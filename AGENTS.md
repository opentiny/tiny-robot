# AGENTS.md

本文面向在本仓库工作的 AI Agent。优先遵守用户当前指令；当用户指令与本文冲突时，先向用户确认再继续。

## 项目定位

`ai-article-hub` 是 OpenTiny AI 文章生成流水线的本地输出库。当前交付形态是本地人工驱动流程：Agent 负责调研、写作、润色和流程编排；`article-hub` CLI 负责确定性解析、校验、安全 guard 和受控 Git/GitHub mutation。

未来 GitHub Workflow 设计只作为演进参考，不属于当前交付范围。不要因为看到 `docs/article-generation-workflow-design.md` 就新增自动化 Workflow、常驻服务、定时任务或发布平台适配，除非用户明确要求。

## 常用命令

```sh
corepack enable
corepack prepare pnpm@10.34.1 --activate
pnpm install
pnpm run build
pnpm test
node dist/cli.js projects validate --config config/projects.yml
node dist/cli.js --dry-run inspect-issue --issue-file tests/fixtures/issue-minimal.json
node dist/cli.js validate article --article-file tests/fixtures/articles/valid-article.md --config config/projects.yml
```

说明：

- `package.json` 声明 `packageManager: pnpm@10.34.1`，README 和 usage 以 `pnpm` 为主。
- `INSTALL.md` 与当前 CI 仍使用 `npm` 命令；修改安装或 CI 相关内容前，先核对仓库是否已统一包管理器和锁文件。
- CLI 构建产物在 `dist/`，源码变更后先运行 `pnpm run build` 再调用 `node dist/cli.js`。

## 仓库地图

| 路径 | 用途 |
| --- | --- |
| `src/` | `article-hub` CLI 源码，包含 `commands`、`domain`、`infrastructure` 和 Git 适配。 |
| `skills/` | 本地 Agent Skill 源码；安装副本不是修改来源。 |
| `config/projects.yml` | 项目 allowlist、源码仓库和文档入口。 |
| `docs/` | 需求、CLI 边界、CLI 参考和未来 Workflow 设计。 |
| `articles/` | 文章母稿目录，格式为 `articles/<project-id>/<YYYY-MM-DD>-<slug>/article.md`。 |
| `materials/` | Issue 来源快照、历史文章归档素材和 dry-run 证据。 |
| `references/` | OpenTiny 品牌、术语和写作规范引用。 |
| `tests/` | CLI、domain、Skill contract 和集成测试。 |

## 架构边界

- `article-hub` 是确定性流程原语，不是 `gh` 的便利封装。
- 普通 GitHub 读取使用 `gh`，例如读取 Issue、PR、Review 和评论原始事实。
- 权限过滤、bot 过滤、固定 `/ai` 命令解析、项目 allowlist、计划 Hash、暂停保护、状态标签互斥、路径安全、文章校验和受控 mutation 必须走 `article-hub`。
- Agent 不得在自然语言、临时脚本或 Skill 文档中重复实现 CLI 已固定的业务规则。
- 新增 CLI 命令必须固定跨 Skill 或 Workflow 复用的不变量、输出稳定 JSON contract、执行写操作前做本地 guard，或提供幂等 mutation plan。
- 单纯读取 GitHub 字段、转发 `gh` 参数、展示 CLI 输出或兼容迁移期便利命令，不应进入生产 CLI。

## 当前支持范围

当前支持项目来自 `config/projects.yml`：

- `webmcp-sdk`
- `genui-sdk`
- `tiny-robot`

当前支持文章类型：

- `release`
- `practical-guide`
- `source-analysis`
- `case-study`

当前支持文风：

- `official-balanced`
- `developer-friendly`
- `release-promotional`
- `technical-deep-dive`

未配置项目必须停止生成并提示需要先更新 `config/projects.yml`。不要绕过 allowlist 生成正式 Draft PR。

## 开发约定

- TypeScript 使用 ESM，`tsconfig.json` 采用 `module: NodeNext`、`target: ES2022` 和 `strict: true`。
- 复用既有分层：命令入口放 `src/commands/`，纯业务规则放 `src/domain/`，进程、错误和 JSON 输出等基础能力放 `src/infrastructure/`。
- CLI stdout 只输出机器可解析 JSON；人类可读错误输出到 stderr。
- JSON envelope 应包含稳定 `schema_version`；失败路径使用稳定错误码，调用方不依赖人类可读 `message` 的具体文案。
- `--dry-run` 不执行外部副作用；有 mutation 的命令应输出可审计的 `mutation_plan.operations`。
- 结构化数据优先使用现有 parser 或标准库处理，不用脆弱的字符串拼接替代。
- 不做与当前任务无关的重构、目录搬迁、文案清理或样式统一。

## 注释约定

- 导出函数、类、类型、接口、模块导出应有中文 JSDoc，说明用途、关键入参、返回值和可能抛出的错误。
- 复杂分支、非显然算法和 workaround 需要一行“为什么”注释。
- 长函数超过 40 行时，在顶部说明该段解决的问题和输入输出契约。
- 不给自解释代码加注释；不写个人备注或临时标记。
- 技术术语拿不准时保留英文，例如 `payload`、`middleware`、`fallback`、`idempotent`、`race condition`。

## 测试约定

测试优先保护调用方可观察的公开行为：

- CLI exit code。
- stdout/stderr 边界。
- JSON envelope、`schema_version`、稳定错误码。
- `--dry-run` 不写文件、不执行外部 mutation。
- `blocking_issues[].code`、`field` 等结构化字段。
- Skill 独立加载契约和本地 Markdown reference 可达性。

测试不要绑定：

- 私有函数、内部调用次数或调用顺序。
- 人类可读中文 message 的完整措辞。
- fixture 的完整快照、评论数量、标题或列表顺序。
- Skill reference 的固定数量、固定文件名或自然语言规则逐字句子。

修改 CLI 或 domain 行为时，优先补对应 unit 或 integration 测试。修改 Skill 时至少运行 Skill contract 测试；写作质量、保真和自然度仍需要 eval 或人工评审，静态测试不能替代行为验证。

## Skill 修改规则

- 仓库内 `skills/` 是唯一源码来源；Codex 或 Claude Code 的本地安装副本不要直接修改。
- 改 Skill 时同步关注入口 `SKILL.md`、YAML Front Matter、引用图、`references/` 可达性和 eval 说明。
- 每个 Skill 根目录只能有一个 `SKILL.md`。
- 运行所需 Markdown reference 必须是本地文件，规范化路径和真实路径都不能逃出 Skill 根目录。
- `generate-opentiny-article` 负责已批准计划到文章初稿和 Draft PR。
- `polish-opentiny-article` 负责在不改事实、术语、代码、Front Matter、链接和图表源的前提下润色或处理 Review 修改。

## 文章生成边界

- 写作计划未被固定命令批准前，不生成正文、不创建 Draft PR。
- 固定批准命令格式为 `/ai 批准写作计划 <plan_version> <hash-prefix>`；额外空格、大写 hash、自然语言同意或 bot 评论都不算批准。
- 资料必须可追溯；只存在于单台机器的文件不得用于生成正式 Draft PR，除非先转成可复现来源。
- 性能、安全、兼容性和版本支持等高风险结论必须回到一级来源核验。
- 不生成 MDX、自定义组件、内联脚本、平台专属发布字段或 AI 装饰图，除非用户明确扩展范围。
- Mermaid 产物按流程保存源文件和派生产物；正文引用稳定图片产物。

## 停止条件

出现以下情况立即停止，不写作、不提交、不创建 PR，并报告阻断点和需要人工决定的问题：

- Issue 标签含 `AI执行：人工暂停`。
- 写作计划没有 `actionable: true` 的批准命令。
- 目标项目不在 `config/projects.yml` allowlist。
- 人工确认资料与公开官方资料冲突，且影响核心结论。
- 来源缺失，无法支撑版本、API、兼容性、性能或安全结论。
- 当前 Head SHA 与开始处理时不一致。
- 文章校验持续报阻断码，且无法在不改受保护内容的前提下消除。

## 关键文档

- `README.md`：项目定位、快速开始和仓库结构。
- `usage.md`：面向使用者的本地文章生成操作手册。
- `INSTALL.md`：把仓库内 Skill 同步到 Codex 或 Claude Code 的本地发现目录。
- `docs/cli-boundary-design.md`：CLI 与 Skill 的边界和命令准入标准。
- `docs/cli-reference.md`：`article-hub` 命令参数和 JSON contract。
- `docs/article-generation-requirements.md`：文章流水线需求、状态和停止条件。
- `docs/article-generation-workflow-design.md`：未来 GitHub Workflow 设计，仅作参考。
- `skills/generate-opentiny-article/SKILL.md`：生成文章 Skill 的执行流程。
- `skills/polish-opentiny-article/SKILL.md`：润色和 Review 修改 Skill 的执行流程。
