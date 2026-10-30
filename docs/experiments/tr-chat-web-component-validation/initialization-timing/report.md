# 元素初始化时序验收报告

## 结论

验收通过，映射判定为 **adapted**。连接到 DOM 后再注册的 `TrChatUI` Custom Element 能保留升级前写入的 `data`、`ui`、`renderers`、字符串/布尔属性和受控面板 ID；`ready` 只派发一次，连接后 Property 写入、公开右栏方法以及断开重连均正常。

本轮发现并修复一个 Angular 会真实触发的竞态：已连接的未注册元素若预先安装同步双向绑定监听器，初始化期 update 事件会在 Vue Custom Element 首次 mount 未结束时回写 Property，导致两个 `.tr-layout`。桥接层现在只把挂载完成前产生的事件延迟到 microtask；组件级回归和浏览器 Demo 均确认最终只有一个布局，挂载后的事件仍保持同步 DOM 协议。

## 原版基线与适配边界

- 原版：`docs/demos/chat/basic.vue`
- Web Component：`docs/demos/chat-experimental/initialization-timing.ts`
- 升级后的可见界面、右栏和公开方法仍来自原版 `TrChatUI`；Demo 额外提供延迟注册、属性写入和重连按钮，用于暴露浏览器 Custom Element 生命周期。
- Vue 应用通常在组件创建前完成注册；连接后升级是 Angular/原生 HTML 等宿主的额外时序，因此属于跨框架适配，不是原版视觉功能。

## 验收结果

| 能力                | 浏览器结果                                                      | 判定 |
| ------------------- | --------------------------------------------------------------- | ---- |
| 延迟注册            | 注册前无布局；点击注册后只有 1 个元素和 1 个 `.tr-layout`       | 通过 |
| 升级前复杂 Property | `data`、`renderers` 均保持对象身份，`ui` 驱动原版界面           | 通过 |
| 升级前 primitive    | `input-value` 保留“升级前草稿”，`right-aside-open` 生效         | 通过 |
| 同步受控回写        | 无效面板 `missing` 规范化为 `preview`，只回写一次且不重复 mount | 通过 |
| 连接后赋值          | 输入更新为“连接后草稿”，右栏受控关闭                            | 通过 |
| 公开方法            | `openRightAside('preview')` 打开原版右栏并渲染面板内容          | 通过 |
| 重连与 ready        | 移除后重新连接仍为单布局，输入保留，`ready=1`                   | 通过 |
| 控制台              | Chromium 专项测试未记录 error 级控制台输出                      | 通过 |

## 截图证据

- [原版基础 TrChat](./vue-basic-initial.png)
- [Web Component 注册前](./web-component-before-upgrade.png)
- [升级后单布局与 Property 状态](./web-component-after-upgrade.png)
- [断开重连后](./web-component-reconnected.png)

## 自动化证据

- `packages/test/component/chat-experimental/Protocol.spec.ts`：连接后升级、同步受控监听、升级前 Property 保留和单布局回归。
- `packages/test/experimental/chat-web-component.examples.spec.ts`：注册前/后状态、Renderer、受控面板回写、连接后赋值、公开方法和 ready-once 重连。

## 限制

- 本轮完整时序在 Chromium 验收；Firefox/WebKit 的完整延迟升级矩阵尚未执行。
- `ready` 表示元素内部首次可用，不代表真实模型服务、MCP 或宿主业务数据已经完成异步加载。
