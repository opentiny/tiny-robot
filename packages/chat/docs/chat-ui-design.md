# TrChatUI 设计方案

## 1. 文档状态

- 状态：设计已确认，待实施。
- 范围：定义 `TrChatUI` 的公共契约、职责边界、默认行为和交互不变量。
- 实施方案：[chat-ui-implementation.md](./chat-ui-implementation.md)。
- 兼容策略：当前处于开发阶段，不保留旧 ChatUI API 兼容层。
- 非范围：本阶段不调整 `ChatRuntime` 核心协议，不增加统一事件系统。

## 2. 设计结论

`TrChatUI` 是不依赖 Runtime 的聊天页面 UI Shell。

```txt
<TrChatUI />
  -> 默认 Data
  -> 默认 UI Options
  -> 可输入 Sender
  -> Welcome 空态
  -> 响应式页面

<TrChat :runtime="runtime" />
  -> Runtime adapter
  -> ChatUIData
  -> ChatUIOptions + onXxx
  -> TrChatUI
```

最终边界：

```txt
data      = 当前展示数据
ui        = UI 配置、原子组件 Props、组件级 onXxx 回调
emits     = ChatUI 根级用户意图
slots     = 区域替换和原子组件扩展
TrChat    = Runtime adapter，内置 Model/MCP 业务编排
```

公共 Props：

```ts
export interface ChatUIProps {
  data?: ChatUIData
  ui?: ChatUIOptions
}
```

不再提供：

```txt
state
composerValue
defaultComposerValue
update:composerValue
```

## 3. 组件职责

### 3.1 TrChatUI 负责

- 组合 Layout、History、Welcome、Prompts、BubbleList、Sender。
- 提供零 Props 默认页面。
- 将普通 Data 映射为原子组件 Props。
- 调用组件级 `onXxx` 回调。
- 通过根 Emits 表达页面级用户意图。
- 管理 Aside、滚动目标、移动端布局等短生命周期 UI 状态。
- 提供完整类型化 Slots。

### 3.2 TrChatUI 不负责

- 请求、流式协议、持久化和错误恢复。
- Runtime、Provider、Transport、Storage 或 Kit engine。
- RunConfig 合成和请求参数解释。
- 直接调用 Model/MCP Runtime controller。
- 等待 Model/MCP Promise。
- 维护 Model/MCP pending 业务状态。
- 提供受控/非受控两套输入 API。

### 3.3 TrChat 负责

- 将 Runtime conversation/messages 映射为 `ChatUIData`。
- 将 Runtime request state 映射为 Sender Data。
- 将 Runtime Model/MCP 映射为普通 View Data。
- 将根级 ChatUI Emits 转发到 Runtime actions。
- 内置 Model/MCP action、pending、防重复和错误处理。
- 向 `ui.model` 和 `ui.mcp` 注入 Model/MCP `onXxx` 回调。
- 合并调用方 UI 配置和 adapter 内部回调。

## 4. 公共 Data

```ts
export interface ChatUIData {
  conversation?: ChatConversationView
  bubble?: ChatBubbleView
  sender?: ChatSenderView
  model?: ChatModelView
  mcp?: ChatMcpView
}

export interface ChatConversationView {
  items?: readonly ChatConversationInfo[]
  activeId?: string | null
  title?: string
}

export interface ChatBubbleView {
  messages?: readonly ChatMessageItem[]
}

export interface ChatSenderView {
  inputValue?: string
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

export type ChatMcpToolMap = Readonly<
  Partial<Record<string, readonly ChatMcpToolView[]>>
>
```

约束：

- Data 只包含普通数据。
- Data 不包含 Vue Ref、Runtime 类型、controller 或操作方法。
- Props 只读，ChatUI 不直接修改调用方 Data。
- Model/MCP 未提供时不渲染对应控件。
- Pending 状态由 adapter 映射到 Data。
- `metadata` 仅用于 UI 扩展信息。

## 5. InputValue 模型

本阶段不定义受控和非受控两套模式。

### 5.1 状态所有权

- `TrSender` 编辑器拥有当前实时草稿。
- Sender 内部草稿是真实输入值，`data.sender.inputValue` 只是外部同步输入；外部值变化时覆盖当前草稿。
- Sender 输入变化调用 `ui.sender.onInput(value)`。
- ChatUI 不直接修改 `data.sender.inputValue`。
- 不提供 `defaultInputValue`。
- 不提供根级 `update:inputValue` emit。
- 不提供 `v-model` API。

### 5.2 零 Props 行为

```vue
<TrChatUI />
```

- Sender 使用自身默认空值。
- 用户可以正常输入、清空和提交。
- 输入草稿保存在 Sender 内部。
- Aside 和 viewport 变化不得重建 Sender 或丢失草稿。

### 5.3 外部同步

当 `data.sender.inputValue` 发生变化时：undefined 表示不执行同步；清空必须显式传 ''

- Sender 将编辑器内容同步为新值。
- 外部同步不重复调用 `onInput`。
- 用户后续输入继续调用 `onInput`。
- 调用方可以在 `onInput` 中保存最新值，但不是强制要求。

### 5.4 Prompt、Clear 和 Submit

- Prompt 通过 Sender 的 `setContent` 写入内容。
- Prompt、clear、submit 只依赖 Sender input 事件调用 onInput，业务函数不得重复调用；外部同步使用 emitUpdate: false。
- Prompt 写入完成后调用 `prompts.onItemClick`。
- 用户点击清空时调用一次根级 `clear`。
- 清空导致的内容变化调用一次 `sender.onInput('')`。
- `clearOnSubmit` 默认开启。
- 提交自动清空不得额外触发根级 `clear`。
- 提交 payload 必须读取 Sender 实际内容。
- 发送失败后的恢复由 `TrChat` input adapter 通过更新 Data 完成。

### 5.5 提交禁用

Sender 自身负责：

- 空内容不可提交。
- 超出字数限制不可提交。
- disabled 状态不可提交。

`data.sender.submitDisabled` 只增加外部禁用条件，不能绕过 Sender 自身约束。

## 6. UI Options

```ts
export interface ChatUIOptions {
  layout?: ChatLayoutOptions
  brand?: ChatBrandOptions
  labels?: Partial<ChatLabels>
  header?: false
  history?: false | ChatHistoryOptions
  welcome?: false | ChatWelcomeOptions
  prompts?: false | ChatPromptsOptions
  bubble?: ChatBubbleOptions
  sender?: false | ChatSenderOptions
  model?: false | ChatModelOptions
  mcp?: false | ChatMcpOptions
}
```

### 6.1 Layout

```ts
export type ChatCssSize = string | number

export interface ChatLayoutOptions {
  contentMaxWidth?: ChatCssSize
  panelPadding?: ChatCssSize
  panelGap?: ChatCssSize
  leftAside?: false | ChatAsideOptions
  rightAside?: false | ChatRightAsideOptions
}

export interface ChatAsideOptions {
  mode?: 'dock' | 'drawer'
  width?: number
  collapsedWidth?: number
  defaultOpen?: boolean
}

export interface ChatRightAsideOptions extends ChatAsideOptions {
  open?: boolean
  title?: string
  showClose?: boolean
  onOpenChange?: (payload: { open: boolean }) => void
}
```

Aside width 只接受 number。CSS size 只用于 CSS 变量。

### 6.2 History

```ts
export type ChatHistoryOptions =
  Omit<HistoryProps<ChatConversationInfo>, 'data' | 'selected'> & {
    onItemAction?: (
      action: HistoryMenuItem,
      conversation: ChatConversationInfo,
    ) => void
  }
```

规则：

- 点击会话走根级 `switchConversation`。
- 重命名走根级 `renameConversation`。
- 删除走根级 `deleteConversation`。
- 非内置菜单动作调用 `onItemAction`。
- 同一次操作只能触发一个对应出口。

### 6.3 Prompts

```ts
export interface ChatPromptsOptions
  extends Omit<PromptsProps, 'items'> {
  items?: PromptProps[]
  onItemClick?: (event: MouseEvent, item: PromptProps) => void
}
```

规则：

- disabled Prompt 不处理。
- 先回填 Sender。
- 再调用 `onItemClick`。
- 不再提供 `promptClick` 根 emit。

### 6.4 Bubble

```ts
export interface ChatBubbleOptions {
  autoScroll?: boolean
  bubbleProvider?: Omit<BubbleProviderProps, 'store'>
  bubbleList?: ChatBubbleListOptions
}

export type ChatBubbleListOptions =
  Omit<BubbleListProps, 'messages' | 'autoScroll'> & {
    onStateChange?: (payload: ChatBubbleStateChangePayload) => void
    onBubbleEvent?: (payload: ChatBubbleEventPayload) => void
  }
```

规则：

- `messages` 只能来自 `data.bubble.messages`。
- ChatUI 统一管理外部滚动容器。
- BubbleList 的 `autoScroll` 固定由 ChatUI 接管。
- Bubble callbacks 保持原 payload，不解释业务含义。

### 6.5 Sender

`ChatSenderOptions` 由可透传的 `TrSender` Props、ChatUI Sender 编排配置和 Sender 自身 callbacks 组成。

```ts
export type ChatSenderOptions = Omit<
  SenderProps,
  'modelValue' | 'defaultValue' | 'loading' | 'disabled' | 'defaultActions'
> & {
  defaultActions?: ChatSenderDefaultActions
  clearOnSubmit?: boolean

  onInput?: (value: string) => void
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
}

export interface ChatModelOptions {
  onSelect?: (payload: { id: string | null }) => void
  onFeatureChange?: (payload: { id: string; enabled: boolean }) => void
}

export interface ChatMcpOptions {
  onAddServer?: (payload: { id: string }) => void
  onRemoveServer?: (payload: { id: string }) => void
  onServerEnabledChange?: (
    payload: { id: string; enabled: boolean },
  ) => void
  onToolEnabledChange?: (
    payload: {
      serverId: string
      toolId: string
      enabled: boolean
    },
  ) => void
}
```

规则：

- 原子组件 Props 优先通过 `Omit` 复用。
- 原子组件 Emits 不属于 Props 接口，所有 callback 必须显式声明。
- callback 是同步意图通知。
- ChatUI 不等待 callback 返回值。
- Model callbacks 归属 `ui.model`。
- MCP callbacks 归属 `ui.mcp`。
- Model/MCP callback 缺失时只保持当前 Data，不伪造成功状态。

## 7. 根级 Emits

```ts
export interface ChatUIEmits {
  submit: [payload: ChatSubmitPayload]
  cancel: []
  clear: []

  createConversation: []
  switchConversation: [payload: { id: string }]
  renameConversation: [payload: { id: string; title: string }]
  deleteConversation: [payload: { id: string }]
}
```

根 Emits 只表达页面级意图。

不保留以下根 Emits：

```txt
update:composerValue
focus
blur
historyAction
promptClick
bubbleStateChange
bubbleEvent
selectModel
updateModelFeature
addMcpServer
removeMcpServer
loadMcpTools
updateMcpServerEnabled
updateMcpToolEnabled
rightAsideOpenChange
```

本阶段不增加统一 `event` emit。

## 8. Model/MCP 编排

### 8.1 ChatUI 边界

- Model/MCP 组件消费普通 View Data。
- 组件内部可以使用局部 emits 与父级 ChatComposer 通信。
- ChatComposer 只负责把 Model/MCP 控件组合到 footer，并调用 `ui.model.onXxx`、`ui.mcp.onXxx`。
- ChatUI 不导入 Runtime 类型。
- ChatUI 不等待 Model/MCP action。
- ChatUI 不暴露 `onLoadMcpTools`。
- MCPSelector 不根据 View Data 自动加载 tools。

### 8.2 TrChat Adapter

`TrChat` 内置：

- Model 选择。
- Model feature 更新。
- MCP Server 添加、删除和启停。
- MCP Tool 加载和启停，加载由 adapter 内部编排。
- pending 状态。
- 重复操作拦截。
- MCP Tool 启用快照和恢复。
- Promise reject 捕获。
- `finally` pending 清理。

### 8.3 Callback 合并

当调用方 `ui.model` 或 `ui.mcp` 已提供同名 callback 时：

1. `TrChat` 先派发内部 Runtime action。
2. 再调用调用方 callback，作为意图通知。
3. 不等待 Runtime action 完成。
4. 调用方 callback 不影响内部 action。
5. 每次事件发生时读取最新 callback，不缓存旧函数。

MCP tools 加载流程：

```txt
用户 add/enable Server
  -> ui.mcp 对应 callback
  -> TrChat adapter 等待 Runtime action
  -> adapter 串行调用 loadTools
  -> Runtime Data 更新
  -> ChatUI 重新渲染
```

## 9. 配置解析规则

不使用通用递归 deep merge。

| 输入 | 语义 |
| --- | --- |
| `undefined` | 使用默认值 |
| `false` | 关闭对应区域 |
| object | 按已声明字段覆盖 |
| array | 完整替换 |
| function | 完整替换 |
| component/VNode | 完整替换 |
| slot | 替换对应默认渲染 |

其他规则：

- 默认对象按组件实例创建。
- 不导出共享可变默认对象。
- callback 不在 resolver 初始化时固化。
- Data 和 UI 分开解析。
- UI 配置不得覆盖 Data 中的展示事实。
- `undefined` 不覆盖有效默认值。

## 10. 默认值

### 10.1 Data

| 字段 | 默认值 |
| --- | --- |
| `conversation.items` | `[]` |
| `conversation.activeId` | `null` |
| `conversation.title` | `labels.newConversationTitle` |
| `bubble.messages` | `[]` |
| `sender.inputValue` | `undefined` |
| `sender.loading` | `false` |
| `sender.disabled` | `false` |
| `sender.submitDisabled` | `false` |
| `model` | `undefined` |
| `mcp` | `undefined` |

### 10.2 UI

| 字段 | 默认值 |
| --- | --- |
| `layout.contentMaxWidth` | `980` |
| `layout.panelPadding` | `12` |
| `layout.panelGap` | `12` |
| `layout.leftAside.mode` | `dock` |
| `layout.leftAside.width` | `300` |
| `layout.leftAside.collapsedWidth` | `56` |
| `layout.leftAside.defaultOpen` | `false` |
| `layout.rightAside` | `false` |
| `header` | 启用 |
| `history.menuItems` | 重命名、删除 |
| `bubble.autoScroll` | `true` |
| `welcome` | 启用 |
| `prompts.items` | `[]` |
| `sender.clearOnSubmit` | `true` |
| `sender.mode` | `multiple` |
| `sender.clearable` | `true` |
| `sender.maxLength` | `1000` |
| `sender.showWordLimit` | `true` |
| `model` | 启用 |
| `mcp` | 启用 |

显式 false 优先；只有 undefined + slot 才自动启用默认右栏。

## 11. Slots

### 11.1 区域 Slots

| Slot | 用途 |
| --- | --- |
| `header` | 替换 Header 内容 |
| `left-aside` | 替换左侧栏内部内容 |
| `main` | 替换消息主区域 |
| `footer` | 替换 Sender 区域 |
| `right-aside` | 提供右侧栏内容 |

### 11.2 扩展 Slots

| Slot | 用途 |
| --- | --- |
| `header-notice` | Header 通知区域 |
| `welcome-footer` | Welcome footer |
| `prompts-footer` | Prompts footer |
| `bubble-prefix` | BubbleList prefix |
| `bubble-suffix` | BubbleList suffix |
| `bubble-after` | BubbleList after |
| `bubble-content-footer` | Bubble content footer |
| `sender-footer` | Sender footer |
| `sender-footer-right` | Sender footer-right |
| `right-aside-title` | 自定义右侧栏标题 |

规则：

- `ChatUI.vue` 使用 `defineSlots<ChatUISlots>()`。
- Slot Props 只包含普通 Data、UI 状态和根级 UI actions。
- Slot Props 不暴露 Runtime controller。
- `right-aside-title` 存在时 Header 必须显示。
- 不保留右侧栏硬编码默认标题。

## 12. 响应式不变量

### 12.1 Desktop

- 断点为 `960px`。
- 左侧栏默认 dock。
- 支持展开和收起。
- collapsed width 默认 `56`。
- Sender 不因 Aside 状态变化重建。

### 12.2 Mobile

- 小于 `960px` 强制使用 drawer。
- 左侧 drawer width 不超过 viewport 的 `86%`。
- 创建或切换会话后关闭 drawer。
- collapsed width 为 `0`。
- 右侧 drawer 最大宽度不超过 viewport。
- Header 标题与按钮不得重叠。

### 12.3 Right Aside

- `open` 未提供时使用内部 open 状态。
- `open` 提供时以外部值为展示依据。
- 关闭按钮和 Layout 变化调用 `onOpenChange`。
- 受外部 `open` 驱动时不得直接修改展示真相。
- 同一次开关操作只调用一次 `onOpenChange`。

## 13. Messages 和滚动

- 空消息展示 Welcome 和可选 Prompts。
- 有消息时展示 BubbleList。
- system 角色默认隐藏。
- `bubble.autoScroll` 默认开启。
- 用户消息追加后支持 smooth scroll。
- `ScrollToBottom` 固定在消息面板内。
- `ScrollToBottom` 不得改变消息区域布局尺寸。
- ProxyScrollbar 使用同一个 scroll target。
- slot 替换 main 后不得产生重复滚动容器。

## 14. 可访问性

- 图标按钮必须具有 `aria-label`。
- 可点击元素使用 button 或正确语义组件。
- 无点击行为的 Logo 不使用 button。
- 不展示未实现的快捷键提示。
- Drawer 验证 Escape、focus 和 overlay。
- 长标题使用省略显示，不挤压操作按钮。
- 窄屏下文字不得与图标重叠。

## 15. 内部结构

```txt
src/
  Chat.vue
  ChatUI.vue
  ui/
    defaults.ts
    resolveData.ts
    resolveOptions.ts
    ChatAside.vue
    ChatComposer.vue
    ChatHeader.vue
    ChatMessages.vue
    ChatRightAsidePanel.vue
  types/
    ui/
      data.ts
      options.ts
      events.ts
      slots.ts
      index.ts
```

职责：

- `ChatUI.vue`：页面组合、根 emits、callback 和 slots 连接。
- `ChatComposer.vue`：Sender 内容命令、Sender callbacks、Model/MCP footer 组合。
- `ChatMessages.vue`：Welcome、Prompts、Bubble 和滚动映射。
- `ChatAside.vue`：History 展示和会话意图。
- `ChatRightAsidePanel.vue`：右侧栏容器、标题和关闭操作。
- `resolveData.ts`：解析默认 Data。
- `resolveOptions.ts`：显式解析 UI Options。
- `Chat.vue`：Runtime adapter 和 Model/MCP 内置编排。

删除：

```txt
useControllableComposer.ts
resolveState.ts
state.ts
```

除非布局逻辑明显降低 `ChatUI.vue` 复杂度，否则不新增 composable。

## 16. Demo

```txt
demo/cases/chat-ui/
  index.vue
  DefaultCase.vue
  ConfiguredCase.vue
  DataCase.vue
```

### DefaultCase

- 只渲染 `<TrChatUI />`。
- 验证零 Props。
- 验证输入、清空和提交。
- 不导入 Runtime 或 Kit。

### ConfiguredCase

- 只传 `ui`。
- 验证 Brand、Labels 和区域配置。
- 验证 `false` 关闭。
- 验证 callback。
- 验证 Slots。
- 验证数组替换。

### DataCase

- 使用普通 Vue refs/computed。
- 不导入 Runtime 或 Kit。
- 验证 conversations、messages 和 sender Data。
- 验证根 Emits。
- 使用独立 `model`、`mcp` 配置验证 Model/MCP Data + `onXxx`。
- 验证 loading、disabled 和 pending。

## 17. 完成定义

满足以下条件后设计视为实现完成：

1. `<TrChatUI />` 可以独立渲染和输入。
2. 公共 Props 只有 `data` 和 `ui`。
3. 不存在公开受控/非受控双输入 API。
4. UI 类型不依赖 Runtime、Kit、Vue Ref 或 controller。
5. 根 Emits 只保留页面级意图。
6. 组件级事件通过类型化 `onXxx` Props 调用。
7. Model/MCP 编排保留在 `TrChat` adapter。
8. Slots 全部使用最终命名。
9. 三个 Demo 在 desktop/mobile 下通过。
10. 布局、滚动、History identity 和响应式行为无回归。
