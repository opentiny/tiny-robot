# 发版推广（release-promotional）文风范例

发版推广文风的定位：版本发布公告需要同时做到「让人想升级」和「不浮夸」。好的发版文章将破坏性变更前置、数据来自真实项目、坦承设计局限，并为用户提供可执行的迁移路径，而非只罗列特性亮点。

---

## 《Announcing Vue 3.4》— Evan You（英文，采集 2026-06-25）

- 链接：https://blog.vuejs.org/posts/vue-3-4
- 传播信号：Official Vue blog；Vue 核心团队发布；HN/Twitter/Reddit 大量转发；vue-3-4 发布后 GitHub 发行版页面数千 reactions；npm 下载量周级增长可观察。
- 为什么好：开篇直接给出可量化收益（parser 2x faster、~44% SFC 编译提速），随即前置「Potential Actions Needed」章节点名升级依赖和配置项，让人明确升级成本再决定是否继续读；结尾坦诚写出「实际端到端构建收益会远小于孤立 benchmark」，在真实价值与合理预期之间保持平衡；每项特性都落到具体 API 和迁移注意，无口号。
- craft 解剖：
  - 钩子 = 开篇以版本代号「🏀 Slam Dunk」制造轻松情绪，随即一句话锚定主线：「substantial internal improvements … alongside some useful user-facing features」——先说内部，再说用户可见，优先级排序即判断。
  - 判断 = 作者将 parser 重写与 reactivity 重构并列为本次首要亮点，理由是两者都属于「基础设施级别的加速」，而非表面 API 糖；同时明确指出 defineModel 从 experimental 毕业是社区长期等待的稳定信号。
  - 主线 = 文章沿「性能基础设施 → 稳定化 API → DX 快捷方式 → 错误体验改进 → 破坏性移除」的顺序推进，每节对应本次版本方向的一个层次，而非随机罗列。
  - 具体 = parser 速度给出「2x」和「~44% SFC 编译提速」双数据；reactivity 给出「array shift/unshift/splice 只触发一次 sync effect」的行为规范；升级说明给出 volar/vue-tsc 最低版本号（^1.8.27）；破坏性移除列举了被删除的完整 API 名。
- 可迁移招式：
  - 前置「升级前需做什么」章节：把成本写在前面，而非埋在正文末尾。
  - 给出双数据：孤立 benchmark 数字 + 对实际端到端收益的坦诚修正。
  - 将 experimental → stable 单独列为一条亮点：向社区传递「可以放心用了」的稳定信号。
  - 破坏性移除与原因绑定：写清「why removed」而非只列 API 名。
  - 每条 DX 改进给出 before/after 代码对比。
- 短节选：
  > The final gain in end-to-end build time will likely be much smaller compared to the isolated benchmarks.

  标注：主动缩小数字预期，是「让人想升级但不浮夸」的典型操作——讲了 2x 之后自己先说「别高兴太早」。

- 借鉴边界：可学其升级成本前置、双数据坦诚和稳定信号标注等招式；不要照搬其 Vue 3.4 主题与 Vue 相关 API 措辞。
- 全文存档：[vue-3-4.md](release-promotional/vue-3-4.md)

---

## 《Next.js 15》— Delba de Oliveira, Jimmy Lai, Rich Haines（英文，采集 2026-06-25）

- 链接：https://nextjs.org/blog/next-15
- 传播信号：Next.js 官方博客；Next.js Conf 大会配套发布；GitHub 仓库 issue/PR 数千 reactions；Hacker News 讨论热度 Top；npm 周下载量数百万级。
- 为什么好：直接在目录中以「(Breaking)」标注两项破坏性变更，而非把它们藏在正文深处；Turbopack 稳定化给出真实生产案例数字（vercel.com 本地启动快 76.7%、Fast Refresh 快 96.3%），不是合成 benchmark；caching 默认值翻转附上「Based on your feedback」的决策背景，承认之前的设计判断不够好；每项 breaking change 提供 codemod 命令，把迁移成本压到最低。
- craft 解剖：
  - 钩子 = 开篇一句「stable and ready for production」+ 自动升级命令（npx @next/codemod@canary upgrade latest），立即回答「我需要做什么」，而非先讲背景故事。
  - 判断 = 作者把 breaking changes 放在目录首位，隐含判断：升级决策的核心是「有没有兼容性障碍」而非「有多少新特性」；Turbopack stable 单独置顶强调，因为它解决了四年来社区等待 Webpack 替代方案的核心焦虑。
  - 主线 = 主线是「升级体验 → 渲染模型演进（Async APIs + Caching）→ 生态对齐（React 19）→ 工具链稳定（Turbopack）→ 开发体验（各种小特性）」，从「能不能升」走到「升完能得到什么」。
  - 具体 = Turbopack 给出 vercel.com 生产案例三项数据（76.7% / 96.3% / 45.8%）；Async Request APIs 列出受影响的全部 API；caching 变更给出明确 opt-in 配置（staleTimes.dynamic: 30）；breaking changes 尾部列举 17+ 条变更并逐条附 PR 链接。
- 可迁移招式：
  - 在目录中用「(Breaking)」标签直接暴露破坏性变更，而非藏在章节内部。
  - Breaking change + codemod 配套：每项兼容性破坏都附自动迁移命令，把「会不会升」的阻力降到最低。
  - 用真实客户数据替代合成 benchmark：「vercel.com 本地启动快 76.7%」比「我们的测试中快 X%」可信得多。
  - 「Based on your feedback」作为决策背景：承认此前设计不够好，建立信任而非自我辩护。
  - Experimental API 明确标注 unstable_ 前缀，让稳定性预期显而易见。
- 短节选：
  > Based on your feedback, we re-evaluated our caching heuristics and how they would interact with projects like Partial Prerendering (PPR) and with third party libraries using fetch.

  标注：承认基于反馈改变默认行为，而非把 breaking change 包装成「更好的设计」——这句话本身就是坦诚的证据。

- 借鉴边界：可学其 Breaking 标签前置、codemod 配套和用户反馈决策背景等招式；不要照搬其 Next.js 15 主题与 Next.js 相关 API 措辞。
- 全文存档：[next-15.md](release-promotional/next-15.md)

---

## 《Announcing TypeScript 5.0》— Daniel Rosenwasser（英文，采集 2026-06-25）

- 链接：https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/
- 传播信号：Microsoft DevBlogs 官方发布；TypeScript GitHub 仓库 starred 超 10 万；HN 讨论热帖；Twitter/X 上 #TypeScript50 话题广泛传播；npm 周下载量破亿级。
- 为什么好：性能数据精确到具体真实项目（Material-UI 构建快 90%、编译器启动快 89%、npm 包体积从 63.8 MB 降至 37.4 MB），而非抽象百分比；bundler resolution mode 专门写了「can hide compatibility issues for users who aren't using a bundler」——主动提示什么情况下不该用这个特性；废弃项给出「5.5 版本移除」的时间线和逃生通道，让迁移路径透明。
- craft 解剖：
  - 钩子 = 「smaller, simpler, and faster」三个形容词并列，对应 npm 包体积、API 复杂度、构建速度三个维度，开篇就把价值主张点名，而非先讲技术实现。
  - 判断 = 作者将 Decorators 放在首位，理由是它是「ECMAScript 标准实现」——这是 TypeScript 与标准对齐的承诺，比单纯 DX 改进权重更高；const Type Parameters 作为次优亮点，因为它解决了泛型推断「宽化」这个长期被问到的问题。
  - 主线 = 主线是「语言特性（Decorators → const → extends）→ 模块系统现代化（bundler resolution → verbatimModuleSyntax）→ 开发体验（JSDoc → completions）→ 性能数字 → 废弃时间表」，从语言能力走向工具链再走向未来路线。
  - 具体 = npm 包体积给出绝对值前后对比（63.8 MB → 37.4 MB，-41.4 MB）；速度提升给出三项真实项目数据；废弃项列出完整 API 名称清单和对应的移除版本；moduleResolution bundler 附有完整 tsconfig 示例。
- 可迁移招式：
  - 给出绝对值前后对比而非只给百分比：「63.8 MB → 37.4 MB」比「减少 41%」更有画面感。
  - 在推荐某特性的同时写明「何时不该用它」：反向警示增加了可信度。
  - 废弃时间表透明化：给出「X.X 版本移除」+ 临时逃生配置，让用户有节奏地迁移而非被迫。
  - 「non-disruptive release」定性 + 具体破坏性变更清单并存：定性语句管预期，清单管操作。
  - 用真实第三方项目（Material-UI）的构建数据背书性能声明。
- 短节选：
  > TypeScript's npm package size went from about 63.8 MB in TypeScript 4.9 to about 37.4 MB in TypeScript 5.0. A build of material-ui has gotten 90% faster startup times, and the TypeScript compiler startup has gotten 89% faster.

  标注：三个数字均有来源（npm 包、material-ui、编译器自身），不是泛泛「显著提升」——可复现、可验证。

- 借鉴边界：可学其绝对值对比、反向警示和废弃时间线透明化等招式；不要照搬其 TypeScript 5.0 主题与 TypeScript 相关 API 措辞。
- 全文存档：[announcing-typescript-5-0.md](release-promotional/announcing-typescript-5-0.md)

---

## 《Vite 5.0 is out!》— Vite Team（英文，采集 2026-06-25）

- 链接：https://vite.dev/blog/announcing-vite5
- 中文译文镜像：[announcing-vite5.zh.md](release-promotional/announcing-vite5.zh.md)
- 传播信号：Vite 官方博客；npm 周下载量发布时已达 750 万次（从 250 万增至 750 万）；Hacker News 热帖；主要框架（Astro、Nuxt、SvelteKit、Remix）官方背书；ViteConf 大会配套发布。
- 为什么好：开篇用 ecosystem 增长数字（npm 周下载量 2.5M→7.5M）建立客观传播基础，而非只说「我们很棒」；将本次定位为「cleanup release + 奠基 Rolldown 未来」，主动说明这次不是大特性版本，管理好预期；对绝大多数项目说「upgrade should be straightforward」，但随即提供超过 12 条 breaking changes 列表 + Migration Guide 链接；「still ample room for improvement」直接承认现状不足。
- craft 解剖：
  - 钩子 = 「Vite 4 was released almost a year ago, and it served as a solid base for the ecosystem. npm downloads per week jumped from 2.5 million to 7.5 million」——以一年时间跨度和三倍增长数据作钩子，让读者先感受生态规模再进入本次版本。
  - 判断 = 作者明确将 Rolldown（Rust 版 Rollup）列为长期战略方向，本次 Vite 5 只是清理技术债为其铺路——这是少见的「当前版本服务未来版本」式定位，对开发者做出路线图承诺。
  - 主线 = 主线是「生态现状 → Node.js 支持要求 → 性能提升 → API 清理（breaking changes）→ 迁移指南 → 未来方向（Rolldown）」，前后呼应：先说为什么是时候升，再说升了能得到什么，最后说接下来会去哪里。
  - 具体 = Node.js 最低版本给出精确要求（18/20+，废弃 14/16/17/19）；manifest 文件路径变更给出新旧对比（根目录 → .vite/ 目录）；npm 数字给出时间戳上下文（「almost a year ago」）。
- 可迁移招式：
  - 用 ecosystem 第三方可验证数据（npm 下载量）开场，比自吹自擂更有说服力。
  - 主动为本次版本定位「这是一个 cleanup release」：管理预期，避免用户期待大特性后失望。
  - Breaking changes 数量多时给「大多数项目 straightforward」的整体评估 + 详细清单并存，让读者先判断风险级别。
  - 将长期路线图（Rolldown）写入发布文：让单次版本升级变成对技术路线的认可投票。
  - 「however, there is still ample room for improvement」：用谦逊语气建立持续迭代的信任。
- 短节选：
  > For most projects, the update to Vite 5 should be straight forward. But we advise reviewing the detailed Migration Guide before upgrading.

  标注：先给乐观评估降低心理门槛，再用「But」转折要求认真读迁移指南——两句话把「值得升」和「升要小心」都说清楚了。

- 借鉴边界：可学其生态数据开场、版本定位管理预期和路线图写入发布文等招式；不要照搬其 Vite 5 主题与 Vite 相关配置措辞。
- 全文存档：[announcing-vite5.md](release-promotional/announcing-vite5.md)
