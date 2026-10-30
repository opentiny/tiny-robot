# TrChat Web Component TODO

本清单记录 `@opentiny/tiny-robot-chat/experimental` 从实验原型推进到稳定跨框架能力需要解决的问题。完成项默认标记为已完成，不直接删除。

## 完成判定规范

每个问题只有同时满足以下条件，才可以从未完成改为已完成：

1. 提供独立的 Web Component 验证 Demo，并明确链接对应的原版 `TrChat` / `TrChatUI` Demo。
2. Demo 覆盖原版的主要 UI 状态和业务交互，不能只验证底层 API 或简化后的替代场景。
3. 使用浏览器分别操作原版与 Web Component Demo，检查布局、可见内容、交互结果、错误恢复和控制台错误。
4. 保存原版、Web Component 初始状态以及关键交互状态的验证截图；截图必须能回溯到具体问题和场景。
5. 自动化测试覆盖主要业务结果，并在审计记录中说明 UI 和业务逻辑是否与原版一致。

缺少 Demo、截图、浏览器对照或业务验收中的任意一项，只能标记为“部分完成”，不能勾选 TODO。

## 当前审计（2026-10-30）

当前严格完成度见 [TrChat Web Component 完成度简报](./tr-chat-web-component-completion-report.md)：组件能力严格验收总体进度 **30 / 30（100%）**，核心跨框架协议 **6 / 6（100%）**，现有示例行为映射 **29 / 29（100%）**。严格场景包含 29 个示例映射和 1 个跨场景可访问性契约；这些口径分别统计完整验收、协议和自动化映射，不混合计算。

Angular 综合测试应用已完成 **7 / 7** 本地确定性业务场景，覆盖对话、历史、原生 MCP `tools/call`、TinyRobot Kit Skills、文本/图片附件、多模态 payload、消息操作和 390px 响应式/可访问性；当前精确消费 npm `1.0.0-alpha.0`，发布包来源契约 **2 / 2**、Angular unit **20 / 20**、Chromium E2E **26 / 26**。证据见 [Angular 综合应用验收报告](./tr-chat-web-component-validation/angular-comprehensive-app/report.md)。真实 DeepSeek、真实外部 MCP 和生产附件服务继续由未完成项跟踪。

| 问题                 | 当前已有证据                                                                                                                                                                                                                                                                              | 缺口                                                                            | 状态   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------ |
| Slot 协议            | [`slots-basic` 等价 Demo、浏览器对照、截图与报告](./tr-chat-web-component-validation/slot/report.md)；Light DOM slot、renderer context、替换和 abort 自动化测试                                                                                                                           | 当前验证范围内无；任意 Vue VNode 跨 Web Component 边界不属于该协议目标          | 已完成 |
| Bubble Renderers     | [`bubble-options` 等价 Demo、浏览器对照、六张截图与报告](./tr-chat-web-component-validation/bubble-renderers/report.md)；内置 ID、DOM content/box、match、消息更新、替换、abort 与恢复测试                                                                                                | 当前验证范围内无；Vue VNode 跨 Web Component 边界和单个 `Tool` 不属于该协议目标 | 已完成 |
| 双向绑定             | [`controlled-ui` 原生 JS 报告](./tr-chat-web-component-validation/controlled-ui/report.md)；[跨框架总报告](./tr-chat-web-component-validation/cross-framework-binding/report.md)；Angular 与 React 均具备右栏开关、活动面板和浮动状态三项独立报告与截图，报告入口统一收录在跨框架总报告中 | 当前范围内无；Angular 是最终应用，React 仅保留协议探针                          | 已完成 |
| 复杂 property        | [`complex-properties` 等价 Demo、浏览器对照、六张截图与报告](./tr-chat-web-component-validation/complex-properties/report.md)；嵌套修改、整体替换及 data/ui/renderers/bubbleRenderers 联动测试                                                                                            | Angular/React wrapper 仍需复用此契约做专项验收                                  | 已完成 |
| Runtime 状态订阅     | [`runtime-subscription` 等价 Demo、浏览器对照、六张截图与报告](./tr-chat-web-component-validation/runtime-subscription/report.md)；snapshot/event、取消、恢复与 Runtime 替换测试                                                                                                          | 真实服务下的高频 streaming 事件压力仍待验证                                     | 已完成 |
| Runtime / 存储所有权 | [`runtime-ownership` 等价 Demo、浏览器对照、六张截图与报告](./tr-chat-web-component-validation/runtime-ownership/report.md)；owned/injected 替换、断开重连和 storageKey 隔离测试                                                                                                          | 跨页面恢复与异常关闭耐久性仍待验证                                              | 已完成 |

本次浏览器对照已确认 Slot、Bubble Renderers 与 Controlled UI Demo 均与原版主要 UI 状态和业务交互一致。双向绑定的原生 JavaScript 主流程以及 Angular、React 三组受控状态专项契约均已通过；React 只保留协议探针，Angular 继续作为最终应用。

## 已完成的组件功能点验收

- [x] **基础聊天**：默认 `TrChat` 左侧 rail、“应用助手”模型选择、输入发送、用户消息和模型回答。证据见 [基础聊天验证报告](./tr-chat-web-component-validation/basic-chat/report.md)。
- [x] **欢迎区与推荐问题**：`Welcome`、`Prompts`、`TrSender.template()`、显示开关、推荐问题写入和返回新会话。证据见 [欢迎区与推荐问题验证报告](./tr-chat-web-component-validation/welcome-prompts/report.md)。
- [x] **发送失败与恢复**：错误气泡、`runtime-action-error` 宿主通知，以及同一 Runtime 内失败后恢复；完整生命周期同时关联已完成的发送/取消和状态订阅报告。证据见 [发送生命周期验证报告](./tr-chat-web-component-validation/send-lifecycle/report.md)。
- [x] **Extension Tabs / Extension Manager**：Skills/MCP 页签、扩展动作、名称详情、页头 DOM Renderer、受控 overlay 与列表恢复。证据见 [Extension Tabs 验证报告](./tr-chat-web-component-validation/extension-tabs/report.md)。
- [x] **Sender Toolbar 与高级输入**：Mention、结构化 Template、帮助 Light DOM slot、自定义按钮、Toolbar 排序/显隐/禁用/激活和窄布局。证据见 [Sender 高级能力验证报告](./tr-chat-web-component-validation/sender-advanced/report.md)。
- [x] **Controlled UI 业务闭环**：受控输入、submit、消息追加、loading、cancel 与取消后恢复。证据见 [Controlled UI 验证报告](./tr-chat-web-component-validation/controlled-ui/report.md)。
- [x] **Runtime 外部动作**：owned Runtime ready、外部发送、streaming、abort、状态恢复与再次完成。证据见 [Runtime Actions 验证报告](./tr-chat-web-component-validation/runtime-actions/report.md)。
- [x] **Runtime 会话操作**：历史加载、激活会话、指定标题创建、列表更新与双向切换。证据见 [Runtime Conversations 验证报告](./tr-chat-web-component-validation/runtime-conversations/report.md)。
- [x] **复杂 property 更新**：固定 shallow property 契约，验证嵌套修改不触发渲染、整体赋值同步更新 data、ui 与 renderer。证据见 [复杂 Property 验证报告](./tr-chat-web-component-validation/complex-properties/report.md)。
- [x] **Runtime 状态订阅协议**：新增 `getRuntimeSnapshot()` 与 `runtime-state-change`，纯 DOM 宿主无需轮询 Vue readable。证据见 [Runtime 状态订阅验证报告](./tr-chat-web-component-validation/runtime-subscription/report.md)。
- [x] **Runtime 与存储所有权**：验证 owned/injected Runtime 的替换、释放、断开重连和 storage namespace 隔离。证据见 [Runtime 与存储所有权验证报告](./tr-chat-web-component-validation/runtime-ownership/report.md)。
- [x] **History 历史分组**：验证置顶/昨天/30 天内分组、五条会话、切换、选中态、消息恢复和重命名。证据见 [历史分组验证报告](./tr-chat-web-component-validation/history-groups/report.md)。
- [x] **右侧业务面板**：验证发布预览、Bubble 消息动作、引用资料、DOM Renderer、双向面板切换和关闭状态。证据见 [右侧业务面板验证报告](./tr-chat-web-component-validation/right-aside-panel/report.md)。
- [x] **响应式布局**：验证 760px 桌面 Dock、390px 移动端 Drawer、状态按钮和横向溢出。证据见 [响应式布局验证报告](./tr-chat-web-component-validation/responsive-layout/report.md)。
- [x] **布局预设**：验证默认、紧凑、专注、空会话底部输入和空会话居中输入五种状态。证据见 [布局预设验证报告](./tr-chat-web-component-validation/layout-presets/report.md)。
- [x] **浮动布局**：验证初始几何、DOM Renderer 页头、拖动、缩放、受控状态回写和两种关闭入口。证据见 [浮动布局验证报告](./tr-chat-web-component-validation/floating-layout/report.md)。
- [x] **发送前拦截**：通过真实 Sender 提交验证 reject、输入保留、continue、用户消息与助手回答。证据见 [发送前拦截验证报告](./tr-chat-web-component-validation/runtime-before-send/report.md)。
- [x] **Composer 状态**：验证正常、禁用输入、仅禁用提交、状态说明和 `composer-before` DOM Renderer 预设输入。证据见 [Composer 状态验证报告](./tr-chat-web-component-validation/runtime-composer/report.md)。
- [x] **Runtime send()**：验证默认 Runtime 拒绝空文本、自定义 Runtime 接收空文本，以及元素方法的布尔返回值。证据见 [Runtime send() 验证报告](./tr-chat-web-component-validation/runtime-send/report.md)。
- [x] **Runtime Adapter**：验证真实 Adapter 的受控输入、DOM 事件映射、自动创建会话、用户/助手消息与输入清空。证据见 [Runtime Adapter 验证报告](./tr-chat-web-component-validation/runtime-adapter/report.md)。
- [x] **DOM 事件协议**：验证直接 `detail`、`bubbles`、`composed`、重复派发和可取消 History 默认行为。证据见 [DOM 事件协议验收报告](./tr-chat-web-component-validation/event-contract/report.md)。
- [x] **元素初始化时序**：验证延迟注册、升级前 Property、同步受控回写、单布局、连接后写入、公开方法及 ready-once 重连。证据见 [元素初始化时序验收报告](./tr-chat-web-component-validation/initialization-timing/report.md)。
- [x] **可访问 Drawer 与消息日志**：验证 dialog 名称与关联、背景 inert、焦点进入/约束/恢复、Escape，以及消息 `role=log`、polite live region 和 streaming `aria-busy`。原版、Web Component 与 Angular 的浏览器业务对照和截图均通过；证据见 [可访问性与键盘导航验收报告](./tr-chat-web-component-validation/accessibility-navigation/report.md)。

## P0：跨框架核心能力

- [x] **Slot 协议**：已明确平台 slot、Vue scoped slot 与 DOM Renderer 的能力边界，补齐原版 `slots-basic` 所需的页头、Bubble footer 和 Composer after 协议，并验证 `Vue slot > DOM Renderer > fallback` 优先级。证据见 [Slot 验证报告](./tr-chat-web-component-validation/slot/report.md)。
- [x] **Bubble Renderers**：已覆盖内置 Markdown/Tools、结构化与未匹配内容、多段内容索引、自定义 content/box、消息更新、match 优先级与替换、异常恢复和 `AbortSignal` 生命周期。证据见 [Bubble Renderers 验证报告](./tr-chat-web-component-validation/bubble-renderers/report.md)。
- [x] **双向绑定**：原生 JavaScript、Angular 20 主应用和 React 19 最薄兼容性探针均通过；Angular 与 React 的 right aside、active panel、floating state 专项契约已完成。证据见 [跨框架双向绑定验证报告](./tr-chat-web-component-validation/cross-framework-binding/report.md)。
- [x] **复杂 property 更新**：`data`、`ui`、`runtimeOptions`、`renderers` 与 `bubbleRenderers` 使用整体重新赋值的 shallow property 契约，不新增命令式补丁 API。证据见 [复杂 Property 验证报告](./tr-chat-web-component-validation/complex-properties/report.md)。
- [x] **Runtime 与存储所有权**：owned Runtime 由元素释放，injected Runtime 由宿主释放；断开重连与 `storageKey` namespace 已验证。证据见 [Runtime 与存储所有权验证报告](./tr-chat-web-component-validation/runtime-ownership/report.md)。
- [x] **Runtime 状态订阅协议**：提供 `getRuntimeSnapshot()` 与 `runtime-state-change`，外部状态文案和控制按钮不再依赖轮询或 Vue readable。证据见 [Runtime 状态订阅验证报告](./tr-chat-web-component-validation/runtime-subscription/report.md)。
- [ ] **真实服务验证**：使用真实 DeepSeek 或兼容服务验证 streaming、取消、超时、网络中断、服务端错误、重试和恢复；使用真实 MCP endpoint 验证工具调用与资源释放。
- [x] **构建体积**：已评估 external Vue、样式裁剪、功能拆包和 tree-shaking；本阶段保留自包含策略，并建立 JavaScript gzip 650 KiB、CSS gzip 48 KiB 的自动化预算。证据见 [构建体积预算报告](./tr-chat-web-component-validation/bundle-budget/report.md)。

## Angular 应用级验收

- [x] **综合业务测试应用**：同一 Angular 20 宿主贯通历史仓库、原生 MCP 工具调用、TinyRobot Kit Skill、图片/文本附件、多模态消息、消息操作、场景状态看板和 390px 验收；默认本地运行，DeepSeek 通过 `.env.local` 与同源代理可选启用。证据见 [Angular 综合应用验收报告](./tr-chat-web-component-validation/angular-comprehensive-app/report.md)。

- [x] **MCP 管理与本地协议**：服务安装、详情、工具发现、工具启停和卸载通过；同源确定性 JSON-RPC 覆盖初始化和 `tools/list`。证据见 [Angular MCP 管理流程验证报告](./tr-chat-web-component-validation/angular-mcp-management/report.md)。真实外部 endpoint 仍由上方“真实服务验证”跟踪。
- [x] **Bubble 消息操作 UI**：复制、正负反馈与原因、通过公开 `send()` 的重发式重试、朗读/停止、Web Share 与剪贴板回退均通过；流式阶段操作门禁和 Renderer 重建后的状态保持已有回归覆盖。证据见 [基础消息操作](./tr-chat-web-component-validation/angular-message-operations/report.md)、[负向反馈](./tr-chat-web-component-validation/angular-negative-feedback/report.md)、[回答朗读](./tr-chat-web-component-validation/angular-read-aloud/report.md)和[回答分享](./tr-chat-web-component-validation/angular-share/report.md)。
- [ ] **消息操作服务闭环**：接入后台评价服务、真实渠道分享和原位替换式重试；当前宿主状态、浏览器能力与重发式重试不能替代生产后台语义。
- [x] **Sender 附件 UI 与消息协议**：使用原版 `TrAttachments` / `UploadButton` 完成选择、移除、随消息提交和成功后清空。证据见 [Angular Sender 附件流程验证报告](./tr-chat-web-component-validation/angular-attachments/report.md)。上传鉴权、存储、解析和失败恢复仍属于真实服务缺口。
- [x] **SSR-safe import**：`./experimental` 增加 Node 条件入口，导入阶段不访问 DOM；注册仍明确限定浏览器生命周期。证据见 [SSR 安全导入报告](./tr-chat-web-component-validation/ssr-safe-import/report.md)。
- [x] **Light DOM 样式边界**：Angular 宿主提供可切换样式压力 Demo；cascade layer、Web Component 基础控件默认值、浏览器几何对比和成对截图均通过。证据见 [Angular Light DOM 样式边界报告](./tr-chat-web-component-validation/angular-style-boundary/report.md)。

## P1：公开试用门槛

- [x] 固化事件协议，包括 `CustomEvent.detail`、冒泡、`composed`、可取消事件和重复派发约束。证据见 [DOM 事件协议验收报告](./tr-chat-web-component-validation/event-contract/report.md)。
- [x] 固化元素升级和初始化时序，包括 pre-upgrade property、延迟注册、连接后 property 写入、`ready` 和公开方法调用。证据见 [元素初始化时序验收报告](./tr-chat-web-component-validation/initialization-timing/report.md)。
- [x] 统一 Runtime、网络、adapter、renderer、附件和宿主回调错误结构，提供稳定的 `source`、`code`、`cause` 与 `recoverable` 语义，同时保留旧事件。证据见 [统一错误契约报告](./tr-chat-web-component-validation/unified-error-contract/report.md)。
- [x] 完成键盘导航、焦点返回、Escape、ARIA live streaming 和移动端 Drawer 的可访问性验证。公共契约已下沉到原生 `TrLayout` / `ChatMessages`，Web Component 与 Angular 自动继承；真实 VoiceOver / NVDA 连续 token 朗读节奏仍作为跨辅助技术发布验证，见 [可访问性与键盘导航验收报告](./tr-chat-web-component-validation/accessibility-navigation/report.md)。
- [x] 建立长会话、持续更新、频繁切换会话和反复挂载卸载的性能与内存测试。证据见 [长会话性能与内存验收报告](./tr-chat-web-component-validation/performance-memory/report.md)。真实网络 streaming 仍由“真实服务验证”单独跟踪。
- [x] 为 Angular、React 和原生 JavaScript 提供最薄类型消费层，覆盖 property binding、DOM 事件和 ref 方法；Angular 使用公开 event map 的 detail helper，React 与原生 JavaScript 直接复用公开元素接口。证据见 [Angular 最薄类型契约报告](./tr-chat-web-component-validation/angular-typed-contract/report.md) 和 [跨框架双向绑定报告](./tr-chat-web-component-validation/cross-framework-binding/report.md)。

## P2：正式发布门槛

- [ ] 建立 Vue baseline 与 Web Component 的视觉差异测试。
- [ ] 将完整回归矩阵扩展到 Firefox 和 WebKit。
- [ ] 验证 CSP、Trusted Types、nonce 和严格安全头。
- [ ] 评估 CDN、IIFE、UMD 等非 bundler 使用方式。
- [ ] 定义 experimental API 的版本、迁移、废弃和 graduation 策略。
- [ ] 明确最低浏览器版本、polyfill 和兼容性声明。

## 建议执行顺序

1. Slot、Bubble Renderers、双向绑定和复杂 property 更新语义。
2. Runtime / storage 所有权以及真实 streaming / MCP。
3. Light DOM 样式冲突、SSR-safe import 和构建体积。
4. 初始化时序、事件协议、框架类型与 wrapper。
5. 可访问性、长时间性能、跨浏览器、CSP 和发布策略。
