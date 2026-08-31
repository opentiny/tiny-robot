---
outline: [1, 3]
---

# Chat 聊天套件

`@opentiny/tiny-robot-chat` 是基于 Vue 3 的聊天页面组装包。它把会话、消息、模型选择、MCP 工具和响应式工作区组合成可以直接嵌入业务页面的 Chat；同时保留纯 UI 入口，方便接入已有的数据层或请求层。

## 定位与入口选择

Chat 套件分为三层：

```text
业务状态 / TinyRobot Kit / 自定义请求层
          -> ChatRuntime
          -> TrChat
          -> TrChatUI
          -> 布局、历史、消息、输入区和可选侧栏
```

- `TrChat` 是完整聊天页面。它接收 `ChatRuntime`，负责把运行时状态接到界面，并处理标准的发送、会话、模型和 MCP 操作。
- `TrChatUI` 是无业务依赖的 UI Shell。它只接收 `ChatUIData` 和 `ChatUIOptions`，通过事件把用户操作交给宿主。
- `ChatRuntime` 是连接数据与页面的协议，描述会话、当前会话、输入区状态、模型/MCP 状态以及动作。

根据项目现状选择入口：

| 场景                                                     | 推荐入口                                      | 原因                                   |
| -------------------------------------------------------- | --------------------------------------------- | -------------------------------------- |
| 从零开始创建聊天页                                       | `useLocalChatRuntime` + `TrChat`              | 自动组装 Kit 会话、Provider 和可选 MCP |
| 已经使用 `@opentiny/tiny-robot-kit` 的 `useConversation` | `useKitChatRuntime` + `TrChat`                | 复用现有会话、存储和消息引擎           |
| 已有自定义 Store、请求层或 Agent                         | `TrChatUI`，或自定义 `ChatRuntime` + `TrChat` | 保留业务数据与 Chat UI 的边界          |

`TrChatUI` 不创建会话、不发送请求、不连接 Provider，也不管理 MCP。产品级 Dialog、Drawer、悬浮入口和鉴权策略属于宿主页面，不属于 Chat UI 的职责。

## 安装与快速开始

### 安装

在 Vue 3 项目中安装 Chat 依赖：

```bash
pnpm add @opentiny/tiny-robot-chat
```

如果要自定义 Kit 存储或直接创建 `useConversation`，再安装 Kit：

```bash
pnpm add @opentiny/tiny-robot-kit
```

在应用入口引入基础组件样式：

```ts
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'
```

Chat 页面必须放在有明确高度的父容器中，否则内部主区无法正确计算滚动高度：

```css
.chat-page {
  height: 100vh;
  min-height: 480px;
}
```

### 最小接入

下面的交互示例迁移自 `chat-basic`，展示 `TrChat`、多模型 Provider 和流式消息的最小组合。在线文档通过同源 Service Worker 提供模拟响应，不需要配置 API Key：

<demo vue="../../demos/suites/chat/Basic.vue" :vueFiles="['../../demos/suites/chat/Basic.vue']" />

下面的代码把 `openai` Provider 指向应用自己的 OpenAI-compatible BFF，适合迁移到业务项目。它不在浏览器中保存 API Key：

```vue
<script setup lang="ts">
import { TrChat, useLocalChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'openai',
    // BFF 暴露 POST /api/chat/completions，并负责服务端认证。
    apiUrl: '/api',
    models: [{ id: 'assistant', label: '业务助手' }],
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

`apiUrl` 可以是服务根地址，也可以是已经包含 `/chat/completions` 的地址。运行时会规范化地址并通过流式 `POST` 请求发送消息。上例的 BFF 需要实现对应的 OpenAI-compatible 请求协议和认证，不应把长期密钥下发到浏览器。

`useLocalChatRuntime` 要求二选一：

- 提供 `modelProviders`，由内置 Provider 创建响应 Provider；
- 或在 `conversation.useMessageOptions.responseProvider` 中提供自定义响应 Provider。

两者同时提供会抛出错误。第一次发送非空文本时，如果没有当前会话，Runtime 会创建会话并使用标题生成器生成标题。默认会话流程启用消息自动保存；`conversation` 中显式传入的选项会覆盖默认值。

## 示例组织

Chat 的示例分为最小接入和综合案例两类：

- 本文的`最小接入`只展示 `TrChat`、`useLocalChatRuntime` 和 `modelProviders` 的基本组合，适合复制到业务项目中开始接入。
- 综合案例按应用拆分为独立页面，展示 TinyRobot、DeepSeek、豆包、Gemini 和 WorkHelper 等完整页面，源码统一位于 `docs/demos/suites/chat`。

文档中的组件级示例写在 `docs/demos` 中，并通过 `<demo vue="..." />` 嵌入 Markdown；综合案例使用独立 Markdown 页面，可直接进入：

- [TinyRobot](/examples/chat-tiny-robot)
- [DeepSeek](/examples/chat-deepseek)
- [豆包](/examples/chat-doubao)
- [Gemini](/examples/chat-gemini)
- [WorkHelper](/examples/chat-worker-helper)

在线文档案例默认请求同源 `/api`，由 docs Service Worker 返回模拟流式响应，不需要配置 API Key。接入真实后台时，将 `modelProviders[].apiUrl` 指向业务 BFF，并由 BFF 完成认证和上游模型协议转换。

### 自定义存储

`conversation` 的选项会传递给 Kit 的 `useConversation`。例如为不同业务创建独立的 LocalStorage key：

```ts
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'

const runtime = useLocalChatRuntime({
  conversation: {
    storage: localStorageStrategyFactory({ key: 'my-chat-conversations' }),
  },
  modelProviders,
})
```

也可以传入 IndexedDB 或自定义存储策略，具体类型以 `@opentiny/tiny-robot-kit` 的公开 API 为准。

## TrChat 与 TrChatUI

### TrChat：运行时驱动的完整页面

```ts
import { TrChat, type ChatRuntime } from '@opentiny/tiny-robot-chat'

const runtime: ChatRuntime = /* useLocalChatRuntime 或 useKitChatRuntime */
```

```vue
<TrChat
  :runtime="runtime"
  title="产品助手"
  :ui="{ brand: { name: '产品助手' } }"
  @runtime-action-error="handleRuntimeError"
/>
```

`TrChat` 内部使用 `useChatRuntimeAdapter` 把 Runtime 投影成 `ChatUIData`。标准的发送、取消、会话 CRUD、模型选择和 MCP 操作由组件消费；普通的提示项、气泡和侧栏事件会继续向外派发。

### TrChatUI：纯界面入口

`TrChatUI` 适合宿主完全拥有会话和请求状态的场景。它的 `data` 是展示事实，不会被组件内部代替业务持久化。发送事件的 payload 为 `ChatSendPayload`：

```ts
interface ChatSendPayload {
  text: string
  structuredData?: ChatStructuredData
}
```

`structuredData` 是公开的预留字段，但默认 `useKitChatRuntime` 当前只将 `text` 写入用户消息；若结构化内容需要端到端发送和持久化，请使用自定义 Runtime 或在业务层完成协议转换。

## Runtime

### ChatRuntime 协议

`ChatRuntime` 的公开结构如下，所有响应式字段只要求提供只读的 `.value`：

```ts
interface ChatRuntime {
  conversations: ChatReadable<readonly ChatConversationInfo[]>
  activeConversation: ChatReadable<ChatConversation | null>
  composer: ChatComposerRuntime
  actions: ChatRuntimeActions
}

interface ChatRuntimeActions {
  send(payload: ChatSendPayload): Promise<boolean>
  abort?(): Promise<void> | void
  createConversation(payload?: { title?: string; metadata?: Record<string, unknown> }): Promise<void> | void
  switchConversation(id: string): Promise<void> | void
  renameConversation(id: string, title: string): Promise<void> | void
  deleteConversation(id: string): Promise<void> | void
}
```

发送前可以通过 Runtime 的 `beforeSend` 校验本轮模型、能力开关和 MCP 状态：

```ts
type ChatBeforeSendResult = 'continue' | 'handled' | 'reject'

interface ChatBeforeSendContext {
  payload: ChatSendPayload
  runConfig?: Readonly<ChatRunConfig>
  model?: Readonly<ChatModelOption>
  mcp?: {
    servers: readonly ChatMcpServerInfo[]
    tools: ChatMcpToolState
  }
}

type ChatBeforeSend = (context: ChatBeforeSendContext) => ChatBeforeSendResult | Promise<ChatBeforeSendResult>
```

`beforeSend` 在生成本轮 `ChatRunConfig` 快照后、创建会话和用户消息前执行。`continue` 继续发送，`handled` 表示业务已经处理且不创建消息，`reject` 阻止发送并保留草稿。回调抛出错误时同样阻止发送，并通过 `runtime-action-error` 报告。

`activeConversation` 包含消息、`requestState`、可选的 `processingState` 和 `lastError`。请求状态是 `idle`、`processing`、`completed`、`aborted` 或 `error`。

### useLocalChatRuntime

`useLocalChatRuntime(options)` 面向新项目。它会：

1. 创建 Kit `useConversation`；
2. 将 `modelProviders` 解析为模型列表和 Provider 响应层；
3. 将 `mcpServers` 转为默认 Streamable HTTP MCP Adapter，或使用宿主传入的 `mcp` Adapter；
4. 安装运行配置和 MCP 工具插件；
5. 返回可以直接传给 `TrChat` 的 `ChatRuntime`。

常用选项：

| 选项             | 类型                            | 说明                               |
| ---------------- | ------------------------------- | ---------------------------------- |
| `conversation`   | `UseConversationOptions` 子集   | 会话、存储和消息选项               |
| `titleGenerator` | `(text: string) => string`      | 自动创建会话时生成标题             |
| `composer`       | `disabled`、`submitDisabled`    | 宿主控制输入区状态                 |
| `beforeSend`     | `ChatBeforeSend`                | 发送前校验模型、能力和 MCP 状态    |
| `modelProviders` | `ChatProviderConfig[]`          | 内置模型 Provider 配置             |
| `mcpServers`     | `ChatMcpServers`                | 声明式 Streamable HTTP MCP         |
| `mcp`            | `UseLocalChatRuntimeMcpAdapter` | 自定义 MCP Runtime、工具列表和调用 |

### useKitChatRuntime

当宿主已经创建 `useConversation` 时，使用 `useKitChatRuntime`：

```vue
<script setup lang="ts">
import { useConversation } from '@opentiny/tiny-robot-kit'
import { TrChat, useKitChatRuntime } from '@opentiny/tiny-robot-chat'

const conversation = useConversation({
  useMessageOptions: {
    // 按 Kit 的消息响应 Provider 接入已有请求层。
    responseProvider: myResponseProvider,
  },
})

const runtime = useKitChatRuntime({
  conversation,
  titleGenerator: (text) => text.trim().slice(0, 24) || '新对话',
})
</script>

<template><TrChat :runtime="runtime" /></template>
```

它负责把 Kit 会话转换为 Chat 会话，并提供发送、取消、创建、切换、重命名和删除动作。也可以传入 `send` 自定义发送流程、`beforeSend` 校验发送条件，以及 `composer` 注入宿主维护的模型/MCP/禁用状态。

### beforeSend：发送前校验与拦截

```ts
const runtime = useLocalChatRuntime({
  modelProviders,
  mcpServers,
  beforeSend: ({ runConfig, model, mcp }) => {
    if (!model || !runConfig?.modelId) {
      throw new Error('请先选择模型')
    }

    for (const serverId of runConfig.mcp?.serverIds ?? []) {
      const server = mcp?.servers.find((item) => item.id === serverId)

      if (!server || server.loading || server.error || !mcp?.tools[serverId]) {
        throw new Error(`MCP Server 不可用：${serverId}`)
      }
    }

    return 'continue'
  },
})
```

回调接收的是当前发送的只读快照。需要修改模型或 MCP 状态时，应调用 Composer 或 MCP Runtime 的动作，不要在 `beforeSend` 中修改快照。

### send 的返回值与错误

Runtime 的 `actions.send()` 有三种结果：

- 输入为空、输入被禁用或工具尚未准备好时返回 `false`；
- 发送任务完成时返回 `true`；
- 底层请求失败时 reject 原始错误。

```ts
try {
  const accepted = await runtime.actions.send({ text: input })
  if (!accepted) console.warn('消息没有进入发送流程')
} catch (error) {
  console.error('请求失败', error)
}
```

通过 `TrChat` 使用时，适配器会捕获动作错误并触发 `runtime-action-error`；输入草稿会保留，页面默认请求错误区域仍会显示错误。直接调用 Runtime 时应自行处理 rejection。

## Provider：openai、deepseek、qwen

`ChatProviderConfig.type` 当前只接受 `openai`、`deepseek` 和 `qwen`。每个模型的 `id` 必须全局唯一，第一个模型作为初始选择项。

| `type`     | 默认地址                                                             | 内置能力映射                                                           |
| ---------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `openai`   | `https://api.openai.com/v1/chat/completions`                         | 无额外映射；可用模型 `featureBody` 自定义                              |
| `deepseek` | `https://api.deepseek.com/chat/completions`                          | `thinking` 映射为 `thinking.type`；reasoning effort 支持 `high`、`max` |
| `qwen`     | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` | `thinking` 映射为 `enable_thinking`，`search` 映射为 `enable_search`   |

Provider 配置：

```ts
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

字段含义：

- `apiUrl` 会去除末尾 `/`；不是 `/chat/completions` 结尾时自动追加该路径。
- `apiKey` 可选。配置后默认作为 Bearer 认证；自定义 `headers.Authorization` 优先。
- `headers` 用于额外请求头。生产环境不要在前端放长期密钥。
- `timeout` 单位为毫秒，覆盖连接和流读取阶段的请求超时。
- `models[].capabilities` 控制界面是否展示 `thinking`、`search` 开关。
- `models[].featureBody` 可以覆盖内置能力开关对应的请求体片段。
- `models[].reasoning` 可配置 `efforts`、`defaultEffort` 和 `effortParam`。

`capabilities` 只决定 UI 可用性，并不保证上游模型支持对应字段；最终请求是否接受由服务端决定。模型、能力开关和 reasoning 会在每次发送时保存为该轮的 `ChatRunConfig`，发送后再切换只影响下一轮。

## MCP：服务与工具

### 两种入口

`useLocalChatRuntime` 提供两种互斥配置：

| 入口         | 适用场景                                                       |
| ------------ | -------------------------------------------------------------- |
| `mcpServers` | 浏览器可访问的远程 Streamable HTTP MCP，默认推荐               |
| `mcp`        | 自定义协议、stdio、旧 SSE、OAuth、企业网关、权限过滤或连接复用 |

同一次调用不能同时传入 `mcp` 和 `mcpServers`，否则会同步抛错。未配置两者时不会创建 MCP Adapter。

### mcpServers

```ts
import type { ChatMcpServers } from '@opentiny/tiny-robot-chat'

const mcpServers: ChatMcpServers = [
  {
    id: 'project-tools',
    name: '项目工具',
    description: '项目查询和自动化操作',
    baseUrl: '/api/mcp/project-tools',
    timeout: 30_000,
  },
]

const runtime = useLocalChatRuntime({ modelProviders, mcpServers })
```

配置字段：

| 字段          | 是否必填 | 说明                                  |
| ------------- | -------- | ------------------------------------- |
| `id`          | 是       | 唯一标识，重复 ID 创建 Adapter 时抛错 |
| `name`        | 是       | UI 展示名称                           |
| `baseUrl`     | 是       | Streamable HTTP MCP 地址              |
| `installed`   | 否       | 初始安装状态，默认为 `false`          |
| `description` | 否       | UI 描述                               |
| `icon`        | 否       | UI 图标地址，作为 metadata 保存       |
| `headers`     | 否       | 请求头；敏感认证头应由 BFF 注入       |
| `timeout`     | 否       | 连接和请求超时时间，单位为毫秒        |
| `validate`    | 否       | 建立连接前执行的校验函数              |

相对地址在浏览器中按当前页面 origin 解析；非浏览器环境必须使用绝对 URL。默认 Adapter 只使用 MCP Streamable HTTP，不启动本地进程，也不自动处理 OAuth 或旧 SSE。

### installed、enabled 与工具发现

这三个状态含义不同：

- `installed` 表示 Server 是否已经安装到当前 Runtime；
- `enabled` 表示本轮是否允许使用该 Server；
- 工具列表表示该 Server 已经发现的可调用工具，工具还可以单独启用或禁用。

`installed: true` 表示初始化时已安装。默认 Adapter 会在初始化后后台连接并发现工具，但 Server 和工具仍保持未启用；这些工具不会进入请求。用户启用或添加 Server 时才会启用已发现工具；如果工具尚未发现，则先执行发现流程。添加操作会把 Server 设为已安装并进入启用流程。

典型状态变化：

```text
配置 installed:false
  -> addServer(id)
  -> installed:true, enabled:true
  -> 发现工具
  -> 工具默认启用

配置 installed:true
  -> installed:true, enabled:false, 后台发现工具
  -> 工具发现完成，Server 和工具仍 disabled
  -> setServerEnabled(id, true)
  -> 启用已发现工具
```

启用中的 Server 尚未完成工具发现时，Composer 会保持不可提交。发送时只会把已安装、已启用且当前工具已准备好的 Server 和工具写入该轮的 `ChatRunConfig.mcp`。禁用 Server 会同时关闭其工具；删除 Server 会清理安装状态、工具和缓存。工具发现失败会保留安装状态、自动禁用 Server，并在 `error` 中暴露错误。

### 安全与 BFF

浏览器直连只适合无敏感凭证且允许 CORS 的公共服务。生产环境只要存在 API Key、Bearer Token、OAuth、内网访问、用户权限或审计要求，就应让 `baseUrl` 指向 BFF：

```text
Browser -> /api/mcp/project-tools -> MCP Server
```

BFF 应负责保存长期凭证、注入认证头、刷新 token、执行权限过滤、审计、限流和 CORS；Chat 包不会读取环境变量，不会替 BFF 保存密钥，也不会自动生成认证头。`headers` 与 `validate` 适合非敏感 header、本地调试或连接前的业务校验。

### 自定义 mcp Adapter

需要自定义 MCP 生命周期时，实现 `UseLocalChatRuntimeMcpAdapter`：

```ts
import type { ChatMcpRuntime, UseLocalChatRuntimeMcpAdapter } from '@opentiny/tiny-robot-chat'

const mcp: UseLocalChatRuntimeMcpAdapter = {
  runtime: customRuntime as ChatMcpRuntime,
  async listTools(serverIds, selectedToolIds) {
    // 返回当前回合允许暴露给模型的工具定义。
    return getTools(serverIds, selectedToolIds)
  },
  async callTool(serverId, originalName, args) {
    return callBusinessTool(serverId, originalName, args)
  },
}

const runtime = useLocalChatRuntime({ modelProviders, mcp })
```

`listTools` 必须为本轮选择返回工具定义；工具的公开名称需要全局唯一，默认 Adapter 使用 `${serverId}__${toolId}`，调用时仍传递 MCP Server 的原始工具名。自定义 Adapter 需要自行处理认证、连接、超时、发现缓存和权限。

## UI options、默认值与布局

`TrChat` 和 `TrChatUI` 的 `ui` 属性类型是 `ChatUIOptions`。未传入的字段使用默认值；设置为 `false` 可以隐藏对应的界面区域，但不会删除 Runtime 中的模型或 MCP 状态。

### 默认值

| 配置                                        | 默认值                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| `layout.surface.mode`                       | `'normal'`                                                                           |
| `layout.emptyState`                         | `'start'`                                                                            |
| `layout.composer.welcome`                   | `'footer'`                                                                           |
| `layout.contentMaxWidth`                    | `980`                                                                                |
| `layout.panelPadding` / `panelGap`          | `12` / `12`                                                                          |
| `layout.leftAside.mode`                     | `'dock'`                                                                             |
| `layout.leftAside.width` / `collapsedWidth` | `300` / `56`                                                                         |
| `layout.leftAside.defaultOpen`              | `false`                                                                              |
| `layout.rightAside`                         | `false`                                                                              |
| `header`                                    | 开启                                                                                 |
| `history`                                   | 开启，菜单含重命名和删除                                                             |
| `welcome`                                   | 开启，显示默认标题和描述                                                             |
| `prompts.items`                             | `[]`                                                                                 |
| `bubble.autoScroll`                         | `true`                                                                               |
| `sender`                                    | `multiple`、可清空、最大长度 `1000`、显示字数限制                                    |
| `model` / `mcp`                             | 默认区域配置，实际数据来自 Runtime；`model.appendTo` 默认挂载到 `body`，可由外部覆盖 |

### 常用 options

```ts
import type { ChatUIOptions } from '@opentiny/tiny-robot-chat'

const ui: ChatUIOptions = {
  brand: { name: '研发助手' },
  layout: {
    contentMaxWidth: 960,
    panelPadding: 16,
    panelGap: 12,
    composer: { welcome: 'center' },
    leftAside: {
      mode: 'dock',
      width: 280,
      collapsedWidth: 56,
      defaultOpen: true,
    },
    rightAside: { mode: 'drawer', width: 320, defaultOpen: false },
  },
  welcome: { title: '开始一个新问题', description: '输入内容开始对话。' },
  prompts: { items: [{ label: '总结这段内容' }, { label: '列出执行步骤' }] },
  sender: { maxLength: 4000, placeholder: '输入消息' },
  bubble: { autoScroll: true },
  labels: { createConversation: '新建对话', composerPlaceholder: '请输入消息' },
}
```

可设为 `false` 的区域包括 `header`、`history`、`welcome`、`prompts`、`sender`、`model`、`mcp`；`layout.leftAside` 和 `layout.rightAside` 也可以设为 `false`。右侧栏的唯一启用开关是 `layout.rightAside`：未配置或为 `false` 时，即使提供右侧栏插槽也不会创建右栏。

### normal 与 floating

`layout.surface.mode` 默认为 `normal`，适合普通页面流；设为 `floating` 时使用浮动布局，并可通过 `floatingOptions` 配置拖拽、缩放和尺寸约束。`floatingState` 是 `TrChat`/`TrChatUI` 的受控浮层状态，配合 `update:floating-state` 与 `floating-*` 事件同步。

```vue
<TrChat
  :runtime="runtime"
  :ui="{ layout: { surface: { mode: 'floating' } } }"
  :floating-state="floatingState"
  @update:floating-state="floatingState = $event"
  @floating-resize-end="saveFloatingState"
/>
```

### 响应式行为

Chat 使用 `960px` 作为桌面与移动端断点：

- 桌面端默认左侧栏是 `dock`，宽度为 `300px`，可收起到 `56px`；
- 移动端侧栏使用抽屉式覆盖内容，并根据视口主动关闭；
- 移动端左侧栏展开宽度不会超过视口宽度的 `86%`；
- `left-aside-open-change` 和 `right-aside-open-change` 的 `source` 为 `user` 或 `viewport`，可区分用户操作与断点切换；
- 受控 `open` 只决定展示状态，组件不会直接改写外部值，外部应根据事件同步状态。

页面容器需要明确高度；内容列通过 `contentMaxWidth` 限制宽度，消息区内部负责滚动。不要在外层再包一层会截断高度的容器。

## Slots 与 events

### Slots

完整替换布局区域：

| Slot                 | 作用域数据                               |
| -------------------- | ---------------------------------------- |
| `layout-header`      | 标题、当前会话、左右侧栏操作             |
| `layout-left-aside`  | 会话数据和会话 CRUD 操作                 |
| `layout-main`        | `messages`、`request`、`conversation`    |
| `layout-footer`      | 输入值、提交、取消、清空和输入状态       |
| `layout-right-aside` | `panel`、打开/关闭右栏函数和当前打开状态 |

左侧栏局部扩展：

| Slot                                    | 用途                     |
| --------------------------------------- | ------------------------ |
| `layout-left-aside-brand`               | 自定义品牌区域           |
| `layout-left-aside-actions`             | 新建会话或业务操作       |
| `layout-left-aside-content`             | 替换默认历史列表         |
| `layout-left-aside-footer`              | 底部操作                 |
| `layout-left-aside-rail`                | Dock 折叠态内容          |
| `layout-left-aside-history-item-prefix` | 历史项前缀，参数为会话项 |

页面和内容扩展：

| Slot                                                                         | 用途                               |
| ---------------------------------------------------------------------------- | ---------------------------------- |
| `header-notice`                                                              | Header 提示                        |
| `layout-right-aside-content` / `layout-right-aside-title`                    | 保留右栏外壳，自定义正文或标题     |
| `composer-before`                                                            | 输入区前方内容                     |
| `sender-footer` / `sender-footer-right`                                      | 输入区底部内容                     |
| `request-error`                                                              | 自定义请求错误，参数为 `{ error }` |
| `welcome-footer` / `prompts-footer`                                          | 欢迎和提示区域底部                 |
| `bubble-prefix` / `bubble-suffix` / `bubble-after` / `bubble-content-footer` | 消息内容周边扩展                   |

右侧栏插槽只提供内容，不负责启用右栏；需要先设置 `ui.layout.rightAside`。

### Events

`TrChat` 和 `TrChatUI` 的主要事件如下：

| Event                                                   | 说明                                                       |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| `submit`                                                | `TrChatUI` 派发 `ChatSendPayload`；`TrChat` 内部消费       |
| `cancel` / `clear`                                      | 取消请求或清空输入；`TrChat` 内部消费                      |
| `create-conversation` / `switch-conversation`           | 会话创建或切换；`TrChat` 内部消费                          |
| `rename-conversation` / `delete-conversation`           | 会话修改；`TrChat` 内部消费                                |
| `history-action`                                        | 历史菜单动作；`delete` 默认由 `TrChat` 消费，其余向外转发  |
| `prompt-click`                                          | 提示项点击，参数含原始 MouseEvent 和提示项                 |
| `bubble-state-change` / `bubble-event`                  | 气泡状态变化或自定义事件                                   |
| `model-select` / `model-feature-change`                 | 模型或 `thinking`/`search` 能力变化                        |
| `mcp-add-server` / `mcp-remove-server`                  | MCP Server 安装或删除                                      |
| `mcp-server-enabled-change` / `mcp-tool-enabled-change` | MCP Server 或工具启停                                      |
| `left-aside-open-change` / `right-aside-open-change`    | 侧栏状态变化，payload 为 `{ open, source }`                |
| `runtime-action-error`                                  | `TrChat` 动作失败，payload 为 `{ action, payload, error }` |
| `update:right-aside-panel`                              | 右栏当前面板变化                                           |
| `update:floating-state`                                 | 浮动布局位置或尺寸变化                                     |
| `floating-drag-*` / `floating-resize-*`                 | 浮层拖拽或缩放生命周期                                     |

不要在 `TrChat` 外部重复处理它已经消费的发送、取消、会话、模型和 MCP 事件；应监听 `runtime-action-error` 统一处理动作错误。

## 独立使用 TrChatUI

`TrChatUI` 支持受控输入和非受控输入。传入 `inputValue` 时必须同步 `update:input-value`；使用 `defaultInputValue` 时由组件维护草稿，生命周期内不要在两种模式之间切换。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TrChatUI, type ChatSendPayload, type ChatUIData } from '@opentiny/tiny-robot-chat'

const inputValue = ref('')
const data = ref<ChatUIData>({
  conversation: { items: [], activeId: null, title: '新对话' },
  bubble: { messages: [] },
  sender: { loading: false, disabled: false, submitDisabled: false },
  request: { state: 'idle' },
})

function handleSubmit(payload: ChatSendPayload) {
  // 在此调用业务 API，并把最新消息、会话和 request 写回 data。
  console.log(payload.text, payload.structuredData)
}
</script>

<template>
  <TrChatUI
    :data="data"
    :input-value="inputValue"
    @update:input-value="inputValue = $event"
    @submit="handleSubmit"
    @cancel="cancelRequest"
  />
</template>
```

宿主需要处理：

- `data.conversation` 的列表、活动会话和历史分组；
- `data.bubble.messages` 的消息事实；
- `data.sender` 和 `data.request` 的加载、禁用、完成和错误状态；
- `create-conversation`、`switch-conversation`、重命名、删除和 `history-action`；
- 模型与 MCP 事件，以及自己的鉴权、请求取消和错误处理。

如果宿主已经实现了完整的 `ChatRuntime`，也可以继续使用 `TrChat`，让 `useChatRuntimeAdapter` 负责标准数据投影和动作错误处理。

## History composables

### useChatHistoryItems

`useChatHistoryItems` 把会话列表转换成默认历史组件可使用的 `ChatHistoryItem[]`。每项保留原始数据在 `raw` 字段；空标题会回退到 `defaultTitle`，并按会话 ID 缓存对象引用以减少无意义更新。

```ts
import { ref } from 'vue'
import { useChatHistoryItems } from '@opentiny/tiny-robot-chat'

const conversations = ref([{ id: '1', title: '', updatedAt: Date.now() }])
const defaultTitle = ref('新对话')
const historyItems = useChatHistoryItems({ conversations, defaultTitle })

// historyItems.value: ChatHistoryItem[]
```

选项：

| 选项            | 类型                                                    | 说明             |
| --------------- | ------------------------------------------------------- | ---------------- |
| `conversations` | `MaybeRefOrGetter<ChatConversationInfo[] \| undefined>` | 会话来源         |
| `defaultTitle`  | `MaybeRefOrGetter<string>`                              | 空标题的回退文本 |

### useChatHistoryData

`useChatHistoryData` 在上述基础上接受业务提供的平铺或分组历史数据，输出 `ChatHistoryDisplayData`：

```ts
import { ref } from 'vue'
import { useChatHistoryData, type ChatConversationInfo } from '@opentiny/tiny-robot-chat'

const conversations = ref<ChatConversationInfo[]>([
  { id: '1', title: '接口设计', updatedAt: Date.now() },
  { id: '2', title: '发布检查', updatedAt: Date.now() },
])
const pinned = ref([conversations.value[0]])
const recent = ref([conversations.value[1]])
const historyData = useChatHistoryData({
  conversations,
  defaultTitle: '新对话',
  history: () => [
    { group: '置顶', items: pinned.value },
    { group: '最近', items: recent.value },
  ],
})
```

当 `history` 未提供时使用 `conversations`；当数据项具有 `group` 字段时识别为分组数据。分组只影响历史视图顺序和展示，不改变 Runtime 的会话事实或当前会话 ID。

## 公开 API 速查

以下列表以 `packages/chat/src/index.ts` 的公开导出为准。

### 组件与函数

| 导出                    | 用途                                            |
| ----------------------- | ----------------------------------------------- |
| `TrChat`                | Runtime 驱动的完整聊天页面                      |
| `TrChatUI`              | 只接收 Data/Options 的纯 UI Shell               |
| `useLocalChatRuntime`   | 组装 Kit、Provider 和可选 MCP                   |
| `useKitChatRuntime`     | 将已有 Kit `useConversation` 转为 `ChatRuntime` |
| `useChatRuntimeAdapter` | 将 Runtime 投影为 UI Data 并处理动作            |
| `useChatHistoryItems`   | 规范化平铺历史项                                |
| `useChatHistoryData`    | 规范化平铺或分组历史数据                        |

### 运行时和配置类型

| 类型                                                       | 用途                                |
| ---------------------------------------------------------- | ----------------------------------- |
| `ChatRuntime`、`ChatRuntimeActions`                        | Runtime 状态与动作协议              |
| `ChatConversation`、`ChatConversationInfo`                 | 当前会话与会话摘要                  |
| `ChatMessageItem`、`ChatMessageContent`、`ChatMessagePart` | 消息内容模型                        |
| `ChatSendPayload`、`ChatRunConfig`、`ChatMcpRunConfig`     | 发送内容与每轮配置快照              |
| `ChatBeforeSend`、`ChatBeforeSendContext`                  | 发送前校验与业务拦截                |
| `ChatProviderConfig`、`ChatProviderModelConfig`            | `openai`/`deepseek`/`qwen` Provider |
| `ChatMcpServers`、`ChatMcpServerConfig`                    | 声明式 MCP Server                   |
| `ChatMcpRuntime`、`ChatMcpServerInfo`、`ChatMcpToolInfo`   | 自定义 MCP Runtime 协议             |
| `ChatRuntimeActionErrorPayload`                            | Runtime 动作错误事件                |

### UI 类型

| 类型                                                                       | 用途                |
| -------------------------------------------------------------------------- | ------------------- |
| `ChatUIOptions`、`ChatLayoutOptions`                                       | 页面配置与布局      |
| `ChatUIData`、`ChatConversationView`、`ChatBubbleView`                     | UI 展示数据         |
| `ChatLabels`、`ChatBrandOptions`                                           | 文案与品牌          |
| `ChatHistoryOptions`、`ChatPromptsOptions`、`ChatSenderOptions`            | 历史、提示和输入区  |
| `ChatBubbleOptions`、`ChatModelView`、`ChatMcpView`                        | 消息、模型和 MCP UI |
| `ChatUIEmits`、`ChatUISlots`                                               | 事件与插槽类型      |
| `ChatLeftAsideSlotProps`、`ChatRightAsideSlotProps`、`ChatSenderSlotProps` | 作用域插槽参数      |

此外还导出 `UseLocalChatRuntimeOptions`、`UseKitChatRuntimeOptions`、`UseChatRuntimeAdapterOptions`、`UseChatHistoryItemsOptions`、`UseChatHistoryDataOptions`，以及浮动布局相关的 `LayoutFloatingState`、`LayoutFloatingOptions`、`LayoutFloatingDragDetail`、`LayoutFloatingResizeDetail`。

## FAQ

### 为什么页面没有高度或消息区不滚动？

Chat 只负责内部布局，父容器必须提供明确的 `height` 或可计算的 flex 高度。优先检查应用根节点、页面容器和 Chat 外层是否存在 `height: 100%`/`100vh`，以及中间 flex 子项是否允许收缩。

### 为什么发送返回 `false`？

文本为空、Runtime 的 `composer.disabled` 或 `submitDisabled` 为真、MCP 已启用但工具仍在加载，或者 `beforeSend` 返回 `reject` 时，`send` 会返回 `false`。网络、Provider 或业务请求错误，以及 `beforeSend` 抛出的错误，会 reject。

### 如何在发送前校验模型或 MCP？

在 `useLocalChatRuntime` 或 `useKitChatRuntime` 中配置 `beforeSend`。它执行在创建会话和用户消息之前，适合校验当前模型、能力开关、MCP Server、工具权限和业务条件。

### 为什么 `modelProviders` 和 `responseProvider` 不能一起配置？

两者都是消息响应层的来源。`modelProviders` 会创建内置 Provider，`responseProvider` 是宿主自定义 Provider；同时提供会产生不明确的请求链，因此 `useLocalChatRuntime` 会抛错。二选一即可。

### `installed: true` 会自动启用 MCP 吗？

不会。它表示初始已安装；默认 Adapter 会后台发现工具，但 Server 和工具仍未启用，也不会加入请求。用户启用或添加 Server 时才会启用已发现工具；工具发现完成前，相关提交会被禁用。

### `mcp` 和 `mcpServers` 可以同时使用吗？

不可以。两者同时传入会抛错。公共 Streamable HTTP 优先使用 `mcpServers`；需要自定义 transport、认证、权限或生命周期时使用 `mcp`。

### MCP 请求应该直接从浏览器发出吗？

只有公共、无敏感凭证且允许 CORS 的服务适合直连。生产环境应使用 BFF，让凭证、OAuth、权限过滤、审计和限流留在后端。相对 `baseUrl` 会按浏览器当前 origin 解析。

### 为什么 MCP 工具没有出现在请求中？

检查 Server 是否 `installed` 且 `enabled`、工具是否单独启用、工具列表是否已经发现，以及是否仍处于 loading。每次发送只取当时已启用的 Server 和工具；发送后再切换只影响下一轮。

### 为什么隐藏 `ui.mcp` 后 MCP 仍然可用？

UI options 只控制页面区域。设置 `mcp: false` 会隐藏 MCP 控件，不会销毁 Runtime 的 MCP 状态；要禁止能力，应在 Runtime 层移除或禁用 Server，或不要配置 MCP。

### `TrChatUI` 会帮我保存会话吗？

不会。它是纯 UI 组件，宿主必须自己处理所有事件，并把会话、消息、请求和输入状态写回 `data`。需要标准会话动作时，使用 `useLocalChatRuntime` 或 `useKitChatRuntime`。

### 为什么我的自定义 Header 操作在移动端消失？

完整替换 `layout-header` 时，宿主也接管了移动端侧栏按钮和 Header 行为。若只需增加内容，优先使用 `header-notice` 或现有的局部布局插槽，并透传作用域操作。

### 如何处理 Runtime 动作错误？

监听 `TrChat` 的 `runtime-action-error`：

```vue
<TrChat :runtime="runtime" @runtime-action-error="({ action, error }) => report(action, error)" />
```

请求错误也可以通过 `request-error` 插槽替换页面默认提示。直接调用 `runtime.actions.*` 时，仍需自行捕获 Promise rejection。
