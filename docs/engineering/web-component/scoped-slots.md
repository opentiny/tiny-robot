# Scoped Slot：把上下文交给宿主视图

定制聊天页头时，宿主既要显示当前会话标题，也要提供新建会话操作。组件调用插槽时交付的这组数据与操作称为上下文；接收上下文的插槽称为 Scoped Slot。

本篇说明实验 Web Component `tr-chat`、`tr-chat-ui` 如何把上下文交给原生 JS、Angular 和 React。基础接入见[适配组件](adapter-component.md)，宿主具名节点的投影见[普通 Slot](ordinary-slots.md)。

## 1 Vue 组件：通过插槽参数取得上下文

```vue
<TrChat :runtime="runtime">
  <template #layout-header="{ title, createConversation }">
    <header>
      <strong>{{ title }}</strong>
      <button @click="createConversation()">新建会话</button>
    </header>
  </template>
</TrChat>
```

`layout-header` 提供标题与操作。TrChat 将操作连接到 Runtime；TrChatUI 的同名操作发出事件，由宿主更新界面数据。

## 2 Web Component：用回调生成相同内容

普通 Slot 负责投影宿主已有的节点。需要组件上下文时，通过元素的 `renderers` 属性提供回调：回调接收上下文、返回 DOM 内容，称为 DOM Renderer。

对已配置 Runtime 的 `tr-chat`：

```js
const chat = document.querySelector('tr-chat')
chat.renderers = {
  'layout-header': ({ title, createConversation }, { signal }) => {
    const header = document.createElement('header')
    const heading = document.createElement('strong')
    heading.textContent = title
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = '新建会话'
    button.addEventListener('click', () => createConversation(), { signal })
    header.append(heading, button)
    return header
  },
}
```

这段代码与 Vue 示例读取相同标题、调用相同操作。`tr-chat` 的新建会话操作清除当前活跃会话，返回空白输入区并保留历史列表；`tr-chat-ui` 发出 `create-conversation` DOM 事件。使用 TrChatUI 时，宿主监听该事件并更新 `data`。

`signal` 是本次调用的 `AbortSignal`。上下文改变、替换回调、卸载或渲染异常时，适配层中止它；示例中的按钮监听随之解除。给 `element.renderers` 赋新对象即可替换或删除配置，撤销配置后恢复组件默认内容。

## 3 返回值与清理

类型从实验入口导入：

```ts
import type { ChatRenderer, ChatRenderers } from '@opentiny/tiny-robot-chat/experimental'
```

[类型定义](../../../packages/chat/src/experimental/elementRenderers.ts)将每个名称与它的上下文关联：

```ts
// packages/chat/src/experimental/elementRenderers.ts
export interface ChatRendererLifecycle {
  readonly signal: AbortSignal
}
export type ChatRendererResult = Node | readonly Node[] | string | null
export type ChatRenderer<TContext> = (context: TContext, lifecycle: ChatRendererLifecycle) => ChatRendererResult
```

返回节点、节点数组、文字或 `null`；字符串作为文字显示。每次调用拥有自己的有效期，宿主在 `signal` 中止时释放监听、订阅与框架视图。失效上下文中的操作停止执行；异步聚焦若在完成前失效，返回 `false`。

通用布局与消息 Renderer 在上下文内容改变后重新生成内容。仅重新创建了内容相同的上下文对象时，保持现有宿主视图。输入视图与欢迎区还需要保持草稿和焦点，采用下一节的专门契约。

同步渲染异常会中止本次调用、清空其出口，并通过 `renderer-error` 事件交付：

```js
chat.addEventListener('renderer-error', (event) => {
  const [{ name, error }] = event.detail
  console.error(`无法渲染 ${name}`, error)
})
```

修正并替换对应回调后可继续使用。其他内容区域与原有输入、事件和方法继续工作。

## 4 输入区：操作原生输入与替换输入视图

### 在宿主按钮中编辑原生输入

`sender-actions-inline` 在单行和多行布局提供输入状态与安全操作；`sender-footer`、`sender-footer-right` 用于实际多行布局的底部区域。例如：

```js
chat.renderers = {
  'sender-footer': (scope, { signal }) => {
    const button = document.createElement('button')
    button.textContent = '插入追问'
    button.disabled = scope.disabled || scope.loading
    button.addEventListener('click', () => scope.insert('请详细说明'), { signal })
    return button
  },
}
```

上下文包含 `disabled`、`loading`、`hasContent`，以及 `focus()`、`blur()`、`insert(text)`、`append(text)`、`replace(text)`。编辑命令按字面文本处理字符串；`focus()` 返回 `Promise<boolean>`。编辑和聚焦遵循输入禁用状态与调用有效期。

### 由宿主管理输入控件

`sender-content` 提供草稿状态、`setInputValue` 和 `subscribe`：

```js
chat.renderers = {
  'sender-content': (scope, { signal }) => {
    const input = document.createElement('textarea')
    const unsubscribe = scope.subscribe(({ value, disabled }) => {
      if (input.value !== value) input.value = value
      input.disabled = disabled
    })
    input.addEventListener('input', () => scope.setInputValue(input.value), { signal })
    signal.addEventListener('abort', unsubscribe, { once: true })
    return input
  },
}
```

`subscribe` 立即交付当前草稿、禁用和加载状态，随后在状态变化时通知宿主。普通草稿更新保持当前输入节点与焦点；替换回调、替换 Runtime 或卸载时结束旧调用。撤销配置后，原生输入框继续显示已接受的草稿。元素的 `focusInput()` 会聚焦当前宿主输入控件。适配元素将 Sender 的 `valueFormat` 默认设为 `text`，使草稿按字面文本初始化和同步。

### 在欢迎区组合原生输入

`layout-empty-state` 的 `renderComposer()` 返回原生输入区的 DOM 容器。在回调内同步调用，并把容器包含在返回结果中：

```js
chat.renderers = {
  'layout-empty-state': (scope) => {
    const section = document.createElement('section')
    const title = document.createElement('h2')
    title.textContent = '开始你的产品咨询'
    section.append(title)
    const composer = scope.renderComposer()
    if (composer) section.append(composer)
    return section
  },
}
```

同一次调用返回同一容器；输入区关闭时返回 `null`。回调结束后或本次调用失效后，再调用它也返回 `null`。普通输入和无关配置更新保持原生输入器；替换外层 Renderer 等需要重建的变化保留草稿，光标与 IME 状态可能随重建改变。

## 5 适配实现与宿主职责

实验适配组件根据 `renderers` 中的名称向原 TrChat、TrChatUI 提供 Vue 插槽函数。原组件继续决定内容位置、显示条件和业务操作，适配层接收插槽上下文并挂载宿主返回的 DOM。

- [ElementRenderer.ts](../../../packages/chat/src/experimental/ElementRenderer.ts)：通用上下文、DOM 返回值、有效期与错误事件。
- [ElementSenderActions.ts](../../../packages/chat/src/experimental/ElementSenderActions.ts)：Sender 状态、安全文本命令与聚焦。
- [ElementSenderContent.ts](../../../packages/chat/src/experimental/ElementSenderContent.ts)：宿主输入订阅与焦点。
- [ElementEmptyStateRenderer.ts](../../../packages/chat/src/experimental/ElementEmptyStateRenderer.ts)：将原生输入区挂载到宿主提供的容器。

这些能力位于 Web Component 适配层，原 Vue 组件继续使用自己的 Slot 接口。宿主负责其视图、事件与资源；完整名称、显示条件和优先级见[Slot 契约](slot-contracts.md)。

### Angular 模板

[Angular Demo](../../../examples/web-component-angular/src/demos/scoped-slots.html)用 `<ng-template let-scope>` 读取上下文，`[renderers]` 将对应回调交给元素。[fromTemplate](../../../examples/web-component-angular/src/shared/template-renderer.ts)创建 Angular 视图、接入变更检测并在 `signal` 中止时销毁。输入视图通过订阅更新模板。具体步骤见 [Angular 模板桥接](../../../examples/web-component-angular/docs/scoped-slots.md)。

### React JSX

[React Demo](../../../examples/web-component-react/src/demos/scoped-slots.tsx)在回调中直接写各位置的 JSX。[fromReact](../../../examples/web-component-react/src/shared/react-renderer.tsx)创建 React root、返回由 React 管理的 DOM 容器，并在中止时卸载。

欢迎区在回调内同步取得 `renderComposer()` 的容器，React 提交视图后将它放到对应位置；适配层观察容器插入并挂载原生输入区。宿主输入状态通知更新同一个 React root，保留输入节点。属性通过 DOM ref / layout effect 赋值，开发模式覆盖 StrictMode。

## 6 运行与验证

三个项目都提供 `#/content/scoped-slots`。页面分别展示页头标题与新建会话、消息角色与索引、Sender 追问按钮、宿主输入框，以及包含原生输入区的欢迎内容；可以切换 TrChat / TrChatUI、撤销自定义内容并卸载重挂。

在仓库根目录运行：

```sh
pnpm dev:wc-examples
pnpm test:wc --grep 'Scoped Slot'
pnpm test:wc --project=react --dev --grep 'Scoped Slot'
```

组件回归保护上下文更新、视图清理、字面文本、禁用与失效操作、输入焦点、普通内容优先级和同元素重连；三端浏览器验收直接操作 Demo。环境为普通 DOM 与 Chromium，宿主版本及候选包来源见 [examples 总览](../../../examples/README.md)。
