# 文风：official-balanced（正式克制，技术与传播均衡）

默认用于 `case-study`，也是不确定时的安全选择。

- **定位**：正式、克制，技术准确与对外可读兼顾。可以有判断，但落到事实，不写成产品广告或公司公告。
- **语域与句式**：完整、稳定的书面技术语域；允许长短句变化，避免口号式短句和情绪化感叹。
- **可用**：明确的结论与判断，只要有事实或来源支撑；必要的背景，限于理解技术决策所需。
- **避免**：行业愿景式开场、价值拔高收尾、无来源的成效数字、二元对比制造的“新结论”。
- **与通用风格的关系**：本文件管”这种文风该说到多重、语气多正式”；不写坏、不编造、不堆套话等通用底线以润色 Skill 的风格指南与反模式为准。

## 这四项手艺在本文风下怎么用

先读 `styles/writing-craft.md` 的四项通用手艺，在本文风下这样落地：

- 钩子：从一个真实困境/事故/决策处境切入（倒叙制造信息落差也好）；别用项目背景流水账开场。
- 判断：讲清为什么这么决策、踩了什么坑、哪里事后看是错的，诚实承认失败与局限；别把个案拔成普适方法论。
- 主线：围绕一条决策/复盘主线推进（问题→应对→结果→经验）；别只讲成功的部分。
- 具体：用可核验数字（分片数、错误率、行数、耗时）、前后对比和真实约束支撑；给关键概念命名让结论可操作。

## 范例与出处

完整范例（含 craft 解剖与短节选）见仓库根目录下的 `materials/style-exemplars/official-balanced.md`；访问不到时不阻断写作。代表：

- [Herding elephants: sharding Postgres at Notion](https://www.notion.com/blog/sharding-postgres-at-notion)（倒叙钩子制造落差，单列三个”后悔点”，数字配决策理由）
- [Cloudflare incident on June 20, 2024](https://blog.cloudflare.com/cloudflare-incident-on-june-20-2024/)（事实先行，如实还原误判，直接命名技术债）
- [Under Deconstruction: The State of Shopify's Monolith](https://shopify.engineering/shopify-monolith)（承认最初策略失败并推倒重来，造可操作术语 Change Locality）
- [APIs as infrastructure: future-proofing Stripe with versioning](https://stripe.com/blog/api-versioning)（用历史建立语境，坦白技术债代价仍值得，用散文讲机制）

## 微样本与提醒

> Earlier this year, we took Notion down for five minutes of scheduled maintenance. While our announcement gestured at 'increased stability and performance,' behind the scenes was the culmination of months of focused, urgent teamwork: sharding Notion's PostgreSQL monolith into a horizontally-partitioned database fleet.

标注：倒叙钩子范本：对外说辞 vs 内部实际，一句话建立张力。

学这里的”招式”，不抄它的主题与措辞。
