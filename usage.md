# 本地 Agent 生成 OpenTiny 文章使用说明

本文面向使用 Codex、Claude Code 或 OpenCode 在本地生成 OpenTiny 技术文章的同学。你可以把它当成一份操作手册：照着准备 Issue、让 Agent 调研、批准写作计划、生成 Draft PR，再进入人工 Review。

如果你只想完成一篇文章，不需要先理解 `article-hub` CLI 的全部细节。CLI 主要由 Agent 调用，用来做校验、状态判断和受控的 GitHub 操作。

## 适用场景

适合使用本文：

- 你已经有一个 OpenTiny 文章选题，想让本地 Agent 辅助生成文章母稿。
- 你需要把文章产物提交成 Draft PR，交给维护者或运营同学 Review。
- 你希望后续根据 PR 评论、`Request changes` 或 `/ai` 指令继续让 Agent 修改文章。

不适合使用本文：

- 自动发现热点、自动创建选题、自动发布到公众号/掘金/CSDN。
- 不经过人工批准，直接让 Agent 写完整文章。
- 让 Agent 使用无法追溯的私有资料生成正式对外内容。
- 把本文当成 CLI 参考手册。命令详情见 [docs/cli-reference.md](./docs/cli-reference.md)。

## 你只需要记住的流程

```text
创建或确认文章 Issue
→ 让 Agent 调研并输出写作计划
→ 人工检查写作计划
→ 复制固定批准命令
→ 让 Agent 生成文章和 Draft PR
→ 人工 Review
→ 按 Review 意见继续让 Agent 修改
```

关键点：写作计划没有批准前，不生成正文、不创建 Draft PR。

## 开始前检查：让 Agent 代查

不需要自己运行技术命令。打开本仓库目录，把下面提示词复制给 Agent，让它帮你检查环境并给出结论。

可复制提示词：

```text
请帮我做 ai-article-hub 本地文章生成前的环境检查。请你自己执行必要命令并给出结论，不要要求我理解技术细节。

请检查：
- 当前目录是否是 ai-article-hub 仓库根目录。
- GitHub CLI 是否已登录，并能访问目标仓库。
- Node.js 和 pnpm 是否满足仓库要求。
- 仓库依赖、测试和构建是否正常。
- article-hub CLI 是否可用，并且项目配置校验通过。
- generate-opentiny-article 和 polish-opentiny-article 是否能被当前 Agent 识别。
- 如果我使用 OpenCode，只确认当前会话是否能发现 Skill，不要展开安装教程。

你可以使用但不限于这些命令：
- gh auth status
- pnpm test
- pnpm run build
- node dist/cli.js projects validate --config config/projects.yml

请用以下格式回复：
结论：可以开始 / 需要处理
已通过：
需要我处理：
你可以代办：
风险：
下一步建议：
```

你只需要看 Agent 的结论：

- `可以开始`：继续准备文章 Issue。
- `需要处理`：先按 Agent 给出的“需要我处理”和“你可以代办”修复环境。
- 如果 Agent 说 Skill 无法识别，回到 [INSTALL.md](./INSTALL.md) 重新同步 Skill，或交给技术同学处理。

## 当前支持范围

### 支持项目

| 项目 ID | 展示名称 |
| --- | --- |
| `webmcp-sdk` | WebMCP SDK |
| `genui-sdk` | OpenTiny MCP/GenUI |
| `tiny-robot` | TinyRobot |

如果文章主题不属于这些项目，Agent 应停止并提示需要先更新 [config/projects.yml](./config/projects.yml)。

### 支持文章类型

| 类型 | 适合什么文章 |
| --- | --- |
| `release` | 版本发布解读 |
| `practical-guide` | 教程、特性使用、性能优化、问题排查 |
| `source-analysis` | 源码、架构、关键链路解析 |
| `case-study` | 项目案例、实践复盘 |

### 支持文风

| 文风 | 说明 |
| --- | --- |
| `official-balanced` | 正式克制，技术与传播均衡 |
| `developer-friendly` | 面向开发者，解释更充分 |
| `release-promotional` | 突出版本价值，但不夸张 |
| `technical-deep-dive` | 强调机制、边界和技术细节 |

## 第一步：准备文章 Issue

优先使用仓库的文章选题模板：[.github/ISSUE_TEMPLATE/article.yml](./.github/ISSUE_TEMPLATE/article.yml)。

Issue 至少写清楚：

- 项目：只能从当前支持项目里选。
- 文章类型：从当前支持文章类型里选。
- 文风：从当前支持文风里选。
- 文章目标：这篇文章要解决谁的什么问题。
- 候选资料：Release、文档、Commit、PR、Demo、Issue 附件或其他公开链接。
- 人工验收说明：哪些事实、截图、代码片段必须由人确认。

最小示例：

```md
项目：genui-sdk
文章类型：practical-guide
文风：developer-friendly

文章目标：
面向前端开发者，说明如何用 GenUI SDK 在已有应用里接入生成式 UI。

候选资料：
- https://github.com/opentiny/genui-sdk
- 目标版本：v1.2.0
- 官方文档：请 Agent 调研 opentiny docs 中的 GenUI SDK 页面

人工验收说明：
- 代码片段需要维护者核对。
- 如果需要截图，先生成截图需求，不要自动使用未确认截图。
```

好资料的特点：

- 能打开。
- 能复现。
- 有版本、Commit、Tag 或发布时间。
- 来自源码、官方文档、Release、PR、Commit、测试或维护者明确确认。

不适合作为正式来源：

- 只有本机文件路径，别人无法访问。
- 只有一句聊天记录，没有维护者确认。
- 与官方源码或文档冲突。
- 只来自搜索摘要，无法回到一级来源。

## 第二步：让 Agent 做调研和写作计划

在 Codex、Claude Code 或 OpenCode 中打开本仓库目录，把 Issue 链接或编号发给 Agent。

可复制提示词：

```text
请在本地 ai-article-hub 仓库中处理这个 OpenTiny 文章 Issue：<Issue 链接或编号>。

请先读取仓库 README、usage、docs、skills 和 config/projects.yml，按当前文章生成流程做调研并输出写作计划。

要求：
- 只做调研和写作计划，不生成正文，不创建 PR。
- 使用 gh 读取 Issue 原始事实，并用 article-hub 做确定性解析和项目校验。
- 检查相似 Issue、已有文章和 materials/article-archive。
- 写清楚计划版本、推荐标题、目标读者、资料快照、建议大纲、素材缺口、人工验收项。
- 最后给出可复制的批准命令：/ai 批准写作计划 <plan_version> <hash-prefix>。
```

你需要重点检查写作计划里的这些内容：

- 文章目标是否准确。
- 读者是否明确。
- 推荐标题是否可接受。
- 大纲是否符合传播和技术目标。
- 来源是否可信、可追溯。
- 目标版本、Tag、Commit 是否固定。
- 素材缺口和人工验收项是否完整。

如果计划不合适，直接让 Agent 修改计划，不要批准。

## 第三步：批准写作计划

只有维护者或有权限的协作者可以批准写作计划。批准必须使用 Agent 给出的固定命令，格式如下：

```text
/ai 批准写作计划 <plan_version> <hash-prefix>
```

示例：

```text
/ai 批准写作计划 2 a1b2c3d4
```

请逐字复制，不要改空格、大小写或 Hash 长度。

这些都不算批准：

```text
我觉得可以，开始写吧
批准计划 2
/ai 批准写作计划 2 A1B2C3D4
/ai 批准写作计划 2 a1b2c3d4 
我批准 /ai 批准写作计划 2 a1b2c3d4
```

原因很简单：系统只认固定命令，避免 Agent 猜测人的意图。

## 第四步：生成文章和 Draft PR

写作计划批准后，再让 Agent 执行生成。

可复制提示词：

```text
写作计划已经在 Issue 中用固定命令批准。请使用 generate-opentiny-article 继续处理这个 Issue：<Issue 链接或编号>。

要求：
- 重新读取 Issue 和评论，确认批准命令 actionable: true。
- 如果 Issue 含 AI执行：人工暂停，立即停止。
- 校验项目属于 config/projects.yml。
- 固定来源快照后再生成文章。
- 生成 articles/<project-id>/<YYYY-MM-DD>-<slug>/article.md 和必要素材。
- 初稿完成后调用 polish-opentiny-article 做正文优化。
- 运行 article-hub validate article，直到校验通过或明确说明阻断原因。
- 校验通过后创建或更新 Draft PR，并回写 Issue 状态。
```

成功后你应该看到：

- 文章文件：`articles/<project-id>/<YYYY-MM-DD>-<slug>/article.md`
- 素材目录：`articles/<project-id>/<YYYY-MM-DD>-<slug>/assets/`
- 文章分支：`article/<issue-number>-<project-id>-<slug>`
- Draft PR 链接
- Issue 状态更新到等待人工处理

## 第五步：人工 Review

Draft PR 创建后，人工需要检查：

- 事实、术语、版本和来源快照是否正确。
- 标题、摘要、大纲和正文节奏是否适合发布。
- 代码片段是否可用。
- 截图、封面或图片缺口是否已经明确。
- PR 描述里的人工验收项是否完成。

如果文章里包含代码片段，必须保留人工验收项：

```md
- [ ] 人工核对代码片段
```

Draft PR 完成人工编辑和必选验收项后，再由人工点击 GitHub 的 **Ready for review**。

## 第六步：让 Agent 按意见修改

### 全文润色

如果文章事实没问题，但读起来有模板感、空话、营销腔或不够自然，可以使用全文润色。

可复制提示词：

```text
请使用 polish-opentiny-article 对这篇 Draft PR 做 /ai 全文润色：<PR 链接>。

要求：
- 只优化正文自然语言。
- 不改 Front Matter、标题、代码块、命令、日志、API、版本号、Commit、图片路径、链接目标、Mermaid 或 SVG 源内容。
- 不新增来源外事实、数据、用户反馈、产品能力或因果关系。
- 润色后运行 article-hub validate article。
```

### 按 Review 意见修改

如果 Review 中有明确意见，可以让 Agent 只改本轮范围。

可复制提示词：

```text
请使用 polish-opentiny-article 处理这个 PR 的 Review 修改意见：<PR 链接>。

要求：
- 只处理 Request changes 和授权用户以 /ai 开头的修改要求。
- 默认只修改评论指向的段落、行或受影响章节。
- 意见冲突、目标不清或缺少事实来源时先停下并说明问题。
- 修改后运行 article-hub validate article，并提交本轮修改。
```

适合写在 PR 评论里的修改要求：

```text
/ai 请把“核心亮点解析”这一节改得更像开发者教程，减少宣传语，但不要改代码块。
```

不适合的修改要求：

```text
/ai 把数据写得更好看一点
/ai 加几个真实用户案例
/ai 顺手优化全文所有地方
```

如果缺少来源，Agent 不应该编造数据或案例。

## 什么时候应该停止

出现以下情况时，不要继续让 Agent 写正文或提交 PR：

- Issue 有 `AI执行：人工暂停` 标签。
- 写作计划没有固定批准命令。
- 批准命令版本或 Hash 与当前计划不一致。
- 批准来自未授权用户或 bot。
- 项目不在 [config/projects.yml](./config/projects.yml)。
- 关键资料无法追溯。
- 人工资料与官方源码或文档冲突。
- 文章校验失败，且不能在不改受保护内容的前提下修复。
- PR Head 已被人工更新，Agent 需要重新读取最新内容。

此时让 Agent 输出三件事即可：

```text
停在哪一步：
缺什么信息：
需要人工决定什么：
```

## 常见问题

| 问题 | 怎么处理 |
| --- | --- |
| Agent 没有触发 Skill | 在提示词中直接写 `generate-opentiny-article` 或 `polish-opentiny-article`。 |
| Codex 或 Claude Code 找不到 Skill | 回到 [INSTALL.md](./INSTALL.md) 重新同步 Skill，并重启工具。 |
| OpenCode 找不到 Skill | 先确认 OpenCode 已能发现本仓库或本机 Skill；本文暂不展开安装方式。 |
| `gh auth status` 失败 | 先完成 GitHub CLI 登录，再继续。 |
| 项目不支持 | 先由维护者评估是否要更新 [config/projects.yml](./config/projects.yml)。 |
| 写作计划没有批准命令 | 让 Agent 重新生成计划 Hash，并把固定批准命令贴到 Issue。 |
| 自然语言已经说“同意”但 Agent 仍停止 | 这是预期行为。必须使用固定 `/ai 批准写作计划 ...` 命令。 |
| 文章校验失败 | 让 Agent 根据 `blocking_issues[].code` 修复；不要让它靠修改 Front Matter、代码或图片路径凑过校验。 |
| 缺截图或封面 | 可以先保留为 Draft PR 验收项；正式发布前由人工补齐。 |
| PR 一直是 Draft | 检查人工验收项、代码片段、截图缺口和必需检查是否完成。 |
| 想发布到外部平台 | 当前流程只生成文章母稿和 Draft PR，不负责发布平台适配。 |

## 产物目录说明

文章母稿：

```text
articles/<project-id>/<YYYY-MM-DD>-<slug>/article.md
```

文章素材：

```text
articles/<project-id>/<YYYY-MM-DD>-<slug>/assets/
```

Mermaid 图表素材：

```text
articles/<project-id>/<YYYY-MM-DD>-<slug>/assets/diagrams/<name>.mmd
articles/<project-id>/<YYYY-MM-DD>-<slug>/assets/diagrams/<name>.svg
articles/<project-id>/<YYYY-MM-DD>-<slug>/assets/diagrams/<name>.png
```

正文统一引用 PNG。`.mmd` 和 `.svg` 用于后续 Review 和修改。

## 相关文档

- [README.md](./README.md)：仓库能力、结构和核心工作流。
- [INSTALL.md](./INSTALL.md)：Codex 和 Claude Code 的 Skill 安装方式。
- [docs/article-generation-requirements.md](./docs/article-generation-requirements.md)：完整需求和边界。
- [docs/cli-reference.md](./docs/cli-reference.md)：`article-hub` CLI 参数参考。
- [skills/generate-opentiny-article/SKILL.md](./skills/generate-opentiny-article/SKILL.md)：生成文章的 Agent 流程。
- [skills/polish-opentiny-article/SKILL.md](./skills/polish-opentiny-article/SKILL.md)：润色和 Review 修改流程。
