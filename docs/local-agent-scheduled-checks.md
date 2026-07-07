# 本地 Agent 定时巡检配置说明

本文提供给 Codex、Claude Code 等本地 Agent 的定时任务使用。它让 Agent 在被定时唤醒时巡检 Issue、PR 和可选的外部平台正式发布任务，不实现 GitHub Workflow、常驻监听，也不跳过写作计划批准、事实确认和人工 Review。

建议先创建两个本地定时任务：

- Issue 巡检：检查文章 Issue、写作计划意见和固定批准命令。
- PR 巡检：检查 Draft PR、Review、行级评论、`Request changes` 和 `/ai` 修改指令。

需要自动将已合入母稿发布到外部平台时，再增加第三个任务：

- 正式发布巡检：读取 `articles/publications.json`，将尚无正式发布记录的文章通过 `webmcp-cli` 发布到目标平台，回写平台 URL 并创建 PR。

Issue 和 PR 任务可以每 15-30 分钟运行一次，并错开 5-10 分钟。正式发布巡检建议低频运行，例如每天 1-2 次，或在文章 PR 合入后人工开启。频率由本地工具决定，仓库不强制。

## 使用方式

不要把本文整篇复制到普通 Agent 对话里。本文是说明书，真正给 Agent 的巡检任务在独立文件中：

- Issue 巡检：[docs/prompts/local-issue-watch.md](./prompts/local-issue-watch.md)
- PR 巡检：[docs/prompts/local-pr-watch.md](./prompts/local-pr-watch.md)
- 正式发布巡检：[docs/prompts/local-publish-watch.md](./prompts/local-publish-watch.md)

常见使用方式：

- 普通对话：让 Agent 读取其中一个巡检任务文件，只会执行一轮巡检，不会创建定时任务。适合第一次验证候选筛选、标签更新和停止行为。
- Codex app automation：在对话中明确要求“创建定时任务”，指定工作目录、频率、运行方式和要使用的巡检任务文件。Issue 巡检、PR 巡检和正式发布巡检应创建成独立任务。
- 调度平台或 Cron：在产品的定时任务入口中创建独立任务，分别让 Agent 读取对应巡检任务文件。

Codex app 可以从普通对话创建 automation。建议使用 project-scoped standalone automation，工作目录指向本仓库，并选择 local project 作为调度入口。工作目录必须填写执行机器上的仓库绝对路径，可在仓库根目录运行 `pwd` 获取；不要复制其他机器的用户路径。Issue 巡检和 PR 巡检在主仓库读取任务文件、候选和共享运行标记；进入写文件、生成、润色、提交或推送流程前，再按任务提示词创建候选专属 Git worktree。成功完成后必须自动清理本轮 worktree；失败或阻断时保留路径供排查。这样既能共享 `<主仓库>/.cache/article-hub/scheduled-runs/` 互斥标记，也不会污染用户当前工作区。

示例：

```text
请创建一个 Codex 定时任务：

名称：ai-article-hub Issue 巡检
类型：standalone / project automation
工作目录：<执行机器上的 ai-article-hub 仓库绝对路径>
运行方式：local project 作为调度入口；写文件前按提示词创建候选专属 worktree
频率：每 30 分钟一次
提示词：读取 docs/prompts/local-issue-watch.md，并按其中完整规则执行一轮 Issue 巡检。
```

再创建一个 PR 巡检任务，频率同样可以是每 30 分钟一次，但和 Issue 巡检错开 5-10 分钟；提示词改为读取 `docs/prompts/local-pr-watch.md`。

正式发布巡检建议单独创建，频率低于 Issue/PR 巡检。示例：

```text
请创建一个 Codex 定时任务：

名称：ai-article-hub 正式发布巡检
类型：standalone / project automation
工作目录：<执行机器上的 ai-article-hub 仓库绝对路径>
运行方式：local project 作为调度入口；发布任务按提示词创建独立 worktree
频率：每天 10:00 一次
提示词：读取 docs/prompts/local-publish-watch.md，并按其中完整规则执行一轮正式发布巡检。目标平台：juejin, csdn, segmentfault。
```

对于 OfficeAce、OfficeClaw、OpenClaw 等其他 Agent 产品，先确认产品是否支持“通过对话创建定时任务”。如果只把提示词粘进普通对话，它通常只会执行一轮巡检。公开资料中，华为云 [OfficeAce 办公智能体](https://www.huaweicloud.com/news/2026/20260416163440660.html) 主要描述办公场景能力，不能据此判断它一定支持对话式创建定时任务；[OpenClaw 定时任务](https://docs.openclaw.ai/zh-CN/automation/cron-jobs) 则有 Cron 类能力，适合把本文巡检任务文件分别配置成定时任务。

OfficeClaw 定时任务 prompt 实测有 1000 字符限制，不适合直接粘贴完整任务内容。推荐只在定时任务里放短启动 prompt，让 Agent 每次运行时读取单独的巡检任务文件；这样既满足字符限制，也避免压缩规则导致状态机、安全停止条件或失败回写遗漏。

OfficeClaw Issue 巡检短 prompt：

```text
在 <执行机器上的 ai-article-hub 仓库绝对路径> 执行一轮本地文章 Issue 巡检。

先读取 docs/prompts/local-issue-watch.md，并按文件中的完整规则执行。不要凭记忆执行；如果无法读取文件，只报告失败原因并停止。

本轮只处理 Issue 巡检，不处理 PR 巡检，不创建 GitHub Workflow、常驻服务或外部发布任务。候选为空时只输出本轮无待处理项。
```

OfficeClaw PR 巡检短 prompt：

```text
在 <执行机器上的 ai-article-hub 仓库绝对路径> 执行一轮本地文章 PR 巡检。

先读取 docs/prompts/local-pr-watch.md，并按文件中的完整规则执行。不要凭记忆执行；如果无法读取文件，只报告失败原因并停止。

本轮只处理 PR 巡检，不处理 Issue 巡检，不创建 GitHub Workflow、常驻服务或外部发布任务。候选为空时只输出本轮无待处理项。
```

OfficeClaw 正式发布巡检短 prompt：

```text
在 <执行机器上的 ai-article-hub 仓库绝对路径> 执行一轮本地文章正式发布巡检。

先读取 docs/prompts/local-publish-watch.md，并按文件中的完整规则执行。不要凭记忆执行；如果无法读取文件，只报告失败原因并停止。

目标平台：juejin, csdn, segmentfault。

本轮只处理正式发布巡检，不处理 Issue 或 PR 巡检，不创建 GitHub Workflow 或常驻服务。候选为空时只输出本轮无待处理项。
```

可以先用下面的测试提示词确认产品行为：

```text
请创建一个定时任务，而不是立即执行任务。

名称：ai-article-hub Issue 巡检
频率：每 30 分钟一次
工作目录：<执行机器上的 ai-article-hub 仓库绝对路径>
执行方式：每次触发时新建会话执行
任务内容：读取 docs/prompts/local-issue-watch.md，并按其中完整规则执行一轮 Issue 巡检。

如果你当前不能创建定时任务，请只回答“不支持通过当前对话创建定时任务”，不要执行巡检。
```

如果 Agent 开始检查 Issue，说明它把提示词当成普通任务执行了，不是创建定时任务。此时应改用产品里的“定时任务”“自动化”“Cron”或“任务调度”入口。

## 共用规则

每次被定时唤醒时，Agent 必须遵守以下规则。完整任务规则以 `docs/prompts/local-issue-watch.md`、`docs/prompts/local-pr-watch.md` 和 `docs/prompts/local-publish-watch.md` 为准。

- 只处理本仓库的 OpenTiny 文章流程，不处理选题发现、普通业务 Issue 或非文章 PR。
- 正式发布巡检通过 `webmcp-cli` 执行平台正式发布；只保存到草稿、进入审核中或未拿到正式文章 URL 时，不得回写 `articles/publications.json`。成功后须在独立 worktree 分支 commit、push 并创建 PR。
- 每轮最多处理 3 个候选项；候选为空时只输出“本轮无待处理项”，不写评论、不改标签。
- 同一个文章 Issue 串行处理。不同 Issue 可以在不同任务中并行。
- 所有 GitHub 状态标签必须通过 `article-hub update-status` 修改，不得用 `gh issue edit --add-label` 或手工拼标签绕过状态机。
- 遇到 `AI执行：人工暂停` 立即停止，不读取新指令、不改文件、不提交、不创建 PR。
- `/ai 同意`、`同意`、`开始写吧` 等近似表达不算批准。写作计划批准只接受逐字固定命令 `/ai 批准写作计划`。
- PR review 中能评论即视为已授权；自动处理只覆盖 `Request changes`、明确可执行评论和 `/ai` 修改指令。普通讨论、提问或目标不清的评论必须转人工确认。
- 需要人工判断时，把关联 Issue 设为当前阶段 + `AI：等待人工`，并在 GitHub 评论写清“停在哪一步、缺什么信息、需要谁决定”。
- 环境、权限或命令失败时，把关联 Issue 设为当前阶段 + `AI：失败`，并在 GitHub 评论写清失败命令、错误摘要和建议处理方式。
- 写入 GitHub 的多行正文（PR body、Issue/PR 评论、写作计划、巡检回执）必须走「临时文件 + `--body-file`」，这是强制三步，不是可选优化：
  1. 用文件写入工具（Write）把完整正文写入临时 Markdown 文件（放系统临时目录或本轮缓存目录，不提交 git）；不要用 here-doc、`echo -e`、`printf` 或带 `\n` 的转义字符串在 shell 里拼多行正文，这些写法会被 `$(...)`、反引号、`!` 触发展开或截断而损坏内容。
  2. 用 `--body-file <文件路径>` 传给 `gh`，`gh pr create`、`gh issue comment`、`gh pr comment` 全都一样；禁止用 `--body "多行内容"` 内联。原因：正文里的 `"`、反引号、`$(...)`、`!` 或换行会提前终止 shell 引号，使 `gh` 只收到首行、其余被当成独立命令，PR/评论最终只剩标题行甚至误触发命令。
  3. 发布后回读刚写入的 PR body 或评论（`gh pr view <number> --json body,comments` 或 `gh issue view <number> --json comments`），确认正文行数大于 1 且包含预期章节；只剩单行标题或正文缺失时按 GitHub 写操作失败处理，不得声称成功。

## 运行标记

Issue/PR 定时任务开始处理某个 Issue 前，先检查本地运行标记：

```text
<主仓库>/.cache/article-hub/scheduled-runs/<issue-number>.json
```

标记建议使用 JSON：

```json
{
  "issue_number": 123,
  "pr_number": 456,
  "task": "issue-watch",
  "agent": "<agent-name>",
  "started_at": "<started-at-iso8601>",
  "expires_at": "<expires-at-iso8601>",
  "thread": "本地定时任务名称或当前对话说明",
  "status": "running",
  "scheduler_root": "<主仓库绝对路径>",
  "worktree": "<候选专属 worktree 路径，未创建时为空>"
}
```

处理规则：

- 同一 Issue 存在未完成标记时，本轮跳过该 Issue。
- 标记已过 `expires_at` 时，不自动删除、不抢占，输出“疑似遗留运行”，要求人工确认。
- 没有标记但 GitHub 标签显示 `AI：处理中` 时，只做只读检查，停止并提示可能有其他 Agent 正在处理。
- 候选为空时不创建标记。
- 正常完成后先清理候选专属 worktree，再删除标记或把 `status` 改为 `completed`。
- 失败但已经回写 GitHub 状态后删除标记。
- Issue/PR 巡检的标记固定读写 `<主仓库>/.cache/article-hub/scheduled-runs/`。候选专属 worktree 内的 `.cache` 不作为互斥依据。

正式发布巡检使用独立的「文章 + 平台」运行标记，具体格式见 `docs/prompts/local-publish-watch.md`。

## 状态标签

人工识别主要看 Issue 标签：

| 标签                          | 含义                                                                     |
| ----------------------------- | ------------------------------------------------------------------------ |
| `阶段：策划` + `AI：等待人工` | 写作计划等待人工审核或固定批准命令。                                     |
| `阶段：写作` + `AI：处理中`   | Agent 正在生成初稿、创建 Draft PR，或处理 Draft PR 初审意见。            |
| `阶段：写作` + `AI：等待人工` | Draft PR 已创建，等待初审、补素材、继续修改或人工点击 Ready for review。 |
| `阶段：审核` + `AI：处理中`   | PR 已 Ready for review，Agent 正在处理 Review 或修改意见。               |
| `阶段：审核` + `AI：等待人工` | Ready PR 的本轮修改已完成，等待重新 Review。                             |
| `AI：失败`                    | Agent 遇到环境、权限、命令或流程失败，需要人工处理。                     |
| `AI执行：人工暂停`            | 人工显式暂停，Agent 不得继续处理。                                       |

## 巡检任务文件

巡检任务拆分到以下文件，定时任务应读取对应文件执行，不再从本文抽取章节：

- [docs/prompts/local-issue-watch.md](./prompts/local-issue-watch.md)
- [docs/prompts/local-pr-watch.md](./prompts/local-pr-watch.md)
- [docs/prompts/local-publish-watch.md](./prompts/local-publish-watch.md)

## 不适合开启定时巡检的情况

以下情况建议继续使用人工触发：

- 第一次试运行文章流程，尚未确认本地环境、权限和 Skill 可用。
- 仓库标签或状态机正在调整。
- 当前有大量人工 Commit、分支整理或 PR 迁移。
- 文章涉及未公开资料、客户截图、账号权限或需要复杂 Demo 复现。
- 外部平台账号尚未登录、存在验证码、平台审核规则不明确，或不希望自动正式发布到外部平台。
- 需要改 CLI、Skill 或流程规则本身。
