# TrChat Web Component

本目录从原 Vue 组件 TrChat 的直接转换能力出发，逐项说明 Web Component 的接入与内容适配。通用用法以纯 JavaScript / DOM 展示。

## 阅读顺序

1. [TrChat 基础能力](basics.md)：直接转换的最小代码，以及 prop、事件、方法、Slot 和嵌套字段的完整能力边界。
2. [Web Component 适配组件](adapter-component.md)：为什么选择独立的接入组件、如何保留基础接口，以及 Runtime 后赋值、就绪通知等接入能力的实现。
3. [普通 Slot](ordinary-slots.md)：在指定位置放入宿主内容，从 Vue 组件用法到 Web Component 内容投影。
4. [Scoped Slot](scoped-slots.md)：内容需要 Chat 的数据和操作时，通过 DOM Renderer 传递上下文。
5. [Slot 契约](slot-contracts.md)：完整名称、内容选择顺序，以及输入区和欢迎区的更新、清理规则。

主线按“保留已有能力，再逐步增强”展开。引入适配组件后，基础篇中可用的接口及部分可用接口的普通 JS 分支继续保持原语义。

## 当前实验实现

当前实验入口为 `@opentiny/tiny-robot-chat/experimental`，提供 `tr-chat` 和 `tr-chat-ui`。前者通过 Runtime 连接会话与操作，后者接收界面数据并向宿主发出操作事件。

## 宿主验证项目

原生 JS、Angular、React 三个独立项目安装同一组真实候选包，E2E 直接使用这些可手工查看的页面。启动、统一验收和报告入口见 [examples 总览](../../../examples/README.md)。

| 宿主环境 | 项目与接入方式                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| 原生 JS  | [web-component-js](../../../examples/web-component-js/README.md)：Vite，DOM 属性赋值与事件监听              |
| Angular  | [web-component-angular](../../../examples/web-component-angular/README.md)：Angular CLI，模板属性与事件绑定 |
| React    | [web-component-react](../../../examples/web-component-react/README.md)：Vite，DOM ref 与 effect             |

当前页面验证基础接入、本地聊天、属性更新、Runtime 延后接入、浮窗、公开方法、普通 Slot、Scoped Slot、宿主输入视图与卸载重挂。
