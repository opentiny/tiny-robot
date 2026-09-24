---
outline: [1, 3]
---

# Chat 聊天界面

`TrChat` 用 Runtime 驱动完整聊天页面；`TrChatUI` 只渲染应用提供的数据并发出用户操作事件。需要自主管理请求与会话时选择前者，已有数据层时选择后者。

## 概览

### 适用场景

- 使用 `TrChat` 快速嵌入会话列表、消息、输入区和模型选择。
- 使用 `TrChatUI` 接入应用已有的会话、消息和请求状态。
- 使用插槽替换局部区域，或注册应用右侧面板。

### 选择组件

| 场景              | 组件       | 应用负责的内容                  |
| ----------------- | ---------- | ------------------------------- |
| 使用 Chat Runtime | `TrChat`   | 提供 Runtime，按需处理转发事件  |
| 已有数据和请求层  | `TrChatUI` | 更新 `data`、处理提交和会话操作 |

`TrChatUI` 是纯界面入口；它不会创建会话、发送请求或持久化数据。`TrChat` 在其基础上连接 Runtime 并处理标准动作。

## 快速开始

安装并在应用入口引入样式：

```bash
pnpm add @opentiny/tiny-robot-chat
```

```ts
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'
```

Chat 的父容器需要有可计算高度。下面的示例使用本地模拟服务，发送后会显示回答。

<demo
  vue="../../demos/chat/basic.vue"
  :vueFiles="[
    '../../demos/chat/basic.vue',
    '../../demos/chat/shared/modelProviders.ts'
  ]"
  title="完整聊天页面"
  description="创建 Runtime 后传给 TrChat，完成一次消息发送。"
/>

```vue
<script setup lang="ts">
import { TrChat, useChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'openai',
    apiUrl: '/api',
    models: [{ id: 'assistant', label: '应用助手' }],
  },
]

const runtime = useChatRuntime({ modelProviders })
</script>

<template>
  <main class="chat-page">
    <tr-chat :runtime="runtime" />
  </main>
</template>
```

生产环境应通过 BFF 保存长期密钥。Runtime 配置见 [Chat 运行时](./chat-runtime#模型服务)。

## 用法示例

### 页面状态

`TrChatUI` 根据 `data` 渲染状态。示例可切换空会话、请求中、消息错误和禁用状态；应用持有并更新这些数据。

<demo
  vue="../../demos/chat/ui-states.vue"
  :vueFiles="['../../demos/chat/ui-states.vue']"
  title="界面状态"
  description="切换 data 中的请求和输入状态，观察界面反馈。"
/>

`data.sender.loading` 控制发送中的反馈，`disabled` 和 `submitDisabled` 分别禁用输入或提交。`data.request.state` 只表达请求生命周期；可展示的错误属于具体消息，放在该 assistant 消息的 `state.error` 中。

### 在所属消息中展示错误

`useChatRuntime` 默认把请求错误规范化到本轮最后一条 assistant 消息的 `state.error`。Bubble 在正常消息内容之后渲染错误，因此错误会保持所属消息的头像、顺序和布局；请求失败仍会让 `request.state` 进入 `error`。

<demo
  vue="../../demos/chat/runtime-error.vue"
  :vueFiles="['../../demos/chat/runtime-error.vue']"
  title="消息级请求错误"
  description="使用确定性本地 Provider 反复触发失败与成功，观察默认错误气泡和动作失败通知。"
/>

错误状态的职责如下：

| 状态或通知             | 管理方           | 用途                                                               |
| ---------------------- | ---------------- | ------------------------------------------------------------------ |
| `message.state.error`  | Runtime 或应用   | 保存并展示属于这条消息的错误详情。                                 |
| `request.state`        | Runtime 或应用   | 表达 idle、processing、completed、aborted、error 等请求生命周期。  |
| `runtime-action-error` | `TrChat`         | 通知应用某个 Runtime 动作失败，可用于遥测或全局非消息动作反馈。    |
| Bubble 默认错误渲染器  | `BubbleProvider` | 在消息内容之后展示错误；不会提供重试按钮，也不改变请求或消息状态。 |

默认错误元素使用 `role="alert"`，长文本会保留换行并在连续字符串中断行，适合窄容器。它使用公开的 `--tr-color-error`、`--tr-color-error-light`、`--tr-bubble-max-width` 和 `--tr-bubble-box-border-radius` 主题变量。需要不同结构时，通过 `ui.bubble.bubbleProvider.errorRenderer` 提供统一的 Provider 级渲染器；不要依赖内部 `.tr-bubble__error` 选择器，也不要把重试等副作用放进纯展示渲染器。

`runtime-action-error` 在 send 失败时仍会发出，但它不是消息错误的数据源。应用可以用它记录遥测；默认页面和综合案例不会再把同一个 send 错误同时显示为顶部提示。会话、模型或 MCP 等非消息动作失败仍适合使用全局反馈。

### 接入外部数据

受控输入时，值由应用持有，收到 `update:input-value` 后必须更新该值。非受控输入使用 `defaultInputValue`，组件在生命周期内维护草稿；两种模式不要切换。

<demo
  vue="../../demos/chat/controlled-ui.vue"
  :vueFiles="['../../demos/chat/controlled-ui.vue']"
  title="受控数据"
  description="应用接收提交事件，更新消息列表、请求状态和输入值。"
/>

`TrChat` 的“新会话”会调用 `runtime.actions.clearActiveConversation()`，不会创建空会话。`TrChatUI` 只触发 `create-conversation`，由应用决定清空当前会话还是立即创建会话。

### 页面布局

通过 `ui` 调整布局和可见区域，不会修改 Runtime 内的模型或 MCP 状态。

```ts
const ui = {
  brand: { name: '研发助手' },
  layout: {
    contentMaxWidth: 960,
    composer: { welcome: 'center' },
    leftAside: { width: 280, defaultOpen: true },
    rightAside: { mode: 'dock', width: 320, resizable: true, minWidth: 280, maxWidth: 480 },
  },
  welcome: { title: '开始一个新问题' },
  sender: { maxLength: 4000, placeholder: '输入消息' },
}
```

常用默认值：

| 配置                                        | 默认值       |
| ------------------------------------------- | ------------ |
| `layout.surface.mode`                       | `'normal'`   |
| `layout.emptyState`                         | `'start'`    |
| `layout.composer.welcome`                   | `'footer'`   |
| `layout.contentMaxWidth`                    | `980`        |
| `layout.panelPadding` / `panelGap`          | `12` / `12`  |
| `layout.leftAside.width` / `collapsedWidth` | `300` / `56` |
| `layout.rightAside.width`                   | `320`        |
| `sender.maxLength`                          | `1000`       |

### 右侧面板

通过 `layout.rightAside.panels` 注册应用面板。`rightAsideOpen` 和 `activeRightAsidePanelId` 同时支持受控值和 `default*` 初始值；受控时应用收到 `update:*` 后更新对应值。

<demo
  vue="../../demos/chat/right-aside-panel.vue"
  :vueFiles="[
    '../../demos/chat/right-aside-panel.vue',
    '../../demos/chat/business-right-aside.vue',
    '../../demos/chat/release-preview.html',
    '../../demos/chat/shared/modelProviders.ts'
  ]"
  title="对话驱动的工作台"
  description="消息操作可以打开发布方案预览和引用资料面板；输入区 MCP 按钮可以打开内置 MCP 面板。"
/>

`mcp` 是内置保留面板 ID，不能在 `panels` 中注册。MCP 激活时直接使用自身的标题和关闭按钮；`layout-right-aside-title` 与 `layout-right-aside-panel` 只作用于应用注册的面板。

### 插槽定制

优先使用局部插槽。`layout-right-aside`、`layout-header`、`layout-left-aside` 和 `layout-main` 会替换整个区域；开发者需要自行实现被替换区域的布局、事件、键盘、焦点和 ARIA 行为。

`layout-main` 保留滚动宿主和滚动控制，`layout-footer` 保留外层 Footer，只替换默认 Sender。`layout-main` 优先于 `layout-empty-state`；自定义空状态需要调用 `renderComposer()` 才会渲染默认输入区。

### 浮动与移动端

`layout.surface.mode: 'floating'` 启用浮动布局。通过 `floatingState` 和 `update:floating-state` 受控位置和尺寸。桌面端 `rightAside.mode: 'dock'` 且 `resizable: true` 时可调整右栏宽度；移动端和 `drawer` 模式不支持调整宽度。视口切换导致侧栏状态变化时，会触发 `*-aside-open-change`，其 `source` 为 `'viewport'`。

## 可访问性与布局约束

- 将 Chat 放入有明确高度的 flex 容器；消息区负责内部滚动。
- 内置图标按钮提供可访问名称。替换 Header、Sender、侧栏或主区后，开发者需要提供等效的名称、键盘操作和焦点管理。
- 宽度不足 `960px` 时，侧栏切换为抽屉。右栏、消息和自定义内容应允许收缩，长内容由区域自身滚动或换行。
- 当前没有另行承诺的 Chat CSS Variable；不要依赖内部 DOM 或 `--tr-chat-ui-*` 变量作为稳定定制入口。

## API

### TrChat Props

| 属性名                                | 说明                                    | 类型                    | 默认值         | 必填 |
| ------------------------------------- | --------------------------------------- | ----------------------- | -------------- | ---- |
| `runtime`                             | 提供会话、Composer 状态和动作。         | `ChatRuntime`           | —              | 是   |
| `ui`                                  | 配置页面布局、文案和区域。              | `ChatUIOptions`         | —              | 否   |
| `title`                               | 覆盖当前会话提供的页面标题。            | `string`                | —              | 否   |
| `history-data`                        | 覆盖 Runtime 会话生成的历史列表或分组。 | `ChatHistoryData`       | —              | 否   |
| `floating-state`                      | 浮动布局的受控位置和尺寸。              | `LayoutFloatingState`   | —              | 否   |
| `right-aside-open`                    | 右栏受控开闭状态。                      | `boolean`               | —              | 否   |
| `default-right-aside-open`            | 非受控右栏初始开闭状态。                | `boolean`               | `false`        | 否   |
| `active-right-aside-panel-id`         | 右栏受控当前面板；应用处理更新事件。    | `ChatRightAsidePanelId` | —              | 否   |
| `default-active-right-aside-panel-id` | 非受控当前面板初始值。                  | `ChatRightAsidePanelId` | 第一个可用面板 | 否   |

### TrChatUI Props

| 属性名                                | 说明                                     | 类型                    | 默认值         | 必填 |
| ------------------------------------- | ---------------------------------------- | ----------------------- | -------------- | ---- |
| `data`                                | 应用提供的展示事实；组件不会修改该对象。 | `ChatUIData`            | 空展示数据     | 否   |
| `ui`                                  | 配置页面布局、文案和区域。               | `ChatUIOptions`         | 默认界面配置   | 否   |
| `input-value`                         | 受控草稿；应用处理更新事件并写回新值。   | `string`                | —              | 否   |
| `default-input-value`                 | 非受控草稿初始值。                       | `string`                | `''`           | 否   |
| `floating-state`                      | 浮动布局的受控位置和尺寸。               | `LayoutFloatingState`   | —              | 否   |
| `right-aside-open`                    | 右栏受控开闭状态。                       | `boolean`               | —              | 否   |
| `default-right-aside-open`            | 非受控右栏初始开闭状态。                 | `boolean`               | `false`        | 否   |
| `active-right-aside-panel-id`         | 受控当前面板；应用处理更新事件。         | `ChatRightAsidePanelId` | —              | 否   |
| `default-active-right-aside-panel-id` | 非受控当前面板初始值。                   | `ChatRightAsidePanelId` | 第一个可用面板 | 否   |

### Events

`TrChatUI` 发出下列事件；`TrChat` 消费会话、发送、模型和 MCP 的标准动作，转发 `history-action`、`prompt-click`、`mcp-create-server`、气泡事件、侧栏状态和浮动状态事件。Runtime 动作失败时，`TrChat` 额外发出 `runtime-action-error`。

| 事件                                                 | 参数                                                     | 触发时机                                                                 |
| ---------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| `submit`                                             | `ChatSendPayload`                                        | 请求提交；应用决定如何发送。                                             |
| `update:input-value`                                 | `string`                                                 | 受控草稿更新。                                                           |
| `cancel` / `clear`                                   | 无                                                       | 请求取消或清空草稿。                                                     |
| `create-conversation`                                | 无                                                       | 请求开始新会话。                                                         |
| `switch-conversation`                                | `{ conversationId: string }`                             | 请求切换会话。                                                           |
| `rename-conversation`                                | `{ conversationId: string; title: string }`              | 请求重命名会话。                                                         |
| `history-action`                                     | `ChatHistoryActionPayload`                               | 历史菜单操作；可调用 `preventDefault()`。                                |
| `prompt-click`                                       | `ChatPromptClickPayload`                                 | 点击提示项。                                                             |
| `bubble-state-change` / `bubble-event`               | 对应 payload                                             | 气泡状态或交互变化。                                                     |
| `model-select`                                       | `{ modelId: string \| null }`                            | 选择模型。                                                               |
| `model-feature-change`                               | `{ featureId; enabled }`                                 | 修改模型能力开关。                                                       |
| `model-reasoning-effort-change`                      | `{ effort: string \| null }`                             | 修改 reasoning effort。                                                  |
| `mcp-add-server` / `mcp-remove-server`               | `{ serverId: string }`                                   | 添加或删除 MCP Server。                                                  |
| `mcp-create-server`                                  | `ChatMcpCreateServerPayload`                             | 请求创建 MCP Server。                                                    |
| `mcp-server-enabled-change`                          | `{ serverId: string; enabled: boolean }`                 | 修改 Server 启用状态。                                                   |
| `mcp-tool-enabled-change`                            | `{ serverId: string; toolId: string; enabled: boolean }` | 修改工具启用状态。                                                       |
| `update:right-aside-open`                            | `boolean`                                                | 右栏受控状态更新。                                                       |
| `update:active-right-aside-panel-id`                 | `string \| undefined`                                    | 当前右栏面板更新。                                                       |
| `left-aside-open-change` / `right-aside-open-change` | `{ open: boolean; source: 'user' \| 'viewport' }`        | 侧栏状态变化。                                                           |
| `update:floating-state`                              | `LayoutFloatingState`                                    | 浮动状态更新。                                                           |
| `floating-drag-*` / `floating-resize-*`              | 对应 Detail                                              | 浮动拖拽或缩放生命周期。                                                 |
| `runtime-action-error`                               | `ChatRuntimeActionErrorPayload`                          | 仅 `TrChat` 发出；通知 Runtime 动作失败，send 错误详情仍从所属消息读取。 |

### Slots

| 插槽                                                                                                            | 作用域参数                         | 说明                               |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------- |
| `layout-header`                                                                                                 | `ChatHeaderSlotProps`              | 替换 Header。                      |
| `layout-left-aside`                                                                                             | `ChatLeftAsideSlotProps`           | 替换左侧展开面板。                 |
| `layout-left-aside-brand` / `layout-left-aside-actions` / `layout-left-aside-footer` / `layout-left-aside-rail` | `ChatLeftAsideSlotProps`           | 扩展默认左侧栏对应区域。           |
| `layout-left-aside-content`                                                                                     | `ChatLeftAsideContentSlotProps`    | 扩展默认左侧栏内容区。             |
| `layout-left-aside-history-item-prefix`                                                                         | `ChatHistoryItemPrefixSlotProps`   | 扩展默认历史项前缀。               |
| `layout-right-aside`                                                                                            | `ChatRightAsidePanelSlotProps`     | 替换整个右栏，并接管所有面板。     |
| `layout-right-aside-title`                                                                                      | `ChatRightAsideTitleSlotProps`     | 替换应用注册面板的标题。           |
| `layout-right-aside-panel`                                                                                      | `ChatRightAsidePanelSlotProps`     | 渲染应用注册面板的正文。           |
| `layout-main`                                                                                                   | `ChatMainSlotProps`                | 替换消息和空状态主内容。           |
| `layout-empty-state`                                                                                            | `ChatEmptyStateSlotProps`          | 在没有可见消息时替换默认空状态。   |
| `layout-footer` / `composer-before`                                                                             | `ChatSenderSlotProps`              | 替换默认 Sender 或在其前插入内容。 |
| `sender-header` / `sender-footer` / `sender-footer-right`                                                       | 无                                 | 扩展默认 Sender。                  |
| `header-notice` / `welcome-footer` / `prompts-footer`                                                           | 无                                 | 扩展对应区域。                     |
| `bubble-prefix` / `bubble-suffix` / `bubble-after`                                                              | `ChatBubbleSlotProps`              | 扩展消息周边。                     |
| `bubble-content-footer`                                                                                         | `ChatBubbleContentFooterSlotProps` | 扩展消息内容底部。                 |

### Expose

| 组件                  | 方法                      | 签名                                             |
| --------------------- | ------------------------- | ------------------------------------------------ |
| `TrChat`              | `send`                    | `(payload: ChatSendPayload) => Promise<boolean>` |
| `TrChat` / `TrChatUI` | `openRightAside`          | `(panel?: ChatRightAsidePanelId) => void`        |
| `TrChat` / `TrChatUI` | `closeRightAside`         | `() => void`                                     |
| `TrChat` / `TrChatUI` | `toggleRightAside`        | `(panel?: ChatRightAsidePanelId) => void`        |
| `TrChat` / `TrChatUI` | `activateRightAsidePanel` | `(panel: ChatRightAsidePanelId) => boolean`      |

### Types

所有下列类型从 `@opentiny/tiny-robot-chat` 导出。`?` 表示可选字段。

#### 组件契约与基础类型

| 类型                           | 类型或字段                                                                                                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatUIProps`                  | `inputValue?`、`defaultInputValue?`、`data?`、`ui?`、`floatingState?`、`rightAsideOpen?`、`defaultRightAsideOpen?`、`activeRightAsidePanelId?`、`defaultActiveRightAsidePanelId?` |
| `ChatUIEmits`                  | `TrChatUI` 的公开事件映射；事件名和参数见 Events。                                                                                                                                |
| `ChatCssSize`                  | `string \| number`                                                                                                                                                                |
| `ChatWelcomeComposerPlacement` | `'footer' \| 'center'`                                                                                                                                                            |
| `ChatRightAsidePanelId`        | `string`                                                                                                                                                                          |
| `ChatRightAsidePanelContext`   | `panelId: ChatRightAsidePanelId \| undefined`；`panel?: ChatRightAsidePanelOptions`                                                                                               |
| `ChatBuiltInModelFeature`      | `'thinking' \| 'search'`                                                                                                                                                          |
| `ChatRequestState`             | `'idle' \| 'processing' \| 'completed' \| 'paused' \| 'aborted' \| 'error'`                                                                                                       |
| `ChatProcessingState`          | `'requesting' \| 'completing' \| string`                                                                                                                                          |
| `ChatMessageContent`           | `string \| ChatMessagePart[]`                                                                                                                                                     |

#### 展示数据

| 类型                   | 字段                                                                                                                                                                                                                                                                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatUIData`           | `conversation?: ChatConversationView`；`bubble?: ChatBubbleView`；`sender?: ChatSenderView`；`model?: ChatModelView`；`mcp?: ChatMcpView`；`request?: ChatRequestView`                                                                                                                                                                       |
| `ChatConversationView` | `items?: readonly ChatConversationInfo[]`；`activeId?: string \| null`；`title?: string`；`history?: ChatHistoryData`                                                                                                                                                                                                                        |
| `ChatHistoryData`      | `readonly ChatConversationInfo[] \| readonly ChatHistoryGroup[]`                                                                                                                                                                                                                                                                             |
| `ChatHistoryGroup`     | `group: string \| symbol`；`items: readonly ChatConversationInfo[]`                                                                                                                                                                                                                                                                          |
| `ChatBubbleView`       | `messages?: readonly ChatMessageItem[]`                                                                                                                                                                                                                                                                                                      |
| `ChatSenderView`       | `loading?: boolean`；`disabled?: boolean`；`submitDisabled?: boolean`                                                                                                                                                                                                                                                                        |
| `ChatRequestView`      | `state: ChatRequestState`；`processingState?: ChatProcessingState`                                                                                                                                                                                                                                                                           |
| `ChatModelView`        | `options?: readonly ChatModelOptionView[]`；`selectedId?: string \| null`；`features?: Partial<Record<'thinking' \| 'search', boolean>>`；`reasoning?: { enabled: boolean; effort?: string }`；`selecting?: boolean`；`reasoningSelecting?: boolean`；`pendingFeatureIds?: readonly ('thinking' \| 'search')[]`                              |
| `ChatModelOptionView`  | `id: string`；`label: string`；`description?: string`；`icon?: ChatIcon`；`disabled?: boolean`；`group?: string`；`efforts?: readonly ModelSelectorReasoningEffortOption[]`；`defaultEffort?: string`；`thinkingRequired?: boolean`；`capabilities?: Partial<Record<'thinking' \| 'search', boolean>>`；`metadata?: Record<string, unknown>` |
| `ChatMcpView`          | `servers?: readonly ChatMcpServerView[]`；`tools?: ChatMcpToolMap`                                                                                                                                                                                                                                                                           |
| `ChatMcpServerView`    | `id: string`；`name: string`；`description?: string`；`icon?: string`；`category?: string`；`installed: boolean`；`enabled: boolean`；`loading?: boolean`；`error?: unknown`；`metadata?: Record<string, unknown>`                                                                                                                           |
| `ChatMcpToolView`      | `id: string`；`name: string`；`description?: string`；`enabled: boolean`；`loading?: boolean`                                                                                                                                                                                                                                                |
| `ChatMcpToolMap`       | `Partial<Record<string, readonly ChatMcpToolView[]>>`，键为 Server ID。                                                                                                                                                                                                                                                                      |

#### 界面配置

| 类型                         | 字段                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatUIOptions`              | `layout?: ChatLayoutOptions`；`brand?: ChatBrandOptions`；`labels?: Partial<ChatLabels>`；`header?: false`；`history?: false \| ChatHistoryOptions`；`welcome?: false \| ChatWelcomeOptions`；`prompts?: false \| ChatPromptsOptions`；`bubble?: ChatBubbleOptions`；`sender?: false \| ChatSenderOptions`；`model?: false \| ChatModelOptions`；`mcp?: false \| ChatMcpOptions`                                                |
| `ChatLayoutOptions`          | `composer?: ChatComposerLayoutOptions`；`surface?: ChatSurfaceOptions`；`emptyState?: 'start' \| 'center'`；`contentMaxWidth?: string \| number`；`panelPadding?: string \| number`；`panelGap?: string \| number`；`leftAside?: false \| ChatAsideOptions`；`rightAside?: false \| ChatRightAsideOptions`                                                                                                                      |
| `ChatComposerLayoutOptions`  | `welcome?: 'footer' \| 'center'`                                                                                                                                                                                                                                                                                                                                                                                                |
| `ChatSurfaceOptions`         | `mode?: 'normal' \| 'floating'`；`floatingOptions?: LayoutFloatingOptions`                                                                                                                                                                                                                                                                                                                                                      |
| `ChatBrandOptions`           | `name?: string`；`logo?: unknown`                                                                                                                                                                                                                                                                                                                                                                                               |
| `ChatAsideOptions`           | `mode?: 'dock' \| 'drawer'`；`width?: number`；`collapsedWidth?: number`；`open?: boolean`；`defaultOpen?: boolean`                                                                                                                                                                                                                                                                                                             |
| `ChatRightAsideOptions`      | 继承 `ChatAsideOptions`，不含 `open`、`defaultOpen`；另有 `showClose?: boolean`；`resizable?: boolean`；`minWidth?: number`；`maxWidth?: number`；`panels?: readonly ChatRightAsidePanelOptions[]`                                                                                                                                                                                                                              |
| `ChatRightAsidePanelOptions` | `id: string`；`title?: string`                                                                                                                                                                                                                                                                                                                                                                                                  |
| `ChatLabels`                 | `newConversationTitle`；`createConversation`；`renameConversation`；`deleteConversation`；`expandConversationList`；`collapseConversationList`；`composerPlaceholder`；`composerLoadingPlaceholder`；`selectModel`；`searchModel`；`modelEmptyText`；`mcp`；`thinkingFeature`；`searchFeature`；`welcomeTitle`；`welcomeDescription`；`rightAsideTitle`；`openRightAside`；`closeRightAside`；`scrollToBottom`，均为 `string`。 |
| `ChatBubbleOptions`          | `autoScroll?: boolean`；`bubbleProvider?: Omit<BubbleProviderProps, 'store'>`；`bubbleList?: ChatBubbleListOptions`。`bubbleProvider.errorRenderer` 可统一替换消息错误视图。                                                                                                                                                                                                                                                    |
| `ChatPromptsOptions`         | 继承 `PromptsProps`，另有 `items?: PromptProps[]`。                                                                                                                                                                                                                                                                                                                                                                             |
| `ChatModelOptions`           | `appendTo?: ModelSelectorProps['appendTo']`                                                                                                                                                                                                                                                                                                                                                                                     |
| `ChatMcpOptions`             | `Record<string, never>`，当前没有配置字段。                                                                                                                                                                                                                                                                                                                                                                                     |

`ChatHistoryOptions`、`ChatBubbleListOptions`、`ChatWelcomeOptions`、`ChatSenderOptions` 和 `ChatSenderDefaultActions` 分别继承 `@opentiny/tiny-robot` 的 `HistoryProps`、`BubbleListProps`、`WelcomeProps`、`SenderProps`、`DefaultActions`，并排除了由 Chat 固定管理的字段；外部组件字段请参阅对应组件文档。

#### 插槽作用域

| 类型                               | 字段                                                                                                                                                                                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatHeaderSlotProps`              | `title`；`isEmpty`；`conversation`；`createConversation()`；`isLeftAsideOpen`；`openLeftAside()`；`closeLeftAside()`；`toggleLeftAside()`；`openRightAside(panel?)`；`closeRightAside()`                                                                  |
| `ChatLeftAsideSlotProps`           | `conversation`；`isOpen`；`isDock`；`createConversation()`；`switchConversation(id)`；`renameConversation(id, title)`；`deleteConversation(id)`；`openLeftAside()`；`closeLeftAside()`；`toggleLeftAside()`                                               |
| `ChatLeftAsideContentSlotProps`    | 继承 `ChatLeftAsideSlotProps`；`history?: ChatHistoryData`                                                                                                                                                                                                |
| `ChatHistoryItemPrefixSlotProps`   | `item: ChatConversationInfo`                                                                                                                                                                                                                              |
| `ChatRightAsidePanelSlotProps`     | `panelId?: string`；`panel?: ChatRightAsidePanelOptions`；`panels: readonly ChatRightAsidePanelOptions[]`；`openRightAside(panelId?)`；`closeRightAside()`；`toggleRightAside(panelId?)`；`activateRightAsidePanel(panelId)`；`isRightAsideOpen: boolean` |
| `ChatRightAsideTitleSlotProps`     | `panelId?: string`；`panel?: ChatRightAsidePanelOptions`                                                                                                                                                                                                  |
| `ChatSenderSlotProps`              | `value`；`loading`；`disabled`；`submitDisabled`；`setInputValue(value)`；`submit({ text, structuredData? })`；`cancel()`；`clear()`                                                                                                                      |
| `ChatMainSlotProps`                | `messages: readonly ChatMessageItem[]`；`request?: ChatRequestView`；`conversation: ChatConversationView`                                                                                                                                                 |
| `ChatEmptyStateSlotProps`          | 继承 `ChatMainSlotProps`；`isEmpty: true`；`renderComposer(): VNode \| null`                                                                                                                                                                              |
| `ChatBubbleSlotProps`              | `messages: readonly BubbleMessage[]`；`role?: string`；`messageIndexes: readonly number[]`                                                                                                                                                                |
| `ChatBubbleContentFooterSlotProps` | 继承 `ChatBubbleSlotProps`；`contentIndex?: number`                                                                                                                                                                                                       |

`ChatUISlots` 是插槽名到上述函数签名的映射；无作用域参数的插槽为 `header-notice`、`welcome-footer`、`prompts-footer`、`sender-header`、`sender-footer` 和 `sender-footer-right`。

#### 消息错误展示

以下入口从 `@opentiny/tiny-robot` 导出，`TrChat` 通过 `ChatBubbleOptions.bubbleProvider` 复用它们。

| 入口                                | 类型或签名                            | 说明                                                               |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `BubbleErrorInfo`                   | `interface`                           | 推荐错误结构：`message` 必填，可包含 `name`、`code` 和 `details`。 |
| `BubbleErrorRendererProps`          | `{ message: BubbleMessage }`          | 自定义错误渲染器只接收所属消息，不接收 `contentIndex`。            |
| `BubbleProviderProps.errorRenderer` | `Component<BubbleErrorRendererProps>` | 在 Provider 范围内替换默认消息错误渲染器。                         |
| `BubbleRenderers.Error`             | `Component<BubbleErrorRendererProps>` | 默认错误渲染器，可在组合自定义 Provider 时复用。                   |

#### 事件参数

| 类型                                                     | 字段                                                                                                             |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `ChatSendPayload`                                        | `text: string`；`structuredData?: ChatStructuredData`                                                            |
| `ChatStructuredData`                                     | `ChatStructuredDataItem[]`                                                                                       |
| `ChatStructuredDataItem`                                 | `type: string`；可追加自定义字段。                                                                               |
| `ChatHistoryActionPayload`                               | `action: HistoryMenuItem`；`conversation: ChatConversationInfo`；`defaultPrevented: boolean`；`preventDefault()` |
| `ChatSwitchConversationPayload`                          | `conversationId: string`                                                                                         |
| `ChatRenameConversationPayload`                          | `conversationId: string`；`title: string`                                                                        |
| `ChatPromptClickPayload`                                 | `event: MouseEvent`；`item: PromptProps`                                                                         |
| `ChatModelSelectPayload`                                 | `modelId: string \| null`                                                                                        |
| `ChatModelFeatureChangePayload`                          | `featureId: 'thinking' \| 'search'`；`enabled: boolean`                                                          |
| `ChatModelReasoningEffortChangePayload`                  | `effort: string \| null`                                                                                         |
| `ChatMcpAddServerPayload` / `ChatMcpRemoveServerPayload` | `serverId: string`                                                                                               |
| `ChatMcpCreateServerPayload`                             | `type: 'form' \| 'code'`；`data: PluginCreationData`                                                             |
| `ChatMcpServerEnabledChangePayload`                      | `serverId: string`；`enabled: boolean`                                                                           |
| `ChatMcpToolEnabledChangePayload`                        | `serverId: string`；`toolId: string`；`enabled: boolean`                                                         |
| `ChatAsideOpenChangePayload`                             | `open: boolean`；`source: 'user' \| 'viewport'`                                                                  |
| `ChatBubbleStateChangePayload`                           | `key: string`；`value: unknown`；`messageIndex: number`；`contentIndex: number`                                  |
| `ChatBubbleEventPayload`                                 | `name: string`；`payload?: unknown`；`messageIndex: number`；`contentIndex: number`                              |

`LayoutFloatingState`、`LayoutFloatingDragDetail`、`LayoutFloatingResizeDetail`、`HistoryMenuItem`、`PromptProps`、`BubbleMessage`、`ModelSelectorReasoningEffortOption` 和 `PluginCreationData` 来自 `@opentiny/tiny-robot`，请参阅对应组件 API。

## 常见问题

### 页面没有高度或消息区不滚动

检查应用根节点、页面容器和 Chat 外层是否有可计算高度，并允许中间 flex 子项收缩。

### TrChatUI 是否保存会话

不会。应用处理事件后，将会话、消息、请求和输入状态写回 `data`。
