# OpenTiny 文章生成需求规格

## 1. 文档状态

- 状态：需求已确认，等待实施计划
- 确认日期：2026-06-18
- 当前交付形态：本地 AI Agent Skill
- 后续形态：GitHub Workflow
- 适用仓库：`hexqi/ai-article-hub`

本文定义 OpenTiny 对外技术文章母稿的生成、协作和审核要求。当前交付只实现本地 Skill；GitHub Workflow 仅保留演进接口和设计约束，不纳入当前交付实施。

## 2. 目标

当前交付系统将一个已批准的选题 Issue 转换为可供人工 Review 的文章 Draft PR，并支持后续 AI 与人工共同修订。

核心目标：

- 基于公开、可追溯的官方资料生成简体中文技术文章。
- 在正文生成前确认写作计划、资料快照和素材缺口。
- 使用 GitHub Issue、Commit、Pull Request 和 Review 完成协作与审计。
- 生成一份平台无关的 Markdown 母稿。
- 保证本地流程未来可以映射为事件驱动的 GitHub Workflow。
- 让 Codex 和 Claude Code 共用同一套 Skill、配置和确定性 CLI。

## 3. 非目标

当前交付不包含：

- 自动发现热点、推荐选题或创建选题 Issue。
- 自动批准选题或文章。
- 向 OpenTiny 官网、微信公众号、掘金、CSDN 等平台发布文章。
- 为不同发布平台生成正文变体或平台专属元数据。
- 英文文章、双语文章或翻译文章。
- 历史文章自动归档。
- 独立文章预览站点。
- 向量数据库、独立知识库、数据库或常驻内容服务。
- 依赖 subagent 才能完成的生成流程。
- 自动执行文章中的代码片段。
- 自动生成 AI 装饰图。

## 4. 当前交付支持范围

### 4.1 项目

当前交付仅支持：

- `webmcp-sdk`
- `genui-sdk`
- `tiny-robot`

项目通过 `config/projects.yml` 注册。新增项目只修改配置，不修改 Skill 主流程。未配置项目必须停止生成并给出配置提示；例如当前 TinyEngine 选题不属于当前交付支持范围。

项目配置至少包含：

- 项目标识和展示名称。
- 主源码仓库和默认分支。
- 官方文档路径与站点 URL。
- 公开 Demo 地址。
- DeepWiki 地址。
- 补充仓库。
- 项目术语和产品命名约束。

### 4.2 文章类型

当前交付支持四种 `article_type`：

| 类型 | 用途 | 必备内容示例 |
| --- | --- | --- |
| `release` | 版本发布解读 | 目标版本、核心变化、用户价值、兼容性、升级注意事项、已知限制 |
| `practical-guide` | 特性、教程、性能优化、问题排查 | 使用场景、前置条件、步骤或方法、注意事项、验收方式 |
| `source-analysis` | 源码与架构解析 | 模块关系、关键链路、实现机制、边界与限制 |
| `case-study` | 项目案例与实践复盘 | 项目背景、实施过程、问题、结果、经验与适用边界 |

类型只规定必备信息，不强制固定章节标题和顺序。人工选题和热点选题属于选题来源，不是文章类型。

### 4.3 文风

当前交付支持四种 `style_profile`：

| 文风 | 说明 |
| --- | --- |
| `official-balanced` | 正式、克制，技术与传播均衡 |
| `developer-friendly` | 面向开发者，解释充分，阅读节奏较轻 |
| `release-promotional` | 突出版本价值，但禁止空泛夸张 |
| `technical-deep-dive` | 强调机制、边界和技术细节 |

默认推荐关系：

- `release` → `release-promotional`
- `practical-guide` → `developer-friendly`
- `source-analysis` → `technical-deep-dive`
- `case-study` → `official-balanced`

写作计划必须允许人工改选文风。

各文风规则存放在生成 Skill 的 `references/styles/` 中，按需加载，不拆成独立 Skill。

## 5. Skill 组成

当前交付包含两个相互独立的 Skill：

```text
skills/
├── generate-opentiny-article/
└── polish-opentiny-article/
    ├── SKILL.md
    └── references/
        ├── article-guardrails.md
        ├── style-guide.md
        ├── anti-patterns.md
        └── examples.md
```

### 5.1 `generate-opentiny-article`

负责：

- 读取并校验选题 Issue。
- 查重、调研并生成写作计划。
- 固定资料版本和 Commit。
- 等待人工批准写作计划。
- 生成文章、Front Matter 和图片素材。
- 调用润色 Skill。
- 执行基础检查。
- 创建并维护文章 Draft PR。
- 处理 `/ai` 修改意见和 `Request changes`。

不负责选题发现、外部发布或文章合并。

### 5.2 `polish-opentiny-article`

该 Skill 是 OpenTiny 对外技术文章的独立优化入口，不嵌套其他 Skill，也不承担通用聊天、社交媒体或任意品牌文案润色。

它负责三种场景：

- 初稿生成后优化全文正文。
- 收到 `/ai 全文润色` 后保守处理全文。
- 根据 `Request changes`、授权用户的 `/ai` 指令或人工要求局部修订。

默认只修改正文自然语言，不修改：

- YAML Front Matter 和已确认标题。
- 代码块、行内代码、命令、日志和报错。
- API、参数、配置键、版本号和 Commit SHA。
- 图片路径、链接目标、Mermaid 或 SVG 源内容。
- 人工区域和本轮范围外的章节。

优化时不得新增固定来源没有提供的事实、数据、来源、用户反馈、产品能力或因果关系。涉及事实、版本、API、兼容性或性能结论时必须回到写作计划固定的来源核验；无法确认时保留原文并请求人工判断。

`SKILL.md` 是唯一入口。`references/article-guardrails.md` 定义修改边界，`style-guide.md` 定义正向风格，`anti-patterns.md` 定义常见问题族，`examples.md` 用于边界校准。这些文件都是普通 reference，不作为独立 Skill 触发。

初稿优化允许在章节内删除纯空话、合并重复句和轻量调整句序。Draft PR 修订默认只处理本轮受影响范围；只有收到 `/ai 全文润色` 才处理全文。完成后必须执行保真回读、自然度回读和文章校验。

历史人工文章只用于提炼正向风格、反例和匿名评测样本，不执行全文仿写或特定作者 voice 模拟。

## 6. 输入契约

### 6.1 选题 Issue

一个 Issue 只对应一篇文章、一个文章目录、一个分支和一个 PR。

Issue 最少提供：

- 所属项目。
- 文章目标。
- 目标读者。
- 文章类型。

标题、大纲、文风、目标版本、资料链接和图片需求允许缺失，由策划阶段补充。历史 Issue 必须容错解析，不要求人工迁移为新格式。

Issue 中已有大纲只作为输入参考。Skill 可以重组并输出新的建议大纲，最终以人工批准的写作计划为准。

### 6.2 人工补充资料

人工可以通过 Issue 正文、评论、附件、公开 URL 或本地文件补充资料。资料分为：

- `待核验资料`：默认类型，仍需回溯官方来源。
- `人工确认资料`：由项目维护者明确背书，可直接用于写作。

人工确认资料与公开官方资料冲突时，Skill 必须暂停并列出冲突，不能自行选择。当前交付只处理公开资料，不设计私有资料权限或匿名来源机制；是否适合公开由人工 Review 确认。

本地文件可以用于策划阶段，但批准写作计划前必须转换为可复现来源：提交到 `materials/issue-sources/<issue-number>/`，或上传为可稳定访问的 Issue 附件，并记录内容 Hash、来源和 License。只存在于单台机器的文件不得用于生成正式 Draft PR。

### 6.3 来源优先级

| 级别 | 来源 | 使用规则 |
| --- | --- | --- |
| 一级 | 源码、测试、类型定义、Release、Tag、PR、Commit、package metadata、官方文档 | 可作为产品事实依据 |
| 二级 | OpenTiny 官网、官方历史文章 | 检查发布日期和适用版本后使用 |
| 三级 | DeepWiki、搜索结果、热点文章 | 只用于发现方向，产品事实必须回溯一级或二级来源 |

性能、安全、兼容性和版本支持等高风险结论必须有一级来源。无法核实的内容进入素材缺口，不允许合理猜测。

当前交付已知资料入口包括三个项目源码仓库、OpenTiny 官网、`opentiny/docs`、项目内文档、DeepWiki 和人工补充资料。项目仓库内的原始文档优先；`opentiny/docs` 及线上站点用于核对已经发布的文档版本，不因其聚合了子仓库文档而重复维护源码副本。

同一版本资料发生冲突时：

- API、类型和运行行为以目标 Commit 的源码、测试和类型定义为准。
- Release 变化以目标 Tag 和 Release Note 为准。
- 历史文章不覆盖当前版本事实。
- 冲突影响核心结论时进入 `AI：等待人工`。

### 6.4 资料快照

每篇文章必须固定资料快照：

- 版本发布文章固定 Release 或 Tag。
- 特性和源码文章固定分支与 Commit SHA。
- 官网和在线文档记录 URL 与访问时间。
- 人工材料记录文件版本或确认信息。

Issue 未指定版本时：

- `release` 必须人工明确 Release 或 Tag。
- `practical-guide` 优先使用最新稳定 Release；未发布特性可以使用默认分支固定 Commit，并明确标记未发布。
- `source-analysis` 由写作计划推荐 Release 或固定 Commit，交人工确认。

不得将浮动的 `latest`、`main` 或 `develop` 保存为最终快照值。PR Review 期间不自动升级来源版本；变更目标版本属于重大修改，必须重新策划并使原批准失效。

## 7. 历史文章归档

过去由人工撰写并已发布的文章统一归档到：

```text
materials/article-archive/<year>/<YYYY-MM-DD>-<slug>/
├── article.md
└── assets/
```

相同正文在微信公众号、掘金、CSDN 等平台发布时只归档一份，Front Matter 记录多个渠道 URL。只有正文存在实质差异时才保存 variant。

当前交付只约定目录和格式，不实现归档自动化。未来 AI 可以协助创建目录、转换 Markdown、下载图片、补充 Front Matter 和合并重复链接，但默认必须保真，不主动润色、更新事实或改写历史正文。

历史归档用于：

- 查重和内容沿革分析。
- 背景、案例和旧版本资料参考。
- OpenTiny 文风规则和评测样本提炼。

## 8. 查重要求

生成写作计划前必须检查：

- 开放和已关闭的选题 Issue。
- 已合并的文章母稿。
- `materials/article-archive/`。
- 同项目相近主题与旧版本内容。

写作计划必须说明相似文章、本文新增价值，以及本文属于新文章、版本更新还是旧文重写。完全重复且没有新版本、新案例或新观点时，保持 `阶段：策划 + AI：等待人工`，不继续生成。

当前交付使用 `rg`、Git 和 GitHub API 检索，不引入向量数据库。

## 9. 写作计划与人工关卡

### 9.1 计划内容

Skill 在选题 Issue 中维护一条“AI 写作计划”评论，必须包含：

- 计划版本、生成时间和内容摘要 Hash。
- 选题目标和查重结论。
- 读者当前问题、前置知识、阅读收益和不覆盖内容。
- 文章类型和文风。
- 三个候选标题及推荐标题。
- 目标 Release、Tag、分支和 Commit。
- 来源清单及可信度。
- 建议大纲。
- 图片与截图计划。
- 素材缺口、风险和人工验收项。
- 预计文章长度。
- 批准和修改方式。

Issue 标题只是工作标题。最终标题在写作计划中确认，并同步到 Draft PR、Front Matter 和正文 H1。

### 9.2 计划版本

大纲、来源、素材缺口、目标版本或文章目标发生实质变化时必须增加 `plan_version`，原批准自动失效。纯格式调整不增加版本。

写作计划评论必须展示绑定当前版本和 Hash 前缀的可复制批准命令。人工只能使用该命令批准明确版本：

```text
/ai 批准写作计划 2 a1b2c3d4
```

命令中的版本或 Hash 与当前计划不一致时必须拒绝批准。批准处理器必须立即写入一条不可变的“批准快照”评论，保存被批准计划的完整内容、`plan_version`、完整 Hash、批准人、时间，以及按 `Asia/Shanghai` 分配的 `article_date`。当前计划评论仍只维护一条；后续修改会使批准快照失效，但不得覆盖历史批准内容。

本地运行时，Skill 可以在当前对话展示计划摘要。用户明确批准后，Skill 代用户向 Issue 发布固定批准评论并继续；未明确批准时不得继续正文生成，也不得长期轮询。

## 10. 状态模型

### 10.1 阶段标签

```text
阶段：选题
→ 阶段：策划
→ 阶段：写作
→ 阶段：审核
→ 阶段：待发布
→ 阶段：已发布
```

终止状态：

```text
阶段：已终止
```

含义：

- `阶段：选题`：选题讨论和批准。
- `阶段：策划`：选题已批准，正在调研和确认写作计划。
- `阶段：写作`：写作计划已批准，正在生成或编辑 Draft PR。
- `阶段：审核`：PR 已 Ready for review，正在人工 Review 和 AI 修订循环。
- `阶段：待发布`：母稿 PR 已合并，等待未来发布流程。
- `阶段：已发布`：未来发布流程已完成。
- `阶段：已终止`：选题或文章明确放弃。

### 10.2 AI 状态标签

- `AI：等待执行`
- `AI：处理中`
- `AI：等待人工`
- `AI：失败`
- `AI：已暂停`

阶段和 AI 状态是独立维度。例如资料不足表示为 `阶段：策划 + AI：等待人工`，不新增“需人工处理”阶段。

进入 `阶段：待发布`、`阶段：已发布` 或 `阶段：已终止` 后必须清除所有 `AI：*` 标签，表示当前没有待执行 AI 任务。

流程状态标签只维护在选题 Issue 上。PR 使用 GitHub 原生 Draft、Ready for review、Review 和 Checks 表示状态，避免 Issue 与 PR 双重状态漂移。

### 10.3 固定命令

状态变更只接受固定命令：

```text
/ai 状态
/ai 批准选题
/ai 批准写作计划 <plan_version> <hash-prefix>
/ai 暂停
/ai 恢复
/ai 重试
```

不得根据普通自然语言猜测批准意图。PR 中其他 `/ai <修改要求>` 视为文章修订指令。

所有状态命令、PR 修订命令和 `Request changes` 处理都必须校验触发者具有仓库写权限或位于配置的 allowlist 中。未授权用户和 bot 的触发请求只保留为普通讨论，不调用模型、不修改分支。

## 11. 生成流程

```text
读取阶段：策划的 Issue
→ 校验项目、输入和权限
→ 查重与资料调研
→ 发布或更新写作计划
→ 等待人工批准当前计划版本
→ 创建本地文章分支和 worktree
→ 生成 Front Matter、正文和素材
→ 执行 OpenTiny 文风润色
→ 执行事实、术语、Markdown、链接和图片检查
→ 推送首个 Commit
→ 创建 Draft PR
```

写作计划批准后不立即创建空 PR。只有初稿达到“可以开始人工 Review”的状态，才推送首个 Commit 并创建 Draft PR。生成失败时只更新 Issue 状态，不产生空 PR。

本地运行使用独立 Git worktree，不切换用户当前分支，也不接触当前工作区未提交修改。成功后可以清理 worktree；失败时保留并输出路径。

当前交付没有常驻进程，也不自动监听 GitHub 事件。计划批准、Ready for review、`Request changes` 或 `/ai` 评论出现后，需要人工再次调用 Skill；Skill 每次启动读取并消费当前所有待处理事件。未来 GitHub Workflow 才负责自动唤醒。

## 12. 输出契约

### 12.1 分支

```text
article/<issue-number>-<project-id>-<slug>
```

示例：

```text
article/3-tiny-robot-5-minute-demo
```

分支名和目录 slug 首次创建后保持稳定。后续标题变化只更新 PR 标题、Front Matter 和正文 H1，不重命名分支和目录。

### 12.2 文章目录

```text
articles/<project-id>/<YYYY-MM-DD>-<slug>/
├── article.md
└── assets/
```

批准处理器在生成开始前按 `Asia/Shanghai` 日期分配 `article_date`，写入不可变批准快照，随后使用该日期创建目录和 Draft PR。即使 PR 创建失败后跨日重试，日期也不改变；该日期表示首次创建 Draft PR 的尝试日期。

### 12.3 Markdown

母稿使用 GitHub Flavored Markdown 的通用子集：

- 支持标题、列表、引用、表格、代码块和标准图片语法。
- 代码块必须标注语言。
- 不使用 MDX、脚本、自定义组件或官网专属语法。
- 正文不嵌入 Mermaid，统一引用生成后的 PNG。
- HTML 只在标准 Markdown 无法表达且确有必要时使用。

`article.md` 使用 YAML Front Matter，不另建 `metadata.yml`。正文第一行保留 H1，校验器必须检查 H1 与 Front Matter 标题一致。

Front Matter 至少包含：

- `schema_version`
- `title`
- `author`，默认 `OpenTiny`
- 可选 `contributors`
- `project`
- `article_type`
- `style_profile`
- `language: zh-CN`
- `topic_issue`
- `created_at` 与 `updated_at`
- 来源仓库、固定 Commit、在线文档 URL 和访问时间
- 图片与素材记录
- Agent、模型、生成时间、两个 Skill 的版本 Commit

不包含：

- 平台专属发布字段。
- 逐条事实与来源映射。
- 完整 prompt、推理过程、聊天记录、Token 消耗或运行日志。

Front Matter 使用 `schemas/article-frontmatter.schema.json` 校验。`schema_version` 必填；破坏性 schema 变化才提升版本。

### 12.4 正文引用

- 版本、API、兼容性和性能结论需要清楚说明，但默认不在正文链接具体源码行。
- 只有 Issue 明确要求时才在正文引用源码 permalink。
- 允许保留简洁的参考资料列表。
- 不使用学术式脚注编号。
- Front Matter 保存来源和版本快照。

### 12.5 长度

- `release`：约 1500–3000 字。
- `practical-guide`：约 2500–5000 字。
- `source-analysis`：约 3000–6000 字。
- `case-study`：由资料完整度决定，建议不超过约 6000 字。

长度不是硬性验收指标。预计超过约 6000 字时，写作计划应建议拆分；拆分后的每篇文章必须使用独立 Issue。

## 13. 图片与图表

### 13.1 图片职责

- 优先复用 OpenTiny 官方仓库或文档图片，并记录来源。
- 可运行的公开 Demo 可以尽力自动截图，但截图只作为候选素材，必须人工确认。
- 需要账号、敏感数据或复杂环境时不自动截图，改为人工任务。
- UI 和 Demo 缺图时生成图片插槽，说明截图步骤、尺寸和画面要求。
- AI 装饰图只输出 prompt，不自动生成或写入文章。
- Draft PR 允许缺少截图或封面，但必须在验收清单中明确标记。

每篇文章必须给出封面需求，包括主题、主文案、视觉元素、比例和可直接使用的 prompt。正文配图按信息价值决定，不为凑数量增加装饰图。

所有图片必须包含中文替代文本和来源记录。外部图片只有在授权或 License 明确兼容时才能复制；Demo 截图必须由人工检查账号、Token、内部地址和个人信息。

本地任务需要真实浏览器证据时优先使用 Chrome DevTools MCP：打开目标页面、等待预期状态、获取最新页面快照、完成交互，再检查 console 和 network；视觉与布局证据使用截图。Chrome DevTools MCP 不可用时才能使用 browser plugin、Playwright 或人工截图。未来 GitHub Workflow 使用 Playwright 执行可重复的公开 Demo 截图步骤。

### 13.2 Mermaid、SVG 与 PNG

图表采用可编辑源文件和跨平台发布图片：

```text
assets/diagrams/<name>.mmd
assets/diagrams/<name>.svg
assets/diagrams/<name>.png
```

默认流程：

```text
.mmd → SVG 矢量母版 → PNG 发布图片
```

- 正文统一引用 PNG。
- SVG 用于高清矢量场景。
- `.mmd` 保留用于 Review 和修改。
- 非 Mermaid 图表可以直接维护 SVG 源文件，再生成 PNG。
- Workflow 必须检查派生产物来自同一源文件，禁止手工修改生成产物。
- 图表使用统一的 OpenTiny 颜色、字体、背景和尺寸配置。

若正式视觉规范尚未提供，使用中性技术风格且不擅自加入 Logo。

## 14. 代码片段

当前交付不自动运行文章中的代码片段，只进行基础事实检查：

- API、参数、版本和上下文与固定源码快照一致。
- 代码块语言和格式正确。
- 不将可自动确认的错误写入文章。

包含代码片段的 PR 必须生成必选人工验收项：

```markdown
- [ ] 人工核对代码片段
```

该项未完成时 PR 保持 Draft。无代码片段的文章不生成该项。

## 15. Draft PR 与协作

### 15.1 创建前阻断条件

以下问题禁止创建 Draft PR：

- 写作计划未批准或批准版本失效。
- 目标仓库、版本或 Commit 无法获取。
- 缺少支撑文章核心结论的资料。
- `article.md` 或 Front Matter 不符合 schema。
- 正文残留事实占位符、内部提示或明显生成错误。
- 存在可自动确认的代码语法或格式错误。

以下问题可以保留为 Draft PR 未完成项：

- 截图、封面或装饰图待补。
- 代码片段或 Demo 待人工验证。
- 非核心外链暂时不可访问。
- 标题和摘要等待运营调整。

### 15.2 PR 描述

PR 描述至少包含：

- 来源选题和写作计划版本。
- 文章目标、类型、文风和目标读者。
- 查看文章与在线编辑入口。
- 本轮生成摘要。
- 来源快照摘要。
- 图片、代码和人工验收清单。
- `/ai` 修改方式。
- 当前流程状态。

PR 描述使用受管区域和人工区域。AI 只更新受管区域；标记缺失或重复时停止更新，不重写整份 PR 描述。

### 15.3 Ready for review

Draft PR 完成人工编辑和必选验收项后，由人工点击 GitHub 原生 **Ready for review**。Workflow 或本地检查通过后，Issue 转为 `阶段：审核`；检查失败时恢复 Draft 并列出缺失项。

进入审核后仍允许 AI 修订：

```text
Review 意见
→ AI 修改并提交新 Commit
→ 自动检查
→ 人工重新 Review
```

普通修订保持 `阶段：审核`。只有大纲重做、目标版本变化等重大返工才由人工 Convert to draft，并退回 `阶段：写作`。

### 15.4 Review 触发

- `Request changes` 自动收集该 Review 中的意见并触发 AI 修订。
- 普通行级评论或普通 PR 评论只有以 `/ai` 开头才触发。
- `Approve` 只更新 GitHub 审核状态，不触发修改。
- 意见冲突或目标不清时先请求澄清，不自行改稿。

AI 完成修改后只回复修改内容、对应 Commit 和待确认项，不自动 Resolve conversation。原评论作者确认后手动 Resolve。

### 15.5 人工 Commit

人工可以通过本地 Git 或 GitHub 在线编辑直接提交到文章分支。AI 启动时记录 Head SHA，提交前再次检查：

- Head 未变化时提交本轮修改。
- Head 已变化时废弃当前 AI 提交，基于最新文章重新处理。
- 不自动 merge、force push 或覆盖人工 Commit。
- 连续变化超过重试上限时进入 `AI：等待人工`。

初稿使用一个 Commit，每批 Review 意见使用一个独立 Commit。AI 不修改、压缩或强推人工 Commit。

AI Commit 使用稳定格式，并记录 Issue 与计划版本：

```text
docs(article): revise TinyRobot demo from review

Issue: #3
Plan-Version: 2
```

### 15.6 合并与终止

Skill 不校验 Approval 数量或 Reviewer 身份，也不自动请求 Reviewer。合并要求统一交给 GitHub Ruleset、Branch protection、CODEOWNERS 和必需 Checks。

PR 合并只表示母稿完成：

```text
PR 合并
→ 阶段：待发布
→ 未来发布 Skill
→ 阶段：已发布
→ 关闭 Issue
```

PR 未合并关闭或选题明确放弃时，Issue 转为 `阶段：已终止` 并关闭。重新启动时必须 reopen Issue、退回 `阶段：策划` 并重新确认写作计划。

Issue 与 PR 关闭规则：

- PR 未合并关闭：关联 Issue 转 `阶段：已终止` 并关闭。
- `阶段：选题`、`策划`、`写作` 或 `审核` 的 Issue 被关闭：视为人工终止。
- `阶段：待发布` 的 Issue 被提前关闭：自动重新打开并说明仍未完成发布。
- `阶段：已发布` 的 Issue 可以关闭，阶段保持不变。
- `阶段：已终止` 的 Issue reopen：恢复原文章分支并重新打开原 PR，然后退回 `阶段：策划 + AI：等待人工`；原 PR 无法恢复时保持终止，并要求人工创建新选题 Issue，不得为原 Issue 创建第二个 PR。

母稿合并后的小型勘误使用新的修订 PR；版本升级或大幅改写创建新的选题 Issue。

## 16. 幂等、并发与恢复

- 任务队列键为 `repository + canonical issue number`；PR 事件必须先解析关联的选题 Issue，不能使用 PR 编号建立另一把锁。
- 同一 Issue 或 PR 的任务串行执行。
- 已开始的任务不强制取消，后续事件进入下一批。
- 同一时间窗口内的多条修改意见可以合并处理。
- 使用分事件 `dedupe_key`、计划版本、分支和 Head SHA 保证幂等，不假设 GitHub 提供统一 event ID。
- 同一选题不得重复创建分支、Commit 或 PR。
- 失败后有限重试；不自动跨 Agent 或模型 fallback。
- 跨模型重试必须由人工显式选择，并记录新的生成信息。
- Mutation 前必须重新检查 `AI：已暂停`；暂停后不得提交任何在途 AI 产物。

暂停属于控制面操作，不进入文章内容任务队列。未来 Workflow 收到 `/ai 暂停` 后必须先写入暂停标签、取消对应的 queued/running run，再回复成功；所有 mutation 在更新 Git ref 前最后一次检查暂停状态。本地 Skill 收到暂停指令后立即停止当前运行，不产生新提交。

GitHub 是唯一长期状态来源：

- Issue 标签保存阶段和 AI 状态。
- Issue 评论保存写作计划与批准记录。
- PR、Review 和 Commit 保存文章修订历史。
- Front Matter 保存文章与来源快照。
- 本地缓存和临时运行目录可以安全删除。

现有“选题库索引”Issue 只作为人工导航，不作为事实来源，也不由生成 Skill 自动维护。

## 17. 源码获取

源码仓库不作为 submodule 加入文章仓库。

- 本地运行使用缓存仓库和增量 fetch，并 checkout 固定 Commit。
- GitHub-hosted Runner 按任务浅 checkout 所需仓库和 Commit。
- 版本对比文章只额外获取需要比较的版本。
- Actions cache 只在实际网络耗时成为问题后增加。
- 本地已有仓库可以复用，但必须校验 remote 和 Commit。
- 无网络或无权限时不得使用过期缓存冒充目标版本。

## 18. 本地运行与安装

### 18.1 支持环境

- macOS
- Linux
- Windows WSL
- Windows Git Bash

PowerShell 和 CMD 原生环境暂不支持。

前置依赖：

- Git
- GitHub CLI `gh`
- Node.js LTS
- npm
- Codex 或 Claude Code
- 对目标 GitHub 仓库的必要权限

Windows Git Bash 是正式支持环境，确定性脚本必须通过 Windows CI。核心路径、文件和状态逻辑使用 Node.js，不依赖 `flock`、GNU `sed`、Linux 专属路径或符号链接。

### 18.2 安装

仓库根目录提供 `INSTALL.md`，指导 AI：

- 识别 Codex 或 Claude Code 环境。
- 完整复制两个 Skill 及其资源到发现目录。
- 安装前检查现有版本并展示差异。
- 安装后执行结构校验和最小触发测试。
- 记录安装来源 Commit。

仓库中的 `skills/` 是唯一源码来源。安装副本禁止直接定制；所有修改先提交到当前仓库，再按 `INSTALL.md` 重新同步。为兼容 Windows，不使用符号链接。

## 19. 确定性 CLI

当前交付确定性能力使用 Node.js LTS、TypeScript、npm 和 `package-lock.json` 实现。Bash 只保留极薄启动入口。

统一 CLI 暂定为 `article-hub`，至少提供：

```text
article-hub inspect-issue
article-hub validate
article-hub checkout-sources
article-hub create-pr
article-hub update-status
article-hub reconcile
article-hub doctor
article-hub setup
```

所有写操作支持统一的 `--dry-run`。`doctor` 只检查标签、权限、Issue Form、依赖和仓库配置；`setup` 展示变更并经人工确认后初始化配置。正常生成流程发现仓库配置缺失时不得自动创建。

Agent 负责调研、判断、写作和润色；CLI 负责 Git、GitHub、schema、文件和状态等确定性操作。

## 20. Dry-run

`dry-run` 必须：

- 读取真实 Issue、仓库和公开资料。
- 在本地临时目录生成写作计划、正文、Front Matter 和图片产物。
- 展示将要修改的标签、评论、分支和 PR。
- 不执行任何 GitHub 写操作，不 push、不创建 PR。
- 支持指定 Agent、模型、文章类型和文风进行回归测试。

## 21. 仓库结构

当前交付目标结构：

```text
.
├── INSTALL.md
├── articles/
├── materials/
│   ├── article-archive/
│   └── issue-sources/
├── skills/
│   ├── generate-opentiny-article/
│   └── polish-opentiny-article/
├── config/
│   └── projects.yml
├── references/
│   ├── brand/
│   └── terminology/
├── schemas/
│   └── article-frontmatter.schema.json
├── scripts/
└── .github/
```

`.github/` 当前交付只包含 Issue Form、PR 模板和基础 CI。完整自动生成 Workflow 属于后续阶段。

## 22. 验收标准

当前交付至少完成：

- 四个 dry-run：三个项目各至少一个，并完整覆盖四种文章类型。
- Codex 和 Claude Code 各完成一次完整 dry-run。
- 一次真实端到端流程：策划批准、生成初稿、创建 Draft PR。
- 一轮 `/ai` 修改、人工 Commit 和重新 Review。
- 一张 Mermaid 图成功生成 `.mmd + .svg + .png`。
- 安装与确定性脚本通过 Linux、macOS、Windows Git Bash CI。
- 人工确认无关键事实错误、无明显 AI 腔、来源快照可追溯。
- 代码片段由人工完成必选验收。
- 重复执行不会重复创建分支、Commit 或 PR。

## 23. 对旧规范的替代

本规格替代 [Draft PR #17](https://github.com/hexqi/ai-article-hub/pull/17) 中与文章生成相关的旧设计。主要变化：

| 旧设计 | 本规格 |
| --- | --- |
| 选题批准后立即创建空 Draft PR | 先进入策划阶段，批准写作计划并生成可 Review 初稿后再创建 PR |
| `阶段：准备`、`阶段：需人工处理` 等混合阶段 | 增加 `阶段：策划`，阶段与 AI 状态正交 |
| Issue 与 PR 同步维护阶段标签 | 状态标签只维护在 Issue，PR 使用 GitHub 原生状态 |
| PR 合并即文章发布并关闭 Issue | PR 合并只表示母稿完成，进入 `阶段：待发布` |
| 生成流程包含选题发现和外部发布 | 当前交付只处理已批准 Issue 到母稿 PR |
| 单文件 `articles/<project>/<slug>.md` | 每篇文章独立目录，名称包含创建日期，图片就近存放 |
| GitHub 外部图片链接可长期保留 | 正式素材入库；Mermaid 同时保存 `.mmd + .svg + .png` |
| 维护独立选题索引 | 标签和搜索是事实来源，索引仅作为人工导航 |
| 定时轮询是主要触发方式 | 未来 Workflow 事件驱动为主，定时校准为辅 |
