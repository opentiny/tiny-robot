---
name: generate-opentiny-article
description: 把一个已批准写作计划的 OpenTiny 文章 Issue 在本地生成初稿、校验产物并创建 Draft PR。当用户要将处于「阶段：策划」、写作计划已获维护者批准的 Issue 落地为文章草稿时使用——例如说「把这个 issue 写成文章」「选题/计划批准了，开始写初稿」「帮我生成这篇 OpenTiny 文章的 Draft PR」。既可由人工直接调用，也可由本地巡检在批准后复用；不负责 GitHub 事件监听、候选发现、周期调度、热点发现或发布平台适配。
---

# Generate OpenTiny Article

## 适用范围

使用本 Skill 将一个已批准的文章 Issue 转成可人工 Review 的 Draft PR。流程由本地 Agent 驱动；本 Skill 只接管批准后的生成子流程，不监听 GitHub 事件，不负责候选发现或周期调度，也不实现 Workflow 自动化、热点发现、发布平台适配或外部发布。

## 前置条件

- 从本仓库目录启动 Agent，项目级 Skill 已自动发现。
- 独立人工调用时，本仓库依赖已安装并通过 `pnpm test`、`pnpm run build`；调用方已提供执行上下文时，`cli_root` 内的 CLI 已构建完成。
- `gh auth status` 可访问目标仓库。
- 写作计划已获固定命令批准。阶段标签可能仍停在 `阶段：选题` 或已是 `阶段：策划`，两种都可继续；阶段推进按第 9 步处理。

## CLI 边界

开始时只解析一次执行上下文：`scheduler_root` 是主仓库，`cli_root` 是提供已构建 CLI 的仓库或 runtime worktree，`operation_root` 是承载文章修改的候选 worktree，`<article_hub>` 是 `node "<cli_root>/scripts/article-hub-launcher.mjs"`。

- 调用方已提供上述上下文时，完整继承并保持不变；不得把 `<article_hub>` 重定义为主仓 launcher，也不得在 `scheduler_root` install/build。
- 独立人工调用且没有上游上下文时，令 `cli_root = scheduler_root`，使用主仓库绝对 launcher；`operation_root` 是当前隔离 worktree。
- 本文命令示例中的 `<article_hub>` 必须替换成解析后的绝对命令；禁止运行裸 `article-hub`、依赖全局安装或 `PATH`。业务命令的进程 `cwd` 始终是 `operation_root`。

确定性判断和受控 mutation 走 `article-hub`，读取 GitHub 原始事实走 `gh`，二者不互相替代——这样规则只有一处实现，Skill 不会在自然语言里把它们重写偏。

- 普通 GitHub 读取使用 `gh`，例如 `gh issue view --json ...`，并把结果保存为本地 fixture。fixture 只放系统临时目录或 `.cache/article-hub/<issue-number>/`，不得写入 `materials/issue-sources/`。
- 确定性判断使用 `article-hub`，包括权限过滤、固定写作计划批准校验、项目 allowlist、批准快照生成、文章校验、状态 guard 和受控 mutation。
- 遇到标签互斥、暂停保护、bot 过滤、批准命令识别、Front Matter schema 或路径安全判断时，必须调用 `article-hub`；不得在 Skill、临时脚本或自然语言推理中重写这些规则。
- 读取 Issue、PR、Review 等 GitHub 原始事实时直接使用 `gh`；不要为了读取字段或转发 `gh` 参数而临时修改 `article-hub`。

## 流程

每一步先确认未触发[停止条件](#停止条件)，再往下走。

1. 用 `gh` 读取 GitHub Issue 原始内容并保存为 fixture，再用 `<article_hub>` 解析。运行中间文件只放系统临时目录或 `.cache/article-hub/<issue-number>/`：

   ```sh
   gh issue view <number> --repo <repository> --json number,title,body,author,labels,comments > <issue.json>
   <article_hub> inspect-issue --issue-file <issue.json>
   ```

   `inspect-issue` 支持 `gh issue view --json` 原始字段：评论级 `authorAssociation` 用于授权判定，字符串 GraphQL `id` 会保留为 `comment_id`。也支持 REST 形态的 `user`、数字 `id` 和 `author_association`。`inspect-issue` 的输出是后续判断的事实来源：`issue.labels` 决定是否触发暂停。读到标签含 `AI执行：人工暂停` 立即停止。写作计划批准必须同时满足 `commands[].fixed_approval === "approve-writing-plan"` 且 `commands[].approval_authorized === true`。

2. 读取项目上下文入口，校验项目属于 `config/projects.yml` 的 allowlist，并 checkout 来源；项目不在 allowlist 时停止：

   ```sh
   <article_hub> projects list --config config/projects.yml
   <article_hub> projects validate --config config/projects.yml
   <article_hub> checkout-sources --config config/projects.yml --project <project-id> --cache-dir .cache/article-hub/source-cache
   ```

   `projects list` 输出中的 `docs`、`demo`、`deepwiki` 和 `terminology` 是调研入口。`projects[].deepwiki.url` 可用于快速了解仓库上下文；涉及产品事实、版本、API、兼容性或性能结论时，仍必须回到源码、官方文档或人工确认资料核验。
   源码 checkout 缓存不得写入 `materials/source-cache/`。`materials/issue-sources/<issue-number>/` 只用于保存需要随仓库提交的人工来源快照，不放 Issue fixture、计划临时文件、批准快照输入文件或源码缓存。默认文章 Draft PR 不提交 `materials/issue-sources/`；只有批准计划明确点名该人工来源快照需要随仓库保存，且人工确认可以公开提交时，才允许纳入 PR。

3. 生成写作计划并回写 Issue——这是本步的硬交付物，不是后续步骤顺带做的事：先在对话展示 5-8 行计划摘要供用户初看，再用 `gh issue comment` 把完整计划作为「当前写作计划评论」发布或更新到 Issue（运营与技术维护者在该评论上审核）。发布成功后在对话中给出 Issue 评论链接。计划评论可含人类可读版本标签（如「第 2 版」），无需任何 Hash。计划评论未发布或无法确认评论链接即视为本步未完成，不得进入批准等待。GitHub 是唯一长期状态源，计划只停在对话里等于这条状态没写入 GitHub。

   ```sh
   gh issue comment <number> --repo <repository> --body-file <临时计划文件>
   ```

   计划评论至少覆盖以下字段（依据 `docs/article-generation-requirements.md` §9.1，缺则补齐）：计划版本与时间、文章目标与查重结论、目标读者/前置知识/阅读收益/不覆盖内容、文章类型、推荐文风（含一句理由与 1 个备选）、推荐标题与候选标题、目标 Release/Tag/分支/Commit、来源清单与可信度、建议大纲、图片与截图素材计划、素材缺口/风险/人工验收项、预计文章长度、批准与修改方式（可复制的批准命令，以及维护者如何在评论中提出修改）。

   文风由本计划推荐（选题阶段不指定文风）：依据文章类型与题材给出推荐，在计划里按固定字段写明、取值用允许枚举——`推荐文风：<official-balanced | developer-friendly | release-promotional | technical-deep-dive>`、`推荐理由：…`、`备选文风：<同上枚举>`、`迁移招式：…`、`舍弃招式：…`（无错配两者写「无」）。若推荐文风与该文章类型的默认文风不一致（例如 `source-analysis` 用 `official-balanced`），在「迁移招式」「舍弃招式」里分别说明要借用与要舍弃该文风的哪些招式、为何适配本题材——不要让写作阶段在文风与题材错配下硬写。维护者认可计划推荐文风时直接批准；要改文风时，先更新计划评论里的推荐文风再批准——文风只以批准计划正文为准（批准快照只冻结计划正文，不含批准评论的自然语言）。

   建议大纲按**主线骨架**给出，不按模块清单给出——这一步决定正文是单主线推进还是模块平推，且会被批准快照冻结、下游写作阶段难以推翻：先写一行『主线骨架：<一条真实调用链 / 一个具体问题 / 一个决策处境>』，再把正文章节列成这条主线的推进阶段，每个阶段两栏——『本阶段要回答读者的哪个问题』『此处才需要登场的模块或事实』。同一对象（组件、包、能力）在主线推进到它时登场一次并融入该阶段叙述。可证伪自检：调换任意两个阶段或抽掉一个阶段，若主线叙述仍成立，说明这是模块清单而非主线骨架，改写为主线骨架再发布计划。并在「人工验收项」里加入一条供维护者确认的结构项——『大纲是单主线推进还是模块清单？（模块清单需改为主线骨架再批准）』，让维护者批准的是结构，而不仅是事实与边界。

   若用户在选题/调研阶段给定或指定了大纲、章节结构或其他计划选择，先判断它是否会让产物带「AI 味」或偏离写作最佳实践（典型：按模块/包/能力分节的清单式大纲、定义式开篇、每节只复述文档、二元对比拔高）。命中时，回写 Issue 的计划评论里必须含一段「结构/写法风险提示」——指出具体风险点、给出主线骨架等更优替代，并请用户在批准前确认采用哪一种；用户确认沿用其指定结构即按其意愿推进。这是提示与确认，不替用户改写、也不拦截批准。

   Issue 描述过于简洁时（如目标一句话、验收说明为空），可自行给出标题、读者、大纲等「建议版本」（最终以批准计划为准）；但会改变核心事实的选择——尤其目标版本/Commit（稳定 Tag 还是 `develop`，直接决定哪些能力算“已发布”）、是否纳入迁移、是否将本 Issue 收口为正式选题——应在调研阶段先向用户澄清，而不是先写进计划再列为缺口。建议大纲默认在末尾包含「关于 OpenTiny NEXT」收尾章节（见 [收尾章节模板](./references/about-opentiny-section.md)）；仅当人工在选题/计划讨论中以自然语言明确表示不要时，才在大纲中省略该章节。

4. 确认写作计划已被批准——这是进入写作前的闸门。只有 `inspect-issue` 输出中存在 `fixed_approval: "approve-writing-plan"` 且 `approval_authorized: true` 的评论，才算由授权用户（非 bot，association 为 OWNER / MEMBER / COLLABORATOR）发出了逐字固定批准命令：

   ```text
   /ai 批准写作计划
   ```

   自然语言表述（如「我觉得可以批准」）、携带参数（如旧版 `/ai 批准写作计划 2 a1b2c3d4`）、越权用户或 bot 发出的命令都不算批准。`/ai 状态`、`/ai 暂停` 等其他可执行命令也不算批准。不要据此推断批准意图，没有满足上述条件的批准命令就停下等待。

5. 批准后生成不可变批准快照，并作为一条评论贴回 Issue（计划正文用 `gh` 取回后写入会话临时文件传入，不提交 git；临时文件只放系统临时目录或 `.cache/article-hub/<issue-number>/`）：

   ```sh
   <article_hub> plan approve --plan-body-file <临时计划正文文件> --command "/ai 批准写作计划" --approver <login> --comment-id <批准评论 id> --approved-at <iso-time> [--plan-comment-id <计划评论 id>] [--plan-label <版本标签>]
   ```

   生成时以该批准快照中的完整计划为唯一计划来源，不回读 live 评论；文章 Front Matter 使用 `schema_version: article-hub.article.v2`，填写 `approval_snapshot` 短对象，包含 `url`、`approver`、`plan_comment_id`、`approval_comment_id`；完整计划和批准时间保存在 Issue 批准快照评论中；在创建 Draft PR 时，于 PR 描述中写一行批准引用（批准人、批准快照评论链接）。

6. 在隔离 Git worktree 中创建文章目录并写作：

   ```text
   articles/<project-id>/<YYYY-MM-DD>-<slug>/article.md
   ```

   写作分四步，前三步是动笔前的必做产出物，第四步才落笔：
   1. **必读（顺序固定）**：读 [文章类型与结构参考](./references/article-types.md) 取本文 `article_type` 的必备信息、推荐大纲与长度区间；读通用写作手艺 `references/styles/writing-craft.md`。本文 `style_profile` 取自批准快照里的计划正文，并据此写入 Front Matter（`style_profile` 是文章校验必填字段）；若批准计划正文中无法判定文风值，停止并回到计划阶段补齐，不在写作步自行拍板。按该 `style_profile` 读对应文风文件，并深读仓库根目录下的 `materials/style-exemplars/<style>.md` 范例——它示范手艺如何落到真实文章，只读手艺描述会写成「文档腔」，范例文件存在即必须读；仅当该文件确实不存在时才降级，并在对话标注「范例降级：materials/style-exemplars/<style>.md 不存在，按 Skill 内文风文件继续」。
   2. **必填产出物·主线声明（三栏）**：动笔前在对话写出三栏——『本文主线 =〔一条真实调用链 / 一个具体问题 / 一个决策处境〕』『贯穿全文的同一个具体实例或调用（自始至终是同一个，不在每章另起一个）』『每个正文业务章节让这个实例推进到哪一步』。模块、组件、包在主线推进到它时登场一次并融入该章叙述；章节标题写它在主线上推进的那一步或那个判断，相邻业务章节用不同句式（连续四节套同一模板——如「X 承接的是…」「从 X 看…」——就是模块清单换皮）。
      若批准快照的「建议大纲」本身是模块清单骨架（按包 / 组件 / 能力分节、而非主线阶段；常见于在结构规则更新前批准的旧计划），不照该清单逐节罗列：按「大纲是推荐而非强制、不强制固定章节标题和顺序」，在不改变覆盖范围、事实边界和维护者明确内容约束的前提下，把章节重排为上面的主线骨架，并在对话与 PR body 注明『批准大纲为模块清单，已按主线骨架重排章节、未改覆盖范围与事实』。若维护者在计划 / Review 中曾明确要求保留某种分节结构，或主线重排会改动覆盖范围，则这是人工决定项：停下来向人工说明冲突（保留批准的模块分节 vs 改为主线骨架）由人工确认，或回到计划阶段修订后重新批准，不在写作步单方面拍板。
   3. **必填产出物·范例借鉴清单**：读完范例后在对话逐条列出（2–4 条，每条三栏：从范例借的招式 / 用在本文哪一节 / 本文中的具体做法），把范例手艺迁移成本文动作而非仿其措辞。若本文 `style_profile` 与 `article_type` 默认文风不同，清单须回应计划里「迁移该文风哪些招式」的承诺。
   4. **落笔**：
      - 套用 `article-types.md` 的「必备信息」，不照搬固定章节标题。
      - 首段用具体问题 / 反常识 / 真实场景开篇（不是「X 是一种…」式定义开场）。
      - 每个正文业务章节先给一句作者判断 / 取舍 / 坑再展开，不止于复述文档。
      - 关键抽象结论旁配对比、数字或最小例子，且来自固定来源。
      - 大纲是推荐非强制、长度非硬性指标；资料不足时降低覆盖范围或标为缺口，不为凑结构编造内容。

   **素材占位符**：批准计划声明的正文视觉素材（截图、GIF、正文配图；Mermaid 图表按下一段专门规则处理，不走本占位符），当前已生成或采集到的用实际图片引用；尚无法生成或采集的，在它该出现的章节插入显式占位符 `<!-- 素材待补：<说明> -->`，不要只把缺口留在 PR 验收清单里。封面属于 PR 级未完成项（见需求 §13.1），留在 PR 验收清单，不进正文占位符。

   worktree 约定：候选 worktree 默认没有 `node_modules`，CLI 固定使用已解析的 `<article_hub>`，不在候选 worktree 重复安装依赖或构建；文章文件和素材统一用 `operation_root` 下的绝对路径写入，避免误写主工作区。

   素材放在同目录 `assets/` 下。Mermaid 优先保存 `.mmd + .svg + .png`，正文引用 PNG；本机无渲染器（`mmdc` / Chrome）时降级：至少提交 `.mmd` 源并在正文内嵌 `mermaid` 代码块（GitHub 原生渲染、纯文本可追溯），在 PR body 标注 SVG/PNG 待补，不要引用尚不存在的图片路径（会触发校验阻断码）。

   默认在正文末尾追加 `## 关于 OpenTiny NEXT` 收尾章节：套用 [关于 OpenTiny NEXT 收尾章节模板](./references/about-opentiny-section.md)，并按本文 `project_id` 在 `config/projects.yml` 中 `role: primary-source` 的仓库填充「代码仓库」行。该章节文案是固定品牌信息，只允许微调与正文衔接的过渡句，不得改写产品定位、链接、微信号等固定内容，也不得新增来源外事实。仅当选题/写作计划阶段人工以自然语言明确表示不要该章节时才省略（自然语言判断，无需固定命令）。该章节作为正文的一部分写入，随后一并交给 polish 润色。

   正文成型后、调用 polish 前，先过这道初稿自审闸门，并在对话输出完整自审表（逐项必须通过；证据须摘自正文实际原句/原位置、不能复述本标准；任一不过或任一证据为空都视为未通过，先改正文；结构问题不要丢给 polish——它无权重排章节）：

   | 自审项 | 通过标准                                                                                                                                                    | 通过证据（摘自正文实际原句/原位置，不能空过）                                                                                                           |
   | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | 主线   | 同一个具体实例/调用贯穿 ≥3 个业务章节；调换任意两个业务章节顺序或抽掉一章，主线叙述会断裂（断裂=有主线，不断裂=模块平推）；相邻业务章节标题不套同一句式模板 | 写出贯穿全文的那个实例；逐业务章节写它在该章推进到的那一步；列出全部业务章节标题，对其中两章做调换/抽章测试并说明为何断裂（不能只断言「都沿主线推进」） |
   | 钩子   | 首段是具体问题/场景/反常识，不是定义式开场                                                                                                                  | 原样摘录首段第一句，并判定其类型（若是「X 是…」定义式开场则不通过）                                                                                     |
   | 判断   | 每个正文业务章节（不含固定收尾章节「关于 OpenTiny NEXT」）至少一句作者判断/取舍/坑，不是纯复述文档                                                          | 逐业务章节摘录那句判断/取舍/坑的原文（不能只给位置或标题）                                                                                              |
   | 具体   | 全文至少 2 处关键抽象结论旁配对比/数字/最小例子之一，且来自固定来源                                                                                         | 摘录这 2 处结论原句及其对应的对比/数字/例子与来源                                                                                                       |
   | 素材   | 批准计划未声明正文视觉素材则直接通过；声明的素材在正文以实际图片、内嵌 Mermaid 代码块或 `<!-- 素材待补：<说明> -->` 占位符呈现                              | 列图片/Mermaid/占位符位置，或注明计划未声明                                                                                                             |
   | 文风   | 正文体现 `style_profile` 文风文件的至少 2 条核心特征；与类型默认文风不同时，范例借鉴清单承诺已落地                                                          | 逐条写出特征名 + 摘录正文中体现它的原句（不能只给位置）                                                                                                 |

   自审表「主线」一项最容易流于自我确认——写者既定义主线又自评是否达标，最易出现「自评通过、实为模块平推」的情形。因此自审通过后、调用 polish 前，再做一次独立结构裁判：由一个不持有本轮主线声明与自审表的独立视角（新开一个干净上下文的子代理，或人工评审），只拿正文与本节「主线」可证伪标准，回答一个问题——『这是单主线推进还是逐模块平推？』并给出可证伪证据（同一实例是否贯穿、调换/抽章是否断裂、相邻标题是否同句式）。判为平推则回到本步第 2 子步重定主线骨架并重写相关章节，不靠 polish 补救（polish 无权重排章节，遇到此情形只能停下打回）。

   独立结构裁判通过后，调用 `polish-opentiny-article` 的「初稿全文优化」润色正文：它只交付润色后的正文，校验、Draft PR 和 Issue 状态仍由本流程在后续步骤统一收尾，不要让它重复执行。

7. 执行确定性校验，并把它当成反馈环而不是一次性闸门：

   ```sh
   <article_hub> validate article --article-file <article.md> --config config/projects.yml
   ```

   结果 `valid: false` 时，按 `blocking_issues[].code`（稳定码，不依赖 message 文案）定位并修正正文，然后重跑，直到 `valid: true`。修正只动正文：不得改 Front Matter、代码块、图片路径等受保护内容来凑过校验；若不改受保护内容就无法消除某个 code，按停止条件停止并报告。边界：`validate article` 只保证 Front Matter schema、来源版本、路径与图片 alt 等确定性规则，不背书章节结构与读感——结构是否单主线推进由第 6 步自审表与独立结构裁判把关，`valid: true` 不等于可发布。

8. 校验通过后创建或更新 Draft PR。创建或更新前先运行 `git status --short`、`git diff --name-only --cached` 和 `git diff --name-only`，确认没有 `source-cache`、Issue fixture、计划临时文件、批准快照输入文件等中间文件进入工作区；默认只允许文章目录 `articles/<project-id>/<YYYY-MM-DD>-<slug>/` 与 `articles/publications.json` 进入本次 Draft PR。若出现 `materials/issue-sources/<issue-number>/`，先对照批准计划：未明确点名需要随仓库保存、或没有人工确认可公开提交时，必须从索引、工作区和 PR 历史中移除后再继续；无法确认清理安全时停止并说明：

   创建或更新 Draft PR 的唯一入口是 `<article_hub> create-pr`。隔离 worktree 的当前分支只用于本地执行，文章 PR 的 head 以 `create-pr` 输出 JSON 的 `branch` 为准。真实创建前先执行同参数 `--dry-run`，读取输出 JSON 的 `branch`，确认它等于 `article/<issue-number>-<project-id>-<slug>`，且 Issue 编号、项目和 slug 与本轮文章一致；不一致时停止并报告实际值和期望值。

   ```sh
   <article_hub> create-pr \
     --article-file <article.md> \
     --config config/projects.yml \
     --issue-number <number> \
     --repository <repository> \
     --base main \
     --slug <slug> \
     --title "<final-title>" \
     --body-file <pr-body.md>
   ```

   `create-pr` 会同步维护 `articles/publications.json`，写入文章条目和空 `publications`；正常流程无需在调用前预先编辑该文件。

   创建或更新后，必须用 `gh pr view <pr-number> --repo <repository> --json headRefName,body,files` 回读。`headRefName` 必须等于 `create-pr` 输出的 `branch`；body 必须包含关联 Issue；files 必须包含 `articles/<project-id>/<YYYY-MM-DD>-<slug>/article.md`。任一不满足都按 GitHub 写操作失败处理，并输出失败摘要、实际值和期望值。

   更新已有 Draft PR 时，创建或推送后再用 `gh pr diff <pr-number> --name-only` 复查最终 PR 文件列表。文件列表若包含默认允许范围以外的路径，先停止并清理分支历史，再请求人工 Review。人工来源快照属于例外路径，必须在 PR body 的来源快照摘要中说明保存理由、来源、License 或公开性判断。

   PR body 按 `.github/pull_request_template.md` 的受管区域生成，承载：批准引用（批准人、批准快照评论链接）、文章摘要、关联 Issue、来源快照摘要，以及 `## 人工验收` 清单。人工验收项放 PR body，不写进 `article.md` 正文——正文是平台无关母稿，验收复选框是协作元数据。文章含代码片段时，在 `## 人工验收` 中加入 `- [ ] 人工核对代码片段`（依据需求 §14：该项属于 PR 的必选验收项，未完成时 PR 保持 Draft）。工具链或流程缺陷（如 fixture 字段错配）不写进对外 PR body，需要时记到 `materials/` 的证据目录或单独反馈维护者。

9. 更新 Issue 状态：

   ```sh
   <article_hub> update-status \
     --issue-file <issue.json> \
     --repository <repository> \
     --intent content-transition \
     --phase "阶段：写作" \
     --ai-state "AI：等待人工" \
     --comment "初稿已生成，Draft PR 已创建。"
   ```

   若 Issue 当前仍在 `阶段：选题`，`content-transition` 不允许直接跳到 `阶段：写作`，会返回 `INVALID_TRANSITION`。此时按状态机依次执行两次合法单步迁移：先 `选题→策划`，再 `策划→写作`，每步都走 `update-status`，不手工拼标签。这是两次各自合法的迁移，不是绕过状态 guard。

## 停止条件

出现以下任一情况立即停止，不写作、不提交新 Commit、不创建 PR，并说明停在哪一步、缺什么、需要人工做什么决定：

- Issue 标签含 `AI执行：人工暂停`——这是人工显式叫停信号，优先级高于任何待办步骤。
- 写作计划没有 `fixed_approval: "approve-writing-plan"` 且 `approval_authorized: true` 的批准命令（无人批准、批准被越权/bot 发出、或只是自然语言表述）。
- 目标项目不在 `config/projects.yml` 的 allowlist 中。
- 文章校验反复报某个 `blocking_issues[].code`，且无法在不改动受保护内容（Front Matter、代码、图片路径）的前提下消除。
- 只在本机存在、无法在来源中追溯的资料，被要求写成正式来源。
- 批准计划正文无法判定 `style_profile` 文风值（缺推荐文风字段或取值不在允许枚举内），需回到计划阶段补齐后重新批准。

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
