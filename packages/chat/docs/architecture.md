# TinyRobot Chat 架构设计

## 1. 文档定位

这份文档只回答两件事：

- `packages/chat` 当前对外提供了什么协议
- `TrChat` 当前默认是如何装配起来的

不在这里展开：

- MVP 阶段拆分和验收项：见 [mvp-plan.md](./mvp-plan.md)
- 为什么这样设计、未来何时扩层：见 [evolution-path.md](./evolution-path.md)

## 2. 架构总览

`@opentiny/tiny-robot-chat` 是应用装配层。

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

## 3. Public API

当前稳定主入口：

- `TrChat`
- `useLocalChatRuntime`
- `useKitChatRuntime`

当前公开核心类型：

- `ChatRuntime`
- `ChatUi`
- `ChatSubmitPayload`
- `ChatConversationItem`
- `ChatMessagePart`
- `ChatMessageItem`
- `ChatStructuredData`
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

## 4. ChatRuntime

`ChatRuntime` 是 UI adapter 协议。

它屏蔽 kit、AI SDK、Pinia、自研 store 的差异，让 `TrChat` 只消费统一协议。

```txt
runtime state -> UI
UI event -> runtime actions
```

当前协议：

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

export type ChatMessageContent = string | ChatMessagePart[]

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

export interface ChatStructuredDataItem {
  type: string
  [key: string]: unknown
}

export type ChatStructuredData = ChatStructuredDataItem[]

export interface ChatSubmitPayload {
  text: string
  structuredData?: ChatStructuredData
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

约束：

- `ChatRuntime` 不直接引用 `HistoryItem / BubbleMessage / StructuredData`。
- state 只读。
- 修改必须走 `runtime.actions`。
- UI 不直接调用 transport。
- UI 不直接依赖 kit 原始返回结构。
- 输入草稿不进入 `ChatRuntime`。
- 不把项目专属发送字段塞进 `ChatRuntime`。

## 5. ChatComposer

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

- 管理 `TrSender.modelValue`
- 处理 `TrSender update:modelValue`
- 处理 Prompt 回填输入框
- 根据输入值、`runtime.sender.disabled`、`runtime.sender.loading` 计算提交禁用
- 调用 `runtime.actions.send(payload)`
- 发送成功后清空输入
- 发送失败后恢复输入

发送链路：

```txt
TrSender submit
  -> composer.send(payload)
    -> runtime.actions.send(payload)
```

## 6. ChatUi

`ChatUi` 只负责默认原子组件展示配置。

```ts
export type ChatSenderUi = Omit<
  SenderProps,
  'modelValue' | 'defaultValue' | 'loading' | 'disabled' | 'defaultActions'
> & {
  defaultActions?: ChatSenderDefaultActions
}

export interface ChatUi {
  layout?: ChatLayoutUi
  history?: Omit<HistoryProps, 'data' | 'selected'>
  bubbleProvider?: Omit<BubbleProviderProps, 'store'>
  bubbleList?: Omit<BubbleListProps, 'messages'>
  welcome?: WelcomeProps
  prompts?: Omit<PromptsProps, 'items'> & {
    items?: PromptProps[]
  }
  sender?: ChatSenderUi
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

## 7. TrChat 默认装配

当前默认结构：

```txt
TrChat
  -> TrLayout
    -> header: Header
    -> left-aside: Conversations
    -> main: Messages
    -> footer: Sender
    -> ProxyScrollbar / ScrollToBottom
```

当前映射关系：

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

内部适配：

- `Conversations.vue` 在内部把 `ChatConversationItem` 适配为 `HistoryDisplayItem`
- `Messages.vue` 在内部把 `ChatMessageItem` 适配为 `BubbleDisplayMessage`

## 8. Runtime 接入路径

### 8.1 useLocalChatRuntime

新项目快速入口。

```txt
useLocalChatRuntime
  -> useConversation
  -> useKitChatRuntime
  -> ChatRuntime
```

职责：

- 创建 `useConversation()`
- 首条消息发送前自动创建会话
- 标题 fallback
- 错误捕获
- 组合最终 `ChatRuntime`

不负责：

- 输入草稿
- 发送成功后清空输入
- Prompt 回填

### 8.2 useKitChatRuntime

已有 kit runtime 迁移入口。

适用场景：

- 用户已经持有 `useConversation()` 返回值
- 用户只想把旧 UI 切换到 `TrChat`
- 用户不想重建已有 transport、storage、plugins

`useKitChatRuntime()` 只做 kit 到 `ChatRuntime` 的映射。

### 8.3 自定义 ChatRuntime

用户外部数据层接入入口。

适用场景：

- AI SDK
- Pinia
- 自研 store
- 老系统数据层
- 只想复用 TinyRobot UI

链路：

```txt
用户数据层
  -> ChatRuntime adapter
    -> TrChat
```

要求：

- 用户自己负责请求、stream、abort、错误处理
- 用户保证数据符合 `ChatRuntime` 契约
- 默认 UI 所需的 `History / BubbleList` 形态由 `chat` 内部 adapter 负责
- `TrChat` 不关心外部 runtime 内部实现

## 9. Slots

`TrChat` 通过 slots 做轻量区域替换。

slot 按布局区域命名，不按默认组件命名。

| slot | 默认内容 | 用途 |
| --- | --- | --- |
| `header` | `Header` | 扩展或替换顶部区域 |
| `left-aside` | `Conversations` | 扩展或替换会话列表区域 |
| `main` | `Messages` | 扩展或替换消息区域 |
| `footer` | `Sender` | 扩展或替换输入区域 |

规则：

- 使用默认区域时，对应 `ui.xxx` 生效
- 覆盖某个 slot 后，该区域对应的 `ui.xxx` 不再保证生效
- slot props 只暴露该区域必要状态和动作
- 深度重组直接使用 `components + kit`

稳定 slot props：

- `header`: `ChatHeaderSlotProps`
- `left-aside`: `ChatHistorySlotProps`
- `main`: `ChatMainSlotProps`
- `footer`: `ChatFooterSlotProps`

## 10. Context

内部 context 结构：

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

## 11. 文件结构

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

- `components/*` 是内部实现，不作为 v1 public API
- public API 从 `src/index.ts` 显式导出
- 不导出白盒命名空间组件作为 v1 稳定入口

## 12. 未来扩展边界

这里只保留当前已经确认的边界，不展开未来方案论证。

- `ChatRuntime` 继续保持瘦，只承接会话、消息、请求生命周期
- 复杂发送上下文优先走中性协议扩展，不直接写业务字段
- 复杂消息渲染优先走 `parts / metadata` 这类中性消息扩展口
- 如果未来真实场景稳定重复，再考虑新增独立 capability/adapters 层

更完整的原因、触发条件和候选形态，统一放在 [evolution-path.md](./evolution-path.md)。
