# TinyRobot Chat 套件架构方案

## 1. 定位

`@opentiny/tiny-robot-chat` 是基于 `components + kit` 的 AI 会话应用装配层。

核心目标：

- 通过 `TrChat` 快速接入完整会话应用。
- 复用 `packages/components` 的原子组件能力。
- 复用 `packages/kit` 的 runtime 能力。
- 支持用户已有数据层，只接入 TinyRobot 新 UI。
- 通过 `ui` 配置原子组件展示。
- 通过 slots 替换局部区域。

核心链路：

```txt
kit runtime -> ChatRuntime -> TrChat
external runtime -> ChatRuntime -> TrChat
```

## 2. 分层

```txt
packages/components
  -> UI primitives：Layout / History / BubbleList / Welcome / Prompts / Sender

packages/kit
  -> runtime core：message / conversation / stream / abort / plugin / storage

packages/chat
  -> application assembly + UI adapter
```

`chat` 只做两件事：

- 定义 `ChatRuntime`，把 kit 或外部数据层适配成 UI 可消费协议。
- 定义 `TrChat`，把现有原子组件装配成完整会话应用。

## 3. Public API

v1 稳定入口：

- `TrChat`
- `useManagedChatRuntime`
- `ChatRuntime`
- `ChatUi`
- `ChatSubmitPayload`

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

`ChatRuntime` 是 UI adapter 协议，不是底层 runtime 协议。

```txt
runtime.state -> UI
UI event -> runtime.actions
```

推荐类型：

```ts
import type { ComputedRef, Ref } from 'vue'
import type { BubbleMessage } from '@opentiny/tiny-robot/components/bubble'
import type { HistoryItem } from '@opentiny/tiny-robot/components/history'
import type { StructuredData } from '@opentiny/tiny-robot/components/sender'
import type { RequestProcessingState, RequestState } from '@opentiny/tiny-robot-kit/vue'

type ChatReadable<T> = Readonly<Ref<T>> | ComputedRef<T>

export type ChatConversationItem = HistoryItem & {
  id: string
  createdAt?: number
  updatedAt?: number
  metadata?: Record<string, unknown>
}

export type ChatMessageItem = BubbleMessage

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
  inputValue: ChatReadable<string>
  disabled: ChatReadable<boolean>
  loading: ChatReadable<boolean>
  submitDisabled: ChatReadable<boolean>
}

export interface ChatSubmitPayload {
  text: string
  structuredData?: StructuredData
}

export interface ChatRuntimeActions {
  setInputValue: (value: string) => void
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

- state 只读。
- 修改必须走 `runtime.actions`。
- UI 不直接调用 transport。
- UI 不直接依赖 kit 原始返回结构。
- `ChatConversationItem.id` 在 chat 内部必须稳定存在。
- `ChatConversationItem.title` 需要在 adapter 层兜底。

## 5. ChatUi

`ChatUi` 只负责配置默认原子组件的展示能力。

它以原子组件名作为 key，以组件 props 作为 value。

```ts
export interface ChatUi {
  layout?: ChatLayoutUi
  history?: Omit<HistoryProps<ChatConversationItem>, 'data' | 'selected'>
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

runtime 接管字段不能通过 `ui` 配置：

| 组件 | runtime 接管字段 |
| --- | --- |
| `TrHistory` | `data / selected` |
| `TrBubbleList` | `messages` |
| `TrSender` | `modelValue / defaultValue / loading / disabled` |

原则：

```txt
同一状态只能有一个来源。
```

## 6. Managed Runtime

`useManagedChatRuntime` 是官方推荐 runtime 创建入口。

内部链路：

```txt
useConversation
  -> useKitChatRuntime
  -> useManagedChatRuntime
  -> ChatRuntime
```

`useKitChatRuntime` 职责：

- `ConversationInfo[] -> ChatConversationItem[]`
- `activeConversationId -> conversations.currentId`
- `activeConversation.engine.messages -> messages.items`
- `activeConversation.engine.requestState -> messages.requestState`
- `activeConversation.engine.processingState -> messages.processingState`
- `activeConversation.engine.isProcessing -> sender.loading`

`useManagedChatRuntime` 职责：

- 创建并持有 `useConversation`。
- 管理 `sender.inputValue`。
- 维护 `messages.lastError`。
- 首条消息发送前自动创建会话。
- 标题归一化。
- 组合最终 `ChatRuntime`。

推荐行为：

- `sender.loading = activeConversation.engine.isProcessing`。
- `sender.submitDisabled = disabled || loading || inputValue.trim().length === 0`。
- `send(payload)` 成功触发后清空输入。
- `send(payload)` 在无 active conversation 时先创建会话。
- `abort()` 调用当前会话 engine 的 abort 能力。

## 7. External Runtime

外部 runtime 是正式能力。

适用场景：

- 用户已有后端数据层。
- 用户已有 Pinia / composable / 自研请求层。
- 用户已有旧版 tiny-robot 接入，但想升级 TinyRobot 新 UI。
- 用户不想使用 `kit`，只想复用 `TrChat` 应用 UI。

接入方式：

```txt
用户数据层
  -> external ChatRuntime adapter
    -> TrChat
```

要求：

- 外部 runtime 自己负责请求、stream、abort、错误处理。
- 外部 runtime 保证数据符合 `HistoryItem / BubbleMessage` 契约。
- `TrChat` 只消费 `ChatRuntime`，不关心外部 runtime 内部实现。

## 8. TrChat 装配

`TrChat` 负责默认完整应用装配。

默认结构：

```txt
TrChat
  -> TrLayout
    -> header
    -> left-aside: TrHistory
    -> main: TrBubbleProvider + TrBubbleList / TrWelcome / TrPrompts
    -> footer: TrSender
    -> ProxyScrollbar / ScrollToBottom
```

默认映射：

| runtime | component |
| --- | --- |
| `runtime.conversations.items` | `TrHistory.data` |
| `runtime.conversations.currentId` | `TrHistory.selected` |
| `runtime.messages.items` | `TrBubbleList.messages` |
| `runtime.sender.inputValue` | `TrSender.modelValue` |
| `runtime.sender.loading` | `TrSender.loading` |
| `runtime.sender.disabled` | `TrSender.disabled` |
| `runtime.sender.submitDisabled` | `TrSender.defaultActions.submit.disabled` |
| `runtime.actions.setInputValue` | `TrSender update:modelValue` |
| `runtime.actions.send` | `TrSender submit` |
| `runtime.actions.abort` | `TrSender cancel` |
| `runtime.actions.switchConversation` | `TrHistory item-click` |
| `runtime.actions.renameConversation` | `TrHistory item-title-change` |
| `runtime.actions.deleteConversation` | `TrHistory item-action(delete)` |

## 9. Slots

`TrChat` 通过 slots 做轻量替换，不提供第二套白盒区域组件体系。

slot 命名按 `TrLayout` 的布局区域来，而不是按默认组件来。

原因：

- slot 解决的是布局插入点问题。
- 一个区域里不一定只放一个默认组件。
- `ui` 继续按组件名配置，`slots` 按布局区域命名，职责更清楚。

建议 slots：

| slot | 默认内容 | 用途 |
| --- | --- | --- |
| `header` | 默认标题栏 | 扩展或替换顶部区域 |
| `left-aside` | `TrHistory` | 扩展或替换会话列表区域 |
| `main` | `TrBubbleProvider + TrBubbleList / TrWelcome / TrPrompts` | 扩展或替换消息区域 |
| `footer` | `TrSender` | 扩展或替换输入区域 |

规则：

- 使用默认区域时，对应 `ui.xxx` 生效。
- 覆盖某个 slot 后，该区域对应的 `ui.xxx` 不再保证生效。
- slot props 只暴露最小动作集合。
- 深度重组直接使用 `components + kit`。

建议 slot props：

`header`：

- `title`
- `requestState`
- `processingState`
- `lastError`
- `createConversation`

`left-aside`：

- `items`
- `currentId`
- `switchConversation`
- `renameConversation`
- `deleteConversation`
- `createConversation`

`main`：

- `messages`
- `requestState`
- `processingState`
- `lastError`

`footer`：

- `inputValue`
- `setInputValue`
- `send`
- `abort`
- `disabled`
- `loading`
- `submitDisabled`

## 10. 文件结构

推荐结构：

```txt
packages/chat/
  package.json
  src/
    index.ts
    Chat.vue
    types.ts
    context.ts
    composables/
      useChatContext.ts
      useKitChatRuntime.ts
      useManagedChatRuntime.ts
    components/
      Header.vue
      Conversations.vue
      Messages.vue
      Sender.vue
      ScrollToBottom.vue
```

说明：

- `components/*` 是内部实现组件，不作为 v1 public API 承诺。
- public API 从 `src/index.ts` 显式导出。
- 不导出额外的白盒命名空间组件作为 v1 稳定入口。

导出建议：

```ts
export { default as TrChat } from './Chat.vue'
export { useManagedChatRuntime } from './composables/useManagedChatRuntime'
export type {
  ChatRuntime,
  ChatRuntimeActions,
  ChatRuntimeSender,
  ChatSubmitPayload,
  ChatUi,
} from './types'
```

## 11. 实现顺序

1. 更新类型：`ChatRuntime / ChatRuntimeSender / ChatUi`。
2. 更新 context：只提供 `runtime + ui`。
3. 更新 `useKitChatRuntime`：映射 kit 到 `ChatRuntime`。
4. 更新 `useManagedChatRuntime`：管理输入、错误、首消息建会话。
5. 实现 `TrChat` 默认布局。
6. 实现内部 `Conversations / Messages / Sender / Header` 映射组件。
7. 实现 slots。
8. 实现 managed runtime demo。
9. 实现 external runtime demo。
10. 做类型检查和 demo 构建验证。

## 12. 验证

基础验证：

- `TrChat` 能完成默认会话应用渲染。
- `useManagedChatRuntime` 能完成首条消息自动建会话并发送。
- external runtime 能只接 UI 层。
- `ui.sender` 能配置 `TrSender` 展示。
- `ui.bubbleList` 能配置 `TrBubbleList` 展示。
- 覆盖 slot 后，对应默认组件不再渲染。
- `TrSender submit/cancel` 与 runtime actions 对齐。
- `TrHistory selected/rename/delete` 与 runtime actions 对齐。
- `TrBubbleList` 能消费 runtime messages。

E2E 注意：

```txt
先构建 components 包。
重新构建 components 后，重启测试服务。
```

## 13. 结论

推荐 v1 架构：

```txt
TrChat 黑盒入口 + ChatRuntime + ChatUi + slots。
```

该方案满足：

- 快速接入完整聊天应用。
- 用户已有数据层时只接 TinyRobot UI。
- API 贴近现有原子组件文档。
- 不维护第二套白盒区域组件体系。
- 不和 `kit` 重复建设 runtime、transport、stream 生命周期。
