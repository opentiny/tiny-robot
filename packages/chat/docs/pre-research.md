# TinyRobot Chat 预研方案

## 1. 结论先行

`@opentiny/tiny-robot-chat` 定位为基于 `components + kit` 的 AI 会话应用装配层。

推荐主线：

```txt
TrChat + runtime + ui + slots
```

其中：

- `runtime` 负责数据、动作、请求生命周期。
- `ui` 负责原子组件级展示配置。
- `slots` 负责轻量区域替换。
- 深度定制直接使用 `components + kit`。

核心 API：

```vue
<script setup lang="ts">
const runtime = useManagedChatRuntime({
  useConversationOptions: {
    useMessageOptions: {
      responseProvider,
    },
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

## 2. 产品目标

`chat` 套件要解决的是“快速交付一个 AI 会话应用”的问题，而不是让用户继续从 `Layout / History / Sender / BubbleList / Welcome / Prompts` 手工拼完整页面。

目标能力：

- 一行组件接入完整会话应用。
- 复用已有 `components` 原子组件，复用已有 `kit` runtime 能力。
- ui 和 runtime 分离，支持用户已有 runtime，只接入 TinyRobot UI。
- 通过 `ui` 配置原子组件展示。
- 通过 slots 替换局部区域。

## 3. 基础能力来源

### 3.1 components

| 组件 | chat 中的职责 |
| --- | --- |
| `TrLayout` | 应用布局 |
| `TrLayout.ProxyScrollbar` | 主区滚动条代理 |
| `TrHistory` | 会话列表 |
| `TrBubbleProvider` | 消息渲染配置 |
| `TrBubbleList` | 消息列表 |
| `TrWelcome` | 空消息欢迎态 |
| `TrPrompts` | 推荐问题 |
| `TrSender` | 输入、提交、取消生成 |

### 3.2 kit

| 能力 | chat 中的职责 |
| --- | --- |
| `useMessage` | 单会话消息发送、流式响应、停止生成 |
| `useConversation` | 多会话创建、切换、删除、标题更新 |
| `responseProvider` | 请求和流式响应入口 |
| plugin lifecycle | 插件生命周期 |
| storage | 会话持久化 |

最终链路：

```txt
kit runtime -> ChatRuntime -> TrChat
external runtime -> ChatRuntime -> TrChat
```

## 4. 竞品参考结论

本次预研只保留对架构和 API 有直接参考意义的对象。

| 产品 | 参考价值 | 对我们的结论 |
| --- | --- | --- |
| assistant-ui | runtime/UI 解耦、managed/external runtime | `ChatRuntime` 作为 UI adapter 协议 |
| Vercel AI SDK UI | transport、stream、error 状态归 runtime | `TrChat` 不接管 transport |
| Ant Design X | AI 组件按 Bubble/Sender/Conversations 等组件组织 | `ui` 应以原子组件名作为 key |

补充观察：

- CopilotKit 偏 agent platform，只参考“预制入口要产品化”。
- AI Elements 偏 UI blocks，我们已有 `components`，不作为主线。
- AG-UI 是协议层，当前不进入方案主线。

## 5. assistant-ui 对我们的启发

assistant-ui 的核心思想是：

```txt
UI components -> runtime context -> backend / LLM
```

它的 runtime 分成两类：

- `LocalRuntime`：库内部管理状态。
- `ExternalStoreRuntime`：用户自己的 store 管状态，库只适配 UI。

转译到 TinyRobot：

```txt
assistant-ui runtime
  -> TinyRobot kit + ChatRuntime adapter

assistant-ui Thread
  -> TrChat

assistant-ui ExternalStoreRuntime
  -> external ChatRuntime
```

结论：

```txt
TinyRobot Chat 对齐 assistant-ui 的 runtime/UI 解耦思想。
但实现必须基于 TinyRobot components 和 kit，不复制 assistant-ui primitives。
```

## 6. API 设计

### 6.1 主入口

推荐：

```vue
<TrChat :runtime="runtime" :ui="ui" />
```

`runtime / ui` 边界：

| 参数 | 职责 |
| --- | --- |
| `runtime` | 数据、动作、请求生命周期 |
| `ui` | 原子组件展示配置 |

`v1` 不额外引入 `behavior` 对象。

原因：

- 目前 chat 应用行为项还不多。
- 现在引入新概念会增加心智成本。
- 少量 chat 行为优先使用内置默认规则，必要时再补充少量顶层 props。

### 6.2 UI 配置

`ui` 以原子组件名作为 key，以组件 props 作为 value。

推荐结构：

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

这样设计的原因：

- 用户看 `Sender` 文档，就知道配置 `ui.sender`。
- 用户看 `BubbleList` 文档，就知道配置 `ui.bubbleList`。
- 不需要理解额外的区域抽象。
- 从原子组件迁移到 `TrChat` 的成本更低。

### 6.3 Runtime 协议

`ChatRuntime` 是 UI adapter 协议。

```txt
runtime.state -> UI
UI event -> runtime.actions
```

基本结构：

```ts
export interface ChatRuntime {
  conversations?: ChatRuntimeConversations
  messages: ChatRuntimeMessages
  sender: ChatRuntimeSender
  actions: ChatRuntimeActions
}
```

约束：

- state 只读。
- 修改必须走 `actions`。
- UI 不直接调用 transport。
- UI 不直接依赖 kit 原始返回结构。

### 6.4 Runtime 接管字段

以下字段由 `runtime` 接管，不能通过 `ui` 配置：

| 组件 | runtime 接管字段 |
| --- | --- |
| `TrHistory` | `data / selected` |
| `TrBubbleList` | `messages` |
| `TrSender` | `modelValue / defaultValue / loading / disabled` |

原因：

```txt
同一状态只能有一个来源。
```

## 7. Slot 设计

`TrChat` 提供区域 slots，用于轻量替换默认区域。

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
- slot 适合轻量替换，不适合深度重组。
- 深度重组直接使用 `components + kit`。

示例：

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

## 8. MVP 范围

MVP 做这些能力：

| 能力 | 说明 |
| --- | --- |
| `TrChat` | 默认完整聊天应用 |
| `ChatRuntime` | UI adapter 协议 |
| `useManagedChatRuntime` | 基于 kit 创建 runtime |
| external runtime demo | 验证只接 UI 层 |
| `ui` 配置 | 按原子组件名配置展示 |
| slots | 轻量替换区域 |

MVP 接入组件：

- `TrLayout`
- `TrHistory`
- `TrBubbleProvider`
- `TrBubbleList`
- `TrWelcome`
- `TrPrompts`
- `TrSender`
- `TrLayout.ProxyScrollbar`

MVP 验证链路：

```txt
输入 -> 发送 -> 流式响应 -> 停止生成 -> 消息展示 -> 会话切换 -> 新会话
```

## 9. 开发前需要确认

| 项 | 推荐结论 |
| --- | --- |
| 产品定位 | `chat = application assembly + UI adapter` |
| 主 API | `<TrChat :runtime="runtime" :ui="ui" />` |
| UI 命名 | 按原子组件名作为 key |
| runtime 边界 | `ChatRuntime` 是 UI adapter |
| transport 边界 | 归 `kit` 或 external runtime |
| 定制方式 | `ui + slots` |
| 深度定制 | 直接使用 `components + kit` |

## 10. 当前方案仍需讨论的问题

- `ui.layout` 是否应该直接等于 `LayoutProps`，还是只开放 chat 需要的 layout 配置。
- 覆盖 slot 后，是否需要暴露完整 slot props，还是只暴露最小动作集合。
- `Prompts.items` 属于静态 UI 配置，还是应允许 runtime 动态提供。
- `ScrollToBottom / ProxyScrollbar` 是否始终内置。
- external runtime 是否进入 v1 正式文档，还是先只作为 demo 验证。

## 11. 最终建议

推荐 v1 收敛为：

```txt
TrChat 黑盒入口 + runtime + 按组件命名的 ui + slots。
```

这样可以做到：

- API 更贴近现有组件文档。
- 用户迁移成本更低。
- 边界更清楚。
- 不需要维护第二套区域组件体系。

## 12. 参考链接

- assistant-ui Architecture: https://www.assistant-ui.com/docs/architecture
- assistant-ui Picking a runtime: https://www.assistant-ui.com/docs/runtimes/pick-a-runtime
- Vercel AI SDK UI Overview: https://ai-sdk.dev/docs/ai-sdk-ui/overview
- Vercel AI SDK UI Transport: https://ai-sdk.dev/docs/ai-sdk-ui/transport
- Ant Design X Overview: https://x.ant.design/components/overview/
- Ant Design X Bubble: https://x.ant.design/components/bubble/
- Ant Design X Sender: https://x.ant.design/components/sender/
- CopilotKit Architecture: https://docs.copilotkit.ai/concepts/architecture
- CopilotKit Prebuilt Components: https://docs.copilotkit.ai/prebuilt-components
- AI Elements: https://elements.ai-sdk.dev/
- AG-UI Overview: https://docs.ag-ui.com/introduction
