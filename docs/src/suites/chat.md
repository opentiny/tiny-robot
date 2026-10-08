---
outline: [1, 3]
---

# Chat 聊天界面

`TrChat` 是用于 Vue 应用的 AI 聊天页面组件，提供会话列表、消息展示和输入区，可接入模型服务发送消息，适用于独立聊天页面和应用内嵌 AI 助手。

## 快速开始

### 安装

在已有 Vue 项目中安装 Chat 套件：

::: code-group

```bash [pnpm]
pnpm add @opentiny/tiny-robot-chat
```

```bash [yarn]
yarn add @opentiny/tiny-robot-chat
```

```bash [npm]
npm install @opentiny/tiny-robot-chat
```

:::

### 引入样式

在应用入口（如 `main.ts`）引入基础组件和 Chat 的样式：

```ts
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'
```

### 接入模型服务

`useChatRuntime` 用于配置模型服务、管理会话和发送请求。传入服务地址和模型配置后，将返回的 `runtime` 对象传给 `TrChat`，即可连接聊天界面的发送、取消和会话切换等操作。

> 请为 `TrChat` 的父容器设置明确高度，否则消息区可能无法正常显示或滚动。

下面的演示使用本地模拟服务，可体验发送消息和查看回答：

<demo
  vue="../../demos/chat/basic.vue"
  :vueFiles="[
    '../../demos/chat/basic.vue',
    '../../demos/chat/shared/modelProviders.ts'
  ]"
  title="完整聊天页面"
  description="输入消息并发送，查看模拟服务返回的回答。"
/>

在自己的项目中，将 `apiUrl` 替换为实际服务的完整地址，并将 `assistant` 替换为服务支持的模型 ID。示例地址不能直接使用。

```vue
<script setup lang="ts">
import { TrChat, useChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'openai',
    apiUrl: 'https://your-service.example.com/v1',
    models: [{ id: 'assistant', label: '应用助手' }],
  },
]

const runtime = useChatRuntime({ modelProviders })
</script>

<template>
  <main class="chat-page">
    <TrChat :runtime="runtime" />
  </main>
</template>

<style scoped>
.chat-page {
  height: 600px;
}
</style>
```

此例要求服务提供兼容 OpenAI 的 `/chat/completions` 接口。生产环境应通过服务端转发请求并保管模型密钥，不要将长期密钥写入前端代码。更多配置见 [模型服务](./chat-runtime#模型服务)。

项目已使用 Kit 的 `useConversation` 管理会话时，可通过 `useChatRuntimeFromConversation` 接入 `TrChat`，复用已有会话和请求配置，详见 [使用已有会话](./chat-runtime#使用已有会话)。

## 常用功能

接入 `TrChat` 后，可以通过 `ui` 配置和插槽调整布局、添加内容或自定义聊天窗口。

部分布局演示使用 `TrChatUI` 展示界面效果，其中的 `ui` 配置同样适用于 `TrChat`。

### 页面布局

通过 `ui` 调整消息区宽度、侧栏和输入区位置，下面的示例展示三种布局效果。

<demo
  vue="../../demos/chat/layout-presets.vue"
  :vueFiles="['../../demos/chat/layout-presets.vue']"
  title="页面布局"
  description="比较默认布局、较窄的内容区和隐藏侧栏后的效果。"
/>

常用设置包括 `ui.layout.contentMaxWidth`（内容最大宽度）、`ui.layout.leftAside`（左侧栏）和 `ui.layout.composer.welcome`（空会话时的输入区位置）。完整字段和默认值见 [界面配置](#界面配置)。

### 插槽定制

需要添加消息操作按钮、替换页头或输入区内容时，可以使用插槽。只修改一小块内容时，优先使用对应的局部插槽；例如 `bubble-content-footer` 可在消息内容下方添加按钮，`sender-footer` 可补充输入区底部内容。

需要替换页头、侧栏或消息区时，使用对应的 `layout-*` 插槽。全部插槽及使用限制见 [插槽](#插槽-2)。

### 右侧面板

需要在聊天旁展示引用资料、预览结果等内容时，通过 `ui.layout.rightAside.panels` 声明面板，并用 `layout-right-aside-panel` 插槽提供内容。

<demo
  vue="../../demos/chat/right-aside-panel.vue"
  :vueFiles="[
    '../../demos/chat/right-aside-panel.vue',
    '../../demos/chat/business-right-aside.vue',
    '../../demos/chat/release-preview.html',
    '../../demos/chat/shared/modelProviders.ts'
  ]"
  title="右侧资料与预览面板"
  description="点击消息操作，打开发布方案预览或引用资料。"
/>

`right-aside-open` 控制面板是否打开，`active-right-aside-panel-id` 控制显示哪个面板。传入这两个属性时，需要处理对应的 `update:*` 事件并更新值；仅需设置初始值时，使用对应的 `default-*` 属性。

### 浮动聊天窗口

将 `ui.layout.surface.mode` 设为 `'floating'`，可以显示可拖动、可缩放的聊天窗口。窗口位置和尺寸通过 `floating-state` 传入；收到 `update:floating-state` 时，需要更新该值，否则窗口会回到原位置。

<demo
  vue="../../demos/chat/floating-layout.vue"
  :vueFiles="['../../demos/chat/floating-layout.vue']"
  title="浮动聊天窗口"
  description="打开聊天窗口，拖动或缩放后查看位置和尺寸变化。"
/>

### 窄屏与移动端

侧栏有两种显示方式：`dock` 与消息区并排，`drawer` 以抽屉形式覆盖消息区。浏览器视口宽度低于 `960px` 时，组件会自动使用抽屉；仅缩小父容器不会触发这一变化。

下面的演示手动切换两种模式，用于比较效果，不会改变浏览器视口：

<demo
  vue="../../demos/chat/responsive-layout.vue"
  :vueFiles="['../../demos/chat/responsive-layout.vue']"
  title="并排侧栏与抽屉"
  description="比较两种侧栏的显示方式和开闭操作。"
/>

桌面端设置 `rightAside.mode: 'dock'` 和 `resizable: true` 后，可拖动调整右栏宽度；移动端和抽屉模式不支持调整宽度。

### 请求失败提示

使用 `TrChat` 和 `useChatRuntime` 时，请求失败会在对应的 AI 消息下显示错误提示。默认不提供重试按钮，可按需添加。

<demo
  vue="../../demos/chat/runtime-error.vue"
  :vueFiles="['../../demos/chat/runtime-error.vue']"
  title="请求失败提示"
  description="使用本地模拟请求，查看失败提示和后续成功发送的效果。"
/>

需要自定义或关闭错误提示时，见 [消息错误提示配置](#消息错误提示配置)；需要接收操作失败通知时，监听 `runtime-action-error`，见 [TrChat 事件](#事件)。

## 使用 TrChatUI

`TrChatUI` 与 `TrChat` 使用相同的聊天界面，但需要自行传入数据并处理交互事件。适用于只需要聊天界面、希望由项目自行控制数据和交互逻辑的场景。

下面的示例演示如何传入消息、处理输入和提交，并显示本地模拟回答。

<demo
  vue="../../demos/chat/controlled-ui.vue"
  :vueFiles="['../../demos/chat/controlled-ui.vue']"
  title="使用应用数据"
  description="应用处理输入和提交，更新消息列表并显示本地模拟回答。"
/>

使用时主要关注：

- `data`：传入会话、消息和输入区状态；数据更新后，界面随之更新。
- `input-value` 与 `update:input-value`：传入输入内容，并在用户输入时更新该值。
- `submit`：处理提交内容，调用请求方法，并更新消息列表和发送中状态。

`TrChatUI` 不保存会话或消息，需由项目自行保存。

需要支持取消请求或会话切换时，还需处理对应事件并更新数据。完整字段见 [ChatUIData](#chatuidata)，事件见 [TrChatUI 事件](#事件-1)。

## API

所有 Chat 类型均从 `@opentiny/tiny-robot-chat` 导出，另有说明的 TinyRobot 基础组件类型除外。

### TrChat API

#### 属性

| 属性名                                | 说明                                       | 类型                    | 默认值         | 必填 |
| ------------------------------------- | ------------------------------------------ | ----------------------- | -------------- | ---- |
| `runtime`                             | 提供会话、输入区状态和操作方法。           | `ChatRuntime`           | —              | 是   |
| `ui`                                  | 配置页面布局、文案和区域。                 | `ChatUIOptions`         | 默认界面配置   | 否   |
| `title`                               | 覆盖当前会话提供的页面标题。               | `string`                | —              | 否   |
| `history-data`                        | 覆盖 Runtime 会话生成的历史列表或分组。    | `ChatHistoryData`       | —              | 否   |
| `floating-state`                      | 由应用管理的浮动窗口位置和尺寸。           | `LayoutFloatingState`   | —              | 否   |
| `right-aside-open`                    | 由应用管理的右栏开闭状态。                 | `boolean`               | —              | 否   |
| `default-right-aside-open`            | 组件管理右栏开闭时的初始值。               | `boolean`               | `false`        | 否   |
| `active-right-aside-panel-id`         | 由应用管理的当前右栏面板，需处理更新事件。 | `ChatRightAsidePanelId` | —              | 否   |
| `default-active-right-aside-panel-id` | 组件管理当前面板时的初始值。               | `ChatRightAsidePanelId` | 第一个可用面板 | 否   |

#### 事件

`TrChat` 会直接处理提交、取消、会话切换、模型选择和 MCP 开关操作，调用 Runtime 对应方法；这些事件不会再次向外发出。

| 事件                                                                | 参数                                 | 触发时机                                                                |
| ------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `runtime-action-error`                                              | `ChatRuntimeActionErrorPayload`      | Runtime 操作失败；send 错误详情仍从所属消息读取。                       |
| `history-action`                                                    | `ChatHistoryActionPayload`           | 历史菜单操作；删除操作可调用 `preventDefault()` 阻止默认 Runtime 删除。 |
| `prompt-click`                                                      | `ChatPromptClickPayload`             | 点击提示项。                                                            |
| `mcp-create-server`                                                 | `ChatMcpCreateServerPayload`         | 请求创建 MCP 服务；Runtime 不处理创建表单。                             |
| `bubble-state-change`                                               | `ChatBubbleStateChangePayload`       | 气泡内部状态变化。                                                      |
| `bubble-event`                                                      | `ChatBubbleEventPayload`             | 气泡内容发出自定义事件。                                                |
| `left-aside-open-change` / `right-aside-open-change`                | `ChatAsideOpenChangePayload`         | 侧栏状态变化。                                                          |
| `update:right-aside-open`                                           | `boolean`                            | 通知应用更新右栏开闭状态。                                              |
| `update:active-right-aside-panel-id`                                | `ChatRightAsidePanelId \| undefined` | 通知应用更新当前右栏面板。                                              |
| `update:floating-state`                                             | `LayoutFloatingState`                | 通知应用更新浮动窗口的位置和尺寸。                                      |
| `floating-drag-start` / `floating-drag` / `floating-drag-end`       | `LayoutFloatingDragDetail`           | 浮动窗口开始拖动、拖动中或拖动结束。                                    |
| `floating-resize-start` / `floating-resize` / `floating-resize-end` | `LayoutFloatingResizeDetail`         | 浮动窗口开始缩放、缩放中或缩放结束。                                    |

#### 插槽

`TrChat` 与 `TrChatUI` 使用相同的界面插槽，见 [插槽](#插槽-2)。在 `TrChat` 中，插槽参数提供的发送、会话、模型和 MCP 操作已连接当前 Runtime。

#### 组件方法

| 方法                      | 签名                                             | 说明                           |
| ------------------------- | ------------------------------------------------ | ------------------------------ |
| `send`                    | `(payload: ChatSendPayload) => Promise<boolean>` | 通过 Runtime 发送消息。        |
| `openRightAside`          | `(panel?: ChatRightAsidePanelId) => void`        | 打开右栏，可同时指定面板。     |
| `closeRightAside`         | `() => void`                                     | 关闭右栏。                     |
| `toggleRightAside`        | `(panel?: ChatRightAsidePanelId) => void`        | 切换右栏，可同时指定面板。     |
| `activateRightAsidePanel` | `(panel: ChatRightAsidePanelId) => boolean`      | 激活存在的面板并返回是否成功。 |

### TrChatUI API

#### 属性

| 属性名                                | 说明                                     | 类型                    | 默认值         | 必填 |
| ------------------------------------- | ---------------------------------------- | ----------------------- | -------------- | ---- |
| `data`                                | 应用提供的显示数据；组件不会修改该对象。 | `ChatUIData`            | 空展示数据     | 否   |
| `ui`                                  | 配置页面布局、文案和区域。               | `ChatUIOptions`         | 默认界面配置   | 否   |
| `input-value`                         | 应用管理的输入内容，需处理更新事件。     | `string`                | —              | 否   |
| `default-input-value`                 | 组件管理输入时的初始内容。               | `string`                | `''`           | 否   |
| `floating-state`                      | 由应用管理的浮动窗口位置和尺寸。         | `LayoutFloatingState`   | —              | 否   |
| `right-aside-open`                    | 由应用管理的右栏开闭状态。               | `boolean`               | —              | 否   |
| `default-right-aside-open`            | 组件管理右栏开闭时的初始值。             | `boolean`               | `false`        | 否   |
| `active-right-aside-panel-id`         | 由应用管理的当前面板，需处理更新事件。   | `ChatRightAsidePanelId` | —              | 否   |
| `default-active-right-aside-panel-id` | 组件管理当前面板时的初始值。             | `ChatRightAsidePanelId` | 第一个可用面板 | 否   |

`input-value` 与 `default-input-value` 二选一，使用期间不切换输入管理方式。由应用管理左栏开闭时，通过 `ui.layout.leftAside.open` 设置状态，并在 `left-aside-open-change` 事件中更新该值。

#### 事件

点击“新会话”时，`TrChatUI` 只触发 `create-conversation`，由应用决定清空当前选中还是立即创建会话。`TrChat` 则会回到新会话页面，在下一条非空消息发送时创建会话。

| 事件                                                                | 参数                                                     | 应用责任                                                              |
| ------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------- |
| `submit`                                                            | `ChatSendPayload`                                        | 发送请求并更新消息、请求状态和输入值。                                |
| `update:input-value`                                                | `string`                                                 | 由应用管理输入时，更新输入内容。                                      |
| `cancel` / `clear`                                                  | 无                                                       | 中止请求或清空输入；组件不会修改外部请求。                            |
| `create-conversation`                                               | 无                                                       | 清空当前会话或创建新会话。                                            |
| `switch-conversation`                                               | `ChatSwitchConversationPayload`                          | 切换数据源并更新 `data.conversation.activeId`。                       |
| `rename-conversation`                                               | `ChatRenameConversationPayload`                          | 保存新标题并更新会话列表。                                            |
| `history-action`                                                    | `ChatHistoryActionPayload`                               | 处理历史菜单操作；`TrChatUI` 本身不会执行删除。                       |
| `prompt-click`                                                      | `ChatPromptClickPayload`                                 | 决定填充输入、直接提交或执行其他操作。                                |
| `bubble-state-change` / `bubble-event`                              | 对应 payload                                             | 更新消息状态或处理自定义气泡事件。                                    |
| `model-select`                                                      | `ChatModelSelectPayload`                                 | 更新 `data.model.selectedId`。                                        |
| `model-feature-change`                                              | `ChatModelFeatureChangePayload`                          | 更新能力开关；异步时可同步 `pendingFeatureIds`。                      |
| `model-reasoning-effort-change`                                     | `ChatModelReasoningEffortChangePayload`                  | 更新思考强度。                                                        |
| `mcp-add-server` / `mcp-remove-server`                              | `ChatMcpAddServerPayload` / `ChatMcpRemoveServerPayload` | 更新 MCP 服务列表。                                                   |
| `mcp-create-server`                                                 | `ChatMcpCreateServerPayload`                             | 创建并接入自定义 MCP 服务。                                           |
| `mcp-server-enabled-change`                                         | `ChatMcpServerEnabledChangePayload`                      | 更新 MCP 服务启用状态。                                               |
| `mcp-tool-enabled-change`                                           | `ChatMcpToolEnabledChangePayload`                        | 更新工具启用状态。                                                    |
| `left-aside-open-change` / `right-aside-open-change`                | `ChatAsideOpenChangePayload`                             | 由应用管理侧栏时更新开闭状态；`source` 区分用户操作和浏览器窗口变化。 |
| `update:right-aside-open`                                           | `boolean`                                                | 更新应用管理的右栏开闭状态。                                          |
| `update:active-right-aside-panel-id`                                | `ChatRightAsidePanelId \| undefined`                     | 更新应用管理的当前面板。                                              |
| `update:floating-state`                                             | `LayoutFloatingState`                                    | 更新应用管理的浮动窗口位置和尺寸。                                    |
| `floating-drag-start` / `floating-drag` / `floating-drag-end`       | `LayoutFloatingDragDetail`                               | 处理窗口开始拖动、拖动中或拖动结束。                                  |
| `floating-resize-start` / `floating-resize` / `floating-resize-end` | `LayoutFloatingResizeDetail`                             | 处理窗口开始缩放、缩放中或缩放结束。                                  |

#### 插槽

见 [插槽](#插槽-2)。在 `TrChatUI` 中，发送和会话操作等插槽方法只触发事件，应用需要处理事件并更新数据。

#### 组件方法

| 方法                      | 签名                                        | 说明                           |
| ------------------------- | ------------------------------------------- | ------------------------------ |
| `openRightAside`          | `(panel?: ChatRightAsidePanelId) => void`   | 打开右栏，可同时指定面板。     |
| `closeRightAside`         | `() => void`                                | 关闭右栏。                     |
| `toggleRightAside`        | `(panel?: ChatRightAsidePanelId) => void`   | 切换右栏，可同时指定面板。     |
| `activateRightAsidePanel` | `(panel: ChatRightAsidePanelId) => boolean` | 激活存在的面板并返回是否成功。 |

#### ChatUIData

`ChatUIData` 是应用传给 `TrChatUI` 的显示数据，组件不会修改它。以下字段均为可选，对应区域见下表。

未配置的字段使用下表默认值。无需模型或 MCP 入口时，省略 `model` / `mcp`，或将 `ui.model` / `ui.mcp` 设为 `false`。

| 字段           | 类型                   | 对应区域                     | 省略时的结果                          |
| -------------- | ---------------------- | ---------------------------- | ------------------------------------- |
| `conversation` | `ChatConversationView` | 页头标题、会话列表和当前选中 | 空列表、无选中，标题为“新对话”。      |
| `bubble`       | `ChatBubbleView`       | 消息主区                     | `messages` 为空，进入空状态。         |
| `sender`       | `ChatSenderView`       | 输入区可用性与加载反馈       | 三个布尔状态均为 `false`。            |
| `model`        | `ChatModelView`        | 输入区模型选择器与能力开关   | 不显示模型选择器。                    |
| `mcp`          | `ChatMcpView`          | 输入区 MCP 入口与内置右栏    | 不显示 MCP 入口或面板。               |
| `request`      | `ChatRequestView`      | 自定义主区和空状态插槽参数   | `undefined`；默认界面不额外显示状态。 |

##### `conversation`

| 字段       | 类型                     | 默认值 | 说明                                                                |
| ---------- | ------------------------ | ------ | ------------------------------------------------------------------- |
| `items`    | `ChatConversationInfo[]` | `[]`   | 原始会话列表；未提供 `history` 时按当前数组顺序生成默认历史数据。   |
| `activeId` | `string \| null`         | `null` | 当前选中会话 ID；应用处理切换事件后更新。                           |
| `title`    | `string`                 | 新对话 | 页头标题；空字符串会原样显示。                                      |
| `history`  | `ChatHistoryData`        | —      | 应用提供的排序或分组结果；提供后优先于根据 `items` 生成的默认历史。 |

`ChatConversationInfo`、`ChatMessageItem` 及消息内容结构见 [Chat 配置与操作：会话、消息与发送](./chat-runtime#会话、消息与发送)。

##### `bubble` 与 `sender`

| 路径                    | 类型                | 默认值  | 说明                                     |
| ----------------------- | ------------------- | ------- | ---------------------------------------- |
| `bubble.messages`       | `ChatMessageItem[]` | `[]`    | 消息列表；组件不会追加、删除或保存消息。 |
| `sender.loading`        | `boolean`           | `false` | 显示发送中反馈并切换为取消操作。         |
| `sender.disabled`       | `boolean`           | `false` | 禁用整个输入区。                         |
| `sender.submitDisabled` | `boolean`           | `false` | 仅禁止提交；输入仍可编辑。               |

单独使用 `TrChatUI` 时，AI 消息的 `state.error` 用于显示错误提示，需要由应用写入。

##### `model`

| 字段                 | 类型                                               | 说明                                           |
| -------------------- | -------------------------------------------------- | ---------------------------------------------- |
| `options`            | `ChatModelOptionView[]`                            | 可选模型列表；为空时显示没有可选模型的提示。   |
| `selectedId`         | `string \| null`                                   | 当前模型；选择后应用通过 `model-select` 写回。 |
| `features`           | `Partial<Record<'thinking' \| 'search', boolean>>` | 当前能力开关。                                 |
| `reasoning`          | `{ enabled: boolean; effort?: string }`            | 深度思考开关及当前思考强度。                   |
| `selecting`          | `boolean`                                          | 模型切换中的整体等待状态。                     |
| `reasoningSelecting` | `boolean`                                          | 思考强度切换中的等待状态。                     |
| `pendingFeatureIds`  | `('thinking' \| 'search')[]`                       | 正在切换的能力，用于逐项等待反馈。             |

`ChatModelOptionView` 至少包含 `id` 和 `label`，还可提供 `description`、`icon`、`disabled`、`group`、思考强度选项（`efforts`）、默认强度（`defaultEffort`）、支持的功能和 `metadata`。选择器弹出面板所在的容器由 `ui.model.appendTo` 配置，其他行为见 [ModelSelector](../components/model-selector)。

##### `mcp`

| 字段      | 类型                  | 说明                                                                 |
| --------- | --------------------- | -------------------------------------------------------------------- |
| `servers` | `ChatMcpServerView[]` | MCP 服务的安装、启用、加载和错误状态；应用处理对应事件后写回。       |
| `tools`   | `ChatMcpToolMap`      | 以 MCP 服务 ID 为键的工具数组；工具包含 `id`、`name`、`enabled` 等。 |

`ChatMcpServerView` 要求 `id`、`name`、`installed` 和 `enabled`；可选 `description`、`icon`、`category`、`loading`、`error` 与 `metadata`。`ChatMcpToolView` 要求 `id`、`name` 和 `enabled`，可选 `description` 与 `loading`。只有 `ui.mcp` 与 `ui.layout.rightAside` 都未设为 `false` 时，MCP 入口和内置面板才可见。

内置右栏使用 [ExtensionManager](../components/extension-manager) 将 MCP 服务按“已安装”和“可安装”分区；点击已安装项名称进入 [MCP 详情](../components/mcp-extension)切换工具，点击“自定义添加”进入 MCP 表单。表单验证通过后，`mcp-create-server` 发出 `{ config, source }`；`config` 是整理后的单个 MCP 服务连接配置，`source` 为 `'form'` 或 `'code'`。Chat 不保存自定义 MCP 服务，应用收到事件后负责保存并更新 `mcp.servers`。服务的 `loading` 状态会禁用其列表操作，工具的 `loading` 状态会禁用对应开关。

##### `request`

| 字段              | 类型                                                                        | 必填 | 说明                   |
| ----------------- | --------------------------------------------------------------------------- | ---- | ---------------------- |
| `state`           | `'idle' \| 'processing' \| 'completed' \| 'paused' \| 'aborted' \| 'error'` | 是   | 请求状态。             |
| `processingState` | `'requesting' \| 'completing' \| string`                                    | 否   | 应用定义的处理中阶段。 |

`request` 会传给 `layout-main` 和 `layout-empty-state`。默认界面的发送中反馈读取 `sender.loading`，消息错误读取 `message.state.error`；只更新 `request` 不会自动渲染这些反馈。

### 界面配置

`TrChat` 和 `TrChatUI` 都通过 `ui` 接收 `ChatUIOptions`，配置布局、文案和各区域的显示方式。

未配置时使用默认界面。支持 `false` 的区域可通过它隐藏，其他选项见下表。

| 字段      | 类型                          | 省略时的行为与合并规则                                                    | `false` 的结果                            |
| --------- | ----------------------------- | ------------------------------------------------------------------------- | ----------------------------------------- |
| `layout`  | `ChatLayoutOptions`           | 未配置的布局字段使用默认值；窗口、输入区和左右侧栏可分别配置。            | 不支持；使用 `leftAside` / `rightAside`。 |
| `brand`   | `ChatBrandOptions`            | 提供的选项覆盖对应的默认名称或图标，默认名称为 `TinyRobot`。              | 不支持。                                  |
| `labels`  | `Partial<ChatLabels>`         | 按字段覆盖内置中文文案；也会更新默认欢迎文案和历史菜单文案。              | 不支持。                                  |
| `header`  | `false`                       | 省略时显示默认 Header。                                                   | 移除 Header。                             |
| `history` | `false \| ChatHistoryOptions` | 与默认 History 选项合并；`menuItems` 整体替换默认重命名、删除菜单。       | 隐藏历史列表，左栏品牌和操作仍在。        |
| `welcome` | `false \| ChatWelcomeOptions` | 与默认欢迎区配置合并；未提供标题和描述时使用 `labels` 中的文案。          | 空会话不显示欢迎区。                      |
| `prompts` | `false \| ChatPromptsOptions` | 与默认 Prompts 选项合并；`items` 整体替换，默认 `[]`。                    | 不显示提示项。                            |
| `bubble`  | `ChatBubbleOptions`           | 合并气泡渲染和列表配置；`autoScroll` 默认 `true`，`system` 消息默认隐藏。 | 不支持。                                  |
| `sender`  | `false \| ChatSenderOptions`  | 提供的选项覆盖对应的默认输入区选项。                                      | 移除输入区及其插槽。                      |
| `model`   | `false \| ChatModelOptions`   | 默认 `{}`；只有 `data.model` 存在时显示。                                 | 即使存在模型数据也隐藏选择器。            |
| `mcp`     | `false \| ChatMcpOptions`     | 默认 `{}`；当前没有额外配置字段。                                         | 即使存在 MCP 数据也隐藏入口和面板。       |

#### `layout`

| 字段                        | 类型                             | 默认值                   | 说明                                                                  |
| --------------------------- | -------------------------------- | ------------------------ | --------------------------------------------------------------------- |
| `surface.mode`              | `'normal' \| 'floating'`         | `'normal'`               | 页面或浮动窗口；浮动时读取 `floatingOptions` 与 `floating-state`。    |
| `emptyState`                | `'start' \| 'center'`            | `'start'`                | 空状态在主区起始位置或居中。                                          |
| `composer.welcome`          | `'footer' \| 'center'`           | `'footer'`               | 空会话时输入区位于页面底部或欢迎区中央。                              |
| `contentMaxWidth`           | `string \| number`               | `980`                    | 消息、欢迎区和输入区的最大内容宽度。                                  |
| `panelPadding` / `panelGap` | `string \| number`               | `12` / `12`              | 内容区内边距与区域间距。                                              |
| `leftAside`                 | `false \| ChatAsideOptions`      | Dock，`300` / `56`，关闭 | 左栏；`open` 由应用管理，`defaultOpen` 仅设置组件管理开闭时的初始值。 |
| `rightAside`                | `false \| ChatRightAsideOptions` | Dock，宽 `320`，不可缩放 | 右栏；只有注册应用面板或存在可见 MCP 数据时才渲染。                   |

`ChatAsideOptions` 还包含 `mode`、`width`、`collapsedWidth`。浏览器视口低于 `960px` 时使用 `drawer`。`ChatRightAsideOptions` 另有 `showClose`、`resizable`、`minWidth`、`maxWidth` 和 `panels`。

`panels` 需要配合 `layout-right-aside` 或 `layout-right-aside-panel` 插槽提供内容；面板 ID 不能重复，也不能使用内置保留 ID `mcp`。`layout-right-aside-title` 和 `layout-right-aside-panel` 只用于应用添加的面板，不替换 MCP 面板。

#### 各区域配置

| 分支      | 常用字段或默认值                                                                                                          | 详细来源                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `brand`   | `name?: string`、`logo?: unknown`。                                                                                       | —                                             |
| `labels`  | 会话创建/重命名/删除、侧栏展开/收起、输入占位、模型、MCP、Welcome、右栏和滚动到底部等文案。                               | —                                             |
| `history` | 默认菜单为重命名和删除；Chat 固定管理 `data`、`selected` 与事件。                                                         | [History](../components/history)              |
| `welcome` | 默认标题与描述来自 `labels.welcomeTitle`、`labels.welcomeDescription`。                                                   | [Welcome](../components/welcome)              |
| `prompts` | `items?: PromptProps[]`，其余展示选项继承 Prompts。                                                                       | [Prompts](../components/prompts)              |
| `bubble`  | `autoScroll`、`bubbleProvider`、`bubbleList`；`bubbleProvider.errorRenderer` 可替换默认消息错误视图，传入 `null` 可关闭。 | [Bubble](../components/bubble)                |
| `sender`  | 默认 `mode: 'multiple'`、`clearable: true`、`maxLength: 1000`、`showWordLimit: true`；值和禁用状态由 Chat 管理。          | [Sender](../components/sender)                |
| `model`   | 当前字段为 `appendTo?: ModelSelectorProps['appendTo']`。                                                                  | [ModelSelector](../components/model-selector) |
| `mcp`     | `Record<string, never>`，当前没有配置字段。                                                                               | —                                             |

`ChatLabels` 的字段为 `newConversationTitle`、`createConversation`、`renameConversation`、`deleteConversation`、`expandConversationList`、`collapseConversationList`、`composerPlaceholder`、`composerLoadingPlaceholder`、`selectModel`、`searchModel`、`modelEmptyText`、`mcp`、`mcpInstallServer`、`mcpRemoveServer`、`thinkingFeature`、`searchFeature`、`welcomeTitle`、`welcomeDescription`、`rightAsideTitle`、`openRightAside`、`closeRightAside` 和 `scrollToBottom`，字段值均为 `string`。

#### 消息错误提示配置

通过 `ui.bubble.bubbleProvider.errorRenderer` 替换错误提示，传入 `null` 可关闭默认提示。`CustomErrorRenderer` 表示应用自行实现的错误展示组件。

```ts
const customErrorUI: ChatUIOptions = {
  bubble: {
    bubbleProvider: { errorRenderer: CustomErrorRenderer },
  },
}

const disabledErrorUI: ChatUIOptions = {
  bubble: {
    bubbleProvider: { errorRenderer: null },
  },
}
```

默认提示的样式变量为 `--tr-bubble-error-color`、`--tr-bubble-error-bg`、`--tr-bubble-error-border-radius` 和 `--tr-bubble-max-width`。单独使用 `Bubble` 或 `BubbleProvider` 时，错误提示默认关闭。

### 插槽

以下插槽同时适用于 `TrChat` 和 `TrChatUI`。

| 插槽                                                                                                            | 插槽参数                           | 说明                               |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------- |
| `layout-header`                                                                                                 | `ChatHeaderSlotProps`              | 替换页头。                         |
| `layout-left-aside`                                                                                             | `ChatLeftAsideSlotProps`           | 替换左侧展开面板。                 |
| `layout-left-aside-brand` / `layout-left-aside-actions` / `layout-left-aside-footer` / `layout-left-aside-rail` | `ChatLeftAsideSlotProps`           | 扩展默认左侧栏对应区域。           |
| `layout-left-aside-content`                                                                                     | `ChatLeftAsideContentSlotProps`    | 扩展默认左侧栏内容区。             |
| `layout-left-aside-history-item-prefix`                                                                         | `ChatHistoryItemPrefixSlotProps`   | 在历史项前添加内容。               |
| `layout-right-aside`                                                                                            | `ChatRightAsidePanelSlotProps`     | 替换整个右栏及其面板。             |
| `layout-right-aside-title`                                                                                      | `ChatRightAsideTitleSlotProps`     | 替换应用添加的面板标题。           |
| `layout-right-aside-panel`                                                                                      | `ChatRightAsidePanelSlotProps`     | 提供应用添加的面板内容。           |
| `layout-main`                                                                                                   | `ChatMainSlotProps`                | 替换消息区和空状态内容。           |
| `layout-empty-state`                                                                                            | `ChatEmptyStateSlotProps`          | 替换没有消息时的内容。             |
| `layout-footer` / `composer-before`                                                                             | `ChatSenderSlotProps`              | 替换默认输入区，或在其前添加内容。 |
| `sender-header` / `sender-footer` / `sender-footer-right`                                                       | 无                                 | 扩展默认输入区。                   |
| `header-notice` / `welcome-footer` / `prompts-footer`                                                           | 无                                 | 扩展对应区域。                     |
| `bubble-prefix` / `bubble-suffix` / `bubble-after`                                                              | `ChatBubbleSlotProps`              | 在消息周围添加内容。               |
| `bubble-content-footer`                                                                                         | `ChatBubbleContentFooterSlotProps` | 在消息内容下方添加内容。           |

替换整个页头、侧栏、消息区或输入区时，需要自行处理该区域的按钮、事件、键盘操作、焦点和屏幕阅读器支持。界面定制优先使用 `ui` 和插槽，不要依赖内部 DOM 或未公开的样式变量。

`layout-main` 会替换消息和空状态内容，并保留外层滚动区域；它优先于 `layout-empty-state`。`layout-footer` 只替换默认输入区。使用 `layout-empty-state` 自定义空状态时，调用插槽参数中的 `renderComposer()` 才会显示默认输入区。

### 类型索引

#### 组件类型

| 类型                           | 种类        | 说明                                              |
| ------------------------------ | ----------- | ------------------------------------------------- |
| `ChatUIProps`                  | `interface` | `TrChatUI` 的属性类型，属性名采用小驼峰写法。     |
| `ChatUIEmits`                  | `interface` | `TrChatUI` 事件名到参数元组的映射。               |
| `ChatUISlots`                  | `interface` | 两个组件共享的插槽函数映射。                      |
| `ChatUIData`                   | `interface` | 显示数据；字段行为见 [ChatUIData](#chatuidata)。  |
| `ChatUIOptions`                | `interface` | 界面配置；字段行为见 [ChatUIOptions](#界面配置)。 |
| `ChatCssSize`                  | `type`      | `string \| number`。                              |
| `ChatWelcomeComposerPlacement` | `type`      | `'footer' \| 'center'`。                          |
| `ChatRightAsidePanelId`        | `type`      | `string`。                                        |
| `ChatRightAsidePanelContext`   | `interface` | 当前 `panelId` 与可选的面板配置。                 |
| `ChatBuiltInModelFeature`      | `type`      | `'thinking' \| 'search'`。                        |
| `ChatRequestState`             | `type`      | 请求状态类型。                                    |
| `ChatProcessingState`          | `type`      | `'requesting' \| 'completing' \| string`。        |

会话、消息和操作相关类型见 [Chat 配置与操作 API](./chat-runtime#api)。

#### 展示数据类型

| 类型                   | 说明                                                                      |
| ---------------------- | ------------------------------------------------------------------------- |
| `ChatConversationView` | 会话列表、当前 ID、标题和可选历史分组。                                   |
| `ChatHistoryData`      | `ChatConversationInfo[] \| ChatHistoryGroup[]`。                          |
| `ChatHistoryGroup`     | `group: string \| symbol` 与 `items`。                                    |
| `ChatBubbleView`       | 消息列表容器。                                                            |
| `ChatSenderView`       | 输入区 loading、disabled 与 submitDisabled 状态。                         |
| `ChatRequestView`      | 请求 `state` 与可选 `processingState`。                                   |
| `ChatModelView`        | 模型列表、选中值、功能开关、思考强度和加载状态。                          |
| `ChatModelOptionView`  | 单个模型的名称、支持的功能、思考强度与附加信息。                          |
| `ChatMcpView`          | MCP 服务列表与工具映射。                                                  |
| `ChatMcpServerView`    | 单个 MCP 服务的安装、启用、加载和错误状态。                               |
| `ChatMcpToolView`      | 单个工具的名称、启用和加载状态。                                          |
| `ChatMcpToolMap`       | `Partial<Record<string, readonly ChatMcpToolView[]>>`，键为 MCP 服务 ID。 |

#### 界面配置类型

| 类型                         | 说明                                                                        |
| ---------------------------- | --------------------------------------------------------------------------- |
| `ChatLayoutOptions`          | 页面显示方式、空状态、内容宽度、间距和两侧栏。                              |
| `ChatSurfaceOptions`         | 普通页面或浮动窗口配置。                                                    |
| `ChatComposerLayoutOptions`  | 欢迎区中输入区的位置。                                                      |
| `ChatBrandOptions`           | 品牌名称与图标。                                                            |
| `ChatLabels`                 | Chat 所有内置中文文案字段。                                                 |
| `ChatAsideOptions`           | 左栏模式、宽度与开闭值。                                                    |
| `ChatRightAsideOptions`      | 右栏模式、宽度、缩放与面板注册。                                            |
| `ChatRightAsidePanelOptions` | `id` 与可选 `title`。                                                       |
| `ChatHistoryOptions`         | 基于 `HistoryProps<ChatConversationInfo>`，排除 Chat 管理的数据和事件字段。 |
| `ChatBubbleOptions`          | 气泡渲染、列表和自动滚动配置。                                              |
| `ChatBubbleListOptions`      | 基于 `BubbleListProps`，排除 Chat 管理的消息和自动滚动字段。                |
| `ChatWelcomeOptions`         | `Partial<WelcomeProps>`。                                                   |
| `ChatPromptsOptions`         | 基于 `PromptsProps`，增加可选 `items`。                                     |
| `ChatSenderOptions`          | 基于 `SenderProps`，排除值、loading、disabled 和原始 defaultActions。       |
| `ChatSenderDefaultActions`   | 基于 `DefaultActions`，提交按钮的 disabled 由 Chat 管理。                   |
| `ChatModelOptions`           | 模型选择器弹出面板所在容器的配置。                                          |
| `ChatMcpOptions`             | 当前为空对象配置。                                                          |

#### 插槽参数

| 类型                               | 字段                                                                                                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatHeaderSlotProps`              | `title`；`isEmpty`；`conversation`；`createConversation()`；`isLeftAsideOpen`；`openLeftAside()`；`closeLeftAside()`；`toggleLeftAside()`；`openRightAside(panel?)`；`closeRightAside()`                    |
| `ChatLeftAsideSlotProps`           | `conversation`；`isOpen`；`isDock`；`createConversation()`；`switchConversation(id)`；`renameConversation(id, title)`；`deleteConversation(id)`；`openLeftAside()`；`closeLeftAside()`；`toggleLeftAside()` |
| `ChatLeftAsideContentSlotProps`    | 继承 `ChatLeftAsideSlotProps`；`history?: ChatHistoryData`                                                                                                                                                  |
| `ChatHistoryItemPrefixSlotProps`   | `item: ChatConversationInfo`                                                                                                                                                                                |
| `ChatRightAsidePanelSlotProps`     | `panelId?`；`panel?`；`panels`；右栏打开、关闭、切换和激活方法；`isRightAsideOpen`                                                                                                                          |
| `ChatRightAsideTitleSlotProps`     | `panelId?`；`panel?`                                                                                                                                                                                        |
| `ChatSenderSlotProps`              | `value`；`loading`；`disabled`；`submitDisabled`；输入更新、提交、取消和清空方法                                                                                                                            |
| `ChatMainSlotProps`                | `messages`；`request?`；`conversation`                                                                                                                                                                      |
| `ChatEmptyStateSlotProps`          | 继承主区数据；`isEmpty: true`；`renderComposer()`                                                                                                                                                           |
| `ChatBubbleSlotProps`              | `messages`；`role?`；`messageIndexes`                                                                                                                                                                       |
| `ChatBubbleContentFooterSlotProps` | 继承 `ChatBubbleSlotProps`；`contentIndex?`                                                                                                                                                                 |

#### 事件参数

| 类型                                                     | 字段                                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `ChatSendPayload`                                        | `text: string`；`structuredData?: ChatStructuredData`                                                   |
| `ChatStructuredData`                                     | `ChatStructuredDataItem[]`                                                                              |
| `ChatStructuredDataItem`                                 | `type: string`；可追加自定义字段。                                                                      |
| `ChatHistoryActionPayload`                               | `action: HistoryMenuItem`；`conversation: ChatConversationInfo`；`defaultPrevented`；`preventDefault()` |
| `ChatSwitchConversationPayload`                          | `conversationId: string`                                                                                |
| `ChatRenameConversationPayload`                          | `conversationId: string`；`title: string`                                                               |
| `ChatPromptClickPayload`                                 | `event: MouseEvent`；`item: PromptProps`                                                                |
| `ChatModelSelectPayload`                                 | `modelId: string \| null`                                                                               |
| `ChatModelFeatureChangePayload`                          | `featureId: 'thinking' \| 'search'`；`enabled: boolean`                                                 |
| `ChatModelReasoningEffortChangePayload`                  | `effort: string \| null`                                                                                |
| `ChatMcpAddServerPayload` / `ChatMcpRemoveServerPayload` | `serverId: string`                                                                                      |
| `ChatMcpCreateServerPayload`                             | `config: McpExtensionFormValue`；`source: McpExtensionFormMode`                                         |
| `ChatMcpServerEnabledChangePayload`                      | `serverId: string`；`enabled: boolean`                                                                  |
| `ChatMcpToolEnabledChangePayload`                        | `serverId: string`；`toolId: string`；`enabled: boolean`                                                |
| `ChatAsideOpenChangePayload`                             | `open: boolean`；`source: 'user' \| 'viewport'`                                                         |
| `ChatBubbleStateChangePayload`                           | `key`；`value`；`messageIndex`；`contentIndex`                                                          |
| `ChatBubbleEventPayload`                                 | `name`；`payload?`；`messageIndex`；`contentIndex`                                                      |

`LayoutFloatingState`、`LayoutFloatingDragDetail`、`LayoutFloatingResizeDetail`、`HistoryMenuItem`、`PromptProps`、`BubbleMessage`、`ModelSelectorReasoningEffortOption`、`McpExtensionFormValue` 和 `McpExtensionFormMode` 来自 `@opentiny/tiny-robot`。气泡状态、事件和渲染器见 [Bubble](../components/bubble)。

## 常见问题

### 页面没有高度或消息区不滚动

为 Chat 的父容器设置明确高度，例如快速开始中的 `height: 600px`。使用百分比高度时，祖先容器也需要有明确高度；使用 flex 布局时，检查消息区所在的子项是否允许收缩（如设置 `min-height: 0`）。
