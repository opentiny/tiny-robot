---
name: generate-opentiny-article
description: 把一个已批准写作计划的 OpenTiny 文章 Issue 在本地生成初稿、校验产物并创建 Draft PR。当用户要将处于「阶段：策划」、写作计划已获维护者批准的 Issue 落地为文章草稿时使用——例如说「把这个 issue 写成文章」「选题/计划批准了，开始写初稿」「帮我生成这篇 OpenTiny 文章的 Draft PR」。仅覆盖本地人工驱动流程；不处理 GitHub 事件自动化、热点发现、定时任务或发布平台适配，这些场景不要用本 Skill。
---

# Generate OpenTiny Article

## 适用范围

使用本 Skill 将一个已批准的文章 Issue 转成可人工 Review 的 Draft PR。流程由本地 Agent 驱动，不监听 GitHub 事件，不实现 Workflow 自动化、热点发现、发布平台适配或外部发布。

## 前置条件

- 从本仓库目录启动 Claude Code，项目级 Skill 已自动发现。
- 本仓库依赖已安装并通过 `npm test`、`npm run build`。
- `gh auth status` 可访问目标仓库。
- 写作计划已获固定命令批准。阶段标签可能仍停在 `阶段：选题` 或已是 `阶段：策划`，两种都可继续；阶段推进按第 9 步处理。

## CLI 边界

确定性判断和受控 mutation 走 `article-hub`，读取 GitHub 原始事实走 `gh`，二者不互相替代——这样规则只有一处实现，Skill 不会在自然语言里把它们重写偏。

- 普通 GitHub 读取使用 `gh`，例如 `gh issue view --json ...`，并把结果保存为本地 fixture。
- 确定性判断使用 `article-hub`，包括权限过滤、固定命令解析、项目 allowlist、批准快照生成、文章校验、状态 guard 和受控 mutation。
- 遇到标签互斥、暂停保护、bot 过滤、批准命令识别、Front Matter schema 或路径安全判断时，必须调用 `article-hub`；不得在 Skill、临时脚本或自然语言推理中重写这些规则。
- 读取 Issue、PR、Review 等 GitHub 原始事实时直接使用 `gh`；不要为了读取字段或转发 `gh` 参数而临时修改 `article-hub`。

## 流程

每一步先确认未触发[停止条件](#停止条件)，再往下走。

1. 用 `gh` 读取 GitHub Issue 原始内容并保存为 fixture，再用 `article-hub` 解析：

   ```sh
   gh issue view <number> --repo hexqi/ai-article-hub --json number,title,body,author,labels,comments > <issue.json>
   article-hub inspect-issue --issue-file <issue.json>
   ```

   `inspect-issue` 的输出是后续判断的事实来源：`issue.labels` 决定是否触发暂停。读到标签含 `AI执行：人工暂停` 立即停止。写作计划批准必须同时满足 `commands[].actionable === true` 且 `commands[].parsed.kind === "approve-writing-plan"`。

   已知缺口：`gh issue view --json` 的原生字段层级（如评论级 `authorAssociation`、字符串 GraphQL id）可能与 `inspect-issue` 期望的归一化结构不一致，导致合法批准被判 `actionable: false`。出现“人工确认评论合法、CLI 却判未批准”时，按停止条件停下并报告该字段错配，不要自行用临时脚本拼 fixture 重写权限/批准判定——这些规则只能由 `article-hub` 实现。

2. 读取项目上下文入口，校验项目属于 `config/projects.yml` 的 allowlist，并 checkout 来源；项目不在 allowlist 时停止：

   ```sh
   article-hub projects list --config config/projects.yml
   article-hub projects validate --config config/projects.yml
   article-hub checkout-sources --config config/projects.yml --project <project-id> --cache-dir <cache-dir>
   ```

   `projects list` 输出中的 `docs`、`demo`、`deepwiki` 和 `terminology` 是调研入口。`projects[].deepwiki.url` 可用于快速了解仓库上下文；涉及产品事实、版本、API、兼容性或性能结论时，仍必须回到源码、官方文档或人工确认资料核验。

3. 生成写作计划并回写 Issue——这是本步的硬交付物，不是后续步骤顺带做的事：先在对话展示计划摘要供用户初看，再用 `gh issue comment` 把完整计划作为「当前写作计划评论」发布或更新到 Issue（运营与技术维护者在该评论上审核）。计划评论可含人类可读版本标签（如「第 2 版」），无需任何 Hash。计划评论未发布即视为本步未完成，不得进入批准等待。GitHub 是唯一长期状态源，计划只停在对话里等于这条状态没落地。

   ```sh
   gh issue comment <number> --repo hexqi/ai-article-hub --body-file <临时计划文件>
   ```

   计划评论至少覆盖以下字段（依据 `docs/article-generation-requirements.md` §9.1，缺则补齐）：计划版本与时间、文章目标与查重结论、目标读者/前置知识/阅读收益/不覆盖内容、文章类型与文风、推荐标题与候选标题、目标 Release/Tag/分支/Commit、来源清单与可信度、建议大纲、图片与截图素材计划、素材缺口/风险/人工验收项、预计文章长度、批准与修改方式（可复制的批准命令，以及维护者如何在评论中提出修改）。Issue 描述过于简洁时（如目标一句话、验收说明为空），可自行给出标题、读者、大纲等「建议版本」（最终以批准计划为准）；但会改变核心事实的选择——尤其目标版本/Commit（稳定 Tag 还是 `develop`，直接决定哪些能力算“已发布”）、是否纳入迁移、是否将本 Issue 收口为正式选题——应在调研阶段先向用户澄清，而不是先写进计划再列为缺口。建议大纲默认在末尾包含「关于 OpenTiny NEXT」收尾章节（见 [收尾章节模板](./references/about-opentiny-section.md)）；仅当人工在选题/计划讨论中以自然语言明确表示不要时，才在大纲中省略该章节。

4. 确认写作计划已被批准——这是进入写作前的闸门。只有 `inspect-issue` 输出中存在 `actionable: true` 且 `parsed.kind: "approve-writing-plan"` 的评论，才算由授权用户（非 bot，association 为 OWNER / MEMBER / COLLABORATOR）发出了逐字固定批准命令：

   ```text
   /ai 批准写作计划
   ```

   自然语言表述（如「我觉得可以批准」）、携带参数（如旧版 `/ai 批准写作计划 2 a1b2c3d4`）、越权用户或 bot 发出的命令都不算批准。`/ai 状态`、`/ai 暂停` 等其他可执行命令也不算批准。不要据此推断批准意图，没有满足上述条件的批准命令就停下等待。

5. 批准后生成不可变批准快照，并作为一条评论贴回 Issue（计划正文用 `gh` 取回后写入会话临时文件传入，不提交 git）：

   ```sh
   article-hub plan approve --plan-body-file <临时计划正文文件> --command "/ai 批准写作计划" --approver <login> --comment-id <批准评论 id> --approved-at <iso-time> [--plan-comment-id <计划评论 id>] [--plan-label <版本标签>]
   ```

   生成时以该快照的 `approved_plan` 为唯一计划来源，不回读 live 评论；在创建 Draft PR 时，于 PR 描述中写一行批准引用（批准人、`approved_at`、快照评论链接）。

6. 在隔离 Git worktree 中创建文章目录并写作：

   ```text
   articles/<project-id>/<YYYY-MM-DD>-<slug>/article.md
   ```

   写作前先读 [文章类型与结构参考](./references/article-types.md)：按本文的 `article_type` 取对应小节的必备信息、推荐大纲和长度区间；动笔前先读通用写作手艺 `references/styles/writing-craft.md`，再按 `style_profile` 取对应文风文件，让手艺、类型和文风共同驱动写法，而不是只填进 Front Matter。需要深读范例时，读取仓库根目录下的 `materials/style-exemplars/<style>.md`；该目录是人工策展的离线材料库，不是 Skill 运行时强依赖，访问不到时按 Skill 内规则继续。大纲是推荐非强制，长度非硬性指标，资料不足时降低覆盖范围或标为缺口，不要为凑结构编造内容。

   worktree 约定：worktree 默认没有 `node_modules`，调用 CLI 时优先复用主仓库已构建的 `node <主仓库>/dist/cli.js`，或在 worktree 内先 `pnpm install && pnpm run build`；文章文件和素材统一用绝对路径写入 worktree，避免误写主工作区。

   素材放在同目录 `assets/` 下。Mermaid 优先保存 `.mmd + .svg + .png`，正文引用 PNG；本机无渲染器（`mmdc` / Chrome）时降级：至少提交 `.mmd` 源并在正文内嵌 ```mermaid``` 代码块（GitHub 原生渲染、纯文本可追溯），在 PR body 标注 SVG/PNG 待补，不要引用尚不存在的图片路径（会触发校验阻断码）。

   默认在正文末尾追加 `## 关于 OpenTiny NEXT` 收尾章节：套用 [关于 OpenTiny NEXT 收尾章节模板](./references/about-opentiny-section.md)，并按本文 `project_id` 在 `config/projects.yml` 中 `role: primary-source` 的仓库填充「代码仓库」行。该章节文案是固定品牌信息，只允许微调与正文衔接的过渡句，不得改写产品定位、链接、微信号等固定内容，也不得新增来源外事实。仅当选题/写作计划阶段人工以自然语言明确表示不要该章节时才省略（自然语言判断，无需固定命令）。该章节作为正文的一部分写入，随后一并交给 polish 润色。

   正文成型后调用 `polish-opentiny-article` 的「初稿全文优化」润色正文：它只交付润色后的正文，校验、Draft PR 和 Issue 状态仍由本流程在后续步骤统一收尾，不要让它重复执行。

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

   PR body 按 `.github/pull_request_template.md` 的受管区域生成，承载：批准引用（批准人、`approved_at`、批准快照评论链接）、文章摘要、关联 Issue、来源快照摘要，以及 `## 人工验收` 清单。人工验收项放 PR body，不写进 `article.md` 正文——正文是平台无关母稿，验收复选框是协作元数据。文章含代码片段时，在 `## 人工验收` 中加入 `- [ ] 人工核对代码片段`（依据需求 §14：该项属于 PR 的必选验收项，未完成时 PR 保持 Draft）。工具链或流程缺陷（如 fixture 字段错配）不写进对外 PR body，需要时记到 `materials/` 的证据目录或单独反馈维护者。

9. 更新 Issue 状态：

   ```sh
   article-hub update-status \
     --issue-file <issue.json> \
     --repository hexqi/ai-article-hub \
     --intent content-transition \
     --phase "阶段：写作" \
     --ai-state "AI：等待人工" \
     --comment "初稿已生成，Draft PR 已创建。"
   ```

   若 Issue 当前仍在 `阶段：选题`，`content-transition` 不允许直接跳到 `阶段：写作`，会返回 `INVALID_TRANSITION`。此时按状态机依次执行两次合法单步迁移：先 `选题→策划`，再 `策划→写作`，每步都走 `update-status`，不手工拼标签。这是两次各自合法的迁移，不是绕过状态 guard。

## 停止条件

出现以下任一情况立即停止，不写作、不提交新 Commit、不创建 PR，并说明停在哪一步、缺什么、需要人工做什么决定：

- Issue 标签含 `AI执行：人工暂停`——这是人工显式叫停信号，优先级高于任何待办步骤。
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
