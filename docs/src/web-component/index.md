---
outline: [1, 3]
---

# TrChat Web Component

在 Angular、React 或原生 JavaScript 应用中，通过 `tr-chat` 接入完整聊天功能，通过 `tr-chat-ui` 使用由业务管理数据的聊天界面。元素注册、类型和自定义内容接口从 `@opentiny/tiny-robot-chat/experimental` 导入。

| 元素         | 适用场景                                         | 数据与操作                              |
| ------------ | ------------------------------------------------ | --------------------------------------- |
| `tr-chat`    | 模型对话、流式回复、历史会话、模型切换、MCP 工具 | 绑定 `runtime`，由 Runtime 执行聊天操作 |
| `tr-chat-ui` | 已有会话服务或业务状态管理，只需要聊天界面       | 绑定 `data`，监听事件并更新数据         |

## 安装与注册

1. 在已有应用中安装 Chat 包：

   ```sh
   pnpm add -E @opentiny/tiny-robot-chat@1.0.1-alpha.1
   ```

2. 在浏览器入口注册元素并引入样式：

   ```ts
   import { defineTrChatElements } from '@opentiny/tiny-robot-chat/experimental'
   import '@opentiny/tiny-robot-chat/experimental/web-component.css'

   defineTrChatElements()
   ```

   同一套构造器可重复注册。服务端渲染应用应在浏览器中执行注册和 Runtime 创建。

3. 给聊天区域明确的高度，例如：

   ```css
   tr-chat,
   tr-chat-ui {
     display: block;
     height: 100%;
   }
   .chat-page {
     height: 100dvh;
   }
   ```

应用代码直接使用 Chat 接口。pnpm 10、npm 7 及以上默认自动安装所需的 peer 依赖，应用无需直接声明 Vue。

## 接入聊天服务

在页面中准备挂载容器：

```html
<div class="chat-page"></div>
```

```ts
import { createChatRuntime } from '@opentiny/tiny-robot-chat'
import { whenTrChatReady, type TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental'

const owned = createChatRuntime({
  modelProviders: [
    {
      type: 'openai',
      apiUrl: new URL('/api/chat/completions', location.origin).href,
      models: [{ id: 'your-model-id', label: '应用助手' }],
    },
  ],
})

const chat = document.createElement('tr-chat') as TrChatHTMLElement
chat.runtime = owned.runtime
chat.ui = { welcome: { title: '你好，有什么可以帮你？' } }
document.querySelector('.chat-page')!.append(chat)

await whenTrChatReady(chat)
await chat.focusInput()

// 所属页面销毁时执行。
async function destroyChat() {
  chat.remove()
  await owned.dispose()
}
```

`/api/chat/completions` 应由应用后端提供兼容 OpenAI Chat Completions 的接口，模型 ID 使用该服务实际支持的值。浏览器直连服务需要服务端允许跨域访问；生产密钥由后端管理。

完整配置见 [Runtime](./runtime)，框架接入见 [Angular](./angular) 和 [React](./react)。

## 由业务管理聊天数据

已有会话服务或消息状态管理时，使用 `tr-chat-ui`。沿用上面的元素注册、样式和 `.chat-page` 容器，通过 `data` 提供消息，监听 `submit` 处理用户发送：

```ts
import { whenTrChatReady, type TrChatUIHTMLElement } from '@opentiny/tiny-robot-chat/experimental'

const chatUI = document.createElement('tr-chat-ui') as TrChatUIHTMLElement
chatUI.data = { bubble: { messages: [] } }
chatUI.addEventListener('submit', (event) => {
  const [payload] = event.detail
  const messages = chatUI.data?.bubble?.messages ?? []
  chatUI.data = {
    ...chatUI.data,
    bubble: {
      messages: [...messages, { role: 'user', content: payload.text }],
    },
  }
  chatUI.clearInput()
})
document.querySelector('.chat-page')!.append(chatUI)

await whenTrChatReady(chatUI)
await chatUI.focusInput()
```

此例将发送内容追加到消息列表。应用在 `submit` 处理中调用自己的会话服务，收到回复后按相同方式追加助手消息，并为 `data` 赋新对象。请求期间可通过 `data.sender.loading` 显示加载状态；取消操作监听 `cancel` 事件，由应用中止请求。聊天功能移除时调用 `chatUI.remove()`，同时清理应用自己的请求和订阅。

## 属性

对象、数组和回调通过 JavaScript 元素属性赋值。Angular 使用 `[runtime]`、`[ui]` 等属性绑定；React 可按 [React 接入示例](./react) 使用 DOM ref。更新业务配置时给元素赋新对象。

| 属性                                                         | `tr-chat` | `tr-chat-ui` | 用途                                                   |
| ------------------------------------------------------------ | --------- | ------------ | ------------------------------------------------------ |
| `runtime`                                                    | 可用      | 不适用       | 会话和聊天操作                                         |
| `data`                                                       | 不适用    | 部分可用     | 会话、消息、输入状态、模型和 MCP 数据                  |
| `ui`                                                         | 部分可用  | 部分可用     | 布局、欢迎区、提示词、消息和输入区配置；受限字段见下文 |
| `historyData`                                                | 可用      | 不适用       | 自定义历史分组和排序                                   |
| `inputValue` / `defaultInputValue`                           | 不适用    | 可用         | 输入草稿的受控值 / 初始值                              |
| `isEmpty`                                                    | 可用      | 可用         | 控制空状态                                             |
| `floatingState`                                              | 可用      | 可用         | 悬浮位置、宽高和偏移                                   |
| `rightAsideOpen` / `defaultRightAsideOpen`                   | 可用      | 可用         | 右侧面板的受控状态 / 初始状态                          |
| `activeRightAsidePanelId` / `defaultActiveRightAsidePanelId` | 可用      | 可用         | 当前右侧面板                                           |
| `renderers`                                                  | 可用      | 可用         | 接收上下文并生成自定义内容                             |
| `bubbleRenderers`                                            | 可用      | 可用         | 自定义 Bubble 消息正文                                 |

`ui` 与 `data` 的字段说明分别见 [Chat 界面配置](../suites/chat)及其公开类型。Web Component 的内容定制方式见 [内容定制](./customization)。

## 事件

事件参数保存在 `CustomEvent.detail` 数组中，按原参数顺序读取。常用名称如下：

| 事件                                                                                            | 元素         | `detail`                                          |
| ----------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------- |
| `ready`                                                                                         | 两者         | `[]`                                              |
| `floating-state-update`                                                                         | 两者         | `[floatingState]`                                 |
| `floating-drag-start` / `floating-drag` / `floating-drag-end`                                   | 两者         | `[dragDetail]`                                    |
| `floating-resize-start` / `floating-resize` / `floating-resize-end`                             | 两者         | `[resizeDetail]`                                  |
| `bubble-event`                                                                                  | 两者         | `[{ name, payload, messageIndex, contentIndex }]` |
| `bubble-state-change`                                                                           | 两者         | `[{ key, value, messageIndex, contentIndex }]`    |
| `renderer-error`                                                                                | 两者         | `[{ name, error }]`                               |
| `runtime-action-error`                                                                          | `tr-chat`    | `[actionError]`                                   |
| `submit`                                                                                        | `tr-chat-ui` | `[sendPayload]`                                   |
| `input-value-update`                                                                            | `tr-chat-ui` | `[text]`                                          |
| `cancel` / `clear` / `create-conversation`                                                      | `tr-chat-ui` | `[]`                                              |
| `switch-conversation`                                                                           | `tr-chat-ui` | `[{ conversationId }]`                            |
| `rename-conversation`                                                                           | `tr-chat-ui` | `[{ conversationId, title }]`                     |
| `model-select`                                                                                  | `tr-chat-ui` | `[{ modelId }]`                                   |
| `model-feature-value-change`                                                                    | 两者         | `[featureChange]`                                 |
| `mcp-add-server` / `mcp-remove-server`                                                          | `tr-chat-ui` | `[{ serverId }]`                                  |
| `mcp-server-enabled-change` / `mcp-tool-enabled-change`                                         | `tr-chat-ui` | `[change]`                                        |
| `prompt-click` / `history-action`                                                               | 两者         | `[payload]`                                       |
| `mcp-create-server`                                                                             | 两者         | `[payload]`                                       |
| `extension-action` / `extension-name-click` / `extension-tab-change`                            | 两者         | `[payload]`                                       |
| `sender-drag-enter` / `sender-drag-over` / `sender-drag-leave` / `sender-drop` / `sender-paste` | 两者         | `[payloadOrEvent]`                                |
| `left-aside-open-change` / `right-aside-open-change`                                            | 两者         | `[{ open, source }]`                              |
| `right-aside-open-update` / `active-right-aside-panel-id-update`                                | 两者         | `[value]`                                         |

```ts
chat.addEventListener('floating-state-update', (event) => {
  const [state] = event.detail
  chat.floatingState = state
})
```

完整事件及载荷类型为 `TrChatElementEventMap`、`TrChatUIElementEventMap`。原 `update:...` 名称也保留；同一事件选择一种名称监听即可。

## 元素方法

在 `await whenTrChatReady(element)` 后调用方法。

| 方法                                                                            | 元素      | 返回值                               |
| ------------------------------------------------------------------------------- | --------- | ------------------------------------ |
| `setInputValue(text)` / `clearInput()`                                          | 两者      | `void`                               |
| `focusInput()`                                                                  | 两者      | `Promise<boolean>`，表示是否成功聚焦 |
| `openRightAside(panelId?)` / `closeRightAside()` / `toggleRightAside(panelId?)` | 两者      | `void`                               |
| `activateRightAsidePanel(panelId)`                                              | 两者      | `boolean`                            |
| `send(payload)`                                                                 | `tr-chat` | `Promise<boolean>`，表示是否接受发送 |

`ready` 表示该元素实例首次准备完成。元素卸载时清理视图及 Renderer；外部传入的 Runtime 由创建它的应用释放。

## 能力边界

| 能力或字段                                                                                                      | 支持情况                    | 使用方式                                                           |
| --------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------ |
| 模型对话、流式输出、取消、会话历史、模型选项、MCP                                                               | 可用                        | 配置 Runtime；网络访问与认证由所接服务决定                         |
| 普通 Slot、Scoped Slot、Bubble 正文                                                                             | 可用                        | 使用具名节点、`renderers`、`bubbleRenderers`                       |
| `ui` 中的文本、布尔值、布局数值及普通数据字段                                                                   | 可用                        | 元素属性赋值                                                       |
| `ui.bubble.bubbleProvider`                                                                                      | 部分可用                    | 普通匹配与数据配置可用；正文使用 `bubbleRenderers`                 |
| `boxRendererMatches[].renderer`、`fallbackBoxRenderer`、`errorRenderer`、角色配置中的 Vue Renderer              | 不可用作 Angular/React 视图 | 这些字段接收 Vue Component；需要自定义正文时使用 `bubbleRenderers` |
| `ui.brand.logo`、`ui.welcome.icon`、提示词 `icon`、历史菜单 `icon`、Bubble `avatar` 的 Vue Component/VNode 分支 | 不可用作 Angular/React 视图 | 使用对应布局或消息 Renderer 输出宿主内容                           |
| 提示词 `badge`                                                                                                  | 部分可用                    | 字符串可用，VNode 不作为跨框架内容接口                             |
| 模型（包括 `data.model.options[].icon`）和自定义工具栏 `icon`                                                   | 部分可用                    | 字符串图标可用，Vue Component/VNode 分支不作为跨框架内容接口       |
| `ui.extensions.tabs[].items[].icon`                                                                             | 部分可用                    | 字符串可用，Vue Component 分支不作为跨框架内容接口                 |
| 扩展项 `actions[].icon`                                                                                         | 不可用作 Angular/React 视图 | 该字段接收 Vue Component；使用扩展区域 Renderer 定制操作内容       |
| 回调返回 Vue VNode、React JSX 或 Angular TemplateRef                                                            | 不可直接使用                | Renderer 返回 DOM；宿主视图挂载及销毁方式见框架示例                |
| `unknown`、`metadata`、自定义 attributes                                                                        | 由调用方保证兼容            | 普通数据或约定的业务值；不能据类型宽泛推定为任意框架组件可用       |

Web Component 在浏览器 DOM 中工作，样式参与当前页面的 CSS 层叠。应用可通过主题变量调整外观，参见 [主题配置](../guide/theme-config)。
