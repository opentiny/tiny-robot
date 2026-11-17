# TrChat Web Component 基础能力

本篇说明如何将原 Vue 组件 TrChat 直接转换为 Web Component，以及转换后哪些能力可用、部分可用、不可用或待验证。TrChat 通过 `runtime` 对象取得会话、消息、请求状态和发送等操作，这个对象称为 Runtime。

## 如何转换为 Web Component

Vue 的 `defineCustomElement` 接收 Vue 组件，返回供浏览器创建自定义元素的构造器。交给它的 Vue 组件称为根组件。在支持包导入的纯 JS 模块工程中，将 TrChat 注册为自定义元素：

```js
import { defineCustomElement } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'

const DirectTrChatElement = defineCustomElement(TrChat)
customElements.define('tr-chat-direct', DirectTrChatElement)
const chat = document.createElement('tr-chat-direct')
```

`tr-chat-direct` 是本示例注册的标签名。`chat` 是创建出的宿主元素（host element），TrChat 会在它内部渲染。此时元素尚未连接到页面，应先给 `chat.runtime` 传入有效 Runtime，再将元素加入页面。

## 可用性说明

以下判断以本地 `upstream/release/v1.0.x` 的原组件为基线，Vue 转换机制以本地 3.5.41 为依据。

- **可用**：公开参数与返回值可以按普通 JS 数据、函数或浏览器原生对象使用；仍需满足表中条件。
- **部分可用**：接口同时包含可直接使用的部分与 Vue 专属对象、渲染语义或响应式依赖，需要按内部字段判断。
- **不可用**：转换后的接口无法向非 Vue 宿主提供这项能力。
- **待验证**：尚未确认具体场景中的实际行为。

对象和数组按嵌套字段判断可用性，方法参数和事件载荷也遵循同样的边界。`unknown`、`metadata` 等业务扩展值由调用方保证兼容。

以下按源码与 Vue 转换机制说明接口边界。浏览器对照验收覆盖普通配置、历史数据、输入与侧栏方法、浮窗和本地发送等代表性场景；业务扩展字段与完整 Runtime 资源释放仍按各节条件判断。

## props 的可用情况

TrChat 通过以下 10 个 props 接收输入，其中 `runtime` 必填。对象和数组通过宿主元素的 JavaScript 属性传入，字符串还可使用 HTML 属性。部分嵌套字段接收 Vue Component（组件定义）或 VNode（Vue 创建的虚拟节点），这些字段依赖 Vue 的渲染机制。

| Vue 组件 TrChat：prop 与类型               | Web Component：纯 JS 赋值                            | 可用性   | 能力边界                                                                   |
| ------------------------------------------ | ---------------------------------------------------- | -------- | -------------------------------------------------------------------------- |
| `runtime`（对象）                          | `chat.runtime = runtime`                             | 部分可用 | 可接收兼容 Runtime；状态更新依赖 Vue 响应式数据，模型选项还可包含 Vue 组件 |
| `ui`（对象）                               | `chat.ui = ui`                                       | 部分可用 | 普通配置和 JS 回调可用，多个嵌套字段仍接收 Vue Component / VNode           |
| `title`（字符串）                          | `chat.title = title`                                 | 可用     | 覆盖会话标题；`undefined` 恢复原默认逻辑                                   |
| `historyData`（数组）                      | `chat.historyData = history`                         | 部分可用 | 标准条目与分组数据可用；透传的扩展图标等字段仍有 Vue 渲染语义              |
| `isEmpty`（布尔值）                        | `chat.isEmpty = isEmpty`                             | 可用     | 控制空状态判断                                                             |
| `floatingState`（对象）                    | `chat.floatingState = state`                         | 可用     | 内部为位置标识与数值字段，配合浮窗布局配置                                 |
| `rightAsideOpen`（布尔值）                 | `chat.rightAsideOpen = open`                         | 可用     | 控制右侧栏开合                                                             |
| `defaultRightAsideOpen`（布尔值）          | `chat.defaultRightAsideOpen = initialOpen`           | 可用     | 提供初始开合状态                                                           |
| `activeRightAsidePanelId`（字符串）        | `chat.activeRightAsidePanelId = panel`               | 可用     | 控制当前右侧面板                                                           |
| `defaultActiveRightAsidePanelId`（字符串） | `chat.defaultActiveRightAsidePanelId = initialPanel` | 可用     | 提供初始面板                                                               |

对象与数组的具体字段见[对象与数组 prop 的内部边界](#对象与数组-prop-的内部边界)。

更新配置时，重新给宿主元素的属性赋值；普通对象与历史数组的替换已有浏览器验收。对象或数组内部原地修改后的刷新、Boolean 属性的所有读回组合仍待验证。

## 事件的可用情况

Vue 将 TrChat 的 emit 转为宿主元素上的 DOM `CustomEvent`，事件参数放在 `event.detail` 数组中。TrChat 的 26 个事件均传入一个参数，宿主从 `event.detail[0]` 读取。监听方式相同，载荷的可用性取决于其内部字段。

| Vue 组件 TrChat：监听与参数                           | Web Component：纯 JS 监听与参数                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `@runtime-action-error="onError"`，`onError(payload)` | `chat.addEventListener('runtime-action-error', event => onError(event.detail[0]))`   |
| `@update:right-aside-open="onOpen"`，`onOpen(open)`   | `chat.addEventListener('update:right-aside-open', event => onOpen(event.detail[0]))` |

下表名称同时适用于 Vue 组件 emit 和 Web Component DOM 事件：

| Vue 组件 emit / Web Component DOM 事件名称                                                                                     | 可用性   | 载荷边界                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------- |
| `runtime-action-error`                                                                                                         | 可用     | action 为普通数据；payload / error 按业务实际类型处理                              |
| `model-feature-value-change`                                                                                                   | 可用     | 模型 ID、特性键和布尔值/字符串等普通数据                                           |
| `update:floating-state`、`update:right-aside-open`、`update:active-right-aside-panel-id`                                       | 可用     | 浮窗普通数据对象、布尔值、面板 ID                                                  |
| `floating-drag-start`、`floating-drag`、`floating-drag-end`、`floating-resize-start`、`floating-resize`、`floating-resize-end` | 可用     | 浮窗位置、尺寸、调整方向等普通数据                                                 |
| `history-action`                                                                                                               | 部分可用 | 操作 ID、会话字段与业务取消方法可用；action.icon 及会话扩展图标可能是 Vue 渲染对象 |
| `prompt-click`                                                                                                                 | 部分可用 | 原生点击事件与提示文字可用；item.icon、item.badge 的 VNode 分支依赖 Vue            |
| `bubble-state-change`、`bubble-event`                                                                                          | 可用     | 消息索引、事件名等普通数据；value / payload 按业务实际类型处理                     |
| `sender-drag-enter`、`sender-drag-over`、`sender-drag-leave`、`sender-drop`、`sender-paste`                                    | 可用     | DragEvent、ClipboardEvent、HTMLElement 等浏览器原生对象                            |
| `mcp-create-server`、`extension-action`、`extension-name-click`、`extension-tab-change`                                        | 可用     | 服务配置、标识、动作与原生事件；自定义 payload 按业务类型处理                      |
| `left-aside-open-change`、`right-aside-open-change`                                                                            | 可用     | open、source 等普通数据                                                            |

事件载荷保留原对象；其中的 Vue 组件、VNode 不会自动转换为宿主视图。`ui` 与 `historyData` 的字段说明列出了相关图标和内容参数。

更新事件保留 `update:*` 名称。`history-action` 的业务取消通过载荷中的 `preventDefault()` 完成，宿主调用 `event.detail[0].preventDefault()`。

## 公开方法的可用情况

TrChat 通过 Vue 的 `defineExpose` 公开 8 个方法，Vue 3.5.41 在根组件挂载后将它们连接到宿主元素。传入兼容 Runtime 且界面挂载完成后，可以通过元素调用这些方法。

Vue 组件用法中，在 `<script setup>` 内通过 `const chatRef = ref(null)` 保存引用，并在模板使用 `<TrChat ref="chatRef" :runtime="runtime" />` 关联组件，通过 `chatRef.value` 调用。两种用法的标准参数与返回值相同：

| Vue 组件 TrChat：组件 ref 调用                 | Web Component：宿主元素调用           | 可用性 | 返回值             |
| ---------------------------------------------- | ------------------------------------- | ------ | ------------------ |
| `chatRef.value.send(payload)`                  | `chat.send(payload)`                  | 可用   | `Promise<boolean>` |
| `chatRef.value.setInputValue(text)`            | `chat.setInputValue(text)`            | 可用   | `void`             |
| `chatRef.value.clearInput()`                   | `chat.clearInput()`                   | 可用   | `void`             |
| `chatRef.value.focusInput()`                   | `chat.focusInput()`                   | 可用   | `Promise<boolean>` |
| `chatRef.value.openRightAside(panel)`          | `chat.openRightAside(panel)`          | 可用   | `void`             |
| `chatRef.value.closeRightAside()`              | `chat.closeRightAside()`              | 可用   | `void`             |
| `chatRef.value.toggleRightAside(panel)`        | `chat.toggleRightAside(panel)`        | 可用   | `void`             |
| `chatRef.value.activateRightAsidePanel(panel)` | `chat.activateRightAsidePanel(panel)` | 可用   | `boolean`          |

`send({ text })` 等标准输入可直接使用；`structuredData`、`externalPayloads` 中的业务扩展值由调用方保证兼容。调用时应保证内部组件已经挂载。直接转换后，同一元素移除再连接及重挂后已有方法引用的有效性仍待验证。

## 对象与数组 prop 的内部边界

普通 JS 数据、函数及 HTMLElement、浏览器事件等原生对象，可以按对应接口使用。包含 Vue Component、VNode 或 Ref / ComputedRef（Vue 响应式值）的字段，还依赖相应的 Vue 渲染或响应式机制。

### ui：部分可用

`ui` 的类型为 `ChatUIOptions`，同时包含普通配置和 Vue 渲染内容参数，整体为部分可用：

| `ui` 内部配置                          | 可用性   | 普通 JS 部分与 Vue 依赖                                                                                           |
| -------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `anchor`、`layout`、`labels`、`header` | 可用     | 布局数值、文字、布尔值及普通嵌套对象                                                                              |
| `model`、`mcp`                         | 可用     | `model.appendTo` 为字符串或原生 HTMLElement；`mcp` 为开关或空配置                                                 |
| `brand`                                | 部分可用 | name 为字符串；logo 交给 Vue 动态组件渲染，按 Vue 组件或标签名语义处理                                            |
| `welcome`                              | 部分可用 | title、description、align 为普通值；icon 接收 VNode                                                               |
| `prompts`                              | 部分可用 | 提示文字、开关、class 与普通 style 对象可用；items[].icon 接收 VNode，badge 可为字符串或 VNode                    |
| `history`                              | 部分可用 | 重命名等开关、菜单 ID/文字可用；menuItems[].icon 接收 Vue Component / VNode                                       |
| `bubble`                               | 部分可用 | 位置、形状、分组与普通数据解析回调可用；头像、匹配项的 `renderer`、回退与错误渲染器接收 Vue 渲染对象              |
| `sender`                               | 部分可用 | 占位文字、模式、尺寸和普通业务回调可用；toolbar[].icon 有 Vue Component 分支，默认按钮 tooltip 的回调可返回 VNode |
| `extensions`                           | 部分可用 | 页签、条目文字、进度等普通数据可用；条目 icon 有 Vue Component 分支，actions[].icon 接收 Vue Component            |

普通配置字段可以直接使用，含 Vue 渲染对象的字段按表中限制处理。从 Vue 导入的 `CSSProperties` 描述普通样式对象，可按普通 JS 数据使用。

字段来源见 [ChatUIOptions](../../../packages/chat/src/types/ui/options.ts)、[Bubble 类型](../../../packages/components/src/bubble/index.type.ts)、[提示词类型](../../../packages/components/src/prompts/index.type.ts)、[历史类型](../../../packages/components/src/history/index.type.ts)、[Sender Tooltip 类型](../../../packages/components/src/sender-actions/types/tooltip.ts)与[扩展类型](../../../packages/components/src/extension-manager/index.type.ts)。

### runtime：部分可用

Runtime 的业务操作可以由 JS 函数提供，状态字段通过 `.value` 读取。`useChatRuntime()` 创建的实例内部使用 Vue 响应式值，状态变化可以被界面追踪。普通 `{ value: ... }` 对象只满足读取形式，后续字段变化不会自动触发同样的界面更新。

动态状态应使用可被 Vue 追踪的数据来源。`runtime.composer.model.options` 中的 `icon` 还可以是字符串或 Vue Component，需按实际取值判断。

依据为 [ChatRuntime / ChatModelRuntime](../../../packages/chat/src/types/runtime.ts)、[ChatReadable](../../../packages/chat/src/types/base.ts)及[状态消费实现](../../../packages/chat/src/composables/useChatRuntimeAdapter.ts)。整体资源释放的能力边界仍待验证。

### historyData：部分可用

标准条目的 id、title、时间戳，以及分组的 group、items 都是普通 JS 数据，可以使用。条目还允许扩展字段，历史归一化会保留这些字段；扩展的 icon 继续交给内部 History 按 Vue Component / VNode 渲染。

普通条目与分组数据可用，含 Vue 渲染对象的扩展字段受限；`metadata` 等业务字段由调用方保证兼容。

依据为 [ChatHistoryData](../../../packages/chat/src/types/ui/data.ts)、[历史条目归一化](../../../packages/chat/src/composables/useChatHistoryItems.ts)和[History 渲染实现](../../../packages/components/src/history/index.vue)。

### floatingState：可用

`placement` 是位置字符串，`offsetX`、`offsetY`、`width`、`height` 为数值；公开字段中没有 Vue 渲染对象或响应式容器。可以用普通 JS 对象传入，更新时重新给元素属性赋值。类型见 [LayoutFloatingState](../../../packages/components/src/layout/index.type.ts)。

## Slot 的可用情况

Slot 是调用方在组件指定位置提供内容的入口。普通 Slot 只接收内容；Scoped Slot 还向调用方提供数据和操作参数。

| Vue 组件 TrChat：Slot 类型与示例                                   | Web Component：可用性 | 能力边界                                                                                                                      |
| ------------------------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 普通 Slot，例如 `#welcome-footer`                                  | 待验证                | Vue Custom Element 支持用 `slot="welcome-footer"` 分配宿主内容，但原 TrChat 按 `slots[name]` 条件转发出口，实际可见性需要验证 |
| Scoped Slot，例如 `#layout-header="{ title, createConversation }"` | 不可用（上下文传递）  | 原生 Slot 只分配 DOM 内容，不会将这些 Vue 插槽参数交给宿主                                                                    |

TrChat 的普通 Slot 包括 `welcome-footer`、`prompts-footer`、`sender-header`、`input-prefix`。Scoped Slot 还覆盖消息、侧栏和输入区等位置。

## Runtime 与样式的接入条件

| 能力                             | Web Component 的结果         | 使用条件或待补验证                                                                                                                 |
| -------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 会话、发送、取消、模型与工具操作 | 原组件仍连接已有 Runtime     | 调用方传入兼容实例，Vue 响应式数据共用同一运行机制；完整业务闭环待验收                                                             |
| Runtime 创建与销毁               | 由调用方通过已有 JS API 管理 | 直接转换要求传入 Runtime；整体释放接口与资源清理仍待验证                                                                           |
| 样式                             | 需要按渲染位置配置           | Vue 默认使用 Shadow DOM，即独立的组件 DOM 树；外部页面 CSS 的规则不能直接穿透它。需要向内部提供样式，或选择普通 DOM 渲染并导入 CSS |

后续的 [Web Component 适配组件](adapter-component.md)以这些已可用能力为基线，保留原有用法与行为，再增加接入能力。普通 Slot 的待验证状态及 Vue 专属字段的限制继续沿用，在对应章节逐项处理。
