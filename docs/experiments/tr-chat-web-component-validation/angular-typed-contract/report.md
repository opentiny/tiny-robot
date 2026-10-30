# Angular 最薄类型契约验收报告

- 验收日期：2026-10-28
- 消费者：Angular 20 strict templates
- 浏览器：Chromium
- Demo：`packages/angular20-chat-experimental`
- 结论：通过

## 结论

Angular 最终应用不需要维护一套复制 Web Component API 的重型 wrapper。实验入口现有 `TrChatHTMLElement` / `TrChatUIHTMLElement` 已覆盖复杂 property 和公开 ref 方法；本批把导出的 `TrChatElementEventMap` / `TrChatUIElementEventMap` 连接到元素的 `addEventListener` / `removeEventListener` overload，并在 Angular 侧提供一个只负责校验事件名和提取 `detail` 的薄 helper。

最终消费方式仍然是标准 Custom Element：

- property：Angular `[runtimeOptions]`、`[ui]`、`[renderers]`、`[rightAsideOpen]` 等直接写 DOM property；
- event：Angular 模板收到标准 `Event`，`trChatEventDetail()` 依据公开 event map 返回准确 detail 类型；
- ref：`ElementRef<TrChatHTMLElement>` 直接调用 `send()`、`getRuntime()` 和右栏方法。

不引入 Angular 专用组件 fork，也不依赖 Vue 类型或内部路径。

## RED / GREEN 证据

- Chat 类型测试在改动前失败：`addEventListener('right-aside-open-update', event => event.detail)` 中 `event` 被推断为普通 `Event`；`submit` 被推断为浏览器 `SubmitEvent`。
- Angular helper 测试在实现前因模块不存在而编译失败。
- 加入元素事件 overload 和 helper 后，Chat type-check、Angular spec type-check 与 4 个 Angular 单元测试通过。

## 运行时验收

| 契约          | Angular Demo 行为                                                    | 结果 |
| ------------- | -------------------------------------------------------------------- | ---- |
| 复杂 property | Runtime、UI、Renderer 和右栏状态通过 property 绑定                   | 通过 |
| DOM event     | 内部关闭右栏派发 update event，typed detail 回写 signal              | 通过 |
| ref 方法      | 真实 Sender / Renderer 通过公开 `send()` 和 Runtime ref 完成业务动作 | 通过 |
| 类型隔离      | Angular 不导入 Vue 或 Chat 内部模块                                  | 通过 |
| 控制台        | property/event/ref 浏览器场景无 error                                | 通过 |

## 截图证据

类型本身是编译期契约，不产生独立视觉样式；运行时截图复用同一 Angular Demo 已保存的 property/event/ref 业务证据：

- [Angular 右侧面板外部 property 打开](../angular-right-aside/screenshots/angular-right-aside-open.png)
- [组件内部 event 关闭并回写 Angular](../angular-right-aside/screenshots/angular-right-aside-closed.png)
- [通过公开 send/ref 完成消息操作](../angular-message-operations/angular-message-retry.png)

## 自动化

- Chat TypeScript 公共元素类型：通过。
- Angular spec TypeScript：通过。
- Angular Karma / ChromeHeadless：4 / 4 通过。
- Angular Chromium property/event/ref 专项：2 / 2 通过。

## 范围边界

- Angular template 对未知 Custom Element 的 `$event` 基础类型仍由 Angular 表示为 `Event`；薄 helper 负责把公开 event map 带入业务代码。
- 本批不生成每个属性和事件一一对应的 Angular directive，以避免复制并漂移 Web Component API。
- React 继续只保留已有兼容性探针，不扩展 wrapper。
