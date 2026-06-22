# `polish-opentiny-article` 契约测试优化设计

日期：2026-06-22

## 1. 背景

`tests/integration/polish-skill.test.ts` 当前通过历史路径、作者名、License、固定 Commit SHA 和旧术语黑名单验证 `polish-opentiny-article` 已完成独立化。这些断言记录的是一次迁移删除了什么，而不是 Skill 当前向调用方提供什么。

随着后续迁移继续追加历史名称，测试会持续膨胀；合法内容也可能因偶然包含 `MIT License`、`Tier` 等通用词而失败。现有测试还手工重复 reference 文件清单，并通过精确中文句子断言模拟 Agent 行为验证，导致内部措辞或目录组织变化时产生无意义失败。

本次调整按照 TDD 原则重新划分测试边界：确定性测试只验证可观察的 Skill 契约，Agent 润色效果留给独立 forward eval。

## 2. 已确认决策

1. 删除历史路径、作者名、License、仓库名、Commit SHA 和旧术语黑名单。
2. 保留契约结构测试，但不固定 reference 的数量、文件名或内部组织。
3. 新增测试侧 Skill 契约检查器，不扩展生产 CLI。
4. 检查器通过一个公开函数返回结构化违规项，测试不绑定完整错误文案。
5. 使用临时目录 fixture 按单个行为逐轮执行 RED→GREEN，不一次性编写全部测试。
6. 真实 `polish-opentiny-article` 只通过检查器入口做集成验证。
7. 自然语言规则的精确句子不属于稳定契约，不在确定性测试中断言。
8. Agent 的事实保护、范围控制和润色效果由后续独立 forward eval 验证，不接入当前确定性 CI。

## 3. 目标

- 让测试描述 Skill 能否被调用方独立、完整、安全地加载。
- 允许 reference 重命名、增删和重组，只要入口引用图仍满足契约。
- 在本地引用缺失、路径逃逸、远程运行依赖、孤立 reference 或嵌套 Skill 时给出稳定失败。
- 让测试在实现重构后继续成立，不记录已删除实现的历史清单。
- 将契约检查逻辑集中在一个小而深的测试接口后，避免集成测试继续堆积文件扫描细节。

## 4. 非目标

- 不新增 `article-hub validate skill` CLI。
- 不修改 `polish-opentiny-article` 的运行规则和正文内容。
- 不为全部 Markdown 语法实现通用解析器。
- 不验证 Agent 是否实际遵守事实保护、范围控制或润色风格。
- 不重构与本次契约测试无关的测试文件或生产模块。
- 不阻止 Skill 文档链接到普通外部资料；只禁止将远程 Markdown 作为运行所需 reference。

## 5. 公开契约

确定性测试保护以下调用方可观察行为：

1. Skill 根目录存在 `SKILL.md`。
2. `SKILL.md` 包含可解析的 YAML Front Matter。
3. Front Matter 的 `name` 与 Skill 目录名一致，`description` 是非空字符串。
4. `SKILL.md` 声明的本地 Markdown reference 均存在。
5. 本地 Markdown reference 的规范化路径和最终真实路径均位于 Skill 根目录内。
6. Markdown reference 可以递归引用其他本地 Markdown reference。
7. `references/` 下所有 Markdown 文件都能从 `SKILL.md` 的引用图到达。
8. Skill 根目录以下不存在第二个 `SKILL.md`。
9. 运行所需 Markdown reference 不能使用远程 URL。

以下内容不属于稳定契约：

- 历史上删除过的文件、目录、作者、License、仓库或 Commit。
- reference 的固定数量和固定名称。
- 自然语言规则的逐字措辞。
- 文档标题、段落顺序和内部规则拆分方式。

## 6. 文件设计

### 6.1 `tests/support/skill-contract.ts`

该文件提供唯一测试接口：

```ts
export type SkillContractViolationCode =
  | "missing-entry"
  | "invalid-frontmatter"
  | "name-mismatch"
  | "external-reference"
  | "escaped-reference"
  | "missing-reference"
  | "nested-skill"
  | "orphan-reference";

export interface SkillContractViolation {
  code: SkillContractViolationCode;
  path: string;
  message: string;
}

/**
 * 检查 Skill 是否满足独立加载所需的入口、文件和引用契约。
 *
 * @param skillRoot Skill 根目录。
 * @returns 检出的全部契约违规项；合法时返回空数组。
 */
export async function inspectSkillContract(
  skillRoot: string
): Promise<SkillContractViolation[]>;
```

检查器只读取传入目录，不修改文件，不依赖 repository root，也不包含 `polish-opentiny-article` 专属名称。返回全部可确定的违规项，便于一次定位多个结构问题。

### 6.2 `tests/unit/skill-contract.test.ts`

单元测试使用临时目录创建最小 Skill fixture。每个测试只验证一个可观察行为，并在测试结束后清理目录。

fixture helper 只负责创建文件，不封装断言。测试通过 `inspectSkillContract` 这一公开接口观察结果，不直接调用 Markdown 提取、路径解析或目录扫描等内部函数。

### 6.3 `tests/integration/polish-skill.test.ts`

集成测试最终只承担两类职责：

1. 调用 `inspectSkillContract(skillRoot)`，验证真实 Skill 没有契约违规。
2. 验证调用方依赖的稳定工作流词汇，包括三种输入场景、Head SHA 保护和文章校验命令。

该文件删除：

- `forbiddenPaths`。
- 历史词语黑名单。
- 手工重复的 reference 路径列表。
- 精确自然语言规则句子断言。

## 7. 引用识别规则

检查器只把 Markdown 链接中满足以下条件的目标视为运行 reference：

- 目标以 `.md` 结尾，允许附带 `#fragment`。
- 目标来自普通 inline link 或 reference definition。
- 目标不是图片。
- 目标不位于 fenced code block 或 inline code 中。

分类规则：

- `http:`、`https:` 或 protocol-relative URL 的 Markdown 目标记为 `external-reference`。
- 其他带 scheme 的目标不作为本地 reference 解析。
- 以 `/` 开头、规范化后逃出 Skill 根目录，或通过 symlink 指向根目录外的目标记为 `escaped-reference`。
- 位于根目录内但不存在或不是普通文件的目标记为 `missing-reference`。
- fragment 不参与文件存在性判断。

本次只实现当前 Skill 契约需要的 CommonMark 子集。若未来出现当前提取器不支持的合法 Markdown 写法，应先增加失败测试，再扩展提取规则。

## 8. 引用图与目录规则

以 `SKILL.md` 为图入口，递归读取每个已解析的本地 Markdown reference。使用真实路径作为访问标识，避免重复遍历和 symlink 循环。

遍历完成后：

- 枚举 `references/` 下所有 `.md` 文件。
- 未出现在可达集合中的文件记为 `orphan-reference`。
- 根目录入口以外的任意 `SKILL.md` 记为 `nested-skill`。

`references/` 目录可以不存在；不存在时不产生孤立文件错误。非 Markdown 素材不参与孤立 reference 检查。

## 9. TDD 实施顺序

每个周期只增加一个测试和使其通过所需的最小实现，保持 tracer-bullet 垂直切片。

### 周期 1：最小合法 Skill

- RED：包含合法 Front Matter、且没有 reference 的 Skill 返回空数组。
- GREEN：读取入口并完成最小 Front Matter 解析。

### 周期 2：入口缺失

- RED：缺少 `SKILL.md` 时返回 `missing-entry`。
- GREEN：增加入口存在性检查。

### 周期 3：Front Matter 契约

- RED：Front Matter 不可解析、字段缺失或 `name` 与目录名不一致时返回对应违规项。
- GREEN：使用项目现有 `yaml` 依赖解析入口元数据。

### 周期 4：缺失的本地 reference

- RED：入口链接到不存在的 Markdown 文件时返回 `missing-reference`。
- GREEN：实现最小 inline Markdown link 提取和文件检查。

### 周期 5：路径逃逸

- RED：入口链接到 `../outside.md` 时返回 `escaped-reference`。
- GREEN：增加规范化绝对路径边界检查。

### 周期 6：symlink 逃逸

- RED：根目录内 symlink 最终指向根目录外时返回 `escaped-reference`。
- GREEN：使用 `realpath` 核验 Skill 根目录和目标文件的最终真实路径。

### 周期 7：远程运行 reference

- RED：入口使用远程 Markdown URL 时返回 `external-reference`。
- GREEN：增加 URL 分类，不把普通外部网页链接误判为运行 reference。

### 周期 8：递归 reference

- RED：入口引用的 Markdown 可以继续引用另一个本地 Markdown 文件。
- GREEN：实现带 visited 集合的引用图遍历。

### 周期 9：孤立 reference

- RED：`references/` 中存在入口不可达的 Markdown 文件时返回 `orphan-reference`。
- GREEN：比较引用图可达集合与 reference 文件集合。

### 周期 10：嵌套 Skill

- RED：子目录存在第二个 `SKILL.md` 时返回 `nested-skill`。
- GREEN：递归扫描 Skill 根目录中的入口文件。

### 周期 11：Markdown 边界

- RED：代码块、行内代码和图片中的 `.md` 文本不应被识别为运行 reference；reference definition 应被识别。
- GREEN：扩展提取器到约定的 CommonMark 子集。

### 周期 12：真实 Skill 集成

- RED：先将 `polish-skill.test.ts` 改为调用检查器，确认历史黑名单删除前后的测试职责变化清晰。
- GREEN：删除历史黑名单、固定 reference 列表和精确规则句子断言，使真实 Skill 契约检查通过。

### 周期 13：重构与全量验证

- 在所有测试为 GREEN 后，统一路径边界判断、违规项构造和 fixture helper。
- 每次重构后运行相关单元测试。
- 最后运行 `pnpm test` 和 `pnpm build`。

## 10. 错误处理

- 缺失入口属于可报告契约问题，不向调用方抛出原始 `ENOENT`。
- 无法读取或解析已发现的 Markdown 文件时，归入最接近的结构违规，并保留相对路径。
- 同一文件的同类违规只报告一次。
- 违规项按 `path` 和 `code` 稳定排序，避免文件系统遍历顺序导致测试抖动。
- `message` 用于人工定位；单元测试主要断言 `code` 和 `path`。

## 11. Agent 行为验证边界

“保留事实”“只修改授权范围”“删除无来源评价时不补充新能力”等要求属于 Agent 的运行行为。静态检查文档中是否包含某个句子，只能证明文本存在，不能证明 Agent 会遵守。

因此本次删除精确句子断言，不用新的关键词集合替代。后续如建设 forward eval，应使用隔离 Agent 上下文执行代表性文章任务，并按以下维度评审：

- 保真：事实、数字、条件、责任主体和结论强度未变化。
- 范围：未修改本轮授权区域之外的内容。
- 自然：主要模板感、空话和营销表达已处理。
- 可发布：结果不需要再次整体润色。

forward eval 是独立项目，不纳入本次实现范围。

## 12. 风险与控制

### Markdown 解析范围膨胀

控制：只支持当前契约所需语法。新语法通过新的失败测试逐步驱动，不预先实现完整 CommonMark parser。

### 测试 helper 演变为生产功能

控制：检查器放在 `tests/support/`，不加入 `src/`、CLI 或发布构建。

### 结构测试再次绑定实现

控制：集成测试只调用检查器，不断言具体 reference 名称和数量。单元测试使用虚构 fixture，不复制真实 Skill 目录结构。

### 外部资料链接被误判

控制：只有目标路径以 `.md` 结尾的远程链接才视为远程运行 reference；普通网页资料链接不受限制。

## 13. 验收标准

- `polish-skill.test.ts` 不包含历史删除清单。
- reference 重命名或重新组织后，只要引用图合法，契约测试仍通过。
- 本地 reference 缺失、路径逃逸、symlink 逃逸、远程 Markdown reference、孤立 reference 或嵌套 Skill 时，测试稳定失败。
- 真实 `polish-opentiny-article` 通过同一公开检查器验证。
- 精确自然语言句子断言被删除，未替换为新的关键词黑名单。
- `pnpm test` 全部通过。
- `pnpm build` 全部通过。
- 不修改生产代码、CLI 行为或 Skill 运行规则。
