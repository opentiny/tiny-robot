# 本地文章正式发布巡检任务

你正在 ai-article-hub 仓库中执行本地文章正式发布定时巡检。请只做本轮巡检，不要实现 GitHub Workflow，不要创建常驻服务。

## 范围

- 只处理 `articles/publications.json` 中已有记录的文章。
- 必须在独立 Git worktree 中执行本轮巡检，不得在用户当前工作区或其他巡检任务的工作区内发布或回写 `articles/publications.json`。
- 候选文章必须满足：
  - `article_file` 指向的母稿存在且非空。
  - 目标平台在该文章的 `publications` 中没有正式发布记录。
- 目标平台按定时任务 prompt 指定；未指定时使用当前 Skill 已支持的平台：`juejin`、`csdn`、`segmentfault`、`oschina`。
- 每轮最多处理 3 个「文章 + 平台」候选项。
- 本任务直接正式发布文章；发布成功并拿到平台文章 URL 后，必须回写 worktree 内的 `articles/publications.json`。
- 本任务必须在 worktree 分支上 commit、push 并创建 PR；PR 只包含已成功发布的平台记录。
- 仓库同步只由 `local-repo-sync` 在主仓执行；本任务与 repo-sync **不互斥**，不要求结束时主仓 `HEAD` 与启动时相同。

## 必读资料

每轮执行前必须读取以下文件，不要凭记忆执行：

- `.agents/skills/webmcp-cli-skill/SKILL.md`
- `.agents/skills/webmcp-cli-skill/domains/publish-from-article-hub.md`
- `.agents/skills/webmcp-cli-skill/domains/publish-article.md`
- 目标平台对应子指南：
  - `juejin`：`.agents/skills/webmcp-cli-skill/domains/publish-article-in-juejin.md`
  - `csdn`：`.agents/skills/webmcp-cli-skill/domains/publish-article-in-csdn.md`
  - `segmentfault`：`.agents/skills/webmcp-cli-skill/domains/publish-article-in-segmentfault.md`
  - `oschina`：`.agents/skills/webmcp-cli-skill/domains/publish-article-in-oschina.md`

## 启动与 runtime / 候选 worktree

启动时把主仓库绝对路径记为 `scheduler_root`（定时任务工作目录）：

```text
失败记录 = <scheduler_root>/.cache/article-hub/scheduled-runs/system/publish-watch.json
runtime_worktree = <scheduler_root>/.worktrees/publish-watch-runtime-<started-at-yyyymmdd-hhmmss>
候选 worktree = <scheduler_root>/.worktrees/publish-watch-<started-at-yyyymmdd-hhmmss>
cli_root = <runtime_worktree>
operation_root = <候选 worktree>
<article_hub> = node "<runtime_worktree>/scripts/article-hub-launcher.mjs"
```

1. 确认 `git -C "<scheduler_root>" rev-parse --show-toplevel` 等于 `scheduler_root`。
2. **不要**检查或依赖 `system/repo-sync.json` 做互斥；不要写入整轮 `system/publish-watch.json` running 标记（该路径仅作失败记录）。
3. 固定本轮基线：
   ```bash
   git -C "<scheduler_root>" fetch origin main
   git -C "<scheduler_root>" rev-parse origin/main
   ```
   记为 `run_base_sha`。
4. 创建 runtime worktree 并在其中 install/build（提供本轮 CLI）：
   ```bash
   git -C "<scheduler_root>" worktree add --detach "<runtime_worktree>" "<run_base_sha>"
   # cwd = runtime_worktree
   corepack pnpm install --no-lockfile
   corepack pnpm run build
   ```
5. 从同一 `run_base_sha` 创建候选发布 worktree（承载 `publications.json` 回写与 PR 分支）：
   ```bash
   git -C "<scheduler_root>" worktree add -b publish-watch/<started-at-yyyymmdd-hhmmss> \
     "<候选 worktree>" \
     "<run_base_sha>"
   ```
6. 在 `scheduler_root` 内禁止为业务目的 `checkout`/`switch`/`merge`/`pull`/`rebase`/`reset`/`stash`/`clean`（`fetch` 与 `worktree add/remove` 除外），禁止在主仓改 `articles/` 或其它 tracked 文件。

## Worktree 隔离

本任务会真实发布外部平台文章，并回写发布状态。为避免多个巡检任务或人工工作互相覆盖，必须使用独立 worktree；**禁止**用主仓当前 `HEAD`，禁止先在主仓 `checkout main`。

执行要求：

- 后续所有发布、校验、候选运行标记、失败记录和 `articles/publications.json` 回写的 `cwd` 都必须是**候选** worktree；CLI 使用 runtime 的 `<article_hub>`。
- 不切换主仓当前分支，不修改主仓 tracked 文件。
- 如果 worktree 创建失败，本轮停止，不要在主工作区继续执行。
- 候选与 runtime 的清理条件统一按“整轮收尾”的 outcome 表执行。
- **不要**要求主仓 `end_head == start_head`。

## 候选识别

> 因为发布成功后的回写 PR 需等待人工合并（见「共用安全规则」），`origin/main` 上的 `articles/publications.json` 可能滞后于真实发布事实：某个「文章 + 平台」可能已在上一轮发布成功、且已生成尚未合并的回写 PR，但 `main` 上还没有它的 `url`。判断是否已发布时，必须同时参考 `main` 和这些待合并 PR，否则会对同一「文章 + 平台」重复发布，在平台上产生重复文章。

1. 读取 worktree 中的 `articles/publications.json`（对应 `origin/main`，可能滞后于待合并 PR）。
2. 收集「待合并回写 PR」中已记录的发布事实，作为去重依据的一部分：
   - 用 `gh pr list --repo <repository> --state open --json number,title,headRefName` 列出打开的 PR，筛出本任务创建的回写 PR：分支名以 `publish-watch/` 开头，或标题为 `chore(publications): record platform publish results`。
   - 对每个这样的 PR，用 `gh api repos/<owner>/<repo>/contents/articles/publications.json?ref=<headRefName>`（`<owner>/<repo>` 即 `<repository>`）读取该分支上的 `publications.json`，对返回内容做 base64 解码后解析，按 `article_file` 归并出「已在待合并 PR 中记录 `url` 的 文章 + 平台」集合，并记住对应 PR 编号。
   - 无法列出 PR，或无法读取/解析某个回写 PR 的 `publications.json` 时，不得假设「未发布」：记录该 PR 无法核对，对它可能覆盖的「文章 + 平台」保守转人工，不在本轮重复发布。
3. 遍历 `articles` 中的每条记录，保留 `article_file`、`title`、`topic_issue`、`source_pr` 和 `publications`。
4. 对每个目标平台检查（「已发布」以 `main` 与待合并 PR 的并集为准）：
   - 如果 `main` 的 `publications[platform].url` 存在，说明已是合并入库的正式发布事实，跳过。
   - 如果该「文章 + 平台」已在某个待合并回写 PR 中记录 `url`，说明已发布但等待人工合并，跳过并记录所在 PR 编号，不重复发布。
   - 如果 `article_file` 不存在、为空或无法读取，跳过并记录原因。
5. 对候选按 `publications.json` 中的文章顺序和目标平台顺序处理。

## 共用安全规则

- 不修改母稿 `article.md`。
- 只在独立 worktree 中修改 `articles/publications.json`；不得在主工作区回写。
- 必须调用正式发布动作；只写入草稿、审核中、未取得平台文章 URL 都不算完成。
- 不创建或修改 GitHub Issue/PR 标签。
- 本任务只创建或更新回写 PR，不负责合并；合并一律等待人工审核后由人工完成。禁止以任何形式合并该 PR：不执行 `gh pr merge`（含 `--auto`、`--merge`、`--squash`、`--rebase` 等任何子选项）、不启用 auto-merge、不在网页点击合并按钮、不把回写改动直接推到 `main` 或其他受保护分支。
- 目标平台未登录、跳转登录页、账号异常、验证码、需真人点击的二次确认弹窗或权限不足时，停止处理该候选，记录失败原因。思否工具 API 的 `publish` + `confirm: true` 属于流程必填参数，在 `get_state` 通过后允许调用，不视为需停止的「二次确认」。
- 已存在正式发布记录时，默认不覆盖、不重发。
- `.cache/`、临时参数文件和本轮 worktree 不得提交。
- commit 只能包含 `articles/publications.json`；不得把 `.cache/`、临时参数文件或文章正文变更加入提交。
- 写入 GitHub 的多行正文（PR body、Issue/PR 评论、巡检回执）必须走「临时文件 + `--body-file`」，这是强制三步，不是可选优化：
  1. 用文件写入工具（Write）把完整正文写入临时 Markdown 文件（放系统临时目录或本轮 worktree 的 `.cache/article-hub/` 下，不提交 git）；不要用 here-doc、`echo -e`、`printf` 或带 `\n` 的转义字符串在 shell 里拼多行正文，这些写法会被 `$(...)`、反引号、`!` 触发展开或截断而损坏内容。
  2. 用 `--body-file <文件路径>` 传给 `gh`，`gh pr create`、`gh pr comment`、`gh issue comment` 全都一样；禁止用 `--body "多行内容"` 内联。原因：正文里的 `"`、反引号、`$(...)`、`!` 或换行会提前终止 shell 引号，使 `gh` 只收到首行、其余被当成独立命令，PR/评论最终只剩标题行甚至误触发命令。
  3. 发布后回读刚写入的 PR body 或评论（`gh pr view <number> --json body,comments` 或 `gh issue view <number> --json comments`），确认正文行数大于 1 且包含预期章节；只剩单行标题或正文缺失时按 GitHub 写操作失败处理，不得声称成功。

## 运行标记

开始处理某个「文章 + 平台」前，先检查本地运行标记：

```text
.cache/article-hub/scheduled-runs/publish-watch-<safe-article-id>-<platform>.json
```

标记建议使用 JSON：

```json
{
  "article_id": "tiny-robot/2026-07-01-tinyrobot-ai-service-communication",
  "platform": "juejin",
  "task": "publish-watch",
  "agent": "<agent-name>",
  "started_at": "<started-at-iso8601>",
  "expires_at": "<expires-at-iso8601>",
  "thread": "本地定时任务名称或当前对话说明",
  "worktree": ".worktrees/publish-watch-<started-at-yyyymmdd-hhmmss>",
  "branch": "publish-watch/<started-at-yyyymmdd-hhmmss>",
  "status": "running"
}
```

处理规则：

- 同一「文章 + 平台」存在未完成标记时，本轮跳过。
- 标记已过 `expires_at` 时，不自动删除、不抢占，输出“疑似遗留运行”，要求人工确认。
- 候选为空时不创建标记。
- 正常完成并回写 `articles/publications.json` 后删除运行标记。
- 失败后删除运行标记，并写入失败记录；过期标记不要删除。

## 发布状态回写

正式发布成功后，必须在 worktree 的 `articles/publications.json` 中写入平台发布事实：

```json
"juejin": {
  "url": "https://juejin.cn/post/7345678901234567890",
  "published_date": "2026-07-03"
}
```

回写规则：

- `url` 必须是平台正式文章 URL，不得写草稿箱、编辑器、审核页或用户主页 URL。
- `published_date` 使用发布成功时刻的 UTC+8 日期，格式为 `YYYY-MM-DD`。
- 保留该文章条目已有字段和其他平台记录，只新增或更新本次平台 key。
- 单篇文章内 `publications` 的 key 建议按字典序排列；平台记录字段顺序固定为 `url`、`published_date`。
- 发布成功但回写失败时，保留 worktree 和运行证据，输出平台 URL、失败原因和需要人工处理的文件路径。

失败时可在 worktree 写入本地失败记录，便于下轮巡检读取：

```text
.cache/article-hub/publish-watch-failures/<article-id>/<platform>.json
```

记录建议使用 JSON：

```json
{
  "schema_version": "article-hub.publish-watch-failure.v1",
  "article_id": "tiny-robot/2026-07-01-tinyrobot-ai-service-communication",
  "article_file": "articles/tiny-robot/2026-07-01-tinyrobot-ai-service-communication/article.md",
  "title": "打通前后端：从一次消息请求看懂 TinyRobot AI 服务通信链路",
  "platform": "juejin",
  "status": "failed",
  "failed_at": "<failed-at-iso8601>",
  "error_summary": "<失败摘要>",
  "next_action": "<建议动作>",
  "source_pr": 34,
  "topic_issue": 11,
  "notes": []
}
```

失败记录不阻止后续重试；重试前应先读取失败原因，确认是否仍然有效。

## Commit、push 与 PR

本轮至少有 1 个候选正式发布成功并回写 `articles/publications.json` 后，必须在 worktree 分支执行：

```bash
git diff -- articles/publications.json
git status --short
git add articles/publications.json
git commit -m "chore(publications): record platform publish results"
git push -u origin HEAD
gh pr create --title "chore(publications): record platform publish results" --body-file <pr-body.md>
```

`<pr-body.md>` 必须先用 Write 工具写入临时 Markdown 文件（不要用 here-doc/`echo`/`printf` 在 shell 里拼），再用 `--body-file` 传入，禁止 `gh pr create --body "..."` 内联；内容至少包含：

```md
## Summary

- 回写本轮已正式发布的平台文章 URL 与发布日期

## Test plan

- [ ] 核对 `articles/publications.json` 只包含本轮成功发布记录
- [ ] 核对平台 URL 可访问且不是草稿、编辑器或审核页
```

执行要求：

- `git status --short` 中除 `articles/publications.json` 外如有其他变更，必须先确认它们不会被提交；`.cache/` 和临时参数文件保持未跟踪或未暂存。
- `git add` 只允许添加 `articles/publications.json`。
- 创建 PR 前必须运行 `gh auth status`。如果 `gh` 未登录或返回 `401 Bad credentials`，停止在本地 commit 之后，不要 push 或声称已创建 PR；输出需要用户执行 `gh auth login`。
- PR 创建后必须用 `gh pr view <pr-number> --repo <repository> --json body` 回读 PR body，确认正文包含 `## Summary` 和 `## Test plan`；若只剩标题行或正文不完整，按 GitHub 写操作失败处理。
- PR 创建（或更新）并回读成功即为本轮 PR 环节的终点：不得合并该 PR，不运行 `gh pr merge`、不启用 auto-merge、不改动目标分支；把 PR 留在「待人工合并」状态，由人工审核后合并。
- 如果目标分支已存在对应的开放回写 PR（例如同一轮内重跑），只更新该 PR 的分支与正文，同样只更新不合并。
- 如果本轮没有任何成功发布记录，不能创建空 commit、不能 push、不能创建 PR。

## 处理流程

1. 读取必读资料。
2. 完成「启动与 runtime / 候选 worktree」：固定 `run_base_sha`、创建 runtime 与候选 worktree、在 runtime install/build。
3. 确认后续发布与回写命令的 `cwd` 都在**候选** worktree 内。
4. 按「候选识别」得到本轮候选；候选为空时把 outcome 记为 `no_candidates`，只输出本轮无待处理项，并按“整轮收尾”清理本轮 worktree。
5. 对每个候选创建运行标记。
6. 运行文章校验（CLI 用 runtime launcher；`cwd` 可为候选 worktree）：

```bash
<article_hub> validate article --article-file <article_file> --config <runtime_or_candidate>/config/projects.yml
```

构建失败则停止该候选。若 `validate article` 返回 `ok: false` 或存在 `blocking_issues`，停止该候选并记录阻断码，不得继续发布。不要回退到主仓 `dist` 或在主仓 `pnpm run build`。

7. 按目标平台子指南执行正式发布。`tabs open` 返回的 `tabid` 须在后续 `run` 命令中通过 `-t <tabid>` 复用。标题使用 `publications.json` 条目的 `title`；正文使用母稿 `article_file`，**不修改母稿、不生成 `.publish/` 副本**。分类与标签须基于正文智能推断，**切勿盲目使用默认值**。PowerShell 终端下参数较长时，优先使用 `-f` 传 JSON 文件，避免内联转义失败。

   - `juejin` / `csdn` / `oschina`：采用 **打开编辑器 → `create_article` → `get_article_info` → `publish_current_draft`**；正文通过 `@base64file:<article_file>` 传入（这些工具的 `content` 期望 Base64）；调用 `publish_current_draft` 前必须先 `get_article_info`。
   - `segmentfault`：采用 `segmentfault_publish_article` 的 **`publish_full_flow` → `get_state` → `publish`（`confirm: true`）**。其 `content` 期望 **原始 Markdown 字符串**，**禁止**对思否使用 `@base64file:`（否则编辑器会写入 Base64 文本而非正文）。长正文须用 `-f` 传入含原始 Markdown 的 JSON。`publish_full_flow` 只到草稿箱不算完成。

   - `juejin`：
     1. 打开 `https://juejin.cn/editor/drafts/new?v=2`，`webmcp-cli state` 确认工具已注入。
     2. `create_article` 写入标题与正文（`content` 使用 `@base64file:<article_file>`）。
     3. `get_article_info` 获取当前草稿内容。
     4. 基于正文智能推断 `category`、`tag`，并生成 **50~100 字**摘要后调用 `publish_current_draft`。
     5. 记录正式文章 URL。

   - `csdn`：
     1. 打开 `https://editor.csdn.net/md/`，`webmcp-cli state` 确认工具已注入（首次进入可能弹出「模版库」，`create_article` 会自动尝试关闭）。
     2. `create_article` 写入标题与正文。
     3. `get_article_info` 获取当前草稿内容。
     4. 基于正文智能推断 `category`、`tags`（1~3 个），并生成 **100 字以内**摘要后调用 `publish_current_draft`。
     5. 成功时页面跳转到 `mp.csdn.net/.../success/<articleId>`，记录正式文章 URL。

   - `segmentfault`：
     1. 打开 `https://segmentfault.com/howtowrite`（已在 `/write` 可跳过），`webmcp-cli state` 确认已登录且注入 `segmentfault_publish_article`；未登录或跳转到 `/user/login` 时停止该候选。后续 `run` 必须带 `-t <tabid>`。
     2. 校验标题长度为 **5~100 字符**；不合规则停止该候选并记录原因。
     3. 调用 `segmentfault_publish_article`，`action` 为 `publish_full_flow`：写入标题、**原始 Markdown** 正文、`category`、`tags`（最多 5 个）；默认 `type: original`、`scope: personal`、`copyright: true`；**不传 `scheduled_time`**（立即发布）。工具会处理引导页与自动保存（约 4.5 秒），并提示封面需手动上传——本巡检跳过封面，不阻塞后续发布。
     4. 调用 `segmentfault_publish_article`，`action` 为 `get_state`，确认 `can_publish: true`（标题有效、正文非空、标签 1~5 个、已选分类）；不满足则记录 `errors` 并停止该候选，不得伪造发布状态。
     5. 本巡检以正式发布为目标：状态校验通过后立即调用 `segmentfault_publish_article`，`action` 为 `publish` 且 **必须** `confirm: true`（这是工具 API 必填确认，不等于需人工二次审核），不等待草稿箱人工复核。若浏览器验证码、账号异常弹窗等仍需真人操作，停止该候选。
     6. 确认 URL 变为正式文章页（含 `/a/`），记录正式文章 URL；仅得到草稿箱 `https://segmentfault.com/user/draft` 不算成功。若已写入草稿但未发布成功，失败记录须带上草稿箱 URL，供人工清理或续发，避免下轮误开新草稿重复发布。

   - `oschina`：必须已在定时任务 prompt 中提供 `oschina_uid`；未提供则跳过并记录原因。
     1. 打开 `https://my.oschina.net/u/<uid>/blog/ai-write`，`webmcp-cli state` 确认工具已注入。
     2. `create_article` 写入标题与正文。
     3. `get_article_info` 获取当前草稿内容。
     4. 基于正文智能推断 `category`、`tags`，并生成 **50~200 字**摘要后调用 `publish_current_draft`。
     5. 记录正式文章 URL。

8. 确认平台返回的 URL 可访问且不是草稿、编辑器或审核页。
9. 回写 worktree 中的 `articles/publications.json`。
10. 删除运行标记。
11. 继续下一个候选。
12. 若本轮至少有 1 个成功回写记录，按「Commit、push 与 PR」提交、推送并创建（或更新）PR；只创建或更新 PR，不合并。
13. PR 创建成功即为本轮 PR 环节完成，PR 留待人工审核合并，本任务不执行任何合并动作；仅当本轮没有更高优先级的异常结果时，才把 outcome 记为 `completed`。其他结果按“整轮收尾”选择 outcome，不再以“是否创建 PR”单独决定是否保留 worktree。
14. **不要**验收主仓 `end_head == start_head`；**不要**写入与 repo-sync 互斥的整轮 system running 标记。

## 平台参数

定时任务 prompt 可以提供以下参数：

```text
目标平台：juejin, csdn, segmentfault, oschina
oschina_uid：<开源中国 uid，可选；目标平台含 oschina 时必填>
segmentfault_category：前端
segmentfault_tags：前端, AI, OpenTiny
```

未提供 `segmentfault_category` 时，优先根据母稿正文推断后传入 `publish_full_flow` 的 `category`；无法判断时使用 `前端`。未提供 `segmentfault_tags` 时，优先从正文推断后传入 `tags`（最多 5 个）；无法判断时使用 `前端`、`AI`、`OpenTiny`。不传 `scheduled_time`。思否 `content` 必须是母稿原始 Markdown；用 `-f` 传参时把文件正文读入 JSON 的 `content` 字段，不要写 `@base64file:`。

## 失败处理

- 平台未登录：记录失败，提示用户在浏览器中完成登录。
- 平台页面工具未注入：记录失败，提示检查 `webmcp-cli state` 输出。
- `validate article` 阻断：记录失败，输出 `blocking_issues[].code`，不继续发布。
- `publish_current_draft` 报错（如摘要字数不符、标签过多）：记录失败，输出工具返回的错误信息。
- 思否 `publish_full_flow` 成功但仅落到草稿箱：不得回写；须继续同工具的 `get_state` + `publish`（`confirm: true`）。若 `get_state` 返回 `can_publish: false`，或 `publish` 返回 `CANNOT_PUBLISH` / `NOT_CONFIRMED`，记录失败并输出 `errors`；`next_action` 应提示人工处理草稿箱残留草稿。
- 思否标题不足 5 字符或超过 100 字符：记录失败，不调用写入。
- 平台正式文章 URL 无法获取：记录失败，不回写 `articles/publications.json`。
- 平台只保存到草稿或进入审核中：记录失败，不回写 `articles/publications.json`，并输出需要人工确认的页面 URL（思否草稿箱为 `https://segmentfault.com/user/draft`）。
- `articles/publications.json` 回写失败：记录失败，保留 worktree，不删除可追溯证据。
- `gh` 未登录或 token 失效：保留本地 commit，停止 push 和 PR，提示用户完成 GitHub CLI 登录后继续。
- push 或 PR 创建失败：保留 worktree、分支和本地 commit，输出失败命令与下一步处理建议。
- OSChina 未提供 `uid`：跳过该平台，不视为流程失败。
- 候选处理失败后继续处理下一个候选；同一候选不要在同一轮反复重试。

## 整轮收尾

所有候选处理结束后只选择一个最符合本轮最终状态的 outcome，并按表清理。候选 worktree 仅在其中包含可继续使用的本地状态，或外部平台状态需要人工核对时保留；runtime 已成功构建后可重建，不因业务失败长期保留。同轮出现混合结果时，按 `startup_failed` → `external_state_uncertain` → `recording_incomplete` → `completed` → `stopped_before_external_write` → `no_candidates` 的优先级选择第一个符合项，避免已创建 PR 掩盖另一个候选的外部状态风险。

| outcome | 判定条件 | 候选 worktree | runtime worktree |
| --- | --- | --- | --- |
| `no_candidates` | 没有待发布候选，未调用平台写入动作 | 清理 | 清理 |
| `stopped_before_external_write` | 候选均在校验、登录、参数或权限检查阶段停止；未完成平台草稿/正文写入，也没有需继续的 commit | 清理 | 清理 |
| `external_state_uncertain` | 平台草稿/正文写入或正式发布动作已经发生，但没有可确认的正式 URL，存在重复发布风险 | 保留，连同失败记录供人工核对 | 清理 |
| `recording_incomplete` | 已确认正式 URL，但 `publications.json` 回写、commit、push、PR 创建或 PR 回读未完成 | 保留现有文件、分支和 commit | 清理 |
| `completed` | 正式发布事实已回写，PR 已创建或更新且回读成功，且本轮没有外部状态不明或回写未完成的候选 | 清理 | 清理 |
| `startup_failed` | runtime 创建、install、build 或 doctor 失败，尚未进入候选处理 | 未创建则无操作；已创建但无业务状态时清理 | 保留供排查 |

清理前先确认目标路径位于 `<scheduler_root>/.worktrees/`。清理顺序固定为候选 worktree、runtime worktree；保留的路径、分支、commit、失败记录和人工下一步必须写入本轮输出。

## 已知限制与问题记录

- `publish-from-article-hub.md` 定义的是人工发起的单篇发布流程。本任务是本地定时巡检，可以一次处理多个候选；成功发布后仍需在 worktree 分支 commit、push 并创建 PR。
- `articles/publications.json` 只记录正式发布事实。未拿到正式文章 URL 时不得写入平台记录。
- 回写 PR 需等待人工合并，未合并期间 `origin/main` 的 `publications.json` 不含这些记录。候选识别必须同时核对待合并回写 PR（见「候选识别」），否则会对已发布但未合并的「文章 + 平台」重复发布。运行标记在发布成功后即删除，不能作为跨轮去重依据。
- 部分平台指南仍包含“先写草稿、等待人工审核”的阶段说明。本任务以“直接正式发布”为目标；若平台在当前账号下必须人工审核或二次确认，则停止该候选，不伪造发布状态。
- `juejin` / `csdn` / `oschina` 使用 `create_article` → `get_article_info` → `publish_current_draft`（`content` 用 `@base64file:`）。思否按 `publish-article-in-segmentfault.md` / `SKILL.md` 使用 `segmentfault_publish_article`：`publish_full_flow` 只写入并自动保存草稿；本巡检在 `get_state` 通过后以 `publish` + `confirm: true` 完成正式发布，跳过技能文档中的人工草稿箱审核与封面手动上传；封面缺失不视为阻断，但发布结果须人工抽查。若写入草稿后发布失败，平台可能残留草稿，下轮不得在未核对草稿箱的情况下直接再跑 `publish_full_flow` 造成重复草稿。
- 母稿若含相对路径本地图片，平台编辑器可能无法直接展示；`validate article` 仅校验图片文件存在，不负责平台 CDN 上传。发布成功后应人工抽查平台正文中的图片是否正常显示。
- 开源中国需要 `uid`，无法从仓库稳定推断；未配置时只能跳过。
- 每轮都使用独立 worktree。并发巡检不得共用 worktree、运行标记或 `.cache/article-hub/publish-watch-failures/` 子路径；候选与 runtime 是否清理只按“整轮收尾”的 outcome 表判断。

## 本轮输出

本轮结束时，请输出：

- outcome、`run_base_sha`、runtime worktree 与候选 worktree 路径、分支名和清理结果；保留时输出具体原因。
- 本轮检查的候选数量。
- 已正式发布的文章、平台和 URL。
- 已回写的 `articles/publications.json` 条目。
- commit SHA、远端分支和 PR URL，并注明 PR 处于「待人工合并」状态；若未创建 PR，说明阻断点。
- 跳过的候选和原因。
- 失败项及下一步建议。
- 需要人工登录、审核或补参数的平台。
- 未在主仓 tracked 工作区改文件的确认结果。
