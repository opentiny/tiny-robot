# 本地文章 PR 巡检任务

你正在 ai-article-hub 仓库中执行本地文章 PR 定时巡检。请只做本轮巡检，不要实现 GitHub Workflow，不要创建常驻服务。

## 启动检查

启动时把当前仓库绝对路径记为 `scheduler_root`。本轮使用 **runtime worktree** 构建 CLI，不在主仓 install/build，也不与 `local-repo-sync` 互斥。

```text
业务标记目录 = <scheduler_root>/.cache/article-hub/scheduled-runs/
失败记录 = <scheduler_root>/.cache/article-hub/scheduled-runs/system/pr-watch.json
runtime_worktree = <scheduler_root>/.worktrees/pr-watch-runtime-<started-at-yyyymmdd-hhmmss>
cli_root = <runtime_worktree>
operation_root = <候选 worktree；未创建时为空>
<article_hub> = node "<runtime_worktree>/scripts/article-hub-launcher.mjs"
```

本文后续出现的 `<article_hub>` 都必须替换成上面的完整命令；禁止直接运行裸 `article-hub`，禁止依赖全局安装、`PATH` 或主仓 `dist`。launcher 固定加载 runtime 的 `dist/cli.js`，并保留调用进程的 `cwd`（候选 worktree 或 runtime）。

执行候选发现前按顺序完成一次启动检查：

1. 确认 `scheduler_root` 是 git 仓库根：
   ```bash
   git -C "<scheduler_root>" rev-parse --show-toplevel
   ```
   必须等于 `scheduler_root`。
2. 运行 `node --version`、`corepack pnpm --version` 和 `gh auth status --hostname github.com`，确认 Node.js 版本不低于 20；任一检查失败时按启动检查失败处理。
3. 固定本轮代码基线（**不要**依赖主仓当前分支或 `HEAD`）：
   ```bash
   git -C "<scheduler_root>" fetch origin main
   git -C "<scheduler_root>" rev-parse origin/main
   ```
   将解析结果记为 `run_base_sha`。本轮 runtime worktree 锚定此 SHA；候选 PR worktree 从 PR Head 创建。
4. 创建 runtime worktree：
   ```bash
   git -C "<scheduler_root>" worktree add --detach \
     "<runtime_worktree>" \
     "<run_base_sha>"
   ```
   路径必须位于 `<scheduler_root>/.worktrees/`。创建失败时进入启动失败路径，不得在主仓继续 install/build。
5. 在 **runtime worktree** 内安装与构建：
   ```bash
   corepack pnpm install --no-lockfile
   corepack pnpm run build
   ```
   工作目录为 `runtime_worktree`。按当前机器 npm registry 解析依赖；不要生成或读取 `pnpm-lock.yaml`。构建因依赖缺失失败时，只允许在 runtime 内补跑一次 install 并重试一次 build。
6. 运行 doctor，`--root` / `--config` 指向 runtime：
   ```bash
   <article_hub> doctor --root "<runtime_worktree>" --config "<runtime_worktree>/config/projects.yml"
   ```
   确认退出码为 0 且输出 `ok: true`。

启动检查失败时不得读取或修改候选 PR/Issue，不得创建候选运行标记，也不得向 GitHub 发布评论。用文件写入工具把失败记录保存到 `失败记录`（至少包含失败时间、操作系统及版本、当前 shell、`scheduler_root`、`run_base_sha`、`runtime_worktree`、失败命令、退出码和原始错误）；在本轮输出中报告同样信息后停止。若已创建 runtime worktree，保留路径供排查。自动恢复只使用 pnpm，不运行 `npm install`。

本任务**不**检查、**不**写入、**不**依赖 `system/repo-sync.json` 做互斥；repo-sync 可与本轮并行。

## 范围

- 只处理打开的 Draft PR 或普通 PR。
- 候选 PR 必须满足以下任一条件：PR 描述关联文章 Issue、分支名符合 `article/<issue-number>-...`、改动包含 `articles/<project-id>/<date>-<slug>/article.md`。
- 每轮最多处理 3 个需要动作的候选 PR；上限按完成候选排序和动作判定后的结果计算。
- 调度入口可以在主仓库启动；本轮 install/build/doctor 在 runtime worktree；凡要改文章、校验、提交或推送，必须切到候选 PR 专属 Git worktree。

## 主仓与路径 contract

本任务**不得**为业务目的改动 `scheduler_root` 的检出分支或 tracked 文件。仓库同步只由 `docs/prompts/local-repo-sync.md` 在主仓执行；本任务不执行 `git pull` / `git merge --ff-only` 更新主仓。

在 `scheduler_root` 内**禁止**：

- `git checkout`、`git switch`、`git merge`、`git pull`、`git rebase`、`git reset`、`git stash`、`git clean`（`fetch` 与 `worktree add/remove` 除外）
- 在主仓 `commit` / `push` / 修改 `articles/` 或其它 tracked 源码与配置
- 在主仓 install/build，或以主仓当前 `HEAD` 为起点创建业务分支，或在主仓检出 `pr-watch/...` / 文章 PR 分支

在 `scheduler_root` 内**允许**：

- `git fetch`（更新 remote-tracking 或本任务的显式 ref，不改当前分支）
- `git worktree add` / `git worktree remove`（仅操作 `.worktrees/` 下路径）
- 读写 `.cache/article-hub/`（含 `scheduled-runs/` 与临时 Markdown）；系统临时目录
- 只读：读任务文件、`gh` 只读 API

**不要求**本轮结束时主仓 `HEAD` 等于启动时的 `HEAD`：repo-sync 可能并行更新主仓；业务隔离靠 runtime / 候选 worktree 与固定 `run_base_sha`，不靠冻结主仓。

CLI 始终使用 runtime 的 `<article_hub>`；改正文命令的进程 `cwd` 必须是候选 worktree。

## 关联 Issue 识别

1. 优先读取 PR 描述里的关联 Issue 链接。
2. 其次从分支名 `article/<issue-number>-...` 解析 Issue 编号。
3. 再从 `articles/publications.json` 或文章目录对应记录查找 Issue 编号。
4. 分支名不符合 `article/<issue-number>-...` 时，继续尝试用 PR 描述和改动文件识别关联 Issue；识别成功后进入本轮检查，并在回执中报告“PR 分支名不符合文章分支 contract”。
5. 如果仍找不到关联 Issue，停止处理该 PR，不改文章、不改标签；只在本地输出原因。

## 候选发现与排序

先抓取打开的 Draft PR 和普通 PR 候选池，按 PR number 去重，再按 `updatedAt` 降序排序；建议至少抓取 50 条。对排序后的 PR 逐个读取 `number,title,body,headRefName,headRefOid,isDraft,updatedAt,files,comments,reviews`，判断是否满足候选条件。完成本地排序后，再进入处理步骤。

每轮最多处理 3 个“需要动作”的 PR；这 3 个名额只统计会执行正文修改、状态更新、澄清回执、无法采纳回执、分支风险回执或失败回写的 PR。

需要动作的优先级如下：

1. 最新 `Request changes`、行级 Review 评论、Review 线程回复或明确 `/ai` 指令。
2. PR 级评论中的明确可执行修改意见。
3. 分支名不符合 `article/<issue-number>-...`，但 PR 描述或文件路径能识别文章 Issue；这种情况发布一次回执说明风险，后续按 body 或文件路径识别。

本轮达到 3 个处理名额后，本轮写操作到此结束，并在本轮输出中列出因名额限制未处理的 PR 编号、`updatedAt` 和触发原因。

## 共用安全规则

- 找到关联 Issue 后，先读取 Issue 标签和 PR 最新 Head SHA。
- 处理前检查共享运行标记 `<scheduler_root>/.cache/article-hub/scheduled-runs/<issue-number>.json`。
- 同一 Issue 有未完成运行标记时跳过。
- 运行标记已过期时不要删除、不要抢占，只报告“疑似遗留运行”，并要求人工确认。
- Issue 含 `AI执行：人工暂停` 时立即停止处理该 PR。
- 所有状态标签只能通过 `<article_hub> update-status` 修改，不能手工拼标签。
- PR 评论、Review、行级线程和 Request changes 中，能评论即视为已授权；不额外判断写权限或 allowlist。
- 不自动 Resolve conversation，不点击 Ready for review，不 merge，不发布外部平台。
- Issue/PR **会话评论** mutation 的唯一入口是 `<article_hub> comment publish`（或 `update-status --comment-file` 的附加评论）。禁止直接执行 `gh pr comment`、`gh issue comment`、Issue comments API POST 或网页发布；CLI 不可用时停止，不得 fallback。
- 会话评论发布固定流程：
  1. 用文件写入工具（Write）把完整正文写入临时 Markdown 文件（系统临时目录或本轮缓存目录，不提交 git）；不要用 here-doc、`echo -e`、`printf` 或带 `\n` 的 shell 字符串拼多行正文。
  2. 命令 `cwd` 必须是 `scheduler_root`、runtime worktree 或候选 worktree，且三者 `origin` 推导为同一仓库；不传 `--repository`。
  3. 运行 `<article_hub> comment publish --target pr|issue --number <n> --body-file <文件>`；只在 `delivery.status == "created"` 时声明评论发布成功。
  4. 需要核对 mutation plan 时可用 `--dry-run`，检查 target、repository、`body.line_count` 和 operation。
  5. `CURRENT_REPOSITORY_INVALID`、`GITHUB_COMMAND_FAILED`、`COMMENT_RESULT_INVALID` 或 CLI 不可用时停止；`retry_safe: false` 时不得盲目重试 publish。
- 附件下载、只读 `gh pr view` / `gh api` 与既有授权的非评论 GitHub 操作不受本规则改写。

## GitHub 评论附件下载

人工在本轮已授权评论中提供 `https://github.com/user-attachments/assets/<uuid>` 图片，并明确要求补入文章时，把它作为现有素材自动处理。只有来源或授权不明、需要重新生成素材，或需要人工检查敏感信息时才转人工。

按以下顺序处理：

1. 先创建候选 PR 专属 worktree。确认附件 URL 使用 HTTPS、host 为 `github.com`，且 path 完整匹配 `/user-attachments/assets/<uuid>`；拒绝其他外链。
2. 把附件下载到该 worktree 的文章目录 `assets/`。先以 URL 末尾 UUID 命名临时文件 `<attachment-uuid>.part`；临时文件已存在时停止，不得覆盖。
3. 使用 `gh api` 下载，以便读取私有仓库评论附件：

```bash
gh api "<attachment-url>" > "<worktree 内文章 assets 绝对路径>/<attachment-uuid>.part"
```

4. 只有命令退出码为 0、临时文件存在且非空时才继续。下载遇到网络错误、`408`、`429` 或 `5xx` 时最多重试 3 次，间隔 1、2、4 秒；其他错误不重试。失败后删除本轮创建的临时文件并保留 stderr。
5. 根据文件内容识别实际类型，只接受 PNG、JPEG、GIF 或 WebP，不根据 URL、alt text 或文件名猜测。评论明确要求 GIF 等特定格式但实际类型不符时，删除临时文件并标记 `ATTACHMENT_TYPE_MISMATCH`，请求人工提供正确素材。
6. 正式文件名优先采用评论明确指定的名称；未指定时根据内容和引用位置生成简短的 kebab-case 名称，扩展名必须匹配实际类型。评论 Markdown 的 alt text 不视为文件名。正式文件已存在时停止，不得覆盖。
7. 把临时文件改为正式文件名，在评论指定位置补入图片引用，运行文章校验，并继续 Head SHA 检查、提交和推送流程。
8. 在“AI 巡检处理回执”的对应意见下记录原始附件 URL、正式文件名、实际类型、字节数和文章引用位置。

## Worktree 隔离

Issue、PR 两个巡检任务共享以下运行标记目录，不得写到 runtime 或候选 worktree 的 `.cache` 中作为互斥依据：

```text
<scheduler_root>/.cache/article-hub/scheduled-runs/
```

本轮有两类 worktree：

| 类型 | 路径示例 | 起点 | 用途 |
| --- | --- | --- | --- |
| runtime | `.worktrees/pr-watch-runtime-<ts>` | `run_base_sha` | install/build/doctor、提供 `<article_hub>` |
| 候选 | `.worktrees/pr-watch-<pr>-<ts>` | 已核对的 `pr_head_sha` | 改正文、校验、commit、push |

候选识别、PR/Issue 读取、去重判断和无需改文件的状态提示可以在 `scheduler_root` 或 runtime 执行。一旦本轮要修改文章、运行校验、提交或推送，必须先创建候选 PR 专属 worktree，并从 PR 当前 Head 开始处理。为避免 repo-sync 或其他并行 `fetch` 覆盖共享状态，把 PR Head 抓取到本任务的显式 ref，再解析为不可变的 `pr_head_sha`；禁止使用 `FETCH_HEAD`、主仓当前 `HEAD`，也禁止先在主仓 `checkout` 该 PR 分支。

```bash
pr_fetch_ref="refs/article-hub/pr-watch/<pr-number>"
git -C "<scheduler_root>" fetch --no-write-fetch-head origin \
  "+refs/pull/<pr-number>/head:${pr_fetch_ref}"
git -C "<scheduler_root>" rev-parse "${pr_fetch_ref}^{commit}"
git -C "<scheduler_root>" worktree add -b pr-watch/<pr-number>-<started-at-yyyymmdd-hhmmss> \
  "<scheduler_root>/.worktrees/pr-watch-<pr-number>-<started-at-yyyymmdd-hhmmss>" \
  "<pr_head_sha>"
```

执行要求：

- 把 `rev-parse` 结果记为 `pr_head_sha`，再用 `gh pr view --json headRefOid` 回读 PR；两者不一致时停止本候选，不创建 worktree。
- 令 `operation_root = <候选 worktree>`。后续所有正文修改、校验、提交、推送和 `<article_hub> create-pr` 命令的 `cwd` 都必须是 `operation_root`；CLI 使用 runtime 的 `<article_hub>`。
- 运行标记仍读写 `<scheduler_root>/.cache/article-hub/scheduled-runs/<issue-number>.json`。
- 不在 `scheduler_root` 写文章文件、素材、可提交临时文件或 Git 暂存区；临时 Markdown 只放系统临时目录或主仓 `.cache/`。
- 候选 worktree 创建失败时，本轮停止处理该 PR；不得回到 `scheduler_root` 或仅在 runtime 继续修改。
- 提交或推送前重新读取 `headRefOid` 并与 `pr_head_sha` 比对；Head 已变化时停止，不覆盖人工修改。
- 只处理可推回原 PR 分支的 PR。跨仓库 PR 或无法确认 push 目标时，停止并请人工处理。
- 如果 PR 分支名不符合 `article/<issue-number>-...`，但已通过 PR 描述或文件路径识别为文章 PR，本轮可以处理无需改文件的回执、澄清和状态同步。若需要修改正文，先请求人工确认是否重建为 `article/<issue-number>-<project-id>-<slug>` 分支；拿到明确确认后再继续会改文件的流程。
- 正常完成并完成 GitHub 回写后，先确认候选 worktree 路径位于 `<scheduler_root>/.worktrees/`，再运行 `git -C "<scheduler_root>" worktree remove --force <候选 worktree 路径>` 清理该候选 worktree，最后删除运行标记；失败、阻断或远端写操作未完成时保留候选 worktree 路径供排查。

## 去重规则

- 每轮读取 PR Draft 状态、PR 评论、Review、行级 Review 评论、Review 线程回复和关联 Issue。
- 读取行级 Review 评论时，必须获取评论正文、评论链接、Review ID、评论 ID、文件路径、行号、`diff_hunk`、`createdAt`、`updatedAt` 和回复；`gh pr view --json reviews,comments` 只能作为摘要，不得替代 `gh api repos/<owner>/<repo>/pulls/<pr-number>/comments --paginate` 或等价 GraphQL `reviewThreads` 读取。
- 找到最近一条当前 Agent 发布的处理回执，标题固定为“AI 巡检处理回执”，正文必须包含隐藏 `dedupe_key` 标记。
- 本轮只消费该回执之后新增或更新的 Request changes、PR 评论、Review、行级 Review 评论、Review 线程回复和明确 `/ai` 指令；先放入本轮意见清单，再逐条判定为已改、需澄清、无法采纳或无需处理。
- 如果没有回执，首次 PR 巡检读取当前全部待处理意见，处理后发布第一条回执。
- 如果评论早于最近回执，但线程后来追加了新回复，按新回复纳入本轮。
- 每轮处理完成后必须发布新的“AI 巡检处理回执”，列出本轮意见清单中每条评论或 Review 的链接、处理结论和依据。只有本轮修改了正文才需要列出 Commit SHA；未改正文时必须说明是需澄清、无法采纳还是无需处理，并写入隐藏 `dedupe_key`。回执正文必须写入临时 Markdown 文件，并通过 `<article_hub> comment publish --target pr --number <pr-number> --body-file <回执文件>` 发布；只接受 `delivery.status == "created"`。
- 失败回执另含隐藏标记 `<!-- ai-article-hub:failure_key=pr-<pr-number>:event-<comment-or-review-id-or-updated-at>:<error-code> -->`。最近回执已含同一 `failure_key` 时，不重复处理或评论；新的 Review、线程回复、`/ai` 指令或人工重试会产生新事件。

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
   - 如果本轮需要修改正文、运行校验、提交或推送，按“Worktree 隔离”抓取并核对 `pr_head_sha`，从该 SHA 创建候选 PR 专属 worktree；令 `operation_root = <候选 worktree>`，后续修改流程的 `cwd` 是 `operation_root`，CLI 仍用 runtime 的 `<article_hub>`。
   - 如果 PR 仍是 Draft，且关联 Issue 是 `阶段：写作`，用 `<article_hub> update-status` 的 `content-transition` 保持 `阶段：写作` + `AI：处理中`。
   - 如果 PR 仍是 Draft，且关联 Issue 是 `阶段：审核`，用 `<article_hub> update-status` 的 `lifecycle-transition` 做 `审核→写作`，目标状态为 `阶段：写作` + `AI：处理中`。
   - 如果 PR 已不是 Draft，且关联 Issue 是 `阶段：写作`，先确认 Ready for review 检查通过，再用 `<article_hub> update-status` 的 `lifecycle-transition` 做 `写作→审核`，目标状态为 `阶段：审核` + `AI：处理中`。
   - 如果 PR 已不是 Draft，且关联 Issue 是 `阶段：审核`，用 `<article_hub> update-status` 的 `content-transition` 保持 `阶段：审核` + `AI：处理中`。
   - 提交或推送前重新读取 PR Head SHA 并与 `pr_head_sha` 比对；Head 已变化时停止，不覆盖人工修改。
4. 对本轮意见先逐条归类，并记录处理动作：
   - 表达/结构类：明确给出修改目标和范围时，进入正文修改；只表达感受或范围过大且存在多种改法时，回复澄清问题。
   - 素材类：能在现有公开素材内处理时修改；人工已在本轮授权评论中提供 GitHub attachment 并明确要求补入文章时，先按“GitHub 评论附件下载”处理。需要重新生成截图、GIF、Demo，或存在敏感信息、来源和授权疑问时，回复澄清或转人工。
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
   - 需要人工生成或确认截图、GIF、Demo、敏感信息或素材来源；人工已在本轮授权评论中提供 GitHub attachment 的情况不在此列，必须先尝试鉴权下载和格式校验。
   - PR Head 与开始处理时不一致。
7. 修改正文时使用 `polish-opentiny-article`：
   - 把 `scheduler_root`、`cli_root = runtime_worktree`、`operation_root` 和 `<article_hub>` 原样交给 Skill；Skill 不重新发现 launcher 或改回主仓执行。
   - 只修改本轮授权范围。
   - 不改 Front Matter、代码块、命令、日志、API、版本号、Commit、图片路径、链接目标、Mermaid 或 SVG 源内容，除非评论明确要求且来源可核验。
   - 不新增来源外事实、数据、用户反馈、产品能力或因果关系。
8. 如果本轮实际修改了正文，运行 `<article_hub> validate article`。
9. 如果本轮实际修改了正文，校验通过后提交本轮修改；如果只回复澄清、无法采纳或无需处理，不创建空 commit。
10. 发布“AI 巡检处理回执”，列出：
    - 本轮意见清单：每条评论链接或 Review ID。
    - 每条意见的处理结论：已改、需澄清、无法采纳、无需处理或失败。
    - 已改意见对应的 Commit SHA；本轮未改正文时写明无 Commit。
    - 需澄清的问题、无法采纳的理由和仍需人工确认的问题。
    - 是否需要运营或技术维护者重新检查。
    - 正文末尾的隐藏 `dedupe_key` 标记。
    - 回执正文保存到临时 Markdown 文件后，用 `<article_hub> comment publish --target pr` 发布；只在 `delivery.status == "created"` 时视为成功。
11. 用 `<article_hub> update-status`（不传 `--repository`；需要评论时用 `--comment-file`）把关联 Issue 改回 PR 状态对应阶段 + `AI：等待人工`：Draft PR 回到 `阶段：写作`；Ready PR 回到 `阶段：审核`。
12. 正常完成并清理**候选** worktree 后，删除本地运行标记；失败状态已回写后删除本地运行标记但保留候选 worktree；过期标记不要删除。

## 失败处理

- 如果遇到意见冲突、事实缺口、素材需确认或 Head SHA 变化，用 `<article_hub> update-status` 改为当前阶段 + `AI：等待人工`，并在 PR 回执和 Issue 评论中写清阻断点；PR 回执不得只有标题，必须包含受影响评论链接、停止原因、待确认问题和下一步负责人。
- 附件处理失败时，回执包含原始附件 URL、失败步骤、`gh api` 退出码或文件校验结果、重试次数和临时文件清理结果。附件不存在或格式不符时按“需澄清”回到 `AI：等待人工`；工具、认证或网络失败时进入 `AI：失败`。回执不得包含凭据或重定向后的 URL。
- 如果环境、权限、命令或 GitHub 写操作失败，且 `<article_hub>` 仍可用，用 `<article_hub> update-status` 改为当前阶段 + `AI：失败`；PR 失败报告写入临时 Markdown 文件，用 `<article_hub> comment publish --target pr` 发布，必须包含失败命令、原始错误、退出码、受影响评论链接、候选 worktree、可继续处理的入口和 `failure_key`；只接受 `delivery.status == "created"`。若返回 `PARTIAL_MUTATION`：`mutation_state: "unknown"` 时不得盲目重试评论；`mutation_state: "created"` 时保留已返回的 comment URL/ID 与本地正文文件，不重复执行已完成的标签或评论操作，也不 fallback 到裸 `gh`。
- 如果 `<article_hub>` 本身意外失效，不得用 `gh` 手工修改标签，也不发布可能被重复消费的 PR 失败评论。把原始错误追加到 `scheduled-runs/system/pr-watch.json`，保留候选运行标记和 worktree，在本轮输出中报告可恢复入口后停止。

## 整轮收尾

所有候选处理结束后（含「本轮无待处理项」或启动失败后的停止）：

1. 确认已无未清理的**成功完成**的候选 worktree；失败/阻断保留的候选路径在输出中列出。
2. 若本轮创建了 runtime worktree 且启动检查已成功走过，正常结束时运行 `git -C "<scheduler_root>" worktree remove --force "<runtime_worktree>"` 清理 runtime。启动失败、runtime 构建失败或需保留排查证据时，保留 runtime 路径并在输出中说明。
3. **不要**验收或要求主仓 `end_head == start_head`；主仓可能被 `local-repo-sync` 并行更新。
4. **不要**写入 `system/pr-watch.json` 作为与 repo-sync 的互斥 running 标记；该文件仅用于启动/CLI 失效等失败记录。

## 本轮输出

本轮结束时，请输出：

- 本轮检查的 PR 数量。
- `run_base_sha` 与 runtime worktree 路径及清理结果。
- 本轮使用并已清理的候选 worktree 路径；没有创建时说明未进入写文件流程，失败或阻断时输出保留路径。
- 已处理的 PR。
- 跳过的 PR 和原因。
- 因本轮 3 个处理名额限制未处理的 PR、`updatedAt` 和触发原因。
- 需要人工处理的 PR/Issue。
- 失败项。
