# @opentiny/tiny-robot-chat

TinyRobot Chat provides Vue 3 components for building an AI chat page or embedding an assistant in an application. `TrChat` combines conversation history, messages, and a composer with a chat runtime. Use `TrChatUI` to supply your own conversation data and handle UI events.

## Installation

In a Vue 3.3.11 or later Vue 3 project, install the Chat package and the base components package.

```sh
npm install @opentiny/tiny-robot-chat @opentiny/tiny-robot
```

Import both stylesheets in your application entry point.

```ts
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'
```

## Usage

Configure your model service with `useChatRuntime` and pass the returned runtime to `TrChat`. The quick start includes a complete `App.vue` example.

- [Quick start](https://docs.opentiny.design/tiny-robot/suites/quick-start)
- [UI configuration and customization](https://docs.opentiny.design/tiny-robot/suites/chat)
- [Runtime configuration](https://docs.opentiny.design/tiny-robot/suites/chat-runtime)

## License

MIT

## Experimental Web Component entry

`@opentiny/tiny-robot-chat/experimental` 提供 `tr-chat` 和 `tr-chat-ui`，需要 Vue >=3.5，且稳定入口、实验入口与 Runtime 创建方共用同一 Vue 实例。该入口面向支持包与 CSS 导入的浏览器工程。

`tr-chat` 接收调用方创建的兼容 Runtime；`tr-chat-ui` 接收 `data`、`ui` 与输入等界面属性。以下示例使用已创建的 `runtime`，页面包含 `<div id="app"></div>`：

```ts
import { defineTrChatElements, whenTrChatReady, type TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental'
import '@opentiny/tiny-robot-chat/experimental/web-component.css'

defineTrChatElements()
const chat = document.createElement('tr-chat') as TrChatHTMLElement
chat.runtime = runtime
chat.addEventListener('update:right-aside-open', (event) => {
  chat.rightAsideOpen = event.detail[0]
})
document.querySelector('#app')!.append(chat)
await whenTrChatReady(chat)
chat.setInputValue('你好')
const accepted = await chat.send({ text: '你好' })
```

示例在初始化时立即调用公开方法，因此先等待首次就绪。只绑定属性、监听事件并使用内置界面时可直接接入；初始化动作也可在提前注册的 `ready` 监听器中执行。两种方式的使用时机与首次就绪边界见[应用侧用法](../../docs/engineering/web-component/adapter-component.md#42-初始化时调用方法)。

适配组件保留原组件的属性、事件和公开方法。TrChat 的 8 个方法包括发送、输入与侧栏操作；TrChatUI 保留 7 个输入与侧栏方法。参数与返回值沿用原组件，元素方法每次调用当前内部实例。调用要求内部组件已挂载；`tr-chat` 还要求有效 Runtime，后赋值场景可等待首次就绪。组件未挂载或已卸载时，方法调用会明确报未就绪错误。

DOM 事件保留原 emit 名称与参数数组，并提供项目别名。例如 `update:inputValue`、Vue 提供的 `update:input-value` 以及项目别名 `input-value-update` 都可监听，单一名称只发出一次。单参数通过 `event.detail[0]` 读取，`ready` 的参数为 `[]`。同一个业务处理选择一种名称；Angular 示例使用项目别名，DOM 监听器也可沿用原名。

布局使用普通 DOM 并引入包 CSS。非 Vue 工程还需配置 Vue ESM feature flags，例如 Angular application builder 的 `define`：`__VUE_OPTIONS_API__: 'true'`、`__VUE_PROD_DEVTOOLS__: 'false'`、`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'`。

基础能力的嵌套字段限制见 [基础能力](../../docs/engineering/web-component/basics.md)，接入实现见 [Web Component 适配组件](../../docs/engineering/web-component/adapter-component.md)。可运行的原生 JS、Angular、React 页面及统一测试见 [examples](../../examples/README.md)。Slot、Renderer、Vue Component / VNode 内容适配与完整 Runtime 资源释放按后续能力分别验证。
