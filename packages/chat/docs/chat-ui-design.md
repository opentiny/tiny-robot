# TrChatUI 设计与实现方案

## 1. 文档状态

- 状态：待评审，评审通过后作为 `TrChatUI` 实现阶段的设计依据。
- 范围：只定义 `TrChatUI` 的定位、公共契约、默认行为、内部结构和验证标准。
- 非范围：暂不修改 `ChatRuntime`、整体架构文档和迁移文档。
- 兼容策略：项目仍在开发阶段，不保留当前 ChatUI API 的兼容层。
- 实施进度：见 [chat-ui-todo.md](./chat-ui-todo.md)。

## 2. 一页结论

`TrChatUI` 是一个带完整默认值的聊天页面 UI Shell。调用方不传任何 Props 时，它必须能够渲染基础聊天页面；调用方传入普通展示状态时，它必须能够接入任意数据层；调用方传入 `ui` 时，可以覆盖、关闭或增强默认 UI 能力。

```txt
<TrChatUI />
  -> 默认空状态
  -> 默认 UI 配置
  -> 可输入的 Composer
  -> Welcome 空态
  -> 响应式 Chat 页面

自定义数据层
  -> ChatViewState
  -> TrChatUI
  -> typed emits
  -> 自定义数据层 actions
```

最终边界：

```txt
state               = 当前展示什么
ui                  = 具体怎么展示
composerValue       = 唯一的双向输入状态
emits               = 所有用户意图
slots               = 区域级渲染替换
TrChatUI 内部状态   = 布局、草稿、滚动等短生命周期 UI 状态
```

## 3. 组件定位

### 3.1 TrChatUI 负责

- 组合 `TrLayout`、History、Welcome、Prompts、BubbleList、Sender 等原子组件。
- 提供一套能够直接渲染基础页面的默认展示状态和默认 UI 配置。
- 将普通展示快照转换为原子组件 Props。
- 通过 Emits 表达用户意图。
- 管理输入草稿、侧栏开关、移动端抽屉、滚动目标等短生命周期 UI 状态。
- 保持桌面端和移动端交互一致性。
- 提供 typed slots 供调用方替换或扩展区域。

### 3.2 TrChatUI 不负责

- 请求、流式协议、取消实现和错误恢复策略。
- 会话、消息和配置的持久化。
- Runtime、Provider、Transport、Storage 或 Kit engine。
- RunConfig 的合成和请求参数解释。
- 直接执行 Model/MCP 数据控制器方法。
- 将业务 actions 放入 `ui` 配置。
- 伪造默认会话、消息、模型或 MCP 数据。

### 3.3 无数据层渲染的含义

无数据层不等于默认提供模拟业务数据。零 Props 渲染时：

- 会话列表为空。
- 当前会话 ID 为 `null`。
- 标题为“新对话”。
- 消息列表为空并展示 Welcome。
- Composer 可输入并维护本地草稿。
- Model/MCP 控件不渲染。
- 会话、提交等操作可以正常发出事件，但不会凭空产生业务数据。

## 4. 保留现有实现的范围

本次不推倒重写已有视图和交互。以下实现作为行为基线保留：

- `ChatUI.vue` 的页面布局、CSS 和区域组合。
- `ChatAside.vue` 的桌面 dock、收起栏、移动端 drawer 和 History item identity。
- `ChatHeader.vue` 的标题、会话入口。
- `ChatMessages.vue` 的空态、Bubble 渲染、自动滚动和消息 slots。
- `ChatComposer.vue` 的 Sender 组合和控制区布局。
- `ScrollToBottom.vue` 的滚动提示和交互。

主要重构对象：

- Props、Emits 和 Slots 公共契约。
- 默认状态和默认配置解析。
- Composer 受控/非受控模型。
- Model/MCP 的 View + Emits 模型。
- `ui.onXxx` 双事件体系。
- 类型命名和文件组织。
- Demo 和验证场景。

## 5. 命名规范

`ChatUI` 前缀只保留在根组件契约上，避免每个子类型都重复 `ChatUI`。

| 类别 | 命名规则 | 示例 |
| --- | --- | --- |
| 根组件契约 | `ChatUIXxx` | `ChatUIProps`、`ChatUIOptions`、`ChatUIEmits`、`ChatUISlots` |
| 展示快照 | `ChatXxxView` | `ChatViewState`、`ChatConversationView`、`ChatModelView` |
| 展示配置 | `ChatXxxOptions` | `ChatLayoutOptions`、`ChatHistoryOptions` |
| 事件数据 | `ChatXxxEvent` / `ChatXxxPayload` | `ChatPromptClickEvent`、`ChatSubmitPayload` |
| 内部解析类型 | `ResolvedXxx`，不导出 | `ResolvedChatViewState` |

不使用 `State`、`Options` 等无包语义的根导出，也不使用 TypeScript namespace 组织 Vue SFC 类型。

## 6. 公共 Props

```ts
export interface ChatUIProps {
  state?: ChatViewState
  ui?: ChatUIOptions
  composerValue?: string
  defaultComposerValue?: string
}
```

### 6.1 Props 职责

| Prop | 职责 | 默认值 |
| --- | --- | --- |
| `state` | 普通展示快照 | `{}`，由内部解析成完整空状态 |
| `ui` | 默认 UI 的可选覆盖和增强 | `{}`，使用完整默认 UI |
| `composerValue` | Composer 受控值 | `undefined`，表示非受控模式 |
| `defaultComposerValue` | 非受控 Composer 初始值 | `''` |

### 6.2 不采用的方案

- 不将所有数据展开成十几个顶层 Props。
- 不把 `composerValue` 放回 `state`，避免快照和双向状态混用。
- 不允许 `ui` 覆盖 conversations、messages、loading 等展示真相。
- 不在 Props 中传入 Runtime 或 controller 对象。

## 7. 展示状态

```ts
export interface ChatViewState {
  conversation?: ChatConversationView
  messages?: readonly ChatMessageItem[]
  composer?: ChatComposerView
  model?: ChatModelView
  mcp?: ChatMcpView
}

export interface ChatConversationView {
  items?: readonly ChatConversationInfo[]
  activeId?: string | null
  title?: string
}

export interface ChatComposerView {
  loading?: boolean
  disabled?: boolean
  submitDisabled?: boolean
}

export interface ChatModelView {
  options?: readonly ChatModelOptionView[]
  selectedId?: string | null
  features?: Readonly<Record<string, boolean>>
  selecting?: boolean
  pendingFeatureIds?: readonly string[]
}

export interface ChatModelOptionView {
  id: string
  label: string
  capabilities?: Readonly<Record<string, boolean | undefined>>
  metadata?: Readonly<Record<string, unknown>>
}

export interface ChatMcpView {
  servers?: readonly ChatMcpServerView[]
  tools?: ChatMcpToolMap
}

export interface ChatMcpServerView {
  id: string
  name: string
  description?: string
  installed: boolean
  enabled: boolean
  loading?: boolean
  metadata?: Readonly<Record<string, unknown>>
}

export interface ChatMcpToolView {
  id: string
  name: string
  description?: string
  enabled: boolean
  loading?: boolean
}

export type ChatMcpToolMap = Readonly<Partial<Record<string, readonly ChatMcpToolView[]>>>
```

约束：

- View 类型只包含普通数据，不包含 `ChatReadable`、Vue Ref、Runtime 类型和操作方法。
- Model/MCP 未提供时不渲染对应控件。
- Pending 状态来自 View；UI 不通过调用 Promise action 猜测业务操作何时完成。
- Runtime adapter 可以维护短生命周期 pending 镜像，并把它映射为 `model.selecting`、`model.pendingFeatureIds`、MCP server/tool `loading`；该 pending 镜像属于 adapter 边界，不暴露为 UI controller。
- Runtime adapter 负责捕获并记录 Model/MCP 异步 action 的失败，避免 fire-and-forget 转发产生 unhandled rejection；pending 镜像必须通过 adapter helper 的 `finally` 清理。
- MCP 工具加载意图由 View 反映 `installed + enabled` 且 tools 缺失后触发，避免 UI 在 add/toggle action 完成前抢跑 `loadTools`。
- `metadata` 仅用于透传 UI 扩展信息，不作为内部业务协议。

## 8. UI 配置

```ts
export interface ChatUIOptions {
  layout?: ChatLayoutOptions
  brand?: ChatBrandOptions
  labels?: Partial<ChatLabels>

  header?: false
  leftAside?: false | ChatAsideOptions
  rightAside?: false | ChatAsideOptions
  history?: false | ChatHistoryOptions
  messages?: ChatMessagesOptions
  welcome?: false | ChatWelcomeOptions
  prompts?: false | ChatPromptsOptions
  composer?: false | ChatComposerOptions
}
```

### 8.1 区域配置

```ts
export type ChatCssSize = string | number

export interface ChatLayoutOptions {
  contentMaxWidth?: ChatCssSize
  panelPadding?: ChatCssSize
  panelGap?: ChatCssSize
}

export interface ChatAsideOptions {
  mode?: 'dock' | 'drawer'
  width?: number
  collapsedWidth?: number
  defaultOpen?: boolean
}

export interface ChatMessagesOptions {
  autoScroll?: boolean
  bubbleProvider?: ChatBubbleProviderOptions
  bubbleList?: ChatBubbleListOptions
}

export interface ChatComposerOptions {
  sender?: ChatSenderOptions
  clearOnSubmit?: boolean
}
```

Aside width 只接受 number，因为底层 `TrLayout` 的 aside width 是布局数值。CSS size 只用于最终进入 CSS 变量的配置。

### 8.2 Brand 和 Labels

```ts
export interface ChatBrandOptions {
  name?: string
  logo?: unknown
}

export interface ChatLabels {
  newConversationTitle: string
  createConversation: string
  renameConversation: string
  deleteConversation: string
  expandConversationList: string
  collapseConversationList: string
  composerPlaceholder: string
  composerLoadingPlaceholder: string
  selectModel: string
  mcp: string
  thinkingFeature: string
  searchFeature: string
  welcomeTitle: string
  welcomeDescription: string
}
```

所有默认可见文案和 `aria-label` 从 Labels 获取。组件内部不再散落硬编码品牌和中文文案。

### 8.3 配置合并规则

不使用通用递归 deep merge。所有区域由显式 resolver 解析。

| 输入 | 语义 |
| --- | --- |
| `undefined` | 使用默认配置 |
| `false` | 关闭对应区域或能力 |
| object | 按已声明字段覆盖默认对象 |
| array | 完整替换，不自动拼接 |
| function / component / VNode | 完整替换 |
| slot | 替换对应区域的默认渲染 |

配置不得改变 `state` 中的业务展示真相。例如标题来自 `state.conversation.title`，缺省时才使用 `labels.newConversationTitle`。

## 9. 默认值

### 9.1 默认展示状态

| 字段 | 默认值 |
| --- | --- |
| `conversation.items` | `[]` |
| `conversation.activeId` | `null` |
| `conversation.title` | `labels.newConversationTitle` |
| `messages` | `[]` |
| `composer.loading` | `false` |
| `composer.disabled` | `false` |
| `composer.submitDisabled` | `false`，最终仍与空输入、disabled 合并 |
| `model` | `undefined` |
| `mcp` | `undefined` |

### 9.2 默认 UI

| 字段 | 默认值 |
| --- | --- |
| `layout.contentMaxWidth` | `980` |
| `layout.panelPadding` | `12` |
| `layout.panelGap` | `12` |
| `header` | 启用 |
| `leftAside.mode` | desktop `dock`，mobile 强制 `drawer` |
| `leftAside.width` | `300` |
| `leftAside.collapsedWidth` | `56` |
| `leftAside.defaultOpen` | `false` |
| `rightAside` | `false`；有配置或 slot 时启用 |
| `history.menuItems` | 重命名、删除 |
| `messages.autoScroll` | `true` |
| `welcome` | 启用默认标题、描述和图标 |
| `prompts.items` | `[]` |
| `composer.clearOnSubmit` | `true` |
| `sender.mode` | `multiple` |
| `sender.clearable` | `true` |
| `sender.maxLength` | `1000` |
| `sender.showWordLimit` | `true` |

默认对象必须按实例创建，不能导出可被调用方修改的共享可变对象。

## 10. Composer 状态模型

Composer 是唯一同时支持受控和非受控的状态。

### 10.1 非受控模式

```vue
<TrChatUI default-composer-value="你好" />
```

- 未传 `composerValue` 时使用内部 draft。
- draft 初始值来自 `defaultComposerValue ?? ''`。
- 输入、Prompt、clear 和 submit 清空都修改内部 draft。

### 10.2 受控模式

```vue
<TrChatUI v-model:composer-value="input" />
```

- 传入 `composerValue` 时，外部值是唯一真相。
- UI 变化只发出 `update:composerValue`。
- `clearOnSubmit` 为 true 时发出清空意图；最终显示值仍由父组件决定。
- Adapter 不得绕过 `ChatUI` 主动清空受控值；发送失败恢复只能在 `ChatUI` 已按 `clearOnSubmit` 发出清空意图后进行，且不得覆盖调用方保留或新输入的值。
- 不维护会覆盖外部值的第二份长期状态。

### 10.3 提交禁用规则

```txt
submitDisabled =
  composer.disabled
  || composer.submitDisabled
  || composerValue.trim() === ''
```

调用方不能通过显式 `false` 绕过空输入和 disabled 不变量。

## 11. Emits

所有用户意图通过顶层 Emits 输出，`ui` 中不允许 `onXxx` callbacks。

```ts
export interface ChatUIEmits {
  'update:composerValue': [value: string]

  submit: [payload: ChatSubmitPayload]
  cancel: []
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]

  createConversation: []
  switchConversation: [payload: { id: string }]
  renameConversation: [payload: { id: string; title: string }]
  deleteConversation: [payload: { id: string }]
  historyAction: [payload: ChatHistoryActionEvent]

  promptClick: [payload: ChatPromptClickEvent]
  bubbleStateChange: [payload: ChatBubbleStateChangePayload]
  bubbleEvent: [payload: ChatBubbleEventPayload]

  selectModel: [payload: { id: string | null }]
  updateModelFeature: [payload: { id: string; enabled: boolean }]

  addMcpServer: [payload: { id: string }]
  removeMcpServer: [payload: { id: string }]
  loadMcpTools: [payload: { serverId: string }]
  updateMcpServerEnabled: [payload: { id: string; enabled: boolean }]
  updateMcpToolEnabled: [payload: { serverId: string; toolId: string; enabled: boolean }]
}
```

事件规则：

- 多字段参数统一使用 object payload。
- Emits 表达意图，不等待数据层 Promise，也不假设操作成功。
- View 中的 loading/pending 负责表达操作中的展示状态。
- 默认 History 的 rename/delete 映射到专用事件；自定义菜单动作走 `historyAction`。
- Prompt 点击先更新 Composer，再发出 `promptClick` 通知。
- Bubble 状态和自定义事件保持透传，不在 ChatUI 中解释业务含义。

`ChatSubmitPayload` 是 UI 层用户输入载荷，只包含文本和结构化输入，不包含 Runtime RunConfig：

```ts
export interface ChatSubmitPayload {
  text: string
  structuredData?: ChatStructuredData
}
```

## 12. Slots

`ChatUI.vue` 必须使用 `defineSlots<ChatUISlots>()`。Slots 分为区域替换和原子组件扩展两类。

### 12.1 区域替换 Slots

| Slot | 默认内容 | 行为 |
| --- | --- | --- |
| `header` | `ChatHeader` | 替换 Header 内容 |
| `left-aside` | `ChatAside` 内部内容 | 替换左侧栏内容，保留布局容器 |
| `main` | `ChatMessages` | 替换消息主区域 |
| `footer` | `ChatComposer` | 替换输入区域 |
| `right-aside` | 无 | 提供后启用右侧栏 |

### 12.2 扩展 Slots

| Slot | 用途 |
| --- | --- |
| `notice` | Header 上方通知 |
| `welcome-footer` | Welcome 扩展 |
| `prompts-footer` | Prompts 扩展 |
| `prefix` | BubbleList prefix |
| `suffix` | BubbleList suffix |
| `after` | BubbleList after |
| `content-footer` | 消息内容 footer |
| `sender-footer` | Sender 左侧 footer |
| `sender-footer-right` | Sender 右侧 footer |

Slot Props 必须只包含普通 View 数据、UI 状态和触发本组件 Emits 的 UI actions，不直接暴露 Runtime actions。

## 13. 响应式和交互不变量

以下行为是现有实现已经验证的基线，重构公共契约时必须保留：

### 13.1 Desktop

- 断点为 `960px`。
- 左侧栏默认 dock，支持展开和收起。
- collapsed width 默认为 56。
- 输入草稿不能因侧栏切换或 viewport 变化丢失。

### 13.2 Mobile

- 小于 960px 时左侧栏强制使用 drawer。
- drawer width 不超过 viewport 的 86%。
- 创建或切换会话后关闭 drawer。
- 移动端 collapsed width 为 0。
- Header 保持标题居中，左右操作区尺寸稳定。

### 13.3 Messages

- 空消息展示 Welcome 和可选 Prompts。
- 有消息时展示 BubbleList。
- system 角色默认隐藏，可由 UI 配置覆盖。
- autoScroll 默认开启。
- 用户消息追加后支持平滑滚动。
- ScrollToBottom 不得改变消息区域布局尺寸。

### 13.4 Accessibility

- 所有图标按钮具有可配置的 `aria-label`。
- 可点击元素必须使用 button 或正确语义组件。
- 无点击行为的 Logo 不得使用 button。
- 不展示未实际实现的快捷键提示；如果保留 `Ctrl K`，必须实现并验证。
- Drawer 的 Escape、focus 和 overlay 行为需要在移动端验证。

## 14. 内部结构

建议的目标文件结构：

```txt
src/
  ChatUI.vue
  ui/
    defaults.ts
    resolveState.ts
    resolveOptions.ts
    ChatAside.vue
    ChatComposer.vue
    ChatHeader.vue
    ChatMessages.vue
  composables/
    useControllableComposer.ts
    useChatUILayout.ts
  types/
    ui/
      state.ts
      options.ts
      events.ts
      slots.ts
      index.ts
```

职责：

- `defaults.ts`：创建每实例默认值。
- `resolveState.ts`：将可选 View 输入解析成完整内部状态。
- `resolveOptions.ts`：按显式规则合并默认 UI 和调用方配置。
- `useControllableComposer.ts`：管理受控/非受控 Composer。
- `useChatUILayout.ts`：管理 viewport、aside mode/open/width。
- `ChatUI.vue`：只做页面组合、事件转发和 slots 连接。

不为了追求文件数量提前抽象。只有当逻辑能够独立测试或明显降低 `ChatUI.vue` 复杂度时才提取 composable。

## 15. Demo 设计

`demo` 只关注 ChatUI，拆成三个明确场景：

```txt
demo/cases/chat-ui/
  index.vue
  DefaultCase.vue
  ConfiguredCase.vue
  ControlledCase.vue
```

### 15.1 DefaultCase

```vue
<TrChatUI />
```

证明零 Props、无 Runtime 也能渲染基础页面。

### 15.2 ConfiguredCase

只传 `ui`，验证：

- Brand 和 Labels 覆盖。
- Welcome、Sender、布局配置覆盖。
- `false` 关闭区域。
- 数组替换语义。
- Slots 替换语义。

### 15.3 ControlledCase

使用普通 Vue refs/computed，不导入 Runtime 或 Kit 类型，验证：

- conversations/messages 输入。
- Composer v-model。
- 会话和提交事件。
- Model/MCP View + Emits。
- loading、disabled、pending 状态。

## 16. 验证标准

### 16.1 静态验证

```powershell
pnpm -F @opentiny/tiny-robot-chat type-check
```

边界搜索：

```powershell
rg "ChatRuntime|ChatReadable|tiny-robot-kit|useConversation" packages/chat/src/ChatUI.vue packages/chat/src/ui packages/chat/src/types/ui
```

ChatUI 相关文件中不得出现 Runtime、Kit 或数据层协议依赖。

### 16.2 Demo 验证

```powershell
pnpm -F @opentiny/tiny-robot-chat dev
```

验证地址：

```txt
http://localhost:5185/chat-ui
```

必须覆盖：

- 零配置渲染。
- UI 配置覆盖和关闭。
- 自定义状态接入。
- Composer 受控/非受控。
- desktop/mobile aside。
- empty/messages/loading/disabled/pending。
- 长标题、长模型名和窄屏布局。

### 16.3 自动化验证

ChatUI API 稳定后再接入 `packages/test`。执行 Playwright 前按仓库规则：

```powershell
pnpm build:components
pnpm -F tiny-robot-test test
```

最低自动化覆盖：

- `<TrChatUI />` mount。
- Composer 受控/非受控。
- Prompt 回填。
- desktop dock 和 mobile drawer。
- 会话事件 payload。
- UI `false` 关闭区域。

## 17. 完成定义

满足以下条件后，ChatUI 方案视为实现完成：

1. `<TrChatUI />` 可以独立渲染并完成 UI 局部交互。
2. `state` 和 `ui` 均为可选。
3. UI 类型不依赖 Runtime、Kit、Vue Ref 或 controller actions。
4. `ui` 只包含展示配置，不包含事件回调和业务状态。
5. Composer 具有明确的受控/非受控语义。
6. Model/MCP 使用 View + Emits。
7. Props、Emits、Slots 和所有导出类型均有静态类型。
8. 三个 Demo 场景均通过 desktop/mobile 验证。
9. `TrChat` 能作为 adapter 接入该契约，但不改变 ChatUI 设计。
10. 现有已验证的布局、滚动和响应式交互没有回归。

整体架构文档和迁移文档在上述实现稳定后再统一更新。
