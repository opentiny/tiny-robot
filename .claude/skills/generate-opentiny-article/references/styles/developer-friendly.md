# 文风：developer-friendly（面向开发者，解释充分，节奏较轻）

默认用于 `practical-guide`。

- **定位**：写给会动手的开发者。解释比正式文风更充分，阅读节奏更轻，但仍是技术文章而非聊天或带货。
- **语域与句式**：可用第二人称（“你可以……”）和直接的操作语气；句子偏短、步骤清晰；术语首次出现时给一句解释。
- **可用**：动机说明、前置条件交代、可运行代码与预期结果、常见坑提示、可选项与必需项的区分。
- **避免**：聊天口头禅和表情化表达、把“能用”说成“最佳实践”、跳过前置条件直接贴长代码、用轻松语气掩盖不确定性。
- **与通用风格的关系**：节奏轻不等于可以省略事实核验；代码、API、版本仍以固定来源为准。不写坏、不编造的底线以润色 Skill 的风格指南与反模式为准。

## 这四项手艺在本文风下怎么用

先读 `styles/writing-craft.md` 的四项通用手艺，在本文风下这样落地：

- 钩子：从读者真实痛点或任务切入（"还在手写 X？""我也曾经不懂它"），先让人对号入座；别从前置概念定义开场。
- 判断：给步骤前先点出常见坑与取舍（A 还是 B、该用/不该用），错误按优先级排；别把"能跑"说成"最佳实践"。
- 主线：围绕"把一件事做出来"推进，步骤可复现、每步给预期结果；别堆并列知识点。
- 具体：最小可运行例子、❌/✅对比、明确前置条件与验证方式；别只给配置不给如何确认生效。

## 范例与出处

完整范例（含 craft 解剖与短节选）见仓库根目录下的 `materials/style-exemplars/developer-friendly.md`；访问不到时不阻断写作。代表：

- [An Interactive Guide to Flexbox](https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/)（"布局算法心智模型"贯穿全文，反直觉处给比喻）
- [An Interactive Guide to CSS Grid](https://www.joshwcomeau.com/css/interactive-guide-to-grid/)（"我也曾不懂"叙事消除门槛，给明确取舍）
- [5 CSS snippets every front-end developer should know](https://web.dev/articles/5-css-snippets-every-front-end-developer-should-know-in-2024)（每节统一节奏便于跳读，纠正社区误解）
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)（❌/✅对比，错误按优先级，每条规则追溯底层原则）

## 微样本与提醒

> If a content writer changes 'Username' to 'Email' that's a change I definitely want to know about. So why would I use a test ID that hides this refactor from my test suite?

标注：用具体的「content writer 改文案」场景解释抽象的「测试行为而非实现」原则——developer-friendly 文风中「具体与画面」的范例，把哲学变成场景。

学这里的"招式"，不抄它的主题与措辞。
