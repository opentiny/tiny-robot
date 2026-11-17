# Bubble 消息正文

本篇面向通过实验 Web Component `tr-chat`、`tr-chat-ui` 展示结构化消息的开发者。宿主可以使用原生 DOM、Angular 模板或 React JSX 渲染消息正文，并通过 Bubble 事件交付操作和状态。

## 1 为结构化消息显示业务卡片

一条消息可以同时包含产品卡片和文本：

```js
const messages = [
  {
    role: 'assistant',
    content: [
      { type: 'product-card', title: '智能助手' },
      { type: 'text', text: '支持知识问答与接入指导。' },
    ],
  },
]
```

Vue 组件通过 `ui.bubble.bubbleProvider.contentRendererMatches` 匹配内容，`renderer` 接收 Vue Component：

```vue
<TrChatUI
  :data="{ bubble: { messages } }"
  :ui="{
    bubble: {
      bubbleProvider: {
        contentRendererMatches: [
          {
            find: (_message, content) => content.type === 'product-card',
            renderer: ProductCard,
          },
        ],
      },
    },
  }"
/>
```

Web Component 使用 `bubbleRenderers` 配置宿主正文回调。回调返回 DOM 节点、节点数组、字面字符串或 `null`：

```js
const chat = document.createElement('tr-chat-ui')
chat.data = { bubble: { messages } }
chat.bubbleRenderers = {
  contentRendererMatches: [
    {
      find: (_message, content) => content.type === 'product-card',
      renderer: (context, { signal }) => {
        const button = document.createElement('button')
        button.textContent = context.content.title
        button.addEventListener(
          'click',
          () => {
            context.emit({ name: 'product-select', payload: { title: context.content.title } })
          },
          { signal },
        )
        return button
      },
    },
  ],
}
document.querySelector('#app').append(chat)
```

标签注册与 CSS 引入见[适配组件接入](adapter-component.md)。`tr-chat` 使用同一 `bubbleRenderers` 属性，消息由它的 Runtime 提供。

## 2 读取正文上下文与交付操作

| 回调上下文             | 含义                                              |
| ---------------------- | ------------------------------------------------- |
| `message`              | 当前消息，包含角色、内容、状态及业务扩展数据      |
| `content`              | 经过 `contentResolver` 解析和统一化后的当前内容项 |
| `contentIndex`         | 当前消息内的内容项索引，从 0 开始                 |
| `emit(event)`          | 交付 `{ name, payload? }` 形式的 Bubble 事件      |
| `setState(key, value)` | 交付对应的状态更新事件                            |

`content` 的字段由业务消息定义；宿主应根据匹配条件读取对应字段。扩展数据由调用方保证可供宿主使用。

```js
chat.addEventListener('bubble-event', (event) => {
  const [{ name, payload, messageIndex, contentIndex }] = event.detail
  console.log(name, payload, messageIndex, contentIndex)
})
chat.addEventListener('bubble-state-change', (event) => {
  const [{ key, value, messageIndex, contentIndex }] = event.detail
  // TrChatUI 的宿主将接受的状态写入 data.bubble.messages[messageIndex].state。
})
```

两类事件沿用原 Bubble 的索引映射，消息分组后仍标识传入消息列表中的原位置。`setState` 同时经过 `state:update` Bubble 事件通路；它交付更新请求，宿主按业务规则回写状态。

## 3 匹配与默认内容

`contentRendererMatches` 的每项沿用原 Bubble 的 `find`、`priority` 和 `attributes`。优先级数值越小越先匹配；相同优先级下，宿主正文匹配排在 `ui.bubble.bubbleProvider` 中已有匹配之前，内置匹配继续参与排序。加载、图片、工具消息等原有匹配规则继续生效。

`attributes` 与 provider 的 `contentAttributes` 保持原合并方式，交付到正文 DOM 出口。业务卡片仍由原 Bubble 管理外层气泡、消息分组和布局。

未匹配的内容继续使用原有回退渲染器；可以配置 `bubbleRenderers.fallbackContentRenderer` 接管 provider 层的正文回退。角色配置中的 `fallbackContentRenderer` 保留原有的更高优先级。没有配置宿主回退时，Chat 的默认 Markdown 继续可用。

撤销某项匹配、移除 `bubbleRenderers` 或将它设为 `undefined`，都会恢复相应的原有选择规则。`null` 表示当前正文为空，不表示继续尝试后面的匹配。

`ui.bubble.bubbleList.contentRenderMode` 继续支持 `single` 和 `split`：前者在同一气泡中展示内容项；后者在单条消息组成的分组中按内容项拆分气泡。两种模式都逐内容项调用正文回调。

## 4 更新、异常与清理

消息或正文数据更新后，旧调用结束，新调用获得当前上下文。Vue 响应式消息中的内容字段更新也会更新正文；普通宿主更新数据时，为元素重新赋值 `data`。替换配置时，为 `bubbleRenderers` 赋新对象。

每次正文调用接收独立的 `signal`。对应数据变化、回调替换、Runtime 替换、撤销配置或卸载时，调用被中止。宿主应解除监听、订阅并释放自己的视图；失效上下文的 `emit`、`setState` 不再交付操作。

正文回调同步抛出异常或返回无效结果时，适配层清理该出口并发出 `renderer-error`。`event.detail[0]` 的 `name` 为 `bubble-content` 或 `bubble-fallback-content`，`error` 为异常。替换为有效回调后，该正文恢复渲染。异步宿主视图内部的异常由相应宿主框架处理。

## 5 适配位置与三端示例

[ElementBubbleContent](../../../packages/chat/src/experimental/ElementBubbleContent.ts) 将 DOM 正文回调包装成内部 Vue 渲染组件，再合并到适配元素传给 Chat 的 `ui` 配置。它使用原 Bubble 的内容解析和事件接口；消息选择、气泡布局及索引映射沿用原组件。

三端页面地址为 `#/content/bubble-content`，产品正文、引用正文和未匹配正文分别配置：

- [原生 JS](../../../examples/web-component-js/src/demos/bubble-content.js)：直接创建正文 DOM，并使用 `signal` 清理监听。
- [Angular](../../../examples/web-component-angular/src/demos/bubble-content.html)：逐项声明正文模板，通过既有 `fromTemplate` 交付视图。
- [React](../../../examples/web-component-react/src/demos/bubble-content.tsx)：逐项声明正文 JSX，通过既有 `fromReact` 管理 root 和清理。

示例使用 TrChatUI 展示数据与状态回写。组件测试同时覆盖 TrChat、TrChatUI，三端页面使用同一候选包验收。气泡容器、头像和请求错误内容使用各自原有配置，本篇接口只接管消息正文。
