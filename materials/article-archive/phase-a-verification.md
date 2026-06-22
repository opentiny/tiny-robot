# Phase A 验收证据

日期：2026-06-22

## 本地确定性验证

- `npm test`：13 个测试文件、200 个用例通过。
- `npm run build`：`tsc -p tsconfig.json` 通过。
- `article-hub doctor --root . --config config/projects.yml`：Node、package-lock、项目配置、skills、INSTALL、GitHub CI、Issue Form、PR 模板检查均通过。

## 四个 dry-run

使用临时文章 fixture 执行 `article-hub --dry-run create-pr`，不写 GitHub、不 push、不创建 PR。

| 项目 | 文章类型 | 结果 | 分支 |
| --- | --- | --- | --- |
| webmcp-sdk | release | `ok=true valid=true` | `article/101-webmcp-sdk-webmcp-release` |
| genui-sdk | practical-guide | `ok=true valid=true` | `article/102-genui-sdk-genui-guide` |
| tiny-robot | source-analysis | `ok=true valid=true` | `article/103-tiny-robot-tiny-robot-source` |
| tiny-robot | case-study | `ok=true valid=true` | `article/104-tiny-robot-tiny-robot-case` |

## 真实端到端 Draft PR

- 验收 Issue：[hexqi/ai-article-hub#22](https://github.com/hexqi/ai-article-hub/issues/22)
- 有效 Draft PR：[hexqi/ai-article-hub#24](https://github.com/hexqi/ai-article-hub/pull/24)
- PR 状态：`OPEN`、`isDraft=true`
- PR base：`main`
- PR head：`article/22-tiny-robot-phase-a-local-loop-article`
- PR diff：仅包含文章目录下 4 个文件：
  - `article.md`
  - `assets/diagrams/phase-a-loop.mmd`
  - `assets/diagrams/phase-a-loop.svg`
  - `assets/diagrams/phase-a-loop.png`
- 文章校验：`article-hub validate article` 返回 `valid=true`、阻断项为空。
- Issue 状态：`阶段：写作 + AI：等待人工 + no_publish + TinyRobot`。

首次真实 PR [#23](https://github.com/hexqi/ai-article-hub/pull/23) 从实现分支切出，diff 带入了 Phase A CLI 实现代码，已关闭并删除远端分支。随后改用 `origin/main` 重新创建 article-only Draft PR #24。

## `/ai` 修改验收

- PR 评论：[ `/ai` 修改意见](https://github.com/hexqi/ai-article-hub/pull/24#issuecomment-4763954776)
- 修改范围：只新增“发布约束”小节，说明本演练稿不发布、不合并。
- 修订提交：`c1828a7 article: update TinyRobot Phase A 本地闭环演练`
- 修订后校验：`article-hub validate article` 返回 `valid=true`、阻断项为空。
- Issue 回写：已评论“已处理 PR #24 中的 /ai 修改意见，并推送修订提交 c1828a7。”

## Mermaid 产物

PR #24 中包含同名三件套：

- `assets/diagrams/phase-a-loop.mmd`
- `assets/diagrams/phase-a-loop.svg`
- `assets/diagrams/phase-a-loop.png`

正文只引用 PNG，校验器确认 `.mmd` 同名 SVG 和 PNG 均存在，PNG 头和尺寸有效。

## 仍需人工完成

- 人工在 PR #24 完成 Review 或提交人工 Commit。
- 人工确认无关键事实错误、无明显 AI 腔、来源快照可追溯。
- 代码片段由人工完成必选验收；本次验收稿未包含正式代码片段。
- 将实现分支推到 GitHub 后，由 Actions 跑 Linux、macOS、Windows Git Bash CI。
- Claude Code 独立 dry-run 需要在 Claude Code 环境安装本仓库 `skills/` 后执行。
