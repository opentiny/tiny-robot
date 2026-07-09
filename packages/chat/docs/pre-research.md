# TinyRobot Chat 预研结论

## 1. 一句话结论

`@opentiny/tiny-robot-chat` 是基于 `components + kit` 的 AI 会话应用装配层。

推荐方案：

```txt
TrChat + ChatRuntime + ChatComposer + ChatUi + slots
```

四层职责：

| 层 | 职责 |
| --- | --- |
| `ChatRuntime` | 会话、消息、请求生命周期 |
| `ChatComposer` | 输入草稿、Prompt 回填、提交禁用、成功后清空 |
| `ChatUi` | 原子组件展示配置 |
| `slots` | 轻量区域替换 |

核心修正：

```txt
sender 输入草稿不属于 ChatRuntime。
```

## 2. 产品目标

`chat` 解决的是“快速交付一个 AI 会话应用”，不是让用户继续手动拼 `Layout / History / Sender / BubbleList / Welcome / Prompts`。

目标能力：

- 一行组件接入完整会话应用。
- 复用 `components` 原子组件。
- 复用 `kit` runtime 能力。
- 支持用户已有数据层，只接入 TinyRobot UI。
- 通过 `ui` 配置默认组件展示。
- 通过 slots 替换局部区域。

## 3. 用户接入路径

用户只需要判断会话、消息、请求生命周期归谁管理。

| 状态归属 | 入口 | 适用场景 |
| --- | --- | --- |
| TinyRobot kit | `useLocalChatRuntime()` | 新项目，快速接入官方 kit 能力 |
| TinyRobot kit | `useKitChatRuntime()` | 已有 `useConversation()`，只迁移 UI |
| 用户外部数据层 | 实现 `ChatRuntime` | AI SDK / Pinia / 自研 store / 老系统 |

链路：

```txt
TinyRobot kit -> ChatRuntime -> TrChat
用户外部数据层 -> ChatRuntime -> TrChat
```

其中 `useKitChatRuntime()` 不是第三种 runtime 模型，只是已有 kit 项目的迁移 adapter。

## 4. 核心 API

```vue
<script setup lang="ts">
const runtime = useLocalChatRuntime({
  useMessageOptions: {
    responseProvider,
  },
})

const ui = {
  sender: {
    placeholder: '请输入问题',
  },
  bubbleList: {
    autoScroll: true,
  },
}
</script>

<template>
  <TrChat :runtime="runtime" :ui="ui" />
</template>
```

## 5. 边界设计

### 5.1 Runtime

`ChatRuntime` 是 UI adapter 协议，不是底层 runtime 协议。

```txt
runtime state -> UI
UI event -> runtime actions
```

它只负责：

- 会话列表。
- 当前会话。
- 消息列表。
- 请求状态。
- 发送。
- 取消。
- 会话创建、切换、重命名、删除。

它不负责：

- 输入框草稿值。
- Prompt 回填输入框。
- 空输入时禁用提交按钮。
- 发送成功后清空输入框。

### 5.2 Composer

`ChatComposer` 是 `TrChat` 内部的最小输入交互状态。

MVP 不把它设计成完整 public runtime，只作为内部 context 使用。

它负责：

- `inputValue`
- `setInputValue`
- `submitDisabled`
- `send`
- `abort`

发送链路：

```txt
TrSender submit
  -> composer.send(payload)
    -> runtime.actions.send(payload)
    -> 成功后清空 composer.inputValue
```

### 5.3 UI

`ChatUi` 只配置默认原子组件展示。

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

`ui` 不接管数据源字段。

| 组件 | 不能通过 `ui` 配置 |
| --- | --- |
| `TrHistory` | `data / selected` |
| `TrBubbleList` | `messages` |
| `TrSender` | `modelValue / defaultValue / loading / disabled` |

## 6. 竞品参考结论

本次只保留对架构和 API 有直接参考意义的对象。

| 产品 | 参考价值 | 对我们的结论 |
| --- | --- | --- |
| assistant-ui | runtime/UI 解耦、LocalRuntime、ExternalStoreRuntime、ComposerRuntime | `ChatRuntime` 解耦数据层，`ChatComposer` 管输入交互 |
| Vercel AI SDK UI | transport、stream、error 状态归 runtime | `TrChat` 不接管 transport |
| Ant Design X | AI 组件按 Bubble/Sender/Conversations 组织 | `ui` 按原子组件名作为 key |

assistant-ui 对我们的启发：

```txt
UI components -> runtime context -> backend / LLM
```

转译到 TinyRobot：

```txt
assistant-ui LocalRuntime
  -> TinyRobot kit + ChatRuntime adapter

assistant-ui ExternalStoreRuntime
  -> 用户外部数据层 + ChatRuntime adapter

assistant-ui ComposerRuntime
  -> TinyRobot Chat 内部最小 ChatComposer
```

## 7. MVP 范围

MVP 做这些能力：

| 能力 | 说明 |
| --- | --- |
| `TrChat` | 默认完整聊天应用 |
| `ChatRuntime` | 数据层 adapter 协议 |
| 内部 `ChatComposer` | 输入交互状态 |
| `useLocalChatRuntime` | kit 新项目快速入口 |
| `useKitChatRuntime` | 已有 kit runtime 迁移入口 |
| external runtime demo | 验证只接 UI 层 |
| `ui` 配置 | 按原子组件名配置展示 |
| slots | 轻量替换区域 |

MVP 不做：

- 完整 public `ComposerRuntime`。
- 全局 store。
- 事件队列。
- 白盒命名空间组件。
- 新 transport 协议。

## 9. 最终建议

v1 收敛为：

```txt
TrChat 黑盒入口 + ChatRuntime + 内部 ChatComposer + ChatUi + slots
```

这样可以做到：

- 默认接入足够简单。
- 已有 kit runtime 迁移时不需要额外传 UI 输入状态。
- external runtime 只需要适配消息、会话和请求生命周期。
- `ui` 继续贴近现有原子组件文档。
- 不维护第二套白盒区域组件体系。

## 10. 参考链接

- assistant-ui Architecture: https://www.assistant-ui.com/docs/architecture
- assistant-ui Runtime architecture: https://www.assistant-ui.com/docs/runtimes/concepts/architecture
- assistant-ui Picking a runtime: https://www.assistant-ui.com/docs/runtimes/pick-a-runtime
- assistant-ui LocalRuntime: https://www.assistant-ui.com/docs/runtimes/custom/local-runtime
- assistant-ui ExternalStoreRuntime: https://www.assistant-ui.com/docs/runtimes/custom/external-store
- assistant-ui ComposerRuntime: https://www.assistant-ui.com/docs/api-reference/runtimes/composer-runtime
- Vercel AI SDK UI Overview: https://ai-sdk.dev/docs/ai-sdk-ui/overview
- Vercel AI SDK UI Transport: https://ai-sdk.dev/docs/ai-sdk-ui/transport
- Ant Design X Overview: https://x.ant.design/components/overview/
- Ant Design X Bubble: https://x.ant.design/components/bubble/
- Ant Design X Sender: https://x.ant.design/components/sender/
