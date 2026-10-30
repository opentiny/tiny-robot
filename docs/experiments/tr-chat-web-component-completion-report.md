# TrChat Web Component 完成度简报

> 审计日期：2026-10-30
> 口径：只有同时具备等价 Demo、浏览器业务对照、关键状态截图、自动化测试和验收报告，才计为“严格完成”。

## 当前完成度

| 口径                     |                 结果 | 说明                                                                                                                |
| ------------------------ | -------------------: | ------------------------------------------------------------------------------------------------------------------- |
| 组件能力严格验收总体进度 |  **30 / 30（100%）** | 29 个示例映射场景和 1 个跨场景可访问性契约均具备 Demo、浏览器业务对照、关键状态截图、自动化测试和独立验收报告。     |
| 核心跨框架协议           |    **6 / 6（100%）** | Slot、Bubble Renderers、双向绑定、复杂 property、Runtime 状态订阅、Runtime/存储所有权均完成严格验收。               |
| 示例行为映射             |  **29 / 29（100%）** | 20 个原版示例和 9 个协议/稳定化验收示例都有 Web Component 映射及 Chromium 自动化交互证据。                          |
| Angular 应用能力         | **21 / 25（84.0%）** | 排除 2 项非 TrChat 产品能力后，21 项严格完成；消息操作后台、附件后端、真实联网搜索和真实外部 MCP 尚未形成生产闭环。 |
| Angular 综合测试场景     |    **7 / 7（100%）** | 对话、历史、MCP、Skills、附件、消息操作、响应式/可访问性均在同一 Angular 应用形成确定性业务闭环。                   |

总体进度以“组件能力严格验收总体进度”为准。其他数字回答不同问题，不能互相替代：示例行为映射达到 100% 表示场景可映射且自动化通过，不表示全部场景已经完成 Vue/Web Component 截图级验收。

Angular 综合应用最新证据见 [综合应用验收报告](./tr-chat-web-component-validation/angular-comprehensive-app/report.md)：精确消费 npm `1.0.0-alpha.0`，发布包来源契约 2 / 2、Angular unit 20 / 20、Chromium E2E 26 / 26，通过桌面综合业务流和直接 390px 浏览器视觉验收。该 7 / 7 表示本地确定性测试场景全部贯通，不改变真实外部服务仍未验收的 21 / 25 生产能力口径。

## 已严格完成

- Slot 与 DOM Renderer 协议。
- Bubble 内置 Renderer、自定义 Renderer 和 `match` 规则。
- Sender Mention、Template、帮助 Slot 与 Toolbar 高级配置。
- Extension Tabs、应用动作与二级 overlay。
- Controlled UI 的原生 JavaScript 主流程。
- Runtime 外部动作和会话操作。
- 复杂 property 整体重赋值语义。
- Runtime snapshot/event 状态订阅。
- owned/injected Runtime 与存储所有权。
- 基础 `TrChat` 布局、模型选择、输入发送与回答。
- `Welcome`、`Prompts`、模板输入、显示开关与返回新会话。
- 发送失败、错误消息、宿主错误通知与同一 Runtime 恢复。
- History 分组、会话切换、选中态与重命名。
- 右侧发布预览、引用资料、面板切换与关闭。
- 760px Dock、390px Drawer 与无横向溢出的响应式布局。
- 默认、紧凑、专注与两种空会话输入位置的布局预设。
- 受控浮动窗口的打开、拖动、缩放、状态回写与关闭。
- 发送前 reject、输入保留、continue 与完整回答。
- Composer 正常、禁用输入、仅禁用提交、状态说明与预设输入。
- Runtime `send()` 的默认/自定义空文本 payload 与布尔返回值。
- 真实 Runtime Adapter 的受控输入、发送、会话创建、消息生命周期与输入清空。
- DOM 事件的直接 detail、传播默认值、重复派发和可取消 History 动作。
- Custom Element 延迟注册、升级前 Property、同步受控回写、单布局、公开方法和 ready-once 重连。
- Angular 宿主 Light DOM 样式压力、cascade layer 和基础控件边界。
- Angular 最薄类型消费层：复杂 property、typed DOM event detail 和 ref 方法。
- 200 条消息、连续更新、会话切换、30 次重挂载和 GC 后内存/DOM 预算。
- Node/SSR 安全导入与浏览器条件入口。
- Runtime、Renderer、附件、网络/适配器和宿主回调的统一错误契约。
- 自包含 Web Component 的生产 JS/CSS gzip 预算门禁。
- Drawer 语义、焦点进入/约束/恢复、Escape，以及流式消息日志的 ARIA 状态契约。

## 当前最高优先级

1. **真实服务验证**：真实 streaming、取消、超时、网络中断、服务端错误、真实联网搜索与恢复。
2. **外部 MCP 完整闭环**：真实 endpoint 的鉴权、创建/编辑/删除、工具执行、错误恢复和资源释放。
3. **消息与附件剩余语义**：后台评价、真实渠道分享、原位重试，以及附件上传/解析失败恢复。
4. **跨浏览器与真实辅助技术**：Firefox / WebKit 全量矩阵，以及 VoiceOver / NVDA 的连续 token 朗读节奏。

组件功能点严格验收与核心跨框架协议均达到 100%；30 个严格场景由 29 个示例映射和 1 个跨场景可访问性契约组成，不代表所有生产稳定化门槛已完成。Light DOM 样式边界、Angular 类型消费、长会话性能/内存、SSR 安全导入、统一错误契约、构建预算和原生可访问性契约均已完成；下一步应推进真实服务、MCP、消息操作、附件和其他发布门槛。

## 证据入口

- [项目 TODO](./tr-chat-web-component-todo.md)
- [原型总报告](./tr-chat-web-component-report.md)
- [Angular 20 应用级报告](./tr-chat-web-component-application-report.md)
- [机器可读兼容矩阵](./tr-chat-web-component-matrix.json)
- [P0 原版基线](../src/experiments/chat-web-component-p0-baselines.md)

## 本轮目标

第一批已完成 Extension Tabs 与 Sender 高级能力验收；第二批已完成基础聊天、欢迎区与推荐问题、发送失败与恢复；第三批已完成 History、右侧业务面板与响应式布局；第四批已完成布局预设、浮动布局与发送前拦截；第五批已完成 Composer 状态、Runtime send() 与 Runtime Adapter。随后完成 Angular 右栏开关、活动面板和浮动状态三组专项受控契约，并以最薄 React 兼容性探针复用同组三项契约。后续批次完成 Angular MCP 本地管理、Sender 附件选择/移除/消息透传，以及 Bubble 复制、正负反馈、重发式重试、朗读/停止和分享回退；再完成 Light DOM 样式边界、Angular 最薄类型消费、长会话性能/内存、SSR 安全导入、统一错误契约与构建体积预算。本批完成 Drawer 键盘/焦点语义和流式消息日志契约，Angular 仍是最终产品应用。
