# TinyRobot Chat 架构设计

## 1. 架构总览

`@opentiny/tiny-robot-chat` 是应用装配层。

补充阅读：

- [evolution-path.md](./evolution-path.md)：记录未来扩展方向、assistant-ui 调研结论、以及后续何时才值得引入新层级

```txt
packages/components
  -> UI primitives：Layout / History / BubbleList / Welcome / Prompts / Sender

packages/kit
  -> runtime core：message / conversation / stream / abort / plugin / storage

packages/chat
  -> application assembly + UI adapter
```

核心结构：

```txt
TrChat
  -> ChatRuntime
  -> internal ChatComposer
  -> ChatUi
  -> slots
```

职责边界：

| 模块 | 职责 |
| --- | --- |
| `ChatRuntime` | 会话、消息、请求生命周期 |
| `ChatComposer` | 输入草稿和提交交互 |
| `ChatUi` | 默认组件展示配置 |
| `slots` | 布局区域替换 |

## 2. Public API

v1 稳定入口：

- `TrChat`
- `useLocalChatRuntime`
- `useKitChatRuntime`
- `ChatRuntime`
- `ChatUi`
- `ChatSubmitPayload`
- `ChatHeaderSlotProps`
- `ChatHistorySlotProps`
- `ChatMainSlotProps`
- `ChatFooterSlotProps`

主入口：

```vue
<TrChat :runtime="runtime" :ui="ui" />
```

Props：

```ts
export interface ChatProps {
  runtime: ChatRuntime
  ui?: ChatUi
  title?: string
}
```

## 3. ChatRuntime

`ChatRuntime` 是 UI adapter 协议。

它屏蔽 kit、AI SDK、Pinia、自研 store 的差异，让 `TrChat` 只消费统一协议。

```txt
runtime state -> UI
UI event -> runtime actions
```

推荐类型：

```ts
import type { ComputedRef, Ref } from 'vue'
import type { RequestProcessingState, RequestState } from '@opentiny/tiny-robot-kit'

export type ChatReadable<T> = Readonly<Ref<T>> | ComputedRef<T>

export interface ChatConversationItem {
  id: string
  title: string
  createdAt?: number
  updatedAt?: number
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

export interface ChatMessagePart {
  type: string
  [key: string]: unknown
}

export interface ChatMessageContentItem extends ChatMessagePart {}

export type ChatMessageContent = string | ChatMessageContentItem[]

export interface ChatToolCall {
  id: string
  type: 'function' | string
  function: {
    name: string
    arguments: string
  }
}

export interface ChatMessageItem<
  T extends ChatMessageContent = ChatMessageContent,
  S extends Record<string, unknown> = Record<string, unknown>,
> {
  role?: string
  content?: T
  parts?: ChatMessagePart[]
  reasoning_content?: string
  tool_calls?: ChatToolCall[]
  tool_call_id?: string
  name?: string
  id?: string
  loading?: boolean
  state?: S
  metadata?: Record<string, unknown>
}

export interface ChatRuntimeConversations {
  items: ChatReadable<readonly ChatConversationItem[]>
  currentId: ChatReadable<string | null>
  loading?: ChatReadable<boolean>
}

export interface ChatRuntimeMessages {
  items: ChatReadable<readonly ChatMessageItem[]>
  requestState: ChatReadable<RequestState>
  processingState: ChatReadable<RequestProcessingState | undefined>
  lastError?: ChatReadable<unknown | null>
}

export interface ChatRuntimeSender {
  disabled: ChatReadable<boolean>
  loading: ChatReadable<boolean>
}

export interface ChatSubmitPayload {
  text: string
  structuredData?: Array<{
    type: string
    [key: string]: unknown
  }>
}

export interface ChatRuntimeActions {
  send: (payload: ChatSubmitPayload) => Promise<void> | void
  abort?: () => Promise<void> | void
  createConversation?: (payload?: { title?: string; metadata?: Record<string, unknown> }) => Promise<void> | void
  switchConversation?: (id: string) => Promise<void> | void
  renameConversation?: (id: string, title: string) => Promise<void> | void
  deleteConversation?: (id: string) => Promise<void> | void
}

export interface ChatRuntime {
  conversations?: ChatRuntimeConversations
  messages: ChatRuntimeMessages
  sender: ChatRuntimeSender
  actions: ChatRuntimeActions
}
```

说明：

- `ChatRuntime` 不再直接引用 `HistoryItem / BubbleMessage / StructuredData`。
- `Conversations.vue` 在内部把 `ChatConversationItem` 适配为 `TrHistory` 需要的 `HistoryDisplayItem`。
- `Messages.vue` 在内部把 `ChatMessageItem` 适配为 `TrBubbleList` 需要的 `BubbleDisplayMessage`。
- `parts / metadata` 先作为协议扩展口保留，不在 MVP 内建立新的渲染框架。

约束：

- state 只读。
- 修改必须走 `runtime.actions`。
- UI 不直接调用 transport。
- UI 不直接依赖 kit 原始返回结构。
- 输入草稿不进入 `ChatRuntime`。

## 4. ChatComposer

`ChatComposer` 是 `TrChat` 内部输入交互状态。

MVP 不作为 public API 导出。

内部结构：

```ts
interface ChatComposer {
  inputValue: ChatReadable<string>
  submitDisabled: ChatReadable<boolean>
  setInputValue: (value: string) => void
  send: (payload: ChatSubmitPayload) => Promise<void> | void
  abort?: () => Promise<void> | void
}
```

职责：

- 管理 `TrSender.modelValue`。
- 处理 `TrSender update:modelValue`。
- 处理 Prompt 回填输入框。
- 根据输入值、`runtime.sender.disabled`、`runtime.sender.loading` 计算提交禁用。
- 调用 `runtime.actions.send(payload)`。
- 发送成功后清空输入。

发送链路：

```txt
TrSender submit
  -> composer.send(payload)
    -> runtime.actions.send(payload)
    -> success
    -> composer.inputValue = ''
```

失败时不清空输入，方便用户重试。

## 5. ChatUi

`ChatUi` 只负责默认原子组件展示配置。

```ts
export interface ChatUi {
  layout?: ChatLayoutUi
  history?: Omit<HistoryProps, 'data' | 'selected'>
  bubbleProvider?: Omit<BubbleProviderProps, 'store'>
  bubbleList?: Omit<BubbleListProps, 'messages'>
  welcome?: WelcomeProps
  prompts?: Omit<PromptsProps, 'items'> & {
    items?: PromptProps[]
  }
  sender?: Omit<SenderProps, 'modelValue' | 'defaultValue' | 'loading' | 'disabled'>
}
```

对应关系：

| `ui` key | 默认组件 |
| --- | --- |
| `layout` | `TrLayout` |
| `history` | `TrHistory` |
| `bubbleProvider` | `TrBubbleProvider` |
| `bubbleList` | `TrBubbleList` |
| `welcome` | `TrWelcome` |
| `prompts` | `TrPrompts` |
| `sender` | `TrSender` |

不能通过 `ui` 配置的数据字段：

| 组件 | 字段 |
| --- | --- |
| `TrHistory` | `data / selected` |
| `TrBubbleList` | `messages` |
| `TrSender` | `modelValue / defaultValue / loading / disabled` |

原则：

```txt
同一状态只能有一个来源。
```

## 6. TrChat 默认装配

```txt
TrChat
  -> TrLayout
    -> header: Header
    -> left-aside: Conversations
    -> main: Messages
    -> footer: Sender
    -> ProxyScrollbar / ScrollToBottom
```

默认映射：

| 来源 | 目标 |
| --- | --- |
| `runtime.conversations.items` | `HistoryDisplayItem[] -> TrHistory.data` |
| `runtime.conversations.currentId` | `TrHistory.selected` |
| `runtime.messages.items` | `BubbleDisplayMessage[] -> TrBubbleList.messages` |
| `composer.inputValue` | `TrSender.modelValue` |
| `runtime.sender.loading` | `TrSender.loading` |
| `runtime.sender.disabled` | `TrSender.disabled` |
| `composer.submitDisabled` | `TrSender.defaultActions.submit.disabled` |
| `composer.setInputValue` | `TrSender update:modelValue` |
| `composer.send` | `TrSender submit` |
| `composer.abort` | `TrSender cancel` |
| `runtime.actions.switchConversation` | `TrHistory item-click` |
| `runtime.actions.renameConversation` | `TrHistory item-title-change` |
| `runtime.actions.deleteConversation` | `TrHistory item-action(delete)` |

## 7. Runtime 接入路径

### 7.1 useLocalChatRuntime

新项目快速入口。

```txt
useLocalChatRuntime
  -> useConversation
  -> useKitChatRuntime
  -> ChatRuntime
```

职责：

- 创建 `useConversation()`。
- 首条消息发送前自动创建会话。
- 标题 fallback。
- 错误捕获。
- 组合最终 `ChatRuntime`。

不负责：

- 输入草稿。
- 发送成功后清空输入。
- Prompt 回填。

### 7.2 useKitChatRuntime

已有 kit runtime 迁移入口。

适用场景：

- 用户已经持有 `useConversation()` 返回值。
- 用户只想把旧 UI 切换到 `TrChat`。
- 用户不想重建已有 transport、storage、plugins。

示例：

```ts
const conversation = useConversation(options)

const runtime = useKitChatRuntime(conversation, {
  send: async ({ text }) => {
    await conversation.activeConversation.value?.engine.sendMessage(text)
  },
})
```

`useKitChatRuntime()` 只做 kit 到 `ChatRuntime` 的映射。

补充：

- `lastError` 现在是可选入参。
- 用户需要自定义错误状态时再传 `lastError`。

### 7.3 自定义 ChatRuntime

用户外部数据层接入入口。

适用场景：

- AI SDK。
- Pinia。
- 自研 store。
- 老系统数据层。
- 只想复用 TinyRobot UI。

链路：

```txt
用户数据层
  -> ChatRuntime adapter
    -> TrChat
```

要求：

- 用户自己负责请求、stream、abort、错误处理。
- 用户保证数据符合 `ChatRuntime` 契约。
- 默认 UI 所需的 `History / BubbleList` 形态由 `chat` 内部 adapter 负责。
- `TrChat` 不关心外部 runtime 内部实现。

## 8. Slots

`TrChat` 通过 slots 做轻量区域替换。

slot 按布局区域命名，不按默认组件命名。

| slot | 默认内容 | 用途 |
| --- | --- | --- |
| `header` | `Header` | 扩展或替换顶部区域 |
| `left-aside` | `Conversations` | 扩展或替换会话列表区域 |
| `main` | `Messages` | 扩展或替换消息区域 |
| `footer` | `Sender` | 扩展或替换输入区域 |

规则：

- 使用默认区域时，对应 `ui.xxx` 生效。
- 覆盖某个 slot 后，该区域对应的 `ui.xxx` 不再保证生效。
- slot props 只暴露该区域必要状态和动作。
- 深度重组直接使用 `components + kit`。

稳定 slot props：

- `header`: `ChatHeaderSlotProps`
- `left-aside`: `ChatHistorySlotProps`
- `main`: `ChatMainSlotProps`
- `footer`: `ChatFooterSlotProps`

`footer` slot 示例：

```vue
<TrChat :runtime="runtime" :ui="ui">
  <template #footer="{ inputValue, loading, send, abort, setInputValue }">
    <CustomSender
      :model-value="inputValue"
      :loading="loading"
      @update:model-value="setInputValue"
      @submit="send"
      @cancel="abort"
    />
  </template>
</TrChat>
```

## 9. Context

内部 context 推荐结构：

```ts
export interface ChatContext {
  runtime: ChatRuntime
  composer: ChatComposer
  ui: ChatUi
}
```

内部组件只读 context，不直接依赖 kit。

```txt
Conversations -> runtime.conversations + runtime.actions
Messages -> runtime.messages + ui + composer.setInputValue
Sender -> runtime.sender + composer + ui.sender
```

## 10. 文件结构

```txt
packages/chat/
  src/
    index.ts
    Chat.vue
    types.ts
    context.ts
    composables/
      useChatContext.ts
      useChatComposer.ts
      useKitChatRuntime.ts
      useLocalChatRuntime.ts
    components/
      Header.vue
      Conversations.vue
      Messages.vue
      Sender.vue
      ScrollToBottom.vue
```

约束：

- `components/*` 是内部实现，不作为 v1 public API。
- public API 从 `src/index.ts` 显式导出。
- 不导出白盒命名空间组件作为 v1 稳定入口。

导出建议：

```ts
export { default as TrChat } from './Chat.vue'
export { useLocalChatRuntime } from './composables/useLocalChatRuntime'
export { useKitChatRuntime } from './composables/useKitChatRuntime'
export type {
  ChatFooterSlotProps,
  ChatHeaderSlotProps,
  ChatHistorySlotProps,
  ChatMainSlotProps,
  ChatMessagePart,
  ChatRuntime,
  ChatRuntimeActions,
  ChatRuntimeSender,
  ChatSubmitPayload,
  ChatUi,
} from './types'
```

## 11. 当前收敛顺序

1. 先移除 `ChatRuntime` 对 UI 组件类型的直接依赖。
2. 再在 `chat` 内部补齐 `HistoryDisplayItem / BubbleDisplayMessage` adapter。
3. 收窄 `useKitChatRuntime()` 入参，保留 `send` 覆盖，`lastError` 改为可选。
4. 给消息协议补最小扩展位：`parts / metadata`。
5. 固定 `header / left-aside / main / footer` 的 slot props 类型。
6. 最后同步文档、demo 和验证用例。

## 12. 验证标准

- `TrChat` 能完成默认会话应用渲染。
- `useLocalChatRuntime` 能完成首条消息自动建会话并发送。
- `useKitChatRuntime` 能接入已有 `useConversation()`，且不需要传输入框状态。
- external runtime 只需要适配消息、会话和请求生命周期。
- Prompt 点击能回填输入框。
- 发送成功后清空输入框。
- 发送失败后保留输入框内容。
- `ui.sender` 能配置 `TrSender` 展示。
- 覆盖 slot 后，对应默认组件不再渲染。

## 13. 结论

v1 推荐架构：

```txt
TrChat 黑盒入口 + ChatRuntime + 内部 ChatComposer + ChatUi + slots
```

该方案满足：

- 快速接入完整聊天应用。
- runtime 和 UI 输入草稿解耦。
- 已有 kit runtime 迁移成本更低。
- 用户已有数据层时只接 TinyRobot UI。
- 不和 `kit` 重复建设 runtime、transport、stream 生命周期。
