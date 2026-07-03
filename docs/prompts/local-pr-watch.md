# 本地文章 PR 巡检任务

你正在 ai-article-hub 仓库中执行本地文章 PR 定时巡检。请只做本轮巡检，不要实现 GitHub Workflow，不要创建常驻服务。

## 范围

- 只处理打开的 Draft PR 或普通 PR。
- 候选 PR 必须满足以下任一条件：PR 描述关联文章 Issue、分支名符合 `article/<issue-number>-...`、改动包含 `articles/<project-id>/<date>-<slug>/article.md`。
- 每轮最多处理 3 个候选 PR。
- 调度入口可以在主仓库运行；凡要改文章、校验、提交或推送，必须切到候选 PR 专属 Git worktree。

## 关联 Issue 识别

1. 优先读取 PR 描述里的关联 Issue 链接。
2. 其次从分支名 `article/<issue-number>-...` 解析 Issue 编号。
3. 再从 `articles/publications.json` 或文章目录对应记录查找 Issue 编号。
4. 如果仍找不到关联 Issue，停止处理该 PR，不改文章、不改标签；只在本地输出原因。

## 共用安全规则

- 找到关联 Issue 后，先读取 Issue 标签和 PR 最新 Head SHA。
- 处理前检查共享运行标记 `<scheduler_root>/.cache/article-hub/scheduled-runs/<issue-number>.json`。
- 同一 Issue 有未完成运行标记时跳过。
- 运行标记已过期时不要删除、不要抢占，只报告“疑似遗留运行”，并要求人工确认。
- Issue 含 `AI执行：人工暂停` 时立即停止处理该 PR。
- 所有状态标签只能通过 `article-hub update-status` 修改，不能手工拼标签。
- PR 评论、Review、行级线程和 Request changes 中，能评论即视为已授权；不额外判断写权限或 allowlist。
- 不自动 Resolve conversation，不点击 Ready for review，不 merge，不发布外部平台。

## Worktree 隔离

启动时把当前仓库根目录记为 `scheduler_root`。Issue、PR 两个巡检任务共享以下运行标记目录，不得写到候选 worktree 的 `.cache` 中：

```text
<scheduler_root>/.cache/article-hub/scheduled-runs/
```

候选识别、PR/Issue 读取、去重判断和无需改文件的状态提示可以在 `scheduler_root` 执行。一旦本轮要修改文章、运行校验、提交或推送，必须先创建候选 PR 专属 worktree，并从 PR 当前 Head 开始处理：

```bash
git fetch origin pull/<pr-number>/head
git worktree add -b pr-watch/<pr-number>-<started-at-yyyymmdd-hhmmss> <scheduler_root>/.worktrees/pr-watch-<pr-number>-<started-at-yyyymmdd-hhmmss> FETCH_HEAD
```

执行要求：

- 后续所有正文修改、校验、提交、推送和 `article-hub create-pr` 命令的 `cwd` 都必须是该 worktree。
- 运行标记仍读写 `<scheduler_root>/.cache/article-hub/scheduled-runs/<issue-number>.json`。
- 不切换 `scheduler_root` 的当前分支，不在 `scheduler_root` 写文章文件、素材、临时文件或 Git 暂存区。
- worktree 创建失败时，本轮停止处理该 PR；不得回到 `scheduler_root` 继续修改。
- 创建 worktree 前记录 PR Head SHA；提交或推送前重新读取并比对，Head 已变化时停止，不覆盖人工修改。
- 只处理可推回原 PR 分支的 PR。跨仓库 PR 或无法确认 push 目标时，停止并请人工处理。
- 正常完成并完成 GitHub 回写后，先确认 worktree 路径位于 `<scheduler_root>/.worktrees/`，再运行 `git worktree remove --force <worktree-path>` 清理本轮 worktree，最后删除运行标记；失败、阻断或远端写操作未完成时保留 worktree 路径供排查。

## 去重规则

- 每轮读取 PR Draft 状态、PR 评论、Review、行级 Review 评论、Review 线程回复和关联 Issue。
- 读取行级 Review 评论时，必须获取评论正文、评论链接、Review ID、评论 ID、文件路径、行号、`diff_hunk`、`createdAt`、`updatedAt` 和回复；`gh pr view --json reviews,comments` 只能作为摘要，不得替代 `gh api repos/<owner>/<repo>/pulls/<pr-number>/comments --paginate` 或等价 GraphQL `reviewThreads` 读取。
- 找到最近一条当前 Agent 发布的处理回执，标题固定为“AI 巡检处理回执”，正文必须包含隐藏 `dedupe_key` 标记。
- 本轮只消费该回执之后新增或更新的 Request changes、PR 评论、Review、行级 Review 评论、Review 线程回复和明确 `/ai` 指令；先放入本轮意见清单，再逐条判定为已改、需澄清、无法采纳或无需处理。
- 如果没有回执，首次 PR 巡检读取当前全部待处理意见，处理后发布第一条回执。
- 如果评论早于最近回执，但线程后来追加了新回复，按新回复纳入本轮。
- 每轮处理完成后必须发布新的“AI 巡检处理回执”，列出本轮意见清单中每条评论或 Review 的链接、处理结论和依据。只有本轮修改了正文才需要列出 Commit SHA；未改正文时必须说明是需澄清、无法采纳还是无需处理，并写入隐藏 `dedupe_key`。

隐藏标记固定放在回执正文末尾：

```text
<!-- ai-article-hub:dedupe_key=pr-<pr-number>:handled-through-<ISO8601> -->
```

`handled-through` 使用本轮已处理评论、Review 或线程回复中最大的 `updatedAt`；如果没有可用时间，就用回执发布时间。下一轮只需要读取最近一条带该标记的当前 Agent 回执，并处理此时间之后新增或更新的意见。

## 处理流程

1. 读取候选 PR、关联 Issue、当前 Head SHA、PR Draft 状态、PR 评论、Review、行级 Review 评论、Review 线程回复和最新文件，并生成本轮意见清单。
2. 如果本轮意见清单为空，或只包含 Approve、通过、确认、当前 Agent 回执这类不带修改目标的内容：
   - 不改文件，不发重复回执。
   - 继续下一个候选 PR。
3. 发现需要修改、澄清、说明无法采纳或写回失败原因的意见后：
   - 在共享运行标记目录创建本地运行标记。
   - 如果本轮只需要澄清、说明无法采纳或确认无需处理，不创建 worktree、不改文件、不提交；直接发布 PR 回执，并按需要回写 Issue 状态。
   - 如果本轮需要修改正文、运行校验、提交或推送，创建候选 PR 专属 worktree，并确认后续修改流程的 `cwd` 是该 worktree。
   - 如果 PR 仍是 Draft，且关联 Issue 是 `阶段：写作`，用 `article-hub update-status` 的 `content-transition` 保持 `阶段：写作` + `AI：处理中`。
   - 如果 PR 仍是 Draft，且关联 Issue 是 `阶段：审核`，用 `article-hub update-status` 的 `lifecycle-transition` 做 `审核→写作`，目标状态为 `阶段：写作` + `AI：处理中`。
   - 如果 PR 已不是 Draft，且关联 Issue 是 `阶段：写作`，先确认 Ready for review 检查通过，再用 `article-hub update-status` 的 `lifecycle-transition` 做 `写作→审核`，目标状态为 `阶段：审核` + `AI：处理中`。
   - 如果 PR 已不是 Draft，且关联 Issue 是 `阶段：审核`，用 `article-hub update-status` 的 `content-transition` 保持 `阶段：审核` + `AI：处理中`。
   - 记录开始处理时的 PR Head SHA，提交或推送前重新读取并比对；Head 已变化时停止，不覆盖人工修改。
4. 对本轮意见先逐条归类，并记录处理动作：
   - 表达/结构类：明确给出修改目标和范围时，进入正文修改；只表达感受或范围过大且存在多种改法时，回复澄清问题。
   - 素材类：能在现有公开素材内处理时修改；需要新增截图、GIF、Demo、敏感信息或素材来源确认时，回复澄清或转人工。
   - 事实类：回固定来源核验；无法核验时回复需要谁确认、需要什么来源。
   - 需澄清：不改正文、不提交，回复具体待确认问题。
   - 无法采纳：不改正文、不提交，回复不采纳理由。
   - 无需处理：Approve、通过、确认或纯感谢等不含修改目标的内容，不发单独回复；若本轮还有其他意见，在回执中说明已忽略原因。
5. 自动处理范围：
   - Request changes 中明确要求修改的内容。
   - 明确可执行评论，包括 PR 级评论、行级评论和 Review 线程。
   - `/ai 修改指令`。
   - `/ai 全文润色` 作为新一轮全文修改处理，完成后提示需要重新确认。
6. 需要停止转人工的情况：
   - 普通讨论、提问或无明确修改目标，但仍需要人工给出方向；纯赞同、Approve、通过或确认按“无需处理”归类。
   - 评论互相冲突。
   - 缺少事实来源。
   - 涉及版本、API、兼容性、性能、安全、代码正确性但无法回到固定来源确认。
   - 需要人工确认截图、GIF、Demo、敏感信息或素材来源。
   - PR Head 与开始处理时不一致。
7. 修改正文时使用 `polish-opentiny-article`：
   - 只修改本轮授权范围。
   - 不改 Front Matter、代码块、命令、日志、API、版本号、Commit、图片路径、链接目标、Mermaid 或 SVG 源内容，除非评论明确要求且来源可核验。
   - 不新增来源外事实、数据、用户反馈、产品能力或因果关系。
8. 如果本轮实际修改了正文，运行 `article-hub validate article`。
9. 如果本轮实际修改了正文，校验通过后提交本轮修改；如果只回复澄清、无法采纳或无需处理，不创建空 commit。
10. 发布“AI 巡检处理回执”，列出：
    - 本轮意见清单：每条评论链接或 Review ID。
    - 每条意见的处理结论：已改、需澄清、无法采纳、无需处理或失败。
    - 已改意见对应的 Commit SHA；本轮未改正文时写明无 Commit。
    - 需澄清的问题、无法采纳的理由和仍需人工确认的问题。
    - 是否需要运营或技术维护者重新检查。
    - 正文末尾的隐藏 `dedupe_key` 标记。
11. 用 `article-hub update-status` 把关联 Issue 改回 PR 状态对应阶段 + `AI：等待人工`：Draft PR 回到 `阶段：写作`；Ready PR 回到 `阶段：审核`。
12. 正常完成并清理 worktree 后，删除本地运行标记；失败状态已回写后删除本地运行标记但保留 worktree；过期标记不要删除。

## 失败处理

- 如果遇到意见冲突、事实缺口、素材需确认或 Head SHA 变化，用 `article-hub update-status` 改为当前阶段 + `AI：等待人工`，并在 PR 回执和 Issue 评论中写清阻断点；PR 回执不得只有标题，必须包含受影响评论链接、停止原因、待确认问题和下一步负责人。
- 如果环境、权限、命令或 GitHub 写操作失败，用 `article-hub update-status` 改为当前阶段 + `AI：失败`，并写清失败命令、错误摘要和建议处理方式；PR 失败报告不得只有标题，必须包含失败命令、错误摘要、受影响评论链接、worktree 路径和可继续处理的入口。

## 本轮输出

本轮结束时，请输出：

- 本轮检查的 PR 数量。
- 本轮使用并已清理的 worktree 路径；没有创建时说明未进入写文件流程，失败或阻断时输出保留路径。
- 已处理的 PR。
- 跳过的 PR 和原因。
- 需要人工处理的 PR/Issue。
- 失败项。
