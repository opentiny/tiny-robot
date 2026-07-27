# TrChat 抽象与迁移设计

## 1. 文档目的

本文记录 TrChat 如何从 Basic 单文件实现中识别真实职责、评审事件边界、完成最小抽取，并通过不同 Runtime 场景验证复用。

本文不是最终 API 清单。最终协议定义见 [architecture.md](./architecture.md)，待评审决策见 [review-checklist.md](./review-checklist.md)。

本次设计采用三步演进法：

```txt
1. 先用原子组件在一个 SFC 中实现完整功能
2. 再从真实代码中抽取可以简化使用的稳定职责
3. 最后把抽取结果放到新场景中验证是否真正可复用
```

这样做的原因是：最终的 `TrChat` 用法虽然很短，但内部隐藏了状态管理、事件连接、响应式传递和组件适配。如果先展示最终结果，很难说明每一层抽象为什么存在，也容易根据未来设想提前设计 API。

## 2. 第一步：建立 Basic 单文件基线

[basic.vue](../demo/cases/basic.vue) 不使用 `TrChat`、Runtime adapter 或共享业务 composable，直接组合以下原子组件：

```txt
TrLayout
├─ TrHistory
├─ TrWelcome / TrPrompts
├─ TrBubbleProvider / TrBubbleList
└─ TrSender
```

Basic 的目标不是提供推荐用法，而是完整暴露一个聊天应用实际需要处理的内容。后续每个协议字段都应能追溯到这里的真实需求。

### 2.1 页面源状态

Basic 自己维护四组状态：

| 状态域 | Basic 状态 |
|---|---|
| 会话 | `sessions`、`currentSessionId`、`messagesBySession` |
| 请求 | `requestState`、`processingState`、`error` |
| 输入 | `inputValue`、`loading`、`submitDisabled` |
| 布局 | `isMobile`、`leftAsideOpen` |

### 2.2 页面动作

Basic 直接实现所有业务动作：

```txt
createConversation
switchConversation
renameConversation
deleteConversation
send
abort
setInputValue
```

`send` 同时负责首次建会话、追加用户消息、创建回复占位、维护请求状态、处理取消和收敛错误。它展示了抽象前发送链路的完整复杂度。

### 2.3 原子组件适配

页面通过 computed 将状态和 handler 组装为组件 props：

```txt
historyProps
promptsProps
bubbleListProps
senderProps
layoutProps
```

这一层既包含展示配置，也包含事件监听。Basic 中事件函数定义在 computed 外部，不使用 `markRaw`，布局变化也不依赖 `:key` 重建组件。

### 2.4 Basic 提供的抽象证据

从 Basic 可以识别出四类不同职责：

```txt
业务状态与业务动作     -> Runtime 候选
输入区域临时状态       -> Composer 候选
组件展示配置与事件通知 -> ChatUi 候选
页面结构与组件连接     -> TrChat 候选
```

这里还不能直接得出最终 API。首先需要检查原子事件如何连接业务动作，以及抽取后是否会产生重复调用或反向依赖。

## 3. 从 Basic 发现的问题

### 3.1 业务动作和 UI 通知容易混淆

以 History 点击为例，单文件中只需要一个 handler：

```txt
item-click -> switchConversation
```

抽取后，业务侧还可能希望监听点击事件。如果 `onItemClick` 也负责切换会话，就会产生两个状态修改入口：

```txt
runtime.actions.switchConversation
ui.history.onItemClick
```

这会导致重复切换，并让 Runtime 反向依赖 UI 配置。

### 3.2 `v-bind` 和显式事件可能重复执行

如果 `ChatUi` 中的 `onSubmit`、`onItemClick` 直接进入 `v-bind`，包装组件又显式声明 `@submit`、`@item-click`，同一事件可能走两套监听链路。

因此内部组件不能依赖 Vue 自动合并 listeners，必须先从展示 props 中排除 listener，再由明确的 handler 组合内部动作和外部通知。

### 3.3 computed 配置暴露了 Context 响应式问题

父组件可能使用：

```ts
const ui = computed<ChatUi>(() => ({
  layout: {
    leftAside: {
      mode: isMobile.value ? 'drawer' : 'dock',
    },
  },
}))
```

如果 Context 保存的是首次 `props.ui` 或 `props.runtime`，computed 返回新对象后，内部组件仍然读取旧配置。通过 `:key` 强制重建只能暂时让界面更新，同时会清空 Composer 草稿并掩盖根因。

### 3.4 TrHistory 需要稳定 item identity

TrHistory 的行内重命名状态依赖当前 item 对象。每次 computed 都创建全新对象时，正在编辑的 item 会失去 identity，导致编辑状态退出。

这个问题属于 TrHistory 的 UI 适配约束，不应该进入 Kit 或公共 Runtime。

### 3.5 内部展示类型不能泄漏

History 和 Bubble 需要内部展示对象，但外部 listener 应收到 `ChatConversationInfo`、`ChatMessageItem` 等公共协议类型，不能收到 `HistoryDisplayItem` 或 `BubbleDisplayMessage`。

## 4. 事件模型评审

### 4.1 事件方向

最终事件方向确定为：

```txt
原子组件 emit
  -> TrChat 内部事件适配
    -> Runtime/Composer 执行默认动作
    -> ChatUi.onXxx 通知业务侧
```

Runtime 不监听 ChatUi。否则数据层会反向依赖 UI，破坏 Runtime adapter 的迁移价值。

### 4.2 事件矩阵

| 原子事件 | 内部动作 | 外部通知 | Payload |
|---|---|---|---|
| History `item-click` | `switchConversation` | `onItemClick` | `ChatConversationInfo` |
| History `item-title-change` | `renameConversation` | `onItemTitleChange` | `title + ChatConversationInfo` |
| History `item-action` | 当前识别 delete 等默认动作 | `onItemAction` | `action + ChatConversationInfo` |
| Sender `update:modelValue` | `setInputValue` | 无独立通知 | `string` |
| Sender `submit` | `internal send -> runtime.actions.send` | `onSubmit` | `ChatSubmitPayload` |
| Sender `cancel` | `internal abort` | `onCancel` | 无 |
| Sender `input` | 无 Runtime action | `onInput` | `string` |
| Sender `focus/blur` | 无 Runtime action | `onFocus/onBlur` | `FocusEvent` |
| Sender `clear` | 输入值由组件双向更新 | `onClear` | 无 |
| Prompt `item-click` | `composer.setInputValue` | `onItemClick` | `MouseEvent + PromptProps` |
| Bubble `state-change` | 无 | `onStateChange` | `ChatBubbleStateChangePayload` |
| Bubble `bubble-event` | 无 | `onBubbleEvent` | `ChatBubbleEventPayload` |
| Layout 相关事件 | 无 Runtime action | 对应 Layout listener | Layout detail |

### 4.3 固定规则

事件协议遵守以下规则：

```txt
Runtime action = 唯一业务状态修改入口
ChatUi.onXxx  = 可选 UI 事件通知
内部 action 先触发，外部 listener 后触发
listener 不等待 action 完成，也不能取消默认动作
```

因此 `onSubmit` 表示“用户触发了提交”，不表示发送成功；`onItemClick` 表示“用户点击了会话”，不负责再次调用 `switchConversation`。

需要改变业务行为时，应替换 Runtime action 或使用区域 slot，不通过 `onXxx` 拦截默认动作。MVP 不引入 `beforeXxx`、`afterXxx` 或 cancelable hook。

### 4.4 为什么不需要 `markRaw`

事件函数定义在 computed 外部即可保持函数引用稳定：

```ts
function handleSubmit(payload: ChatSubmitPayload) {
  // UI notification
}

const ui = computed<ChatUi>(() => ({
  sender: {
    onSubmit: handleSubmit,
  },
}))
```

函数不会被 Vue 深度代理。`markRaw` 不能阻止 computed 重新计算，也不能修复 Context 捕获旧对象的问题。它只适合组件定义、第三方实例等不应被代理的对象，不应该包裹整个 `ChatUi`。

## 5. 第二步：从 Basic 抽取 TrChat

事件边界确认后，才开始抽取正式协议。

### 5.1 抽取 ChatRuntime

Basic 中的业务状态和动作被收敛为中性协议：

```ts
interface ChatRuntime {
  conversations: ChatReadable<readonly ChatConversationInfo[]>
  activeConversation: ChatReadable<ChatConversation | null>
  sender: ChatRuntimeSender
  actions: ChatRuntimeActions
}
```

对应关系如下：

| Basic | ChatRuntime |
|---|---|
| `sessions` | `conversations` |
| `currentSessionId + currentSession` | `activeConversation.id` |
| `currentMessages` | `activeConversation.messages` |
| `requestState` | `activeConversation.requestState` |
| `processingState` | `activeConversation.processingState` |
| `error` | `activeConversation.lastError` |
| `send` | `actions.send` |
| `abort` | `actions.abort` |
| 会话 CRUD | conversation actions |

`ChatRuntime` 是 UI 消费的数据和动作协议，不规定底层必须使用 Kit。它也不包含输入草稿和组件 props。

### 5.2 抽取内部输入编排

Basic 中以下输入交互被收敛到内部输入编排：

```txt
inputValue
setInputValue
submitDisabled
发送前清空草稿
发送失败恢复草稿
```

发送链路变为：

```txt
TrSender
  -> internal send(payload)
  -> ChatRuntime.actions.send(payload)
  -> Kit engine / 外部数据层
```

输入草稿属于 UI 临时状态。将它放入 Runtime 会要求所有外部数据层额外维护 Sender 状态，因此 Composer 与 Runtime 必须分开。

### 5.3 抽取 ChatUi

Basic 中的组件 props 和 UI listeners 被收敛为：

```ts
interface ChatUi {
  layout?: ChatLayoutUi
  history?: ChatHistoryUi
  bubbleProvider?: Omit<BubbleProviderProps, 'store'>
  bubbleList?: ChatBubbleListUi
  welcome?: WelcomeProps
  prompts?: ChatPromptsUi
  sender?: ChatSenderUi
}
```

`ChatUi` 可以包含展示配置和事件通知，但不能包含以下 Runtime/Composer 管理的数据：

```txt
messages
current conversation
sender modelValue
loading
业务 actions
```

否则同一状态会同时来自 Runtime 和 ChatUi，形成两个状态源。

### 5.4 抽取默认页面装配

`Chat.vue` 接管 Basic 的稳定页面结构：

```txt
TrLayout
├─ Conversations
├─ Header
└─ Main
   ├─ Messages
   ├─ ScrollToBottom
   └─ Sender
```

默认装配负责常见路径，`header`、`left-aside`、`main`、`footer` 等区域 slot 负责整体替换。这样既能提供开箱即用体验，也不要求高度定制场景重新进入 Runtime 内部。

### 5.5 抽取内部 UI adapter

公共 Runtime 类型不直接等同于原子组件 props：

```txt
ChatConversationInfo -> HistoryDisplayItem -> TrHistory
ChatMessageItem      -> BubbleDisplayMessage -> TrBubbleList
```

`Conversations.vue` 维护按 id 复用的本地可写对象，满足 TrHistory 重命名的稳定引用要求；`Messages.vue` 将中性消息字段映射给 TrBubbleList。内部 adapter 只解决 UI 兼容问题，不改变 Runtime 数据归属。

### 5.6 修复 Context 响应式传递

`Chat.vue` 通过只读 ref 向 Context 提供最新 props：

```ts
const runtime = toRef(() => props.runtime)
const ui = toRef(() => props.ui)
```

内部组件在事件发生时读取 `runtime.value` 和 `ui.value`，内部输入编排也在动作执行时获取当前 Runtime。因此：

- 父组件可以替换整个 `ui` 对象。
- viewport 改变后 computed 配置立即生效。
- 动态替换 Runtime 后使用新的 state 和 actions。
- 不需要 `:key` 重建 TrChat。
- Composer 草稿不会因布局变化丢失。

### 5.7 显式组合 props 和 listeners

History、Sender、Prompts、Bubble 和 Layout adapter 都先从配置中排除 listeners，再通过显式 handler 连接：

```txt
展示 props -> v-bind
原子事件   -> internal handler
internal handler -> Runtime/Composer action + ChatUi listener
```

这保证每个业务事件只有一个状态修改入口，也避免 `v-bind` 和显式事件重复执行。

## 6. Kit adapter 的抽取

Basic 自己实现了会话、消息、请求、取消和错误收敛；Kit 已经具备这些能力，Chat 不应重新实现。

### 6.1 `useKitChatRuntime`

`useKitChatRuntime` 面向已有 Kit `useConversation()` 实例，只做适配：

```txt
conversation.conversations      -> runtime.conversations
conversation.activeConversation -> runtime.activeConversation
active engine.messages          -> activeConversation.messages
engine request state            -> activeConversation.requestState
conversation CRUD          -> runtime.actions
engine.sendMessage         -> runtime.actions.send
```

它不重建 conversation、storage、provider 或 plugins，因此适合已有 Kit 应用只迁移 UI。

### 6.2 `useLocalChatRuntime`

`useLocalChatRuntime` 面向新项目，在 `useKitChatRuntime` 之上增加默认创建策略：

```txt
UseConversationOptions
  -> useConversation
  -> autoSaveMessages
  -> 首次发送自动创建会话
  -> 默认标题策略
  -> useKitChatRuntime
```

两者最终输出同一种 `ChatRuntime`，不是两套协议。

## 7. 第三步：在新场景中验证复用

抽取完成不等于设计成立。必须把同一协议放到不同数据来源中验证。

### 7.1 Built-in Kit：验证简化价值

[built-in-kit.vue](../demo/cases/built-in-kit.vue) 使用：

```txt
useLocalChatRuntime
+ computed<ChatUi>
+ TrChat
```

与 Basic 相比，它不再维护页面结构、会话 Store、输入草稿、请求状态和原子事件桥接，用于证明抽取确实降低了新项目接入成本。

### 7.2 Existing Kit：验证迁移价值

[existing-kit.vue](../demo/cases/existing-kit.vue) 保留已有 `useConversation()`、storage、provider 和生命周期，通过：

```txt
existing conversation
  -> useKitChatRuntime({ conversation })
  -> TrChat
```

接入新 UI。这个场景验证迁移不是重新创建一套 Kit 数据层，而是复用已有实例和持久化数据。

### 7.3 Custom Runtime：验证协议通用性

[custom-runtime.vue](../demo/cases/custom-runtime.vue) 使用非 Kit 数据源实现同一个 `ChatRuntime`，并复用相同的 `TrChat` 和 `ChatUi` 结构。

这个场景用于验证：

- UI 不读取 Kit 实例。
- 事件 payload 不包含 Kit 类型。
- Runtime 实现可以自行决定存储、请求和取消策略。
- 切换数据层不要求修改默认 UI 组件。

### 7.4 三个场景的证明关系

```txt
Basic        -> 证明抽象来自真实复杂度
Built-in Kit -> 证明抽取可以简化新项目
Existing Kit -> 证明已有 Kit 可以只迁移 UI
Custom       -> 证明公共协议不依赖 Kit
```

只有这四个案例共同成立，才能说明 TrChat 不是为单一 Demo 定制的封装。

## 8. 当前验证结果

当前实现已经完成以下验证：

- Demo 仅保留 Basic、Built-in Kit、Existing Kit 和 Custom Runtime。
- Basic 使用 computed 组装 props，不使用 `markRaw` 或 TrChat Runtime adapter。
- `runtime/ui` 通过只读 ref 进入 Context。
- ChatUi listeners 均为可选强类型字段，没有通用 `onXXX: any`。
- 内部 props 和 listeners 分开处理。
- Runtime action 是唯一业务状态修改入口。
- UI listener 收到公共 payload，不暴露内部 DisplayItem。
- TrHistory 重命名使用稳定 item 引用。
- Built-in、Existing、Custom 使用相同 ChatRuntime 和 ChatUi 边界。
- viewport 更新不依赖重建 TrChat。

仍需补充的验证：

- 自动化验证每个事件只执行一次。
- 自动化验证替换整个 `runtime/ui` 对象后使用新状态和 actions。
- Desktop 和 Mobile 下的完整人工回归。
- `structuredData` 在默认 Kit 发送链路中的传递语义。
- system message 存在时 Welcome 的可见消息判断。

## 9. 当前非目标

MVP 暂不引入：

- `beforeXxx/afterXxx` 事件体系。
- cancelable UI listener。
- 全局事件总线。
- Pinia 作为 TrChat 的必要依赖。
- 通用 capability registry。
- 完整消息 renderer registry。
- 将模型、MCP、上传等能力直接平铺进核心 Runtime。

这些能力只有经过实际场景反复验证后，才考虑在 Runtime 之外增加窄的 capability/adapter。

## 10. 评审结论

从 Basic 到 TrChat 的演进结果是：

```txt
Basic 单文件
├─ 业务状态与动作       -> ChatRuntime
├─ 输入区域临时状态     -> internal input controller
├─ 原子组件配置与通知   -> ChatUi
└─ 页面布局与事件适配   -> TrChat
```

事件模型最终确定为：

```txt
原子组件 emit
  -> TrChat internal handler
    -> Runtime/Composer action
    -> ChatUi listener
```
