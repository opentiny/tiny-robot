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

### 数据驱动的页面状态

`TrChatUI` 把 `data` 中的会话、消息、输入状态、模型和 MCP 数据映射到对应界面区域。下面三个快照分别描述一个完整场景，便于观察同一数据结构如何随会话进程扩展；示例不发送请求。

<demo
  vue="../../demos/chat/data-driven-ui.vue"
  :vueFiles="['../../demos/chat/data-driven-ui.vue']"
  title="数据驱动的聊天界面"
  description="切换三组 ChatUIData 快照，对比各数据分支对应的界面区域。"
/>

`data.sender.loading` 控制发送中的反馈，`disabled` 和 `submitDisabled` 分别禁用输入或提交。`data.request` 记录请求生命周期，并作为参数传给 `layout-main` 和 `layout-empty-state`；默认界面不会仅根据它额外渲染反馈。可展示的错误属于具体消息，应放在对应 assistant 消息的 `state.error` 中。

### 消息错误状态

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

通过 `ui` 调整内容宽度和页面区域，不会修改 `data` 或 Runtime 中的会话状态。下面的示例始终使用同一份数据，只切换布局配置。

<demo
  vue="../../demos/chat/layout-presets.vue"
  :vueFiles="['../../demos/chat/layout-presets.vue']"
  title="页面布局预设"
  description="比较默认、紧凑内容和专注模式下的页面区域与内容宽度。"
/>

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

### 浮动聊天窗口

`layout.surface.mode: 'floating'` 启用浮动布局。通过 `floatingState` 和 `update:floating-state` 受控位置和尺寸；如果应用不写回新值，窗口会回到旧位置。

<demo
  vue="../../demos/chat/floating-layout.vue"
  :vueFiles="['../../demos/chat/floating-layout.vue']"
  title="受控浮动聊天"
  description="打开聊天窗口并拖动或缩放，观察位置与尺寸状态同步更新。"
/>

### 窄视口与移动端

侧栏的 `dock` 模式占据页面宽度，`drawer` 模式覆盖主内容。下面的约束容器用于比较两种结果；它显式切换模式，不模拟浏览器视口。

<demo
  vue="../../demos/chat/responsive-layout.vue"
  :vueFiles="['../../demos/chat/responsive-layout.vue']"
  title="Dock 与 Drawer"
  description="比较桌面与移动端侧栏交互，并观察侧栏开闭事件。"
/>

组件的自动响应式判断使用浏览器视口：宽度低于 `960px` 时侧栏转为抽屉。仅收窄父容器不会触发自动转换。视口转换导致侧栏状态变化时，会触发 `*-aside-open-change`，其 `source` 为 `'viewport'`；用户点击产生的事件则为 `'user'`。桌面端 `rightAside.mode: 'dock'` 且 `resizable: true` 时可调整右栏宽度，移动端和 `drawer` 模式不支持调整宽度。

## 可访问性与布局约束

- 将 Chat 放入有明确高度的 flex 容器；消息区负责内部滚动。
- 内置图标按钮提供可访问名称。替换 Header、Sender、侧栏或主区后，开发者需要提供等效的名称、键盘操作和焦点管理。
- 宽度不足 `960px` 时，侧栏切换为抽屉。右栏、消息和自定义内容应允许收缩，长内容由区域自身滚动或换行。
- 当前没有另行承诺的 Chat CSS Variable；不要依赖内部 DOM 或 `--tr-chat-ui-*` 变量作为稳定定制入口。

## API

所有 Chat 类型均从 `@opentiny/tiny-robot-chat` 导出，另有说明的 TinyRobot 基础组件类型除外。

### 状态所有权

| 输入或通知                      | 所有者                | 组件行为                                                                                                                |
| ------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `TrChat.runtime`                | Runtime               | `TrChat` 读取状态并执行标准动作；会话、消息、请求、模型和 MCP 的详细协议见 [Chat 运行时](./chat-runtime#runtime-协议)。 |
| `TrChatUI.data`                 | 应用                  | 只读展示快照；用户操作后组件发出事件，应用处理并传入新的 `data`。                                                       |
| `ui`                            | 应用                  | 只配置区域、文案和组件选项，不保存会话数据，也不覆盖 Runtime 状态。                                                     |
| `input-value`、右栏和浮动受控值 | 应用                  | 组件发出 `update:*`，应用必须写回；`default-*` 只提供非受控初始值。                                                     |
| 其他 Events                     | 应用或 Runtime 适配层 | 表达用户意图或状态通知；`TrChatUI` 不会据此修改应用数据。                                                               |

### TrChat API

#### Props

| 属性名                                | 说明                                    | 类型                    | 默认值         | 必填 |
| ------------------------------------- | --------------------------------------- | ----------------------- | -------------- | ---- |
| `runtime`                             | 提供会话、Composer 状态和动作。         | `ChatRuntime`           | —              | 是   |
| `ui`                                  | 配置页面布局、文案和区域。              | `ChatUIOptions`         | 默认界面配置   | 否   |
| `title`                               | 覆盖当前会话提供的页面标题。            | `string`                | —              | 否   |
| `history-data`                        | 覆盖 Runtime 会话生成的历史列表或分组。 | `ChatHistoryData`       | —              | 否   |
| `floating-state`                      | 浮动布局的受控位置和尺寸。              | `LayoutFloatingState`   | —              | 否   |
| `right-aside-open`                    | 右栏受控开闭状态。                      | `boolean`               | —              | 否   |
| `default-right-aside-open`            | 非受控右栏初始开闭状态。                | `boolean`               | `false`        | 否   |
| `active-right-aside-panel-id`         | 右栏受控当前面板；应用处理更新事件。    | `ChatRightAsidePanelId` | —              | 否   |
| `default-active-right-aside-panel-id` | 非受控当前面板初始值。                  | `ChatRightAsidePanelId` | 第一个可用面板 | 否   |

#### Events

`TrChat` 在内部消费提交、取消、会话切换、模型选择和 MCP 开关事件，并调用 Runtime 动作；这些事件不会再次向外发出。

| 事件                                                                | 参数                                 | 触发时机                                                                |
| ------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `runtime-action-error`                                              | `ChatRuntimeActionErrorPayload`      | Runtime 动作失败；send 错误详情仍从所属消息读取。                       |
| `history-action`                                                    | `ChatHistoryActionPayload`           | 历史菜单操作；删除动作可调用 `preventDefault()` 阻止默认 Runtime 删除。 |
| `prompt-click`                                                      | `ChatPromptClickPayload`             | 点击提示项。                                                            |
| `mcp-create-server`                                                 | `ChatMcpCreateServerPayload`         | 请求创建 MCP Server；Runtime 不处理创建表单。                           |
| `bubble-state-change`                                               | `ChatBubbleStateChangePayload`       | 气泡内部状态变化。                                                      |
| `bubble-event`                                                      | `ChatBubbleEventPayload`             | 气泡内容发出自定义事件。                                                |
| `left-aside-open-change` / `right-aside-open-change`                | `ChatAsideOpenChangePayload`         | 侧栏状态变化。                                                          |
| `update:right-aside-open`                                           | `boolean`                            | 请求应用写回受控右栏开闭状态。                                          |
| `update:active-right-aside-panel-id`                                | `ChatRightAsidePanelId \| undefined` | 请求应用写回受控右栏面板。                                              |
| `update:floating-state`                                             | `LayoutFloatingState`                | 请求应用写回受控浮动位置和尺寸。                                        |
| `floating-drag-start` / `floating-drag` / `floating-drag-end`       | `LayoutFloatingDragDetail`           | 浮动窗口拖拽生命周期。                                                  |
| `floating-resize-start` / `floating-resize` / `floating-resize-end` | `LayoutFloatingResizeDetail`         | 浮动窗口缩放生命周期。                                                  |

#### Slots

`TrChat` 将全部界面插槽传给内部的 `TrChatUI`。插槽名、作用域参数和替换责任见 [TrChatUI Slots](#trchatui-slots)；作用域中的会话、提交、模型和 MCP 动作会连接当前 Runtime。

#### Expose

| 方法                      | 签名                                             | 说明                           |
| ------------------------- | ------------------------------------------------ | ------------------------------ |
| `send`                    | `(payload: ChatSendPayload) => Promise<boolean>` | 通过 Runtime 发送消息。        |
| `openRightAside`          | `(panel?: ChatRightAsidePanelId) => void`        | 打开右栏，可同时指定面板。     |
| `closeRightAside`         | `() => void`                                     | 关闭右栏。                     |
| `toggleRightAside`        | `(panel?: ChatRightAsidePanelId) => void`        | 切换右栏，可同时指定面板。     |
| `activateRightAsidePanel` | `(panel: ChatRightAsidePanelId) => boolean`      | 激活存在的面板并返回是否成功。 |

### TrChatUI API

#### Props

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

`input-value` 与 `default-input-value` 二选一，并在组件生命周期内保持同一种模式。左栏的受控开闭值位于 `ui.layout.leftAside.open`；应用收到 `left-aside-open-change` 后更新该配置。

#### Events

| 事件                                                                | 参数                                                     | 应用责任                                          |
| ------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| `submit`                                                            | `ChatSendPayload`                                        | 发送请求并更新消息、请求状态和输入值。            |
| `update:input-value`                                                | `string`                                                 | 受控输入时写回草稿。                              |
| `cancel` / `clear`                                                  | 无                                                       | 中止请求或清空草稿；组件不会修改外部请求。        |
| `create-conversation`                                               | 无                                                       | 清空当前会话或创建新会话。                        |
| `switch-conversation`                                               | `ChatSwitchConversationPayload`                          | 切换数据源并更新 `data.conversation.activeId`。   |
| `rename-conversation`                                               | `ChatRenameConversationPayload`                          | 保存新标题并更新会话列表。                        |
| `history-action`                                                    | `ChatHistoryActionPayload`                               | 处理历史菜单动作；`TrChatUI` 本身不会执行删除。   |
| `prompt-click`                                                      | `ChatPromptClickPayload`                                 | 决定填充输入、直接提交或执行其他操作。            |
| `bubble-state-change` / `bubble-event`                              | 对应 payload                                             | 更新消息状态或处理自定义气泡事件。                |
| `model-select`                                                      | `ChatModelSelectPayload`                                 | 更新 `data.model.selectedId`。                    |
| `model-feature-change`                                              | `ChatModelFeatureChangePayload`                          | 更新能力开关；异步时可同步 `pendingFeatureIds`。  |
| `model-reasoning-effort-change`                                     | `ChatModelReasoningEffortChangePayload`                  | 更新 reasoning effort。                           |
| `mcp-add-server` / `mcp-remove-server`                              | `ChatMcpAddServerPayload` / `ChatMcpRemoveServerPayload` | 更新 MCP Server 列表。                            |
| `mcp-create-server`                                                 | `ChatMcpCreateServerPayload`                             | 创建并接入自定义 MCP Server。                     |
| `mcp-server-enabled-change`                                         | `ChatMcpServerEnabledChangePayload`                      | 更新 Server 启用状态。                            |
| `mcp-tool-enabled-change`                                           | `ChatMcpToolEnabledChangePayload`                        | 更新工具启用状态。                                |
| `left-aside-open-change` / `right-aside-open-change`                | `ChatAsideOpenChangePayload`                             | 受控时写回开闭状态；`source` 区分用户与视口变化。 |
| `update:right-aside-open`                                           | `boolean`                                                | 写回受控右栏开闭状态。                            |
| `update:active-right-aside-panel-id`                                | `ChatRightAsidePanelId \| undefined`                     | 写回受控当前面板。                                |
| `update:floating-state`                                             | `LayoutFloatingState`                                    | 写回受控浮动位置和尺寸。                          |
| `floating-drag-start` / `floating-drag` / `floating-drag-end`       | `LayoutFloatingDragDetail`                               | 按需记录或响应拖拽生命周期。                      |
| `floating-resize-start` / `floating-resize` / `floating-resize-end` | `LayoutFloatingResizeDetail`                             | 按需记录或响应缩放生命周期。                      |

<span id="trchatui-slots"></span>

#### Slots

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

替换整个 Header、侧栏、主区或 Sender 时，插槽内容接管相应的按钮、事件、键盘、焦点和 ARIA 责任。`layout-main` 优先于 `layout-empty-state`。

#### Expose

| 方法                      | 签名                                        | 说明                           |
| ------------------------- | ------------------------------------------- | ------------------------------ |
| `openRightAside`          | `(panel?: ChatRightAsidePanelId) => void`   | 打开右栏，可同时指定面板。     |
| `closeRightAside`         | `() => void`                                | 关闭右栏。                     |
| `toggleRightAside`        | `(panel?: ChatRightAsidePanelId) => void`   | 切换右栏，可同时指定面板。     |
| `activateRightAsidePanel` | `(panel: ChatRightAsidePanelId) => boolean` | 激活存在的面板并返回是否成功。 |

<span id="chatui-data"></span>

#### ChatUIData

`ChatUIData` 是应用拥有的只读展示快照，六个一级字段均为可选。组件会逐字段读取 `conversation`、`bubble` 和 `sender`，省略字段或传入 `undefined` 时使用下表默认值；空字符串、空数组、`false` 和 `null` 会保留，不会被默认值覆盖。`conversation: {}`、`bubble: {}` 和 `sender: {}` 因此会得到各自的字段默认值。`model`、`mcp` 和 `request` 没有默认对象；空的 `model` 或 `mcp` 对象仍表示该能力存在，若要隐藏应省略对应字段或把 `ui.model` / `ui.mcp` 设为 `false`。

| 一级字段       | 类型                   | 对应区域                     | 省略时的结果                          |
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

`ChatConversationInfo`、`ChatMessageItem` 及消息内容结构见 [Chat 运行时：会话、消息与发送](./chat-runtime#会话消息与发送)。

##### `bubble` 与 `sender`

| 路径                    | 类型                | 默认值  | 说明                                       |
| ----------------------- | ------------------- | ------- | ------------------------------------------ |
| `bubble.messages`       | `ChatMessageItem[]` | `[]`    | 消息事实；组件不会追加、删除或持久化消息。 |
| `sender.loading`        | `boolean`           | `false` | 显示发送中反馈并切换为取消操作。           |
| `sender.disabled`       | `boolean`           | `false` | 禁用整个输入区。                           |
| `sender.submitDisabled` | `boolean`           | `false` | 仅禁止提交；输入仍可编辑。                 |

##### `model`

| 字段                 | 类型                                               | 说明                                           |
| -------------------- | -------------------------------------------------- | ---------------------------------------------- |
| `options`            | `ChatModelOptionView[]`                            | 可选模型；空数组显示模型空态。                 |
| `selectedId`         | `string \| null`                                   | 当前模型；选择后应用通过 `model-select` 写回。 |
| `features`           | `Partial<Record<'thinking' \| 'search', boolean>>` | 当前能力开关。                                 |
| `reasoning`          | `{ enabled: boolean; effort?: string }`            | 深度思考及当前 effort。                        |
| `selecting`          | `boolean`                                          | 模型切换中的整体等待状态。                     |
| `reasoningSelecting` | `boolean`                                          | reasoning effort 切换中的等待状态。            |
| `pendingFeatureIds`  | `('thinking' \| 'search')[]`                       | 正在切换的能力，用于逐项等待反馈。             |

`ChatModelOptionView` 至少包含 `id` 和 `label`，还可提供 `description`、`icon`、`disabled`、`group`、effort 列表、默认 effort、能力声明和 `metadata`。选择器浮层挂载位置由 `ui.model.appendTo` 配置，其他行为见 [ModelSelector](../components/model-selector)。

##### `mcp`

| 字段      | 类型                  | 说明                                                               |
| --------- | --------------------- | ------------------------------------------------------------------ |
| `servers` | `ChatMcpServerView[]` | Server 的安装、启用、加载和错误状态；应用处理对应事件后写回。      |
| `tools`   | `ChatMcpToolMap`      | 以 Server ID 为键的工具数组；工具包含 `id`、`name`、`enabled` 等。 |

`ChatMcpServerView` 要求 `id`、`name`、`installed` 和 `enabled`；可选 `description`、`icon`、`category`、`loading`、`error` 与 `metadata`。`ChatMcpToolView` 要求 `id`、`name` 和 `enabled`，可选 `description` 与 `loading`。只有 `ui.mcp` 与 `ui.layout.rightAside` 都未设为 `false` 时，MCP 入口和内置面板才可见。

##### `request`

| 字段              | 类型                                                                        | 必填 | 说明                   |
| ----------------- | --------------------------------------------------------------------------- | ---- | ---------------------- |
| `state`           | `'idle' \| 'processing' \| 'completed' \| 'paused' \| 'aborted' \| 'error'` | 是   | 请求生命周期。         |
| `processingState` | `'requesting' \| 'completing' \| string`                                    | 否   | 应用定义的处理中阶段。 |

`request` 会传给 `layout-main` 和 `layout-empty-state`。默认界面的发送中反馈读取 `sender.loading`，消息错误读取 `message.state.error`；只更新 `request` 不会自动渲染这些反馈。

<span id="chatui-options"></span>

#### ChatUIOptions

`ChatUIOptions` 的十一个一级字段均为可选，并按分支与默认配置合并；传入空对象或 `undefined` 都得到默认界面。标记为 `false` 的区域会被移除；重新传入对象即可恢复。数组字段以应用提供的数组整体替换默认数组，`bubble.bubbleList.roleConfigs` 例外，它按角色键合并。

| 一级字段  | 类型                          | 省略时的行为与合并规则                                                        | `false` 的结果                            |
| --------- | ----------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------- |
| `layout`  | `ChatLayoutOptions`           | 逐个布局字段 fallback，嵌套的 `surface`、`composer`、左右侧栏分别解析。       | 不支持；使用 `leftAside` / `rightAside`。 |
| `brand`   | `ChatBrandOptions`            | 与默认名称 `TinyRobot` 和默认图标浅合并。                                     | 不支持。                                  |
| `labels`  | `Partial<ChatLabels>`         | 按字段覆盖内置中文文案；也会更新默认欢迎文案和历史菜单文案。                  | 不支持。                                  |
| `header`  | `false`                       | 省略时显示默认 Header。                                                       | 移除 Header。                             |
| `history` | `false \| ChatHistoryOptions` | 与默认 History 选项合并；`menuItems` 整体替换默认重命名、删除菜单。           | 隐藏历史列表，左栏品牌和动作仍在。        |
| `welcome` | `false \| ChatWelcomeOptions` | 与默认 Welcome 选项合并；标题和描述 fallback 到 `labels`。                    | 空会话不显示 Welcome。                    |
| `prompts` | `false \| ChatPromptsOptions` | 与默认 Prompts 选项合并；`items` 整体替换，默认 `[]`。                        | 不显示提示项。                            |
| `bubble`  | `ChatBubbleOptions`           | 合并气泡 Provider 和列表配置；`autoScroll` 默认 `true`，system 消息默认隐藏。 | 不支持。                                  |
| `sender`  | `false \| ChatSenderOptions`  | 与默认 Sender 选项浅合并。                                                    | 移除输入区及其插槽。                      |
| `model`   | `false \| ChatModelOptions`   | 默认 `{}`；只有 `data.model` 存在时显示。                                     | 即使存在模型数据也隐藏选择器。            |
| `mcp`     | `false \| ChatMcpOptions`     | 默认 `{}`；当前没有额外配置字段。                                             | 即使存在 MCP 数据也隐藏入口和面板。       |

##### `layout`

| 字段                        | 类型                             | 默认值                   | 说明                                                               |
| --------------------------- | -------------------------------- | ------------------------ | ------------------------------------------------------------------ |
| `surface.mode`              | `'normal' \| 'floating'`         | `'normal'`               | 页面或浮动窗口；浮动时读取 `floatingOptions` 与 `floating-state`。 |
| `emptyState`                | `'start' \| 'center'`            | `'start'`                | 空状态在主区起始位置或居中。                                       |
| `composer.welcome`          | `'footer' \| 'center'`           | `'footer'`               | 空会话时输入区位于 Footer 或 Welcome 中央。                        |
| `contentMaxWidth`           | `string \| number`               | `980`                    | 消息、Welcome 和输入区的最大内容宽度。                             |
| `panelPadding` / `panelGap` | `string \| number`               | `12` / `12`              | 内容区内边距与区域间距。                                           |
| `leftAside`                 | `false \| ChatAsideOptions`      | Dock，`300` / `56`，关闭 | 左栏；`open` 为受控值，`defaultOpen` 为非受控初始值。              |
| `rightAside`                | `false \| ChatRightAsideOptions` | Dock，宽 `320`，不可缩放 | 右栏；只有注册应用面板或存在可见 MCP 数据时才渲染。                |

`ChatAsideOptions` 还包含 `mode`、`width`、`collapsedWidth`。浏览器视口低于 `960px` 时实际模式强制为 `drawer`。`ChatRightAsideOptions` 另有 `showClose`、`resizable`、`minWidth`、`maxWidth` 和 `panels`；`panels` 需要配合 `layout-right-aside` 或 `layout-right-aside-panel` 插槽，重复 ID 以及保留 ID `mcp` 会被忽略。

##### 其他配置字段

| 分支      | 常用字段或默认值                                                                                                 | 详细来源                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `brand`   | `name?: string`、`logo?: unknown`。                                                                              | —                                             |
| `labels`  | 会话创建/重命名/删除、侧栏展开/收起、输入占位、模型、MCP、Welcome、右栏和滚动到底部等文案。                      | —                                             |
| `history` | 默认菜单为重命名和删除；Chat 固定管理 `data`、`selected` 与事件。                                                | [History](../components/history)              |
| `welcome` | 默认标题与描述来自 `labels.welcomeTitle`、`labels.welcomeDescription`。                                          | [Welcome](../components/welcome)              |
| `prompts` | `items?: PromptProps[]`，其余展示选项继承 Prompts。                                                              | [Prompts](../components/prompts)              |
| `bubble`  | `autoScroll`、`bubbleProvider`、`bubbleList`；`bubbleProvider.errorRenderer` 可统一替换消息错误视图。            | [Bubble](../components/bubble)                |
| `sender`  | 默认 `mode: 'multiple'`、`clearable: true`、`maxLength: 1000`、`showWordLimit: true`；值和禁用状态由 Chat 管理。 | [Sender](../components/sender)                |
| `model`   | 当前字段为 `appendTo?: ModelSelectorProps['appendTo']`。                                                         | [ModelSelector](../components/model-selector) |
| `mcp`     | `Record<string, never>`，当前没有配置字段。                                                                      | —                                             |

`ChatLabels` 的字段为 `newConversationTitle`、`createConversation`、`renameConversation`、`deleteConversation`、`expandConversationList`、`collapseConversationList`、`composerPlaceholder`、`composerLoadingPlaceholder`、`selectModel`、`searchModel`、`modelEmptyText`、`mcp`、`thinkingFeature`、`searchFeature`、`welcomeTitle`、`welcomeDescription`、`rightAsideTitle`、`openRightAside`、`closeRightAside` 和 `scrollToBottom`，字段值均为 `string`。

### 类型索引

#### 组件与核心对象

| 类型                           | 种类        | 说明                                                    |
| ------------------------------ | ----------- | ------------------------------------------------------- |
| `ChatUIProps`                  | `interface` | `TrChatUI` Props 的 camelCase 类型。                    |
| `ChatUIEmits`                  | `interface` | `TrChatUI` 事件名到参数元组的映射。                     |
| `ChatUISlots`                  | `interface` | 两个组件共享的插槽函数映射。                            |
| `ChatUIData`                   | `interface` | 展示快照；字段行为见 [ChatUIData](#chatui-data)。       |
| `ChatUIOptions`                | `interface` | 界面配置；字段行为见 [ChatUIOptions](#chatui-options)。 |
| `ChatCssSize`                  | `type`      | `string \| number`。                                    |
| `ChatWelcomeComposerPlacement` | `type`      | `'footer' \| 'center'`。                                |
| `ChatRightAsidePanelId`        | `type`      | `string`。                                              |
| `ChatRightAsidePanelContext`   | `interface` | 当前 `panelId` 与可选的面板配置。                       |
| `ChatBuiltInModelFeature`      | `type`      | `'thinking' \| 'search'`。                              |
| `ChatRequestState`             | `type`      | 请求生命周期联合类型。                                  |
| `ChatProcessingState`          | `type`      | `'requesting' \| 'completing' \| string`。              |

共享的 `ChatConversationInfo`、`ChatMessageItem`、消息内容、Runtime 和动作类型统一列在 [Chat 运行时 API](./chat-runtime#api)，这里不重复定义。

#### 展示数据类型

| 类型                   | 说明                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| `ChatConversationView` | 会话列表、当前 ID、标题和可选历史分组。                                 |
| `ChatHistoryData`      | `ChatConversationInfo[] \| ChatHistoryGroup[]`。                        |
| `ChatHistoryGroup`     | `group: string \| symbol` 与 `items`。                                  |
| `ChatBubbleView`       | 消息列表容器。                                                          |
| `ChatSenderView`       | 输入区 loading、disabled 与 submitDisabled 状态。                       |
| `ChatRequestView`      | 请求 `state` 与可选 `processingState`。                                 |
| `ChatModelView`        | 模型列表、选中值、能力、reasoning 和异步状态。                          |
| `ChatModelOptionView`  | 单个模型的标签、能力、effort 与元数据。                                 |
| `ChatMcpView`          | MCP Server 列表与工具映射。                                             |
| `ChatMcpServerView`    | 单个 Server 的安装、启用、加载和错误状态。                              |
| `ChatMcpToolView`      | 单个工具的名称、启用和加载状态。                                        |
| `ChatMcpToolMap`       | `Partial<Record<string, readonly ChatMcpToolView[]>>`，键为 Server ID。 |

#### 界面配置类型

| 类型                         | 说明                                                                        |
| ---------------------------- | --------------------------------------------------------------------------- |
| `ChatLayoutOptions`          | 页面 surface、空状态、内容宽度、间距和两侧栏。                              |
| `ChatSurfaceOptions`         | 正常或浮动 surface 配置。                                                   |
| `ChatComposerLayoutOptions`  | Welcome 中输入区的位置。                                                    |
| `ChatBrandOptions`           | 品牌名称与图标。                                                            |
| `ChatLabels`                 | Chat 所有内置中文文案字段。                                                 |
| `ChatAsideOptions`           | 左栏模式、宽度与开闭值。                                                    |
| `ChatRightAsideOptions`      | 右栏模式、宽度、缩放与面板注册。                                            |
| `ChatRightAsidePanelOptions` | `id` 与可选 `title`。                                                       |
| `ChatHistoryOptions`         | 基于 `HistoryProps<ChatConversationInfo>`，排除 Chat 管理的数据和事件字段。 |
| `ChatBubbleOptions`          | Bubble Provider、列表和自动滚动配置。                                       |
| `ChatBubbleListOptions`      | 基于 `BubbleListProps`，排除 Chat 管理的消息和自动滚动字段。                |
| `ChatWelcomeOptions`         | `Partial<WelcomeProps>`。                                                   |
| `ChatPromptsOptions`         | 基于 `PromptsProps`，增加可选 `items`。                                     |
| `ChatSenderOptions`          | 基于 `SenderProps`，排除值、loading、disabled 和原始 defaultActions。       |
| `ChatSenderDefaultActions`   | 基于 `DefaultActions`，提交按钮的 disabled 由 Chat 管理。                   |
| `ChatModelOptions`           | ModelSelector 的浮层挂载配置。                                              |
| `ChatMcpOptions`             | 当前为空对象配置。                                                          |

#### 插槽作用域

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
| `ChatMcpCreateServerPayload`                             | `type: 'form' \| 'code'`；`data: PluginCreationData`                                                    |
| `ChatMcpServerEnabledChangePayload`                      | `serverId: string`；`enabled: boolean`                                                                  |
| `ChatMcpToolEnabledChangePayload`                        | `serverId: string`；`toolId: string`；`enabled: boolean`                                                |
| `ChatAsideOpenChangePayload`                             | `open: boolean`；`source: 'user' \| 'viewport'`                                                         |
| `ChatBubbleStateChangePayload`                           | `key`；`value`；`messageIndex`；`contentIndex`                                                          |
| `ChatBubbleEventPayload`                                 | `name`；`payload?`；`messageIndex`；`contentIndex`                                                      |

`LayoutFloatingState`、`LayoutFloatingDragDetail`、`LayoutFloatingResizeDetail`、`HistoryMenuItem`、`PromptProps`、`BubbleMessage`、`ModelSelectorReasoningEffortOption` 和 `PluginCreationData` 来自 `@opentiny/tiny-robot`。气泡状态、事件和渲染器见 [Bubble](../components/bubble)。

## 常见问题

### 页面没有高度或消息区不滚动

检查应用根节点、页面容器和 Chat 外层是否有可计算高度，并允许中间 flex 子项收缩。

### TrChatUI 是否保存会话

不会。应用处理事件后，将会话、消息、请求和输入状态写回 `data`。
