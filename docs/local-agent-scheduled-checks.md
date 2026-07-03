# 本地 Agent 定时巡检提示词

本文提供给 Codex、Claude Code 等本地 Agent 的定时任务使用。它只让 Agent 在被定时唤醒时巡检 Issue 和 PR，不实现 GitHub Workflow、常驻监听或外部发布，也不跳过写作计划批准、事实确认和人工 Review。

建议创建两个本地定时任务：

- Issue 巡检：检查文章 Issue、写作计划意见和固定批准命令。
- PR 巡检：检查 Draft PR、Review、行级评论、`Request changes` 和 `/ai` 修改指令。

两个任务可以每 15-30 分钟运行一次，并错开 5-10 分钟。频率由本地工具决定，仓库不强制。

## 使用方式

不要把本文整篇复制到普通 Agent 对话里。本文是说明书，真正给 Agent 的是“Issue 巡检提示词”和“PR 巡检提示词”两个 `text` 代码块。

常见使用方式：

- 普通对话：粘贴其中一个 `text` 代码块，只会执行一轮巡检，不会创建定时任务。适合第一次验证候选筛选、标签更新和停止行为。
- Codex app automation：在对话中明确要求“创建定时任务”，指定工作目录、频率、运行方式和要使用的提示词代码块。Issue 巡检和 PR 巡检应创建成两个任务。
- 调度平台或 Cron：在产品的定时任务入口中创建两个任务，分别把 Issue 巡检和 PR 巡检代码块填入任务 prompt。

Codex app 可以从普通对话创建 automation。建议使用 project-scoped standalone automation，工作目录指向本仓库，并选择 local project 运行。工作目录必须填写执行机器上的仓库绝对路径，可在仓库根目录运行 `pwd` 获取；不要复制其他机器的用户路径。不要默认使用 worktree，因为两个定时任务需要共享 `.cache/article-hub/scheduled-runs/` 下的运行标记；如果每次在不同 worktree 运行，互斥标记可能分散。

示例：

```text
请创建一个 Codex 定时任务：

名称：ai-article-hub Issue 巡检
类型：standalone / project automation
工作目录：<执行机器上的 ai-article-hub 仓库绝对路径>
运行方式：local project，不使用 worktree
频率：每 30 分钟一次
提示词：使用 docs/local-agent-scheduled-checks.md 里的“Issue 巡检提示词”代码块。
```

再创建一个 PR 巡检任务，频率同样可以是每 30 分钟一次，但和 Issue 巡检错开 5-10 分钟。

对于 OfficeAce、OfficeClaw、OpenClaw 等其他 Agent 产品，先确认产品是否支持“通过对话创建定时任务”。如果只把提示词粘进普通对话，它通常只会执行一轮巡检。公开资料中，华为云 [OfficeAce 办公智能体](https://www.huaweicloud.com/news/2026/20260416163440660.html) 主要描述办公场景能力，不能据此判断它一定支持对话式创建定时任务；[OpenClaw 定时任务](https://docs.openclaw.ai/zh-CN/automation/cron-jobs) 则有 Cron 类能力，适合把本文两个提示词分别配置成定时任务。

可以先用下面的测试提示词确认产品行为：

```text
请创建一个定时任务，而不是立即执行任务。

名称：ai-article-hub Issue 巡检
频率：每 30 分钟一次
工作目录：<执行机器上的 ai-article-hub 仓库绝对路径>
任务内容：使用 docs/local-agent-scheduled-checks.md 里的“Issue 巡检提示词”。

如果你当前不能创建定时任务，请只回答“不支持通过当前对话创建定时任务”，不要执行巡检。
```

如果 Agent 开始检查 Issue，说明它把提示词当成普通任务执行了，不是创建定时任务。此时应改用产品里的“定时任务”“自动化”“Cron”或“任务调度”入口。

## 共用规则

每次被定时唤醒时，Agent 必须遵守以下规则：

- 只处理本仓库的 OpenTiny 文章流程，不处理外部发布、选题发现、普通业务 Issue 或非文章 PR。
- 每轮最多处理 3 个候选项；候选为空时只输出“本轮无待处理项”，不写评论、不改标签。
- 同一个文章 Issue 串行处理。不同 Issue 可以在不同任务中并行。
- 所有 GitHub 状态标签必须通过 `article-hub update-status` 修改，不得用 `gh issue edit --add-label` 或手工拼标签绕过状态机。
- 遇到 `AI执行：人工暂停` 立即停止，不读取新指令、不改文件、不提交、不创建 PR。
- `/ai 同意`、`同意`、`开始写吧` 等近似表达不算批准。写作计划批准只接受逐字固定命令 `/ai 批准写作计划`。
- PR review 中能评论即视为已授权；自动处理只覆盖 `Request changes`、明确可执行评论和 `/ai` 修改指令。普通讨论、提问或目标不清的评论必须转人工确认。
- 需要人工判断时，把关联 Issue 设为当前阶段 + `AI：等待人工`，并在 GitHub 评论写清“停在哪一步、缺什么信息、需要谁决定”。
- 环境、权限或命令失败时，把关联 Issue 设为当前阶段 + `AI：失败`，并在 GitHub 评论写清失败命令、错误摘要和建议处理方式。

## 运行标记

定时任务开始处理某个 Issue 前，先检查本地运行标记：

```text
.cache/article-hub/scheduled-runs/<issue-number>.json
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
  "status": "running"
}
```

处理规则：

- 同一 Issue 存在未完成标记时，本轮跳过该 Issue。
- 标记已过 `expires_at` 时，不自动删除、不抢占，输出“疑似遗留运行”，要求人工确认。
- 没有标记但 GitHub 标签显示 `AI：处理中` 时，只做只读检查，停止并提示可能有其他 Agent 正在处理。
- 候选为空时不创建标记。
- 正常完成后删除标记，或把 `status` 改为 `completed`。
- 失败但已经回写 GitHub 状态后删除标记。

## 状态标签

人工识别主要看 Issue 标签：

| 标签 | 含义 |
| --- | --- |
| `阶段：策划` + `AI：等待人工` | 写作计划等待人工审核或固定批准命令。 |
| `阶段：写作` + `AI：处理中` | Agent 正在生成初稿、创建 Draft PR，或处理 Draft PR 初审意见。 |
| `阶段：写作` + `AI：等待人工` | Draft PR 已创建，等待初审、补素材、继续修改或人工点击 Ready for review。 |
| `阶段：审核` + `AI：处理中` | PR 已 Ready for review，Agent 正在处理 Review 或修改意见。 |
| `阶段：审核` + `AI：等待人工` | Ready PR 的本轮修改已完成，等待重新 Review。 |
| `AI：失败` | Agent 遇到环境、权限、命令或流程失败，需要人工处理。 |
| `AI执行：人工暂停` | 人工显式暂停，Agent 不得继续处理。 |

## Issue 巡检提示词

把下面提示词复制到本地 Agent 的 Issue 定时任务中：

```text
你正在 ai-article-hub 仓库中执行本地文章 Issue 定时巡检。请只做本轮巡检，不要实现 GitHub Workflow，不要创建常驻服务。

范围：
- 只处理打开的文章 Issue。
- 候选 Issue 必须带有以下任一相关标签：阶段：选题、阶段：策划、AI：等待执行、AI：失败、AI：等待人工。
- 每轮最多处理 3 个候选 Issue。
- PR 已存在的 Issue 不再执行生成类动作，只做状态提示，并把后续修改交给 PR 巡检。

共用安全规则：
- 每个候选 Issue 先读取 Issue 正文、标签、评论和关联 PR。
- 处理前检查 .cache/article-hub/scheduled-runs/<issue-number>.json。
- 同一 Issue 有未完成运行标记时跳过。
- 运行标记已过期时不要删除、不要抢占，只报告“疑似遗留运行”，并要求人工确认。
- Issue 含 AI执行：人工暂停 时立即停止处理该 Issue。
- 所有状态标签只能通过 article-hub update-status 修改，不能手工拼标签。
- 需要写作计划批准时，只接受 inspect-issue 输出中 actionable: true 且 parsed.kind 为 approve-writing-plan 的固定命令。
- /ai 同意、同意、开始写吧、自然语言批准或带参数的 /ai 批准写作计划 都不算批准。
- /ai 批准选题 不作为本地定时巡检触发条件；当前使用说明从写作计划审核开始。

处理流程：
1. 使用 gh 读取候选 Issue 原始事实，并用 article-hub inspect-issue 解析标签、权限和固定 /ai 命令。
2. 如果发现 /ai 暂停、/ai 恢复 或 /ai 重试，分别通过 article-hub update-status 的 pause、resume、retry intent 处理；不要手工改标签。
3. 如果发现 /ai 批准选题：
   - 不进入生成流程。
   - 评论说明：当前本地巡检从写作计划审核开始，不消费 /ai 批准选题，请按使用说明让 Agent 生成或更新写作计划。
   - 保持或更新为 阶段：策划 + AI：等待人工。
   - 继续下一个候选 Issue。
4. 如果 Issue 已有关联 Draft PR 或文章 PR：
   - 不调用 generate-opentiny-article。
   - 如果 Issue 又出现新的写作计划意见或批准命令，评论说明“该文章已进入 PR 阶段，请到关联 PR 提修改意见”。
   - 关联 PR 仍是 Draft 时，用 article-hub update-status 保持或更新为 阶段：写作 + AI：等待人工。
   - 关联 PR 已 Ready for review 时，先执行本地 Ready for review 检查；通过后才用 article-hub update-status 保持或更新为 阶段：审核 + AI：等待人工。
   - Ready for review 检查失败但 PR 未转回 Draft 时，保持 阶段：审核 + AI：等待人工，并评论说明缺哪些检查项，请人工处理或 Convert to draft。
   - 继续下一个候选 Issue。
5. 如果没有新事实、新评论、新 review 意见、固定批准命令或状态命令，不重复评论。
6. 如果有新 Issue 信息或写作计划 review 意见：
   - 读取 README、usage、docs、skills 和 config/projects.yml。
   - 检查相似 Issue、已有文章和 materials/article-archive。
   - 生成或更新“当前写作计划评论”，完整计划必须进入 Issue 评论。
   - 写清计划版本、推荐标题、目标读者、来源快照、建议大纲、截图/GIF 素材需求、素材缺口、人工验收项。
   - 给出固定批准命令：/ai 批准写作计划。
   - 通过 article-hub update-status 把 Issue 设为 阶段：策划 + AI：等待人工。
7. 如果发现 /ai 同意、同意、开始写吧 等近似批准：
   - 只回复一次提醒：当前流程只接受逐字固定命令 /ai 批准写作计划。
   - 保持或更新为 阶段：策划 + AI：等待人工。
   - 不生成文章，不创建 PR。
8. 如果发现授权用户发出的固定 /ai 批准写作计划：
   - 先创建本地运行标记。
   - 如果 Issue 当前仍是 阶段：选题，先用 article-hub update-status 做 选题→策划。
   - 使用 article-hub update-status 做 策划→写作，把 Issue 改为 阶段：写作 + AI：处理中。
   - 巡检本身不重新实现生成流程；进入已批准写作计划到 Draft PR 的既有流程，按 generate-opentiny-article 的步骤处理该 Issue。
   - 创建或更新 Draft PR 前运行 git status --short，确认没有运行缓存和临时文件进入工作区。
   - Draft PR 创建成功后，使用 article-hub update-status 改为 阶段：写作 + AI：等待人工，并评论 Draft PR 链接和待人工处理项。
9. 如果遇到意见冲突、缺来源、截图/GIF 需确认、代码事实需维护者确认或 Head SHA 不一致：
   - 停止处理该 Issue。
   - 用 article-hub update-status 改为当前阶段 + AI：等待人工。
   - 评论写清：停在哪一步、缺什么信息、需要谁决定。
10. 如果环境、权限、命令或 GitHub 写操作失败：
   - 停止处理该 Issue。
   - 用 article-hub update-status 改为当前阶段 + AI：失败。
   - 评论写清失败命令、错误摘要和建议处理方式。
11. 正常完成或失败状态已回写后，删除本地运行标记；过期标记不要删除。

本轮结束时，请输出：
- 本轮检查的 Issue 数量。
- 已处理的 Issue。
- 跳过的 Issue 和原因。
- 需要人工处理的 Issue。
- 失败项。
```

## PR 巡检提示词

把下面提示词复制到本地 Agent 的 PR 定时任务中：

```text
你正在 ai-article-hub 仓库中执行本地文章 PR 定时巡检。请只做本轮巡检，不要实现 GitHub Workflow，不要创建常驻服务。

范围：
- 只处理打开的 Draft PR 或普通 PR。
- 候选 PR 必须满足以下任一条件：PR 描述关联文章 Issue、分支名符合 article/<issue-number>-...、改动包含 articles/<project-id>/<date>-<slug>/article.md。
- 每轮最多处理 3 个候选 PR。

关联 Issue 识别：
1. 优先读取 PR 描述里的关联 Issue 链接。
2. 其次从分支名 article/<issue-number>-... 解析 Issue 编号。
3. 再从 articles/publications.json 或文章目录对应记录查找 Issue 编号。
4. 如果仍找不到关联 Issue，停止处理该 PR，不改文章、不改标签；只在本地输出原因。

共用安全规则：
- 找到关联 Issue 后，先读取 Issue 标签和 PR 最新 Head SHA。
- 处理前检查 .cache/article-hub/scheduled-runs/<issue-number>.json。
- 同一 Issue 有未完成运行标记时跳过。
- 运行标记已过期时不要删除、不要抢占，只报告“疑似遗留运行”，并要求人工确认。
- Issue 含 AI执行：人工暂停 时立即停止处理该 PR。
- 所有状态标签只能通过 article-hub update-status 修改，不能手工拼标签。
- PR 评论、Review、行级线程和 Request changes 中，能评论即视为已授权；不额外判断写权限或 allowlist。
- 不自动 Resolve conversation，不点击 Ready for review，不 merge，不发布外部平台。

去重规则：
- 每轮读取 PR Draft 状态、PR 评论、Review、行级线程和关联 Issue。
- 找到最近一条当前 Agent 发布的处理回执，标题固定为“AI 巡检处理回执”，正文必须包含隐藏 `dedupe_key` 标记。
- 本轮只处理该回执之后新增的 Request changes、明确可执行评论和明确 /ai 指令。
- 如果没有回执，首次 PR 巡检读取当前全部待处理意见，处理后发布第一条回执。
- 如果评论早于最近回执，但线程后来追加了新回复，按新回复纳入本轮。
- 每轮修改完成后必须发布新的“AI 巡检处理回执”，列出本轮处理的评论链接或 Review ID、Commit SHA、未采纳意见和仍需人工处理的问题，并写入隐藏 `dedupe_key`。

隐藏标记固定放在回执正文末尾：

```text
<!-- ai-article-hub:dedupe_key=pr-<pr-number>:handled-through-<ISO8601> -->
```

`handled-through` 使用本轮已处理评论、Review 或线程回复中最大的 `updatedAt`；如果没有可用时间，就用回执发布时间。下一轮只需要读取最近一条带该标记的当前 Agent 回执，并处理此时间之后新增或更新的意见。

处理流程：
1. 读取候选 PR、关联 Issue、当前 Head SHA、PR Draft 状态、PR 评论、Review、行级线程和最新文件。
2. 如果没有新增的 Request changes、明确可执行评论或明确 /ai 指令：
   - 不改文件，不发重复回执。
   - 继续下一个候选 PR。
3. 发现可处理意见后：
   - 创建本地运行标记。
   - 如果 PR 仍是 Draft，且关联 Issue 是 阶段：写作，用 article-hub update-status 的 content-transition 保持 阶段：写作 + AI：处理中。
   - 如果 PR 仍是 Draft，且关联 Issue 是 阶段：审核，用 article-hub update-status 的 lifecycle-transition 做 审核→写作，目标状态为 阶段：写作 + AI：处理中。
   - 如果 PR 已不是 Draft，且关联 Issue 是 阶段：写作，先确认 Ready for review 检查通过，再用 article-hub update-status 的 lifecycle-transition 做 写作→审核，目标状态为 阶段：审核 + AI：处理中。
   - 如果 PR 已不是 Draft，且关联 Issue 是 阶段：审核，用 article-hub update-status 的 content-transition 保持 阶段：审核 + AI：处理中。
   - 记录开始处理时的 PR Head SHA，提交或推送前重新读取并比对；Head 已变化时停止，不覆盖人工修改。
4. 对本轮意见先逐条归类：表达/结构类、素材类、事实类、需澄清、无法采纳。
5. 自动处理范围：
   - Request changes 中明确要求修改的内容。
   - 明确可执行评论，包括 PR 级评论、行级评论和 Review 线程。
   - /ai 修改指令。
   - /ai 全文润色 作为新一轮全文修改处理，完成后提示需要重新确认。
6. 需要停止转人工的情况：
   - 普通讨论、提问、赞同或无明确修改目标。
   - 评论互相冲突。
   - 缺少事实来源。
   - 涉及版本、API、兼容性、性能、安全、代码正确性但无法回到固定来源确认。
   - 需要人工确认截图、GIF、Demo、敏感信息或素材来源。
   - PR Head 与开始处理时不一致。
7. 修改正文时使用 polish-opentiny-article：
   - 只修改本轮授权范围。
   - 不改 Front Matter、代码块、命令、日志、API、版本号、Commit、图片路径、链接目标、Mermaid 或 SVG 源内容，除非评论明确要求且来源可核验。
   - 不新增来源外事实、数据、用户反馈、产品能力或因果关系。
8. 修改后运行 article-hub validate article。
9. 校验通过后提交本轮修改。
10. 发布“AI 巡检处理回执”，列出：
    - 已处理的评论链接或 Review ID。
    - 对应 Commit SHA。
    - 未采纳意见及理由。
    - 仍需人工确认的问题。
    - 是否需要运营或技术维护者重新检查。
    - 正文末尾的隐藏 `dedupe_key` 标记。
11. 用 article-hub update-status 把关联 Issue 改回 PR 状态对应阶段 + AI：等待人工：Draft PR 回到 阶段：写作；Ready PR 回到 阶段：审核。
12. 正常完成或失败状态已回写后，删除本地运行标记；过期标记不要删除。

失败处理：
- 如果遇到意见冲突、事实缺口、素材需确认或 Head SHA 变化，用 article-hub update-status 改为当前阶段 + AI：等待人工，并在 PR 回执和 Issue 评论中写清阻断点。
- 如果环境、权限、命令或 GitHub 写操作失败，用 article-hub update-status 改为 当前阶段 + AI：失败，并写清失败命令、错误摘要和建议处理方式。

本轮结束时，请输出：
- 本轮检查的 PR 数量。
- 已处理的 PR。
- 跳过的 PR 和原因。
- 需要人工处理的 PR/Issue。
- 失败项。
```

## 不适合开启定时巡检的情况

以下情况建议继续使用人工触发：

- 第一次试运行文章流程，尚未确认本地环境、权限和 Skill 可用。
- 仓库标签或状态机正在调整。
- 当前有大量人工 Commit、分支整理或 PR 迁移。
- 文章涉及未公开资料、客户截图、账号权限或需要复杂 Demo 复现。
- 需要改 CLI、Skill 或流程规则本身。
