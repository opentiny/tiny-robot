# 文风：technical-deep-dive（强调机制、边界和技术细节）

默认用于 `source-analysis`。

- **定位**：面向想理解“怎么实现、为什么这样实现、边界在哪”的读者。允许并鼓励深入机制和细节。
- **语域与句式**：严谨的技术语域，可使用较长的论证性段落；保留必要的转场以推进调用链或论证。
- **可用**：实现机制拆解、关键设计取舍的说明、调用链与模块关系、边界条件与限制、绑定确定 SHA 的源码引用。
- **避免**：把当前实现说成“唯一正确设计”、用工程黑话包装普通叙述（撞反模式“表演性技术表达”）、引用未固定版本的源码、罗列细节却没有主线。
- **与通用风格的关系**：深入细节不等于堆术语；技术动词要有对象、条件和结果。机制描述涉及版本、API、兼容性、性能时回固定来源核验。底线以润色 Skill 的风格指南与反模式为准。

## 这四项手艺在本文风下怎么用

先读 `styles/writing-craft.md` 的四项通用手艺，在本文风下这样落地：

- 钩子：从一条真实调用链或一个"天天写却没深想"的入口切入（如"这行 render 调用之后发生了什么"），把熟悉变陌生；别用"X 是一个……组件"开场。
- 判断：拆解机制时点出设计取舍与代价，并给实现模式起个可迁移的名字（如"依赖注入""双向依赖收集"）；别把当前实现说成唯一正解。
- 主线：选一条主线贯穿（一次调用、一个问题），各模块按主线需要登场；别逐文件罗列成 API 字典。
- 具体：用真实字段名、绑定确定 SHA 的源码片段、最小对比和可感知类比落地。

## 范例与出处

完整范例（含 craft 解剖与短节选）见仓库根目录下的 `materials/style-exemplars/technical-deep-dive.md`，动笔前必读（存在即读，确实缺失才降级并在对话标注：说明缺哪个范例文件、改按 Skill 内文风文件继续）。代表：

- [React as a UI Runtime](https://overreacted.io/react-as-a-ui-runtime/)（主张驱动结构：每节先抛论点，正文是论据）
- [How Does setState Know What to Do?](https://overreacted.io/how-does-setstate-know-what-to-do/)（反常识提问开篇 + 侦探式逐层揭示）
- [A deep dive into React Fiber](https://blog.logrocket.com/deep-dive-react-fiber/)（用 16ms 帧预算数字锚定问题，再顺序拆解）
- [深度解析：Vue3 如何巧妙的实现强大的 computed](https://juejin.cn/post/6844904053638447117)（中文；单步调试视角把响应式机制具象化）

## 微样本与提醒

> The react package only lets you _use_ React features but doesn't know anything about _how_ they're implemented. The implementation is inside the renderers.

标注：示范「作者洞察」：点出「声明与实现分离」这个架构原则，而非只描述 updater 的工作流程。

学这里的"招式"，不抄它的主题与措辞。
