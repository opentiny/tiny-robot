---
outline: [1, 3]
---

# Chat 聊天套件

`@opentiny/tiny-robot-chat` 提供两种聊天入口：由运行时对象（`ChatRuntime`）驱动的完整页面 `TrChat`，以及由应用完全控制数据和请求的纯界面入口 `TrChatUI`。

本文按“先接入、再理解、最后定制”的顺序组织。首次接入只需阅读“快速开始”；只有需要接入已有数据层、模型能力或 MCP 时，才继续阅读对应章节。

## 概览

### 适用场景

- 使用 `TrChat` 快速嵌入带会话、消息、模型选择和输入区的聊天页面。
- 使用 `TrChatUI` 将现有数据仓库、请求层或 Agent 数据接入 Chat 外观。
- 使用 `ChatRuntime` 统一会话、发送、模型和 MCP 状态。

### 入口选择

| 场景                               | 入口                             | 需要由应用负责的内容              |
| ---------------------------------- | -------------------------------- | --------------------------------- |
| 从零创建聊天页                     | `useLocalChatRuntime` + `TrChat` | 模型服务配置或自定义响应 Provider |
| 已有 Kit `useConversation`         | `useKitChatRuntime` + `TrChat`   | 已有会话和消息引擎                |
| 已有自定义数据仓库、请求层或 Agent | `TrChatUI`                       | 会话、消息、请求、鉴权和错误处理  |

### 职责边界

| 使用方式   | 数据来源                                     | 接入关系                               | 组件责任                        |
| ---------- | -------------------------------------------- | -------------------------------------- | ------------------------------- |
| 完整聊天页 | `useLocalChatRuntime` 或 `useKitChatRuntime` | Runtime -> `TrChat`                    | 消费发送、会话、模型和 MCP 动作 |
| 纯界面入口 | 应用数据和请求层                             | 应用数据 -> `TrChatUI` -> 应用事件处理 | 展示数据并派发用户操作          |

宿主应用负责后端代理（BFF）、权限、持久化、错误展示和页面容器。`TrChatUI` 可以独立使用，也可以作为 `TrChat` 内部的界面实现；它不是 `TrChat` 的下游接入层。

## 快速开始

### 安装

```bash
pnpm add @opentiny/tiny-robot-chat
```

在应用入口引入样式：

```ts
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'
```

Chat 必须放在有明确高度的容器中：

```css
.chat-page {
  height: 100vh;
  min-height: 480px;
}
```

### 最小接入

传入一个模型服务配置即可渲染完整聊天页。示例使用文档站的确定性模拟接口，发送后可以看到消息结果。

<demo
  vue="../../demos/chat/Basic.vue"
  :vueFiles="['../../demos/chat/Basic.vue']"
  title="完整聊天页面"
  description="使用 Runtime 和模型服务配置完成一次可运行的聊天接入。"
/>

核心代码只有运行时对象、模型服务配置和 `TrChat`：

```vue
<script setup lang="ts">
import { TrChat, useLocalChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'openai',
    // BFF 暴露 POST /api/chat/completions，并负责服务端认证。
    apiUrl: '/api',
    models: [{ id: 'assistant', label: '应用助手' }],
  },
]

const runtime = useLocalChatRuntime({ modelProviders })
</script>

<template>
  <main class="chat-page">
    <TrChat :runtime="runtime" />
  </main>
</template>
```

`apiUrl` 可以是服务根地址，也可以是已经包含 `/chat/completions` 的地址。生产环境应让 BFF 保存长期密钥，不要把密钥下发到浏览器。

## 完整案例

下面的案例展示完整页面和多项能力组合：

- [TinyRobot](/examples/chat-tiny-robot)
- [DeepSeek](/examples/chat-deepseek)
- [DouBao](/examples/chat-doubao)
- [Gemini](/examples/chat-gemini)
- [WorkHelper](/examples/chat-worker-helper)

案例默认使用文档站的模拟请求；接入真实服务时，请按“配置模型服务”和“MCP 服务和工具”章节替换请求地址和认证方式。

## 常用接入

### 配置模型服务

`ChatProviderConfig.type` 当前支持 `openai`、`deepseek` 和 `qwen`。每个模型的 `id` 必须全局唯一，第一个模型作为初始选择项。这里的 Provider 指模型服务配置。

```ts
import type { ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    label: '团队模型',
    apiUrl: '/api/model',
    // apiKey 可省略，由 BFF 负责认证。
    headers: { 'X-Client-Name': 'my-chat' },
    timeout: 60_000,
    models: [
      {
        id: 'qwen-plus',
        label: '通义千问',
        capabilities: { thinking: true, search: true },
      },
    ],
  },
]
```

| 字段                    | 说明                                            |
| ----------------------- | ----------------------------------------------- |
| `apiUrl`                | 自动补全 `/chat/completions`；末尾 `/` 会被移除 |
| `apiKey`                | 默认生成 Bearer 认证；生产环境不应放在前端      |
| `headers`               | 额外请求头；`Authorization` 优先于 `apiKey`     |
| `timeout`               | 连接和流读取超时，单位为毫秒                    |
| `models[].capabilities` | 控制 `thinking`、`search` 控件是否可用          |
| `models[].featureBody`  | 覆盖能力开关对应的请求体片段                    |
| `models[].efforts`      | 配置 reasoning effort 选项                      |

能力开关只描述 UI 可用性，最终请求是否被上游接受由服务端决定。每次发送都会保存模型、能力和 reasoning 的 `ChatRunConfig` 快照。

### 复用会话和存储

新项目使用 `useLocalChatRuntime`。已经创建 Kit `useConversation` 的项目使用 `useKitChatRuntime`：

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'
import { TrChat, useKitChatRuntime } from '@opentiny/tiny-robot-chat'

const conversation = useConversation({
  useMessageOptions: {
    // 按 Kit 的消息响应 Provider 接入已有请求层。
    responseProvider: myResponseProvider,
  },
})

const runtime = useKitChatRuntime({ conversation })
```

`useLocalChatRuntime` 的响应层二选一：提供 `modelProviders`，或在 `conversation.useMessageOptions.responseProvider` 中提供自定义 Provider；两者同时提供会抛错。

需要独立存储 key 时，将 `storage` 传给 `conversation`：

```ts
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'

const runtime = useLocalChatRuntime({
  conversation: {
    storage: localStorageStrategyFactory({ key: 'my-chat-conversations' }),
  },
  modelProviders,
})
```

### 调整页面布局

`ui` 只控制显示和布局，不会删除运行时对象中的模型或 MCP 状态。

```ts
const ui = {
  brand: { name: '研发助手' },
  layout: {
    contentMaxWidth: 960,
    panelPadding: 16,
    composer: { welcome: 'center' },
    leftAside: { width: 280, defaultOpen: true },
    rightAside: { mode: 'drawer', width: 320 },
  },
  welcome: { title: '开始一个新问题', description: '输入内容开始对话。' },
  sender: { maxLength: 4000, placeholder: '输入消息' },
}
```

常见默认值：

| 配置                                        | 默认值       |
| ------------------------------------------- | ------------ |
| `layout.surface.mode`                       | `'normal'`   |
| `layout.emptyState`                         | `'start'`    |
| `layout.composer.welcome`                   | `'footer'`   |
| `layout.contentMaxWidth`                    | `980`        |
| `layout.panelPadding` / `panelGap`          | `12` / `12`  |
| `layout.leftAside.width` / `collapsedWidth` | `300` / `56` |
| `layout.leftAside.defaultOpen`              | `false`      |
| `layout.rightAside`                         | `false`      |
| `sender.maxLength`                          | `1000`       |
| `bubble.autoScroll`                         | `true`       |

## 状态与交互

### 请求状态

`activeConversation.requestState` 的公开取值为 `idle`、`processing`、`completed`、`paused`、`aborted` 和 `error`。`processingState` 可进一步表示 `requesting` 或 `completing` 等处理中阶段。

状态所有权：

| 状态           | 管理方                                | 应用责任                            |
| -------------- | ------------------------------------- | ----------------------------------- |
| 当前会话、消息 | Runtime 或宿主 `data`                 | 需要自定义数据层时写回最新事实      |
| 输入草稿       | `TrChat` 适配器或 `TrChatUI` 受控属性 | 受控模式下同步 `update:input-value` |
| 请求状态       | Runtime 或宿主 `data.request`         | 展示 loading、错误和恢复入口        |
| 模型/MCP 选择  | Runtime 输入区状态或宿主事件处理      | 通过公开动作更新，不修改只读快照    |

### 发送前校验和发送结果

`beforeSend` 在创建会话和用户消息前执行：

```ts
const runtime = useLocalChatRuntime({
  modelProviders,
  beforeSend: ({ runConfig, model, mcp }) => {
    if (!model || !runConfig?.modelId) {
      throw new Error('请先选择模型')
    }

    return 'continue'
  },
})
```

返回值含义：

| 返回值       | 结果                     |
| ------------ | ------------------------ |
| `'continue'` | 继续创建会话并发送       |
| `'handled'`  | 应用已经处理，不创建消息 |
| `'reject'`   | 阻止发送并保留草稿       |

`runtime.actions.send()` 在文本为空、发送被禁用、MCP 工具未准备好或 `beforeSend` 返回 `'reject'` 时返回 `false`；请求错误或校验函数抛错时 reject 原始错误。

### 组件事件和动作责任

`TrChat` 会消费标准动作；`TrChatUI` 只派发事件，宿主必须处理这些事件并更新 `data`。

| 事件/动作                   | `TrChat`         | `TrChatUI` |
| --------------------------- | ---------------- | ---------- |
| `submit`、`cancel`、`clear` | 内部调用 Runtime | 派发给宿主 |
| 创建、切换、重命名会话      | 内部调用 Runtime | 派发给宿主 |
| 模型/MCP 操作               | 内部调用 Runtime | 派发给宿主 |
| `prompt-click`、气泡事件    | 向外派发         | 向外派发   |
| `runtime-action-error`      | 向外派发         | 不提供     |

监听 `runtime-action-error` 统一处理 Runtime 动作错误：

```vue
<TrChat :runtime="runtime" @runtime-action-error="({ action, error }) => report(action, error)" />
```

## 组合与定制

### 使用 TrChatUI

`TrChatUI` 适合应用已经拥有会话和请求状态的场景。下面的示例使用本地状态接收提交内容，并把结果写回消息列表。

<demo
  vue="../../demos/chat/UIControlled.vue"
  :vueFiles="['../../demos/chat/UIControlled.vue']"
  title="纯界面接入"
  description="宿主维护输入、消息和请求状态，组件只负责展示和派发事件。"
/>

受控输入必须同步 `update:input-value`；使用 `defaultInputValue` 时由组件维护草稿，生命周期内不要切换两种模式。

```vue
<TrChatUI
  :data="data"
  :input-value="inputValue"
  @update:input-value="inputValue = $event"
  @submit="handleSubmit"
  @cancel="cancelRequest"
/>
```

宿主至少需要维护：`data.conversation`、`data.bubble.messages`、`data.sender`、`data.request`，以及创建、切换、重命名、删除和历史菜单事件。

### 使用插槽

优先使用局部插槽；只有需要接管整块布局时才使用 `layout-*` 插槽。

| Slot                                               | 作用                                |
| -------------------------------------------------- | ----------------------------------- |
| `header-notice`                                    | Header 提示                         |
| `layout-header`                                    | 完整替换 Header，并接管侧栏按钮行为 |
| `layout-left-aside-content`                        | 替换历史列表内容                    |
| `layout-right-aside-panel`                         | 渲染注册的业务右栏面板              |
| `composer-before`                                  | 输入区前置内容                      |
| `sender-footer` / `sender-footer-right`            | 输入区底部内容                      |
| `request-error`                                    | 自定义请求错误，参数为 `{ error }`  |
| `welcome-footer` / `prompts-footer`                | 欢迎区和提示项底部扩展              |
| `bubble-prefix` / `bubble-suffix` / `bubble-after` | 消息周边扩展                        |
| `bubble-content-footer`                            | 消息内容底部扩展                    |
| `layout-main` / `layout-footer`                    | 完整替换主区或输入区                |

替换默认输入、气泡或布局时，插槽内容需要自行承担原有事件、键盘、ARIA、焦点和状态责任。

### 添加右侧面板和浮动布局

通过 `layout.rightAside.panels` 注册业务面板，使用 `layout-right-aside-panel` 渲染：

```vue
<TrChat
  :runtime="runtime"
  :ui="{ layout: { rightAside: { panels: [{ id: 'details', title: '详情' }] } } }"
  v-model:right-aside-open="rightAsideOpen"
  v-model:active-right-aside-panel-id="activePanelId"
>
  <template #layout-right-aside-panel="{ panelId }">
    <DetailPanel v-if="panelId === 'details'" />
  </template>
</TrChat>
```

`layout.surface.mode: 'floating'` 适合悬浮聊天窗；`floatingState` 与 `update:floating-state` 配合使用。移动端会将侧栏切换为抽屉，并通过 `source: 'viewport'` 的状态事件通知宿主。

## 高级与边界

### MCP 服务和工具

MCP 有两个互斥入口：

| 入口         | 使用场景                                              |
| ------------ | ----------------------------------------------------- |
| `mcpServers` | 浏览器可访问的 Streamable HTTP MCP，默认入口          |
| `mcp`        | 自定义 transport、OAuth、权限过滤、连接复用或企业网关 |

```ts
const mcpServers = [
  {
    id: 'project-tools',
    name: '项目工具',
    baseUrl: '/api/mcp/project-tools',
    installed: false,
    timeout: 30_000,
  },
]

const runtime = useLocalChatRuntime({ modelProviders, mcpServers })
```

`installed` 表示是否已安装，`enabled` 表示本轮是否允许使用；工具还可以单独启用。`installed: true` 不会自动启用 Server。工具发现完成前，提交会保持禁用。

`mcp` 和 `mcpServers` 不能同时传入；未配置时不会创建 MCP Adapter。自定义 Adapter 必须提供 `runtime`、`listTools` 和 `callTool`：

```ts
const mcp = {
  runtime: customRuntime,
  async listTools(serverIds, selectedToolIds) {
    // 返回当前回合允许暴露给模型的工具定义。
    return getTools(serverIds, selectedToolIds)
  },
  async callTool(serverId, originalName, args) {
    return callBusinessTool(serverId, originalName, args)
  },
}
```

### 安全、BFF 和结构化数据

浏览器直连只适合无敏感凭证且允许 CORS 的公共服务。生产环境应使用 BFF：

```text
Browser -> /api/mcp/project-tools -> MCP Server
```

BFF 负责凭证、OAuth、权限过滤、审计、限流和 CORS；Chat 不读取环境变量，也不会替 BFF 保存密钥。

`ChatSendPayload.structuredData` 是公开字段，但默认 `useKitChatRuntime` 只将 `text` 写入用户消息。需要持久化结构化内容时，使用自定义 Runtime 或在应用层完成协议转换。

### 响应式、容器和主题变量

- 父容器必须提供可计算高度，消息区内部负责滚动。
- 桌面断点为 `960px`；移动端侧栏使用抽屉并根据视口主动关闭。
- `contentMaxWidth` 控制内容列宽度，长内容由消息区滚动处理。
- `--tr-chat-ui-content-max-width`、`--tr-chat-ui-panel-padding`、`--tr-chat-ui-panel-gap` 由 `ui.layout` 生成，属于实现使用的主题变量；除非项目主题契约明确承诺，不应把它们当作稳定公共 API。

## API 参考

### 组件和函数

| 导出                    | 用途                                        |
| ----------------------- | ------------------------------------------- |
| `TrChat`                | Runtime 驱动的完整聊天页面                  |
| `TrChatUI`              | 由 `data` 和事件驱动的纯界面组件            |
| `useLocalChatRuntime`   | 组装 Kit、Provider 和可选 MCP               |
| `useKitChatRuntime`     | 将 Kit `useConversation` 转为 `ChatRuntime` |
| `useChatRuntimeAdapter` | 将 Runtime 投影为 UI Data                   |
| `useChatHistoryItems`   | 规范化平铺历史项                            |
| `useChatHistoryData`    | 规范化平铺或分组历史数据                    |

### TrChat Props

| 属性                                                         | 类型                  | 说明                     |
| ------------------------------------------------------------ | --------------------- | ------------------------ |
| `runtime`                                                    | `ChatRuntime`         | 必填，Runtime 数据和动作 |
| `ui`                                                         | `ChatUIOptions`       | 页面布局、文案和区域配置 |
| `title`                                                      | `string`              | 覆盖当前页面标题         |
| `floatingState`                                              | `LayoutFloatingState` | 受控浮层状态             |
| `rightAsideOpen` / `defaultRightAsideOpen`                   | `boolean`             | 右栏受控值或初始值       |
| `activeRightAsidePanelId` / `defaultActiveRightAsidePanelId` | `string`              | 当前面板受控值或初始值   |
| `historyData`                                                | `ChatHistoryData`     | 自定义历史列表或分组数据 |

### TrChatUI Props

| 属性                                                         | 类型                  | 说明                                        |
| ------------------------------------------------------------ | --------------------- | ------------------------------------------- |
| `data`                                                       | `ChatUIData`          | 宿主提供的展示事实                          |
| `ui`                                                         | `ChatUIOptions`       | 页面布局、文案和区域配置                    |
| `inputValue`                                                 | `string`              | 受控输入值；使用时同步 `update:input-value` |
| `defaultInputValue`                                          | `string`              | 非受控输入初始值                            |
| `floatingState`                                              | `LayoutFloatingState` | 受控浮层状态                                |
| `rightAsideOpen` / `defaultRightAsideOpen`                   | `boolean`             | 右栏受控值或初始值                          |
| `activeRightAsidePanelId` / `defaultActiveRightAsidePanelId` | `string`              | 当前面板受控值或初始值                      |

### Events

| 事件                                                 | Payload                         | 说明                                |
| ---------------------------------------------------- | ------------------------------- | ----------------------------------- |
| `submit`                                             | `ChatSendPayload`               | `TrChatUI` 派发提交                 |
| `cancel` / `clear`                                   | 无                              | 取消请求或清空输入                  |
| `create-conversation`                                | 无                              | 请求创建会话                        |
| `switch-conversation`                                | `{ conversationId }`            | 请求切换会话                        |
| `rename-conversation`                                | `{ conversationId, title }`     | 请求重命名                          |
| `history-action`                                     | `ChatHistoryActionPayload`      | 历史菜单动作，可 `preventDefault()` |
| `prompt-click`                                       | `ChatPromptClickPayload`        | 提示项点击                          |
| `model-select`                                       | `{ modelId }`                   | 模型选择                            |
| `model-feature-change`                               | `{ featureId, enabled }`        | `thinking`/`search` 开关            |
| `model-reasoning-effort-change`                      | `{ effort }`                    | reasoning effort 变化               |
| `mcp-add-server` / `mcp-remove-server`               | `{ serverId }`                  | 安装或删除 MCP Server               |
| `mcp-server-enabled-change`                          | `{ serverId, enabled }`         | Server 启停                         |
| `mcp-tool-enabled-change`                            | `{ serverId, toolId, enabled }` | 工具启停                            |
| `left-aside-open-change` / `right-aside-open-change` | `{ open, source }`              | 侧栏状态变化                        |
| `runtime-action-error`                               | `ChatRuntimeActionErrorPayload` | `TrChat` Runtime 动作错误           |
| `update:right-aside-open`                            | `boolean`                       | 右栏受控更新                        |
| `update:active-right-aside-panel-id`                 | `string \| undefined`           | 当前面板更新                        |
| `update:floating-state`                              | `LayoutFloatingState`           | 浮层位置或尺寸更新                  |
| `floating-*` / `floating-resize-*`                   | 对应 Detail                     | 浮层拖拽和缩放生命周期              |

### 组件实例方法（Expose）

`TrChat` 额外暴露 `send`、`openRightAside`、`closeRightAside`、`toggleRightAside` 和 `activateRightAsidePanel`。`TrChatUI` 暴露右栏的 `openRightAside`、`closeRightAside`、`toggleRightAside` 和 `activateRightAsidePanel`。

### Runtime 类型

| 类型                                                         | 说明                   |
| ------------------------------------------------------------ | ---------------------- |
| `ChatRuntime` / `ChatRuntimeActions`                         | Runtime 状态和动作协议 |
| `ChatConversation` / `ChatConversationInfo`                  | 当前会话和摘要         |
| `ChatMessageItem` / `ChatMessageContent` / `ChatMessagePart` | 消息内容模型           |
| `ChatRequestState` / `ChatProcessingState`                   | 请求状态和处理中阶段   |
| `ChatSendPayload` / `ChatStructuredData`                     | 发送内容               |
| `ChatRunConfig` / `ChatMcpRunConfig`                         | 每轮请求配置快照       |
| `ChatBeforeSend` / `ChatBeforeSendContext`                   | 发送前校验             |
| `ChatProviderConfig` / `ChatProviderModelConfig`             | Provider 配置          |
| `ChatMcpServers` / `ChatMcpServerConfig`                     | 声明式 MCP 配置        |
| `ChatMcpRuntime` / `ChatMcpServerInfo` / `ChatMcpToolInfo`   | 自定义 MCP Runtime     |
| `ChatReadable` / `ChatWritable`                              | Runtime 响应式值协议   |

### UI 类型

| 类型                                                                                                      | 说明                      |
| --------------------------------------------------------------------------------------------------------- | ------------------------- |
| `ChatUIData`                                                                                              | TrChatUI 展示数据         |
| `ChatUIOptions` / `ChatLayoutOptions`                                                                     | 页面和布局配置            |
| `ChatLabels` / `ChatBrandOptions`                                                                         | 文案和品牌                |
| `ChatHistoryOptions` / `ChatPromptsOptions` / `ChatSenderOptions`                                         | 历史、提示和输入区配置    |
| `ChatBubbleOptions` / `ChatModelView` / `ChatMcpView`                                                     | 消息、模型和 MCP 展示配置 |
| `ChatUIEmits` / `ChatUISlots`                                                                             | 事件和插槽类型            |
| `ChatHeaderSlotProps` / `ChatLeftAsideSlotProps` / `ChatRightAsidePanelSlotProps` / `ChatSenderSlotProps` | 作用域插槽参数            |

## 排错

### 页面没有高度或消息区不滚动

检查应用根节点、页面容器和 Chat 外层是否存在可计算高度，以及中间 flex 子项是否允许收缩。

### `send` 返回 `false`

文本为空、输入区被禁用、MCP 工具仍在加载或 `beforeSend` 返回 `'reject'` 时会返回 `false`。网络和 Provider 错误会 reject。

### `modelProviders` 和 `responseProvider` 不能同时配置

两者都是响应层来源。选择内置 Provider 或自定义响应 Provider 其中一个。

### `installed: true` 是否会启用 MCP

不会。它只表示已安装；Server 和工具仍需单独启用，工具发现完成前提交会被禁用。

### `TrChatUI` 是否保存会话

不会。宿主必须处理所有事件，并把会话、消息、请求和输入状态写回 `data`。
