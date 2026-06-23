# generate-opentiny-article 评测脚手架

用于回归这个 skill 的**流程编排正确性**：是否用 `article-hub` 把守三个闸门（暂停 / 批准 / 校验反馈环）、是否按序调用命令、停止类场景是否真的停手。它不是文风评测——文风由 `polish-opentiny-article` 的评测负责。

## 文件

- `evals.json`：3 个场景的测试 prompt + 期望产出 + 断言。
- `fixtures/approved-issue/`：合法场景。`issue.json` 含 maintainer（MEMBER）发出的固定命令 `/ai 批准写作计划 2 4bdcce36`，`plan.json` 经 `plan hash` 算出的前缀正是 `4bdcce36`，二者自洽。
- `fixtures/paused-issue/issue.json`：标签含 `AI：已暂停`，且评论里**仍有**一条 actionable 批准命令——用于验证暂停优先于批准。
- `fixtures/unapproved-issue/issue.json`：三种“伪批准”——自然语言表述、越权用户（association=NONE）、bot——经 `inspect-issue` 后 `actionable` 全为 false。

> fixture 的 hash 前缀依赖 `plan.json` 内容。若改动 `approved-issue/plan.json`，需重跑 `node dist/cli.js plan hash --plan-file <plan.json>`，并把 `issue.json` 批准命令里的前缀同步更新。

## 断言分两类

- **确定性（可观察 / 可脚本核验）**：是否用 `inspect-issue` 读取事实、进入写作前是否确认了 `actionable:true`、`plan approve` 前是否先 `plan hash`、`create-pr` 前 `validate article` 是否 `valid:true`、停止类场景是否未生成文章 / 未 `create-pr` / 未新增 commit。
- **定性（需人工或 grader）**：是否未编造来源外事实、是否被自然语言带偏、停止原因说明是否准确。

## 运行方式

这是流程编排型 skill，断言要看**决策与工具调用轨迹**，不只看产出文件，因此评测时需保留并检查 Agent 的执行轨迹（transcript）。

- **停止类场景（paused-stop / unapproved-stop）**：成本低，推荐每次改 skill 后本地回归。只给本地 `issue.json`，正确行为是 Agent 读取后**停手**——不产生写作产物、不创建 PR、不新增 commit。这两个场景不需要真实 GitHub。
- **happy-path-draft**：需要真实 GitHub 环境（隔离 worktree、`gh` 可访问目标仓库、创建 Draft PR）。在沙箱中可只验证到 `validate article` 通过、文章路径与素材布局正确，PR 创建步骤按环境能力决定是否真实执行。

按 skill-creator 方法论做 before/after 对比时，对改动前后的 skill 版本各跑同一组 prompt，比较三个闸门是否都被正确把守。本脚手架目前只定义场景与断言，未内置自动对比运行器。
