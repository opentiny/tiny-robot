# 内容定制

Web Component 提供三种内容入口：普通 Slot 放入宿主已有的节点；`renderers` 根据聊天上下文生成内容；`bubbleRenderers` 根据消息内容生成正文。两种元素使用相同的定制接口。

## 普通 Slot

使用 `slot` 指定区域，节点中的文本、属性、事件和条件显示由宿主应用管理。

```html
<tr-chat>
  <p slot="welcome-footer">可以向助手咨询产品接入问题。</p>
  <button slot="prompts-footer" type="button">查看使用手册</button>
  <span slot="input-prefix">产品咨询</span>
  <small slot="sender-footer">发送前请检查内容。</small>
</tr-chat>
```

| Slot                  | 位置               |
| --------------------- | ------------------ |
| `welcome-footer`      | 欢迎区底部         |
| `prompts-footer`      | 提示词列表底部     |
| `sender-header`       | 输入区顶部         |
| `input-prefix`        | 输入内容前方       |
| `sender-footer`       | 多行输入区底部     |
| `sender-footer-right` | 多行输入区底部右侧 |

需要撤销 Slot 时，移除带 `slot` 的整个节点。Angular 把 `@if` 放在该节点外层；React 条件渲染整个节点。保留空的 Slot 节点仍表示提供了该 Slot。

```html
@if (showPrefix) {
<span slot="input-prefix">产品咨询</span>
}
```

上例为 Angular 模板；React 对应用法为 `{showPrefix && <span slot="input-prefix">产品咨询</span>}`。同一区域同时提供普通 Slot 和 Renderer 时，Renderer 优先。

## Scoped Slot：`renderers`

需要当前会话标题、消息或聊天操作时，给 `renderers` 配置回调。回调接收上下文与 `AbortSignal`，同步返回 DOM 节点、节点数组、文字或 `null`。

```ts
chat.renderers = {
  'layout-header': ({ title, createConversation }, { signal }) => {
    const header = document.createElement('header')
    const heading = document.createElement('strong')
    heading.textContent = title
    const button = document.createElement('button')
    button.textContent = '新建会话'
    button.addEventListener('click', createConversation, { signal })
    header.append(heading, button)
    return header
  },
}
```

| Renderer                                                                                                                                                       | 上下文用途                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `layout-header`                                                                                                                                                | 标题、会话状态、新建会话及侧栏操作 |
| `layout-left-aside`、`layout-left-aside-brand`、`layout-left-aside-actions`、`layout-left-aside-content`、`layout-left-aside-footer`、`layout-left-aside-rail` | 左侧栏内容与会话操作               |
| `layout-left-aside-history-item-prefix`                                                                                                                        | 当前历史会话项                     |
| `layout-right-aside`、`layout-right-aside-title`、`layout-right-aside-panel`                                                                                   | 右侧面板及切换操作                 |
| `layout-main`                                                                                                                                                  | 消息、请求与会话状态               |
| `layout-empty-state`                                                                                                                                           | 空状态及输入区容器                 |
| `layout-footer`、`composer-before`、`composer-after`                                                                                                           | 草稿、发送、取消及清空操作         |
| `sender-content`                                                                                                                                               | 自定义输入控件，草稿状态与订阅     |
| `sender-actions-inline`、`sender-footer`、`sender-footer-right`                                                                                                | 原生输入框状态与安全编辑操作       |
| `bubble-prefix`、`bubble-suffix`、`bubble-after`、`bubble-content-footer`                                                                                      | 消息及其原始索引                   |
| `extension-header-actions`、`extension-overlay`                                                                                                                | 当前扩展页签                       |

所有名称与上下文类型由 `ChatRenderers` 定义。`tr-chat` 的会话操作连接 Runtime；`tr-chat-ui` 的操作发出事件，由宿主处理。

上下文改变、回调替换或视图销毁时，当前调用的 `signal` 会中止。用它释放事件监听、订阅和宿主框架视图。字符串返回值按文字显示；DOM 内容由调用方安全构建。Renderer 同步抛错时，通过 `renderer-error` 交付错误；替换对应回调后可继续使用。

通用 Renderer 在上下文更新时会重新生成内容，不保证保留自定义控件的焦点和局部状态。持久业务状态应由宿主管理。

### 自定义输入控件

`sender-content` 的 `subscribe()` 用于在同一个输入视图中同步草稿、禁用和加载状态。

```ts
chat.renderers = {
  'sender-content': (scope, { signal }) => {
    const input = document.createElement('textarea')
    const sync = (state: typeof scope) => {
      if (input.value !== state.value) input.value = state.value
      input.disabled = state.disabled || state.loading
    }
    sync(scope)
    input.addEventListener('input', () => scope.setInputValue(input.value), { signal })
    const unsubscribe = scope.subscribe((state) => {
      if (input.value !== state.value) input.value = state.value
      input.disabled = state.disabled || state.loading
    })
    signal.addEventListener('abort', unsubscribe, { once: true })
    return input
  },
}
```

自定义输入控件负责把用户输入交给 `setInputValue()`；发送操作读取已接受的草稿。普通输入区扩展可通过 `sender-actions-inline` 等上下文的 `focus()`、`blur()`、`insert()`、`append()`、`replace()` 操作原生输入框。

`layout-empty-state` 需要保留原生输入区时，在回调中同步调用 `scope.renderComposer()`，把返回的容器放入结果；一个结果只放入一次。

## Bubble 消息正文

通过 `bubbleRenderers.contentRendererMatches` 按消息或内容匹配正文。未覆盖的正文沿用默认 Markdown 等渲染。

```ts
import type { ChatBubbleRenderers } from '@opentiny/tiny-robot-chat/experimental'

const bubbleRenderers: ChatBubbleRenderers = {
  contentRendererMatches: [
    {
      priority: 100,
      find: (_message, content) => content.type === 'product-card',
      renderer: ({ message, content, emit, setState }, { signal }) => {
        const card = document.createElement('article')
        const title = document.createElement('h3')
        title.textContent = String(content.title ?? '')
        const button = document.createElement('button')
        button.textContent = message.state?.selected ? '已选择' : '选择产品'
        button.disabled = message.state?.selected === true
        button.addEventListener(
          'click',
          () => {
            emit({ name: 'product-select', payload: { id: content.id } })
            setState('selected', true)
          },
          { signal },
        )
        card.append(title, button)
        return card
      },
    },
  ],
}
chat.bubbleRenderers = bubbleRenderers
```

消息内容使用对应业务类型，例如：

```ts
const messages = [
  {
    role: 'assistant',
    content: [
      { type: 'product-card', id: 'starter', title: '入门方案' },
      { type: 'text', text: '也可以继续询问方案细节。' },
    ],
  },
]
```

上面的 `messages` 可赋给 `tr-chat-ui` 的 `data.bubble.messages`；使用 `tr-chat` 时，由模型服务或业务消息处理产生相同内容。

| 配置或上下文              | 用途                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| `contentRendererMatches`  | `find`、`priority`、`attributes` 与正文 Renderer；优先级数值越大越优先                      |
| `fallbackContentRenderer` | 自定义未匹配内容的兜底正文                                                                  |
| `message` / `content`     | 原消息与当前解析后的内容项                                                                  |
| `contentIndex`            | 当前内容项索引                                                                              |
| `emit({ name, payload })` | 发出 `bubble-event`                                                                         |
| `setState(key, value)`    | 发出名称为 `state:update` 的 `bubble-event`，以及 `bubble-state-change`；由应用更新消息状态 |

两种元素都通过事件通知状态变化。应用处理 `bubble-state-change` 并写回消息后，Renderer 才能读到新的状态。以下以已有的 `tr-chat-ui` 元素为例，绑定上面的 `messages`，并将选择结果写入对应消息的 `state`：

```ts
import type { TrChatUIHTMLElement } from '@opentiny/tiny-robot-chat/experimental'

const chatUI = document.querySelector('tr-chat-ui') as TrChatUIHTMLElement
chatUI.bubbleRenderers = bubbleRenderers
chatUI.data = { bubble: { messages } }
chatUI.addEventListener('bubble-state-change', (event) => {
  const [{ messageIndex, key, value }] = event.detail
  const current = chatUI.data?.bubble?.messages ?? []
  chatUI.data = {
    ...chatUI.data,
    bubble: {
      messages: current.map((message, index) =>
        index === messageIndex ? { ...message, state: { ...message.state, [key]: value } } : message,
      ),
    },
  }
})
```

使用 `tr-chat` 时，由应用把变化写回自己的消息存储或 Runtime 实现；元素不会自动修改或保存 Runtime 中的消息。调用 `setState()` 时，这两个事件表示同一次状态变化，选择其中一种处理即可。

事件中的 `messageIndex` 指向原消息，`contentIndex` 对应解析后的内容项；启用内容拆分后仍可据此定位业务数据。正文或配置更新会结束旧 Renderer 调用，使用 `signal` 清理宿主视图。删除 `bubbleRenderers` 配置恢复默认正文。

## Angular 和 React 自定义视图

普通 Slot 可直接写 Angular 模板或 React JSX。Scoped Slot 和 Bubble 正文的回调返回 DOM 容器：Angular 在容器内创建嵌入视图，React 在容器内挂载 React root，并在 `signal` 中止时销毁。

完整可运行的宿主视图示例分别位于仓库的 `examples/web-component-angular/src/demos/` 和 `examples/web-component-react/src/demos/`，其中 `ordinary-slots`、`scoped-slots`、`bubble-content` 展示各自用法。模型应用接入步骤见 [Angular](./angular) 和 [React](./react)。
