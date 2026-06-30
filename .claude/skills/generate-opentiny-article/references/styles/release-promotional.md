# 文风：release-promotional（突出版本价值，但禁止空泛夸张）

默认用于 `release`。

- **定位**：可以突出本次版本对用户的价值，但价值必须落到具体变化。这是“讲清楚为什么值得升级”，不是“喊口号”。
- **语域与句式**：积极但克制；允许提炼“这次最值得关注的变化”，前提是每条都能指向具体能力、配置或 API。
- **可用**：版本亮点提炼、变化带来的用户收益（基于真实变更）、升级前后的对比（两边都给事实）。
- **避免**：领先、全面、智能、革命性等无支撑的形容词；把实验特性写成正式能力；只报喜不写兼容性、升级注意和已知限制。
- **与通用风格的关系**：”突出价值”绝不豁免事实核验和结论强度控制；夸大即触发反模式”营销表达和能力夸大”。底线以润色 Skill 的风格指南与反模式为准。

## 这四项手艺在本文风下怎么用

先读 `styles/writing-craft.md` 的四项通用手艺，在本文风下这样落地：

- 钩子：从升级前的一个具体痛点或一项最该被看见的改进切入；别用”隆重推出”式套话开场。
- 判断：提炼”这次最值得关注的变化”并说清为什么值得，主动管理预期（如”这是一次 cleanup release””端到端收益小于孤立 benchmark 数字”）；别只报喜。
- 主线：围绕本次版本的少数核心方向推进，每条都指向具体能力/配置/API；别罗列流水账 changelog。
- 具体：用真实数字绑定真实项目、给迁移命令/codemod，把 breaking change 和”何时不该用”写得和新特性一样显眼。

## 范例与出处

完整范例（含 craft 解剖与短节选）见仓库根目录下的 `materials/style-exemplars/release-promotional.md`，动笔前必读（存在即读，确实缺失才降级并在对话标注：说明缺哪个范例文件、改按 Skill 内文风文件继续）。代表：

- [Announcing Vue 3.4](https://blog.vuejs.org/posts/vue-3-4)（主动缩小 benchmark 预期，破坏性移除逐条给”为什么”）
- [Next.js 15](https://nextjs.org/blog/next-15)（目录直接标 (Breaking)，用生产案例数据，每项 breaking 附 codemod）
- [Announcing TypeScript 5.0](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/)（性能数字绑真实项目，推荐特性同时写”何时不该用”）
- [Vite 5.0 is out!](https://vite.dev/blog/announcing-vite5)（用生态第三方数据开场而非自夸，主动定性”cleanup release”并坦承不足）

## 微样本与提醒

> The final gain in end-to-end build time will likely be much smaller compared to the isolated benchmarks.

标注：主动缩小数字预期，是「让人想升级但不浮夸」的典型操作——讲了 2x 之后自己先说「别高兴太早」。

学这里的”招式”，不抄它的主题与措辞。
