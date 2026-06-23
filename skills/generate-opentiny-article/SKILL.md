---
name: generate-opentiny-article
description: 把一个已批准写作计划的 OpenTiny 文章 Issue 在本地生成初稿、校验产物并创建 Draft PR。当用户要将处于「阶段：策划」、写作计划已获维护者批准的 Issue 落地为文章草稿时使用——例如说「把这个 issue 写成文章」「选题/计划批准了，开始写初稿」「帮我生成这篇 OpenTiny 文章的 Draft PR」。仅覆盖本地人工驱动流程；不处理 GitHub 事件自动化、热点发现、定时任务或发布平台适配，这些场景不要用本 Skill。
---

# Generate OpenTiny Article

## 适用范围

使用本 Skill 将一个已批准的文章 Issue 转成可人工 Review 的 Draft PR。流程由本地 Agent 驱动，不监听 GitHub 事件，不实现 Workflow 自动化、热点发现、发布平台适配或外部发布。

## 前置条件

- 已按仓库 `INSTALL.md` 安装本 Skill。
- 本仓库依赖已安装并通过 `npm test`、`npm run build`。
- `gh auth status` 可访问目标仓库。
- Issue 处于 `阶段：策划`，且维护者明确批准当前写作计划。

## CLI 边界

确定性判断和受控 mutation 走 `article-hub`，读取 GitHub 原始事实走 `gh`，二者不互相替代——这样规则只有一处实现，Skill 不会在自然语言里把它们重写偏。

- 普通 GitHub 读取使用 `gh`，例如 `gh issue view --json ...`，并把结果保存为本地 fixture。
- 确定性判断使用 `article-hub`，包括权限过滤、固定命令解析、项目 allowlist、计划 Hash、文章校验、状态 guard 和受控 mutation。
- 遇到 Hash、标签互斥、暂停保护、bot 过滤、批准命令识别、Front Matter schema 或路径安全判断时，必须调用 `article-hub`；不得在 Skill、临时脚本或自然语言推理中重写这些规则。
- 读取 Issue、PR、Review 等 GitHub 原始事实时直接使用 `gh`；不要为了读取字段或转发 `gh` 参数而临时修改 `article-hub`。

## 流程

每一步先确认未触发[停止条件](#停止条件)，再往下走。

1. 用 `gh` 读取 GitHub Issue 原始内容并保存为 fixture，再用 `article-hub` 解析：

   ```sh
   gh issue view <number> --repo hexqi/ai-article-hub --json number,title,body,author,labels,comments > <issue.json>
   article-hub inspect-issue --issue-file <issue.json>
   ```

   `inspect-issue` 的输出是后续判断的事实来源：`issue.labels` 决定是否触发暂停，`commands[].actionable` 决定是否已批准。读到标签含 `AI：已暂停` 立即停止。

2. 校验项目属于 `config/projects.yml` 的 allowlist，并 checkout 来源；项目不在 allowlist 时停止：

   ```sh
   article-hub projects validate --config config/projects.yml
   article-hub checkout-sources --config config/projects.yml --project <project-id> --cache-dir <cache-dir>
   ```

3. 生成或更新写作计划，计算 Hash：

   ```sh
   article-hub plan hash --plan-file <plan.json>
   ```

4. 确认写作计划已被批准——这是进入写作前的闸门。是否已批准只看 `inspect-issue` 输出里某条评论 `actionable: true`，即由授权用户（非 bot，association 为 OWNER / MEMBER / COLLABORATOR）发出的固定命令：

   ```text
   /ai 批准写作计划 <plan_version> <hash-prefix>
   ```

   `<hash-prefix>` 必须匹配第 3 步算出的 Hash 前缀。自然语言表述（如「我觉得可以批准计划 2」）、越权用户或 bot 发出的同款命令都不算批准——不要据此推断批准意图，没有 `actionable` 命令就停下等待。

5. 批准后生成不可变批准快照：

   ```sh
   article-hub plan approve --plan-file <plan.json> --command "<command>" --approver <login> --comment-id <id> --approved-at <iso-time>
   ```

6. 在隔离 Git worktree 中创建文章目录并写作：

   ```text
   articles/<project-id>/<YYYY-MM-DD>-<slug>/article.md
   ```

   素材放在同目录 `assets/` 下；Mermaid 必须保存 `.mmd + .svg + .png`，正文只引用 PNG。正文成型后调用 `polish-opentiny-article` 的「初稿全文优化」润色正文：它只交付润色后的正文，校验、Draft PR 和 Issue 状态仍由本流程在后续步骤统一收尾，不要让它重复执行。

7. 执行确定性校验，并把它当成反馈环而不是一次性闸门：

   ```sh
   article-hub validate article --article-file <article.md> --config config/projects.yml
   ```

   结果 `valid: false` 时，按 `blocking_issues[].code`（稳定码，不依赖 message 文案）定位并修正正文，然后重跑，直到 `valid: true`。修正只动正文：不得改 Front Matter、代码块、图片路径等受保护内容来凑过校验；若不改受保护内容就无法消除某个 code，按停止条件停止并报告。

8. 校验通过后创建或更新 Draft PR：

   ```sh
   article-hub create-pr \
     --article-file <article.md> \
     --config config/projects.yml \
     --issue-number <number> \
     --repository hexqi/ai-article-hub \
     --base main \
     --slug <slug> \
     --title "<final-title>" \
     --body-file <pr-body.md>
   ```

9. 更新 Issue 状态：

   ```sh
   article-hub update-status \
     --issue-file <issue.json> \
     --repository hexqi/ai-article-hub \
     --phase "阶段：写作" \
     --ai-state "AI：等待人工" \
     --comment "初稿已生成，Draft PR 已创建。"
   ```

## 停止条件

出现以下任一情况立即停止，不写作、不提交新 Commit、不创建 PR，并说明停在哪一步、缺什么、需要人工做什么决定：

- Issue 标签含 `AI：已暂停`——这是人工显式叫停信号，优先级高于任何待办步骤。
- 写作计划没有 `actionable: true` 的批准命令（无人批准、批准被越权/bot 发出、或只是自然语言表述）。
- 目标项目不在 `config/projects.yml` 的 allowlist 中。
- 文章校验反复报某个 `blocking_issues[].code`，且无法在不改动受保护内容（Front Matter、代码、图片路径）的前提下消除。
- 只在本机存在、无法在来源中追溯的资料，被要求写成正式来源。

## 写作约束

下面这些约束是因为产物要对外发布并经人工 Review，怕的是“读起来顺但站不住”：

- 不新增来源外的事实、数据、用户反馈或因果关系——这类补全会在 Review 或发布后被证伪，损害对外文章的可信度。
- 不把只存在于单台机器、无法在来源中追溯的资料写成正式来源——他人无法复核，且 `validate article` 的来源版本校验也会失败。
- 不写 MDX、自定义组件、内联脚本或平台专属发布字段——产物要保持可人工 Review 的纯 Markdown，发布适配不在本流程范围。
- 不生成空 Draft PR——只有文章校验通过后才创建 PR，否则 Review 拿到的是不可用初稿。

## 输出

- `articles/<project-id>/<YYYY-MM-DD>-<slug>/article.md`
- 就近素材目录 `assets/`
- Draft PR 链接
- Issue 状态更新摘要
