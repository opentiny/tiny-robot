# Web Component 适配组件：职责与实现

在[基础能力清单](basics.md)的直接转换结果上增加接入能力时，适配组件应保留已有的属性、事件和公开方法，再提供 Runtime 后赋值、就绪通知及后续内容入口。

## 1 直接转换后的接入需求

Vue 已将根组件的 props、emit 和公开方法连接到宿主元素，基本数据与操作可以沿用这套机制。进一步接入宿主时，还有以下需求：

- **明确内容出口**：Vue Custom Element 已支持具名内容分配，但原 TrChat 按 `slots[name]` 条件创建出口。直接转换后的实际可见性仍待验证，需要明确宿主内容如何连接到这些出口。
- **允许连接页面后再传入 Runtime**：原 TrChat 要求有效 Runtime。宿主先将元素连接到页面、再赋值 Runtime 时，需要在数据准备好之后挂载内部组件。
- **提供首次就绪通知**：宿主需要知道组件何时已挂载、具备必要输入，以便安排后续交互。

Scoped Slot 的上下文传递和 Vue 渲染内容参数还涉及组件内部如何生成内容，在对应的内容适配中分别处理。

## 2 为什么选择适配组件

项目选择新增一个 Vue 接入组件，称为 Web Component 适配组件。它作为 `defineCustomElement` 的根组件，内部继续使用原 TrChat，将元素属性、事件、挂载控制和内容出口集中在同一个接入边界。

Vue 自动连接的是根组件的接口。根组件由 TrChat 变为适配组件后，需要在这一边界上接收并转发原有 props、事件和公开方法。会话状态与业务操作继续由 Runtime 和 TrChat 负责。在相同输入与挂载条件下，原有方法的参数、返回值、事件载荷及业务语义保持一致；部分可用接口中已经支持的普通 JS 分支也应保留。

挂载顺序为：

1. 浏览器创建宿主元素，此时元素尚未连接到页面。
2. 元素连接到页面后，Vue 在其内部挂载适配组件，并将元素属性作为输入。
3. Runtime 有效后，适配组件挂载内部 TrChat。
4. 适配组件向内部组件传递属性、转发事件，并提供宿主调用的公开方法。

内容出口在后续普通 Slot 适配中接入。

## 3 逐项实现接入职责

### 3.1 接收属性并控制 Runtime 挂载时机

[TrChatElement.ce.vue](../../../packages/chat/src/experimental/TrChatElement.ce.vue) 声明 `runtime?: ChatRuntime` 等元素属性。`runtime` 允许后赋值，内部 TrChat 通过以下关键绑定等待 Runtime：

```vue
<!-- packages/chat/src/experimental/TrChatElement.ce.vue -->
<Chat v-if="props.runtime" :runtime="props.runtime" :ui="props.ui" :floating-state="props.floatingState" />
```

元素先连接页面时，Vue 挂载适配组件；宿主随后设置 `chat.runtime`，条件成立后才挂载内部 TrChat。其余属性也由适配组件接收，再传给原组件。

`title` 与其他属性一样显式声明并传给内部 TrChat，保持原组件的可选值语义。传入字符串可覆盖标题；设为 `undefined` 时恢复会话标题或默认标题。

[TrChatUIElement.ce.vue](../../../packages/chat/src/experimental/TrChatUIElement.ce.vue) 接收 `ChatUIProps`，通过 `v-bind="props"` 交给内部 TrChatUI，由宿主提供界面数据。

将 `ui.layout.surface.mode` 设为 `'floating'` 可启用浮窗布局。宿主通过 `chat.floatingState` 传入位置和尺寸对象，适配组件将它绑定到内部 TrChat；更新时重新给元素属性赋值。该属性的 DOM 类型为 [LayoutFloatingState](../../../packages/chat/src/experimental/elementTypes.ts)。

### 3.2 转发事件并保留参数类型

内部 TrChat 发出的事件需要先由新的根组件接收，再交给宿主元素。适配组件按原组件的公开事件清单建立监听器：

```ts
// packages/chat/src/experimental/TrChatElement.ce.vue
const emit = defineEmits(elementEventNames(CHAT_EVENTS))
const events = createElementEventListeners(CHAT_EVENTS, emit)
```

`events` 通过 `v-on="events"` 连接到内部 TrChat。[createElementEventListeners](../../../packages/chat/src/experimental/events.ts) 接收内部事件的全部参数，再通过适配组件 emit 交给 Vue。DOM `CustomEvent` 与 `event.detail` 参数数组由 Vue 提供。

[elementEvents.ts](../../../packages/chat/src/experimental/elementEvents.ts) 分别列出 TrChat、TrChatUI 的公开事件。元素侧保留原事件名，并额外提供项目别名。例如，`update:right-aside-open` 与 `right-aside-open-update` 都可监听，收到相同参数；单个事件名只触发一次。Vue 对含大写字母的事件还会提供连字符名称，例如 `update:inputValue` 与 `update:input-value`。

参数类型也沿用原组件的事件契约：[事件类型文件](../../../packages/chat/src/types/ui/events.ts)提取 `ChatEmits`，[Chat.vue](../../../packages/chat/src/Chat.vue) 通过 `defineEmits<ChatEmits>()` 使用它，[elementTypes.ts](../../../packages/chat/src/experimental/elementTypes.ts) 再将事件参数元组映射为 DOM 监听器类型。

### 3.3 转发公开方法

原 TrChat 公开 8 个方法，TrChatUI 公开 7 个输入与侧栏方法。适配组件保存内部组件 ref，并通过 [elementMethods.ts](../../../packages/chat/src/experimental/elementMethods.ts) 将对应方法注册到宿主元素：

```ts
// packages/chat/src/experimental/TrChatElement.ce.vue
const componentRef = shallowRef<TrChatElementMethods | null>(null)
useElementMethods(
  () => componentRef.value,
  [
    'send',
    'setInputValue',
    'clearInput',
    'focusInput',
    'openRightAside',
    'closeRightAside',
    'toggleRightAside',
    'activateRightAsidePanel',
  ],
)
```

内部 `<Chat ref="componentRef" ... />` 提供实际调用目标。元素方法每次调用都读取当前内部实例，传递原参数并返回原结果；替换 Runtime 或重新连接元素后，已有方法引用仍调用当前实例。两个元素的方法参数与返回值由 [elementTypes.ts](../../../packages/chat/src/experimental/elementTypes.ts) 声明。

`send` 调用 TrChat 自身的发送方法，包含草稿清空、发送结果和拒绝后草稿恢复；`runtime.actions.send` 是 Runtime 的业务操作入口。输入与侧栏方法同样沿用原组件行为。

### 3.4 同步宿主状态并发出首次就绪通知

[elementHost.ts](../../../packages/chat/src/experimental/elementHost.ts) 集中处理宿主属性同步与首次就绪通知。TrChat 适配组件向它传入需要同步的布尔属性，以及 Runtime 是否已准备好的条件：

```ts
// packages/chat/src/experimental/TrChatElement.ce.vue
useExperimentalElementHost(
  props as unknown as Record<string, unknown>,
  ['isEmpty', 'rightAsideOpen', 'defaultRightAsideOpen'],
  () => emit('ready'),
  () => Boolean(props.runtime),
)
```

适配组件挂载或更新后，将这些布尔值同步到宿主元素，供调用方读回。对 `tr-chat`，首次就绪条件是适配组件已挂载且 Runtime 有效。

[readiness.ts](../../../packages/chat/src/experimental/readiness.ts) 记录首次就绪状态，发出一次 `ready` 通知，并兑现 `whenTrChatReady(element)` 返回的 Promise。

[ElementEventContract.spec.ts](../../../packages/test/component/chat/ElementEventContract.spec.ts) 及配套 fixture 验证 `ready` 的空参数数组，以及单参数、数组和多参数事件的完整转发。

### 3.5 注册元素并提供包入口

[register.ts](../../../packages/chat/src/experimental/register.ts) 将适配组件交给 `defineCustomElement`，生成自定义元素构造器：

```ts
// packages/chat/src/experimental/register.ts
export const TrChatElement = defineCustomElement(TrChatElementComponent, {
  shadowRoot: false,
}) as unknown as TrChatElementConstructor<TrChatHTMLElement>
```

`shadowRoot: false` 选择普通 DOM 渲染，便于使用包提供的样式。这属于接入配置。`defineTrChatElements()` 将构造器注册为 `tr-chat`，同时注册对应 TrChatUI 的 `tr-chat-ui`。

包入口与构建配置分别承担以下职责：

- [index.ts](../../../packages/chat/src/experimental/index.ts) 导出注册函数、就绪 API 和元素类型；[web-component.css](../../../packages/chat/src/experimental/web-component.css) 引入基础组件样式并设置元素的块级显示。
- [vite.experimental.config.ts](../../../packages/chat/vite.experimental.config.ts) 与 [tsconfig.experimental.json](../../../packages/chat/tsconfig.experimental.json) 构建实验 JS、CSS 和类型产物，Vue 作为外部依赖共用。
- [package.json](../../../packages/chat/package.json) 声明实验入口及对应构建命令，供应用通过包路径导入。

## 4 使用适配元素

当前实现通过实验入口提供 `tr-chat`。以下步骤适用于支持包与 CSS 导入的纯 JS 模块工程，使用本分支构建的包。Vue 需要 3.5+，包与 Runtime 共用同一 Vue 实例；构建配置见[实验入口说明](../../../packages/chat/README.md#experimental-web-component-entry)。

调用方已创建兼容的 Runtime，以下通过变量 `runtime` 使用它。页面中准备 `<div id="app"></div>` 作为容器。

### 4.1 注册并挂载

1. 在应用入口导入并注册元素，同时引入样式：

   ```js
   import { defineTrChatElements } from '@opentiny/tiny-robot-chat/experimental'
   import '@opentiny/tiny-robot-chat/experimental/web-component.css'

   defineTrChatElements()
   ```

2. 创建尚未连接的元素，并传入 Runtime：

   ```js
   const chat = document.createElement('tr-chat')
   chat.runtime = runtime
   ```

3. 将元素连接到页面：

   ```js
   document.querySelector('#app').append(chat)
   ```

只传入属性、监听事件并由用户操作内置界面时，完成这些步骤即可。

### 4.2 初始化时调用方法

初始化后需要立即调用 `setInputValue`、`focusInput`、`send` 等方法时，应先确认内部组件已经挂载。`whenTrChatReady(element)` 接收宿主元素，返回 `Promise<void>`，等待该元素首次就绪：

- `tr-chat`：适配组件已挂载，且已接入有效 Runtime。
- `tr-chat-ui`：适配组件已挂载。

沿用上面已连接的 `chat`，等待就绪后设置草稿并聚焦输入框：

```js
import { whenTrChatReady } from '@opentiny/tiny-robot-chat/experimental'

await whenTrChatReady(chat)
chat.setInputValue('你好')
const focused = await chat.focusInput()
```

元素首次就绪后再调用此函数，会返回已完成的 Promise。先连接元素、后接入 Runtime 时，Promise 会等待 Runtime 赋值后内部 TrChat 挂载；元素连接和 Runtime 赋值仍由应用完成。

### 4.3 使用 ready 事件

也可以在创建元素时监听 DOM `ready` 事件，在回调中调用方法：

```js
const chat = document.createElement('tr-chat')
chat.addEventListener(
  'ready',
  () => {
    chat.setInputValue('你好')
  },
  { once: true },
)
chat.runtime = runtime
document.querySelector('#app').append(chat)
```

`ready` 与 `whenTrChatReady` 表示相同的首次就绪条件，同一初始化动作选择其中一种方式。事件监听应在首次连接前设置，以接收首次通知；Promise 形式也适用于调用时元素已经首次就绪的情况。

### 4.4 首次就绪的边界

首次就绪状态按元素记录。同一元素后续替换 Runtime、断开再连接时，`whenTrChatReady` 的等待不会重置，`ready` 也不会重新发出。应用需要根据自己的视图生命周期确认当前内部组件已挂载；创建新元素后，按新元素的就绪状态安排调用。

内部组件尚未挂载或已卸载时调用公开方法会抛出未就绪错误。发送完成和发送结果通过 `await chat.send(payload)` 获取。

## 5 当前边界与下一步

适配组件保留基础篇已有的属性、原事件及公开方法，并增加 Runtime 后赋值、布尔属性同步、首次就绪通知和事件别名。

[ElementBaseline.spec.ts](../../../packages/test/component/chat/ElementBaseline.spec.ts) 对直接转换与适配组件运行同一组属性、输入、侧栏、浮窗和发送契约；适配组件的回归还覆盖首次就绪等待、就绪后调用、布尔属性读回、原事件及别名、Runtime 替换与元素重连。业务取消方法由事件契约测试覆盖。三个宿主的“公开方法”页面验证真实包中的输入、聚焦与发送用法，入口见 [examples](../../../examples/README.md)。

普通 Slot 的内容分配机制已由 Vue 提供，原 TrChat 条件出口的直接转换效果仍待验证。下一篇[普通 Slot](ordinary-slots.md)介绍后续适配方案：显式提供具名出口，连接宿主内容与原组件。
