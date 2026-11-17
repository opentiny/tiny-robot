# 普通 Slot：宿主内容投影

普通 Slot 允许调用方在 Chat 的指定位置提供内容，例如在输入框上方显示一段自定义文字。本篇比较原 Vue 组件 TrChat、TrChatUI 的直接转换结果，以及实验入口提供的 `tr-chat`、`tr-chat-ui`，说明宿主内容如何进入指定区域。

## 1 Vue 组件：提供具名内容

Vue 用户通过 `#sender-header` 将内容放到输入框上方：

```vue
<TrChat :runtime="runtime">
  <template #sender-header>
    <div>输入框上方的自定义内容</div>
  </template>
</TrChat>
```

`#sender-header` 指定了具名插槽，Vue 将模板中的内容交给 TrChat。TrChatUI 使用相同的插槽名称，界面配置与数据通过它自己的 props 传入。

## 2 直接转换：具名内容分配已有，条件出口有缺口

浏览器具名 Slot 与 Vue Custom Element 已支持通过 `slot="名称"` 分配宿主内容。例如，宿主可以提供同一段 HTML：

```html
<tr-chat-direct>
  <div slot="sender-header">输入框上方的自定义内容</div>
</tr-chat-direct>
```

这里的 `tr-chat-direct` 表示将原 TrChat 交给 `defineCustomElement` 注册的元素，创建与 Runtime 赋值方式见[基础能力](basics.md#如何转换为-web-component)。

原 [TrChat](../../../packages/chat/src/Chat.vue) 和 [TrChatUI](../../../packages/chat/src/ChatUI.vue) 会检查同名 Vue 插槽（`slots[name]` 或 `$slots[name]`），再创建内容出口。宿主 DOM 子节点没有成为这些 Vue 插槽函数，条件不成立，内容就没有进入对应区域。TrChatUI 的直接转换也有相同缺口。

由上述出口条件可知，直接转换时四个普通 Slot 均不能收到宿主内容。适配元素已在以下三种宿主中通过普通 DOM 渲染验证：

| 宿主环境   | 原 Vue 组件直接转换：TrChat  | 原 Vue 组件直接转换：TrChatUI | 实验适配元素：tr-chat / tr-chat-ui  |
| ---------- | ---------------------------- | ----------------------------- | ----------------------------------- |
| 原生 JS    | 不可用：四个区域均未收到内容 | 不可用：四个区域均未收到内容  | 可用：按下节条件显示四个入口        |
| Angular 20 | 不可用：四个区域均未收到内容 | 不可用：四个区域均未收到内容  | 可用：保留模板绑定、事件与子视图    |
| React 19   | 不可用：四个区域均未收到内容 | 不可用：四个区域均未收到内容  | 可用：保留 JSX 子内容、事件与子视图 |

## 3 适配元素：用 HTML 指定内容位置

按[适配组件接入步骤](adapter-component.md#4-使用适配元素)注册元素、准备兼容 Runtime 后，`tr-chat` 使用以下内容：

```html
<tr-chat>
  <div slot="sender-header">输入框上方的自定义内容</div>
</tr-chat>
```

Vue 使用 `#sender-header` 提供插槽，宿主 HTML 使用 `slot="sender-header"` 指定内容位置。实验适配层保留宿主节点，并将它们投影到内部 TrChat 的同名出口。

`tr-chat-ui` 接收界面数据，使用同样的普通 Slot：

```html
<tr-chat-ui>
  <div slot="sender-header">输入框上方的自定义内容</div>
</tr-chat-ui>
```

两个适配元素的普通 Slot 范围一致：

| Slot 名称        | 可用性 | 显示位置与条件                                             |
| ---------------- | ------ | ---------------------------------------------------------- |
| `welcome-footer` | 可用   | 欢迎内容底部；处于空状态且启用了欢迎内容                   |
| `prompts-footer` | 可用   | 提示词列表底部；处于空状态且有可显示的提示词               |
| `sender-header`  | 可用   | 输入区顶部；启用了默认输入区                               |
| `input-prefix`   | 可用   | 编辑器文字前方；启用了默认输入区，且输入区当前处于多行模式 |

这些条件沿用原 Vue 组件。宿主提供的内容会随相应区域显示或隐藏；未提供某个名称时，适配组件保留该区域的默认布局。

## 4 适配实现：连接宿主容器与内部出口

[elementSlots.ts](../../../packages/chat/src/experimental/elementSlots.ts) 保存宿主提供的节点，并观察具名节点的增删。`withOrdinaryElementSlots` 是内部构造器包装函数；[register.ts](../../../packages/chat/src/experimental/register.ts) 用它扩展基础构造器：

```ts
// packages/chat/src/experimental/register.ts
export const TrChatElement = withOrdinaryElementSlots(
  defineCustomElement(TrChatElementComponent, { shadowRoot: false }),
) as unknown as TrChatElementConstructor<TrChatHTMLElement>
```

连接处理延到微任务，使 Angular 等宿主先完成模板子节点和属性绑定。适配层在 Vue 挂载前保存宿主节点与条件视图锚点，挂载后保留锚点的原位置，以便宿主继续创建与删除视图。

`useOrdinaryElementSlots()` 返回当前实际提供的普通 Slot 名称，适配组件按名称向内部组件提供 Vue 插槽：

```vue
<!-- packages/chat/src/experimental/TrChatElement.ce.vue -->
<template v-for="name in ordinarySlots" :key="name" #[name]><ElementSlot :name="name" /></template>
```

外层 `#[name]` 使内部 TrChat 的条件出口成立；`ElementSlot` 将宿主原节点放入对应区域。[TrChatUIElement.ce.vue](../../../packages/chat/src/experimental/TrChatUIElement.ce.vue) 做相同转发。新增具名节点时创建出口，最后一个同名节点移除时撤销出口，使输入区恢复默认布局。

原组件继续决定区域是否显示。区域隐藏期间，适配层暂存宿主节点；再次显示时投影同一节点，保留文字绑定与事件。对于已经投影的节点，适配层将宿主的插入、删除操作定位到其原位置，使 React 等宿主仍能管理自己的顶层子内容。

## 5 宿主更新内容与管理子视图

宿主可以更新已有节点，也可以动态新增、移除具名节点。要同时收起 Slot 内容及其布局，将条件放在带有 `slot` 属性的节点外层。保留空的具名节点仍表示提供了该 Slot。

### 原生 JS：更新已有容器

保存节点引用，通过 `append` 和 `remove` 控制是否提供 Slot；元素卸载时移除宿主监听：

```js
const chat = document.createElement('tr-chat')
chat.runtime = runtime
const content = document.createElement('div')
content.slot = 'sender-header'
const button = document.createElement('button')
button.textContent = '查看提示'
const listeners = new AbortController()
button.addEventListener('click', () => console.log('宿主点击'), { signal: listeners.signal })
content.append(button)
chat.append(content)
document.querySelector('#app').append(chat)

button.textContent = '更新后的提示'
content.remove() // 撤销 Slot，收起输入区顶部布局
chat.append(content) // 重新提供 Slot
// 宿主视图销毁时：
listeners.abort()
chat.remove()
```

### Angular：模板绑定与条件子视图

宿主组件使用 `CUSTOM_ELEMENTS_SCHEMA` 允许自定义元素标签；这是 Angular 的接入配置。模板中使用属性绑定传入 Runtime，并用外层条件控制是否提供 Slot：

```html
<tr-chat [runtime]="runtime">
  @if (showContent) {
  <div slot="sender-header">
    <span>{{ text }}</span>
    <button (click)="onClick()">查看提示</button>
  </div>
  }
</tr-chat>
```

`runtime`、`text`、`showContent` 和 `onClick()` 属于宿主组件。三端示例中的 [Angular 普通 Slot 页](../../../examples/web-component-angular/src/demos/ordinary-slots.ts)使用模板属性、事件绑定和 `@if`，由 Angular 创建、更新与销毁内容。

### React：JSX 子内容与 DOM ref

React 示例使用 DOM ref，在 layout effect 中赋值 `runtime` 等元素属性；JSX 声明宿主内容与事件：

```jsx
<tr-chat ref={chatRef}>
  {showContent && (
    <div slot="sender-header">
      <span>{text}</span>
      <button onClick={onClick}>查看提示</button>
    </div>
  )}
</tr-chat>
```

`chatRef`、`text`、`showContent` 和 `onClick` 属于宿主组件。已验证 React 19；运行方式及 StrictMode 验收见 [React 示例](../../../examples/web-component-react/README.md)。

### 更新与卸载边界

- 已验证具名节点的动态增删、文字绑定、宿主点击事件，以及空状态切换期间更新内容后重新显示。移除 `sender-header` 和 `input-prefix` 时，对应布局同步收起。
- 已验证卸载元素后内部界面清空、宿主视图清理、重新创建元素后继续交互；组件回归还覆盖首次 Runtime 延后接入和同元素断开再连接。
- 验收环境为普通 DOM 渲染与 Chromium。Shadow DOM、其他浏览器及其他宿主版本待验证。

这里的四个入口只接收宿主内容。`sender-footer`、`sender-footer-right` 等带上下文的入口属于后续 Scoped Slot 适配范围，当前实验入口仅支持上表四个普通入口。

## 6 运行与复查

三个示例都提供 `#/content/ordinary-slots`，共用现有导航。页面使用包装好的 `tr-chat`、`tr-chat-ui`，分别在四个位置展示欢迎说明、换题按钮、咨询主题和助手标识。可修改咨询主题、切换提示词，通过“显示 Slot 内容”控制内容显隐，并操作空状态和卸载重挂。启动方式见 [examples 总览](../../../examples/README.md)。

统一验收直接操作这些页面：

```sh
pnpm test:wc --grep '普通 Slot'
```

[普通 Slot E2E](../../../packages/test/web-component/common/ordinary-slots.spec.ts)记录四个区域的分配计数及页面截图，并验证三端宿主交互与清理。[组件回归](../../../packages/test/component/chat/ElementOrdinarySlots.spec.ts)保护未提供 Slot 的默认布局、部分名称、动态增删、延后 Runtime 和同元素重连。
