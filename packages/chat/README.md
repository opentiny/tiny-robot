# TinyRobot Chat

## 1. 这是什么

`@opentiny/tiny-robot-chat` 是一个基于 Vue 3 的聊天页面组件包，提供：

- 完整聊天页面；
- 会话列表和会话操作；
- 流式回答与取消；
- 模型选择、深度思考和联网搜索开关；
- MCP 服务和工具管理。

Runtime 是聊天页面使用的状态和操作集合。Provider 是模型服务的连接配置。MCP 是供模型调用外部能力的工具服务。

| 场景 | 推荐入口 | 说明 |
| --- | --- | --- |
| 新项目 | `useLocalChatRuntime + TrChat` | 默认方式，包负责组装会话、模型和 MCP 运行时 |
| 已有 Kit 会话 | `useKitChatRuntime + TrChat` | 复用已有会话和发送逻辑 |
| 自有状态管理 | `TrChatUI` | 仅提供界面，需要自行管理数据与事件 |

## 2. 安装和准备

仓库使用 pnpm，根目录声明的版本为 `pnpm@10.34.5`。在仓库外的 Vue 3 项目中，将包加入项目依赖：

```bash
pnpm add @opentiny/tiny-robot-chat vue
```

在本仓库的 workspace 应用中，依赖写法为：

```json
{
  "dependencies": {
    "@opentiny/tiny-robot-chat": "workspace:*"
  }
}
```

使用前需要准备：

- Vue 3；
- 一个可访问的模型服务；
- 模型服务的 API Key，或由后端代发请求。

浏览器端的 `VITE_` 环境变量会进入浏览器代码。不要在生产环境直接放置长期密钥。模型服务和 MCP 服务需要允许浏览器跨域访问，或者通过后端 / BFF 转发请求。BFF 是 Backend For Frontend，指专门给前端使用的后端接口。

## 3. 快速开始

下面的示例使用内置 `openai` Provider，不依赖额外的 Kit 导入：

```vue
<script setup lang="ts">
import {
  TrChat,
  useLocalChatRuntime,
  type ChatProviderConfig,
} from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'openai',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    models: [
      {
        id: 'gpt-4.1-mini',
        label: 'GPT-4.1 mini',
      },
    ],
  },
]

const runtime = useLocalChatRuntime({
  modelProviders,
})
</script>

<template>
  <TrChat :runtime="runtime" />
</template>
```

在项目根目录创建 `.env.local`：

```env
VITE_OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
```

然后执行项目 `package.json` 中已有的开发脚本启动项目（通常是 `pnpm dev`）。该示例仅适用于模型服务允许浏览器跨域请求的情况；生产环境建议将 `apiUrl` 指向自己的后端或 BFF，由后端代发模型请求。

这个示例不需要在 `conversation.useMessageOptions` 中提供 `responseProvider`，因为 `modelProviders` 会提供响应请求所需的 Provider。`useLocalChatRuntime` 会将会话、模型和完整聊天页面连接起来。

第一次发送非空消息时，如果当前没有会话，Runtime 会自动创建会话，并使用消息文本生成标题。未配置 `storage` 时，Kit 会使用默认的 LocalStorage 策略保存会话和消息；`useLocalChatRuntime` 同时会开启消息自动保存流程。

发送过程中，页面的取消操作会调用 Runtime 的 `abort`。如果 API Key 缺失，Runtime 会在发送后的 Provider 请求阶段报错，而不是在创建 Runtime 时验证；错误会通过 `runtime-action-error` 报告，当前请求错误也会显示在页面中。

聊天页面需要放在有明确高度的容器中，例如让应用根节点或外层布局提供高度。

需要自定义存储策略，或需要显式配置 LocalStorage、IndexedDB 时，再直接安装并导入 Kit：

```bash
pnpm add @opentiny/tiny-robot-kit
```

例如，为不同案例配置独立的 LocalStorage key：

```ts
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'

const runtime = useLocalChatRuntime({
  conversation: {
    storage: localStorageStrategyFactory({
      key: 'tiny-robot-doubao-conversations',
    }),
  },
  modelProviders,
})
```

也可以将 `indexedDBStorageStrategyFactory` 或自定义 `ConversationStorageStrategy` 传给 `conversation.storage`。具体参数以 `@opentiny/tiny-robot-kit` 文档为准。

## 4. 配置模型

### 4.1 最小模型配置

`ChatProviderConfig` 的最小配置如下：

```ts
import type { ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'openai',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    models: [
      {
        id: 'gpt-4.1-mini',
        label: 'GPT-4.1 mini',
      },
    ],
  },
]
```

`apiKey` 会随前端代码和请求到达浏览器用户，只适合本地开发或可信环境。生产环境应使用后端代理或自定义 `responseProvider`，不要在浏览器中放置长期密钥。

同一组 Provider 中的模型 ID 以及多个 Provider 之间的模型 ID 都必须唯一。模型列表中的第一个模型会作为初始选择项。

### 4.2 支持的服务类型

`type` 只接受 `openai`、`deepseek` 和 `qwen`。默认地址和内置请求映射如下：

| `type` | 默认服务地址 | 可用内置能力 |
| --- | --- | --- |
| `openai` | `https://api.openai.com/v1/chat/completions` | 默认没有额外的能力请求体映射；可通过模型配置提供自定义 `featureBody` |
| `deepseek` | `https://api.deepseek.com/chat/completions` | `thinking` 会映射为 `thinking.type`；请求支持 `reasoning_effort` 的 `high`、`max` |
| `qwen` | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` | `thinking` 映射为 `enable_thinking`，`search` 映射为 `enable_search` |

这些是包内的默认请求映射，不代表服务端一定允许对应字段。服务端返回的 HTTP 错误会作为请求错误处理。

### 4.3 多个模型和能力开关

能力通过模型的 `capabilities` 声明：

```ts
const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    apiKey: import.meta.env.VITE_DASHSCOPE_API_KEY,
    models: [
      {
        id: 'qwen-model-a',
        label: 'Qwen Model A',
        capabilities: {
          thinking: true,
          search: true,
        },
      },
      {
        id: 'qwen-model-b',
        label: 'Qwen Model B',
        capabilities: {
          thinking: true,
        },
      },
    ],
  },
]
```

- `thinking` 表示深度思考开关。
- `search` 表示联网搜索开关。
- 只有当前模型声明支持的开关才会显示在页面中。
- 切换模型后，当前模型不支持的开关会关闭。
- 当前页面提供 `thinking` 和 `search` 开关，不提供 reasoning effort 选择器；模型的 `reasoning.defaultEffort` 决定初始 effort，DeepSeek 预设默认值为 `high`。

`capabilities` 控制界面可用性；实际请求字段由 Provider 默认映射和模型的 `featureBody` 决定。

### 4.4 自定义服务地址与请求头

`apiUrl` 可以传服务根地址，也可以传完整的 `/chat/completions` 地址。运行时会去除末尾斜杠；当地址不是以 `/chat/completions` 结尾时，会追加该路径。

```ts
const modelProviders: ChatProviderConfig[] = [
  {
    type: 'openai',
    apiUrl: 'https://api.example.com/v1',
    apiKey: import.meta.env.VITE_MODEL_API_KEY,
    headers: {
      'X-Client-Name': 'tiny-robot-chat',
    },
    models: [
      {
        id: 'custom-model',
        label: 'Custom Model',
      },
    ],
  },
]
```

请求会使用 `POST` 和流式响应。`headers` 会与 `Content-Type` 合并；Provider 的 API Key 会作为 Bearer Authorization 请求头发送。

## 5. 配置 MCP 工具服务

MCP 是让模型在回答时调用外部工具服务的配置方式。Chat 提供两种入口：

| 入口 | 适合场景 | 说明 |
| --- | --- | --- |
| `mcpServers` | 远程 Streamable HTTP MCP Server | 推荐的默认方式，Chat 自动创建 MCP Adapter |
| `mcp` | stdio、旧 SSE、OAuth、企业网关、连接复用、自定义权限 | 高级方式，宿主自己提供 Adapter |

默认 `mcpServers` 只面向 Streamable HTTP。生产环境中，带密钥、OAuth、内网访问、审计或权限过滤的 MCP Server，建议通过 BFF 代理后再交给 `mcpServers`。BFF 是 Backend For Frontend，指专门给前端使用的后端接口；在 MCP 场景里，它通常负责保存密钥，并把前端请求安全转发给真正的 MCP Server。

### 5.1 选择接入方式

| MCP 服务形态 | 推荐接入 | 原因 |
| --- | --- | --- |
| 公共 Streamable HTTP MCP，浏览器可直接访问 | `mcpServers` 直连 | 最少配置，Chat 自动发现工具并调用 |
| 需要 API Key、Bearer Token 或 OAuth | `mcpServers` 指向 BFF | 密钥和 token 留在后端 |
| 公司内网、企业网关、权限系统、审计系统 | `mcpServers` 指向 BFF，或自定义 `mcp` | 由宿主控制认证和权限 |
| 本地 stdio MCP | 自定义 `mcp` | 浏览器不能启动本地进程 |
| 旧 SSE MCP | 自定义 `mcp` | 默认 Adapter 不内置旧协议 |
| 模型平台托管 MCP | 放在模型 Provider 或后端请求链路中 | Chat 不管理平台内部 MCP 连接 |

普通 Web 项目优先使用 `mcpServers`；只有默认 Adapter 覆盖不了协议、认证或生命周期时，再使用高级 `mcp`。

### 5.2 最小示例

`mcpServers` 是只读数组，每项必须包含 `id`、`name` 和 `baseUrl`：

```ts
import type { ChatMcpServers } from '@opentiny/tiny-robot-chat'

const mcpServers: ChatMcpServers = [
  {
    id: 'maps',
    name: 'Maps',
    baseUrl: 'https://mcp.example.com/maps',
  },
]
```

在第 3 节的快速开始示例中加入 `mcpServers` 属性即可：

```ts
const runtime = useLocalChatRuntime({
  modelProviders,
  mcpServers,
})
```

也可以在已有的 `responseProvider` 配置上加入 `mcpServers`。`modelProviders` 与 `conversation.useMessageOptions.responseProvider` 不能同时提供。

### 5.3 生产推荐：BFF 代理

浏览器直连 MCP Server 只适合无敏感凭证、允许 CORS 的服务。生产环境中，只要 MCP Server 需要 API Key、Bearer Token、OAuth、内网访问或权限过滤，就推荐使用 BFF：

```txt
Browser Chat
  -> /api/mcp/maps
    -> Remote MCP Server
```

前端只配置自己的 BFF 地址：

```ts
const mcpServers: ChatMcpServers = [
  {
    id: 'maps',
    name: 'Maps',
    description: '地图、路线、位置和周边查询',
    baseUrl: '/api/mcp/maps',
  },
]
```

BFF 负责：

- 保存 API Key、OAuth token 和长期凭证；
- 向远程 MCP Server 注入 `Authorization` 或其他认证请求头；
- 处理 token refresh、权限过滤、审计和限流；
- 解决浏览器 CORS 限制；
- 只把当前用户允许使用的 MCP 能力暴露给前端。

Chat 包不会读取环境变量，不会保存密钥，也不会自动生成认证 header。

### 5.4 高德地图 MCP 示例

如果你接入的是 DashScope 托管的高德地图 MCP，Server 地址通常类似：

```ts
const mcpServers: ChatMcpServers = [
  {
    id: 'amap-maps',
    name: '高德地图',
    description: '地图、导航、地理编码、天气、路径规划和周边搜索',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1/mcps/amap-maps/mcp',
  },
]
```

这个服务需要 DashScope API Key。生产环境推荐通过 BFF 代理：

```ts
const mcpServers: ChatMcpServers = [
  {
    id: 'amap-maps',
    name: '高德地图',
    description: '地图、导航、地理编码、天气、路径规划和周边搜索',
    baseUrl: '/api/mcp/amap-maps',
  },
]
```

本地调试时，也可以显式传入请求头：

```ts
const dashScopeApiKey = import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY?.trim()

const mcpServers: ChatMcpServers = [
  {
    id: 'amap-maps',
    name: '高德地图',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1/mcps/amap-maps/mcp',
    headers: dashScopeApiKey ? { Authorization: `Bearer ${dashScopeApiKey}` } : undefined,
    validate: (serverId) => {
      if (!dashScopeApiKey) {
        throw new Error(`Missing VITE_ALIYUN_DASHSCOPE_KEY for ${serverId}.`)
      }
    },
  },
]
```

`VITE_` 环境变量会进入浏览器构建产物。上面的直传 Key 示例只适合本地调试，不适合作为生产接入方式。

### 5.5 配置字段

| 字段 | 是否必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 唯一标识；重复 ID 会在创建默认 Adapter 时同步报错 |
| `name` | 是 | 页面显示名称 |
| `baseUrl` | 是 | MCP Streamable HTTP 地址 |
| `installed` | 否 | 初始显示为已安装，但不自动启用 |
| `description` | 否 | 页面说明 |
| `icon` | 否 | 页面图标地址 |
| `headers` | 否 | MCP 请求头；仅建议用于非敏感 header 或本地调试 |
| `timeout` | 否 | 连接和请求超时，单位为毫秒 |
| `validate` | 否 | 创建 MCP 连接前执行的校验函数，参数为 Server ID |

### 5.6 初始安装状态

```ts
const mcpServers: ChatMcpServers = [
  {
    id: 'internal-tools',
    name: 'Internal Tools',
    baseUrl: '/mcp/internal-tools',
    installed: true,
  },
]
```

`installed: true` 的含义仅是 Runtime 初始化时该 Server 已安装：

- 不会自动调用 MCP 服务；
- 不会自动读取工具；
- 初始状态仍是未启用；
- 用户启用 Server 后才读取工具；
- Runtime 重建时会重新采用静态配置中的初始状态；
- 运行时删除 Server 不会修改原始 `mcpServers` 数组。

### 5.7 地址与认证

浏览器环境支持相对地址：

```ts
const mcpServers: ChatMcpServers = [
  {
    id: 'local-tools',
    name: 'Local Tools',
    baseUrl: '/api/mcp/local-tools',
  },
]
```

浏览器中相对地址会依据当前页面的 origin 解析。非浏览器环境必须使用完整绝对地址，否则启用 Server 时会报错。

带请求头和连接前校验的配置如下，适合本地调试或短期验证：

```ts
const mcpApiKey = import.meta.env.VITE_MCP_API_KEY?.trim()

const mcpServers: ChatMcpServers = [
  {
    id: 'protected-tools',
    name: 'Protected Tools',
    baseUrl: 'https://mcp.example.com/tools',
    headers: mcpApiKey ? { Authorization: `Bearer ${mcpApiKey}` } : undefined,
    validate: (serverId) => {
      if (!mcpApiKey) {
        throw new Error(`Missing MCP API key for ${serverId}.`)
      }
    },
  },
]
```

浏览器中的 MCP 请求需要服务端处理 CORS。`VITE_` 变量会暴露给浏览器，不要在浏览器中放置生产环境长期密钥；生产环境应通过后端或 BFF 转发认证请求。

### 5.8 用户实际操作后的行为

1. 用户添加 Server，Runtime 将其标记为已安装并开始启用流程。
2. 用户启用已安装的 Server，Runtime 读取该 Server 的工具列表。
3. 读取成功后，页面显示可用工具。
4. 用户可以选择或关闭单个工具。
5. 发送消息时，只会把当前已安装、已启用 Server 中当前启用的工具加入本条消息的请求配置。
6. 禁用 Server 会清空当前 Runtime 中该 Server 的工具状态和缓存；删除 Server 还会取消其已安装状态。
7. 重新启用 Server 会重新读取工具。

每次发送都会保存当时的模型、能力开关和 MCP 工具选择。发送后再切换模型、能力或工具，只影响下一条消息。已启用的 MCP Server 仍在读取工具时，发送不可用。

如果工具读取失败，该 Server 仍保持已安装状态，但会自动禁用并记录错误；其他已启用的 Server 和普通聊天能力不受影响。

### 5.9 默认 Adapter 边界

`mcpServers` 会自动创建默认 Adapter。默认 Adapter 负责：

- 使用 Streamable HTTP 连接 MCP Server；
- 在用户启用 Server 时执行 Tool discovery；
- 将 MCP Tool 转换为模型可见的 function tool；
- 根据本轮 `runConfig` 只暴露当前消息允许使用的 Tool；
- 调用 Tool 时使用 MCP 原始 Tool 名称；
- 对连接和请求设置超时；
- 对同一个 Server 的并发工具读取做去重；
- 禁用或删除 Server 时清空当前 Runtime 中的 Tool 状态和缓存；
- 工具读取失败时保留 installed 状态，自动禁用该 Server 并记录错误；
- 按需创建 Client，调用结束后关闭。

默认 Adapter 不负责：

- 启动本地 stdio MCP 进程；
- 兼容旧 SSE 协议；
- 管理 OAuth 登录、授权码流程或 token refresh；
- 自动读取环境变量；
- 保存 API Key、Bearer Token 或长期凭证；
- 提供连接池或长会话复用；
- 实现企业权限、审计、限流或租户隔离；
- 处理模型平台内部托管的 MCP。

这些场景应使用 BFF 或高级 `mcp` Adapter。

### 5.10 高级 MCP 接入

特殊协议或自定义运行逻辑可以传入高级 `mcp` Adapter。典型场景包括：

- 本地 stdio MCP；
- 旧 SSE MCP；
- OAuth 或企业统一登录；
- 后端网关、审计、限流、租户隔离；
- 自定义 Client 生命周期或连接复用；
- 平台已经托管 MCP，前端只需要消费宿主维护的工具状态。

高级入口的类型是公开的 `UseLocalChatRuntimeMcpAdapter`，对象必须包含 `runtime`、`listTools` 和 `callTool`：

```ts
import { shallowRef } from 'vue'
import {
  useLocalChatRuntime,
  type ChatMcpRuntime,
  type UseLocalChatRuntimeMcpAdapter,
} from '@opentiny/tiny-robot-chat'

const mcpRuntime: ChatMcpRuntime = {
  servers: shallowRef([
    {
      id: 'custom-tools',
      name: 'Custom Tools',
      installed: true,
      enabled: true,
    },
  ]),
  tools: shallowRef({
    'custom-tools': [
      {
        id: 'search',
        name: 'search',
        description: 'Search internal documents',
        enabled: true,
      },
    ],
  }),
  addServer: async () => {},
  removeServer: async () => {},
  setServerEnabled: async () => {},
  setToolEnabled: async () => {},
}

const mcp: UseLocalChatRuntimeMcpAdapter = {
  runtime: mcpRuntime,
  async listTools(serverIds, toolIds) {
    if (!serverIds.includes('custom-tools')) return []
    if (!toolIds['custom-tools']?.includes('search')) return []

    return [
      {
        serverId: 'custom-tools',
        id: 'search',
        name: 'custom-tools__search',
        originalName: 'search',
        description: 'Search internal documents',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
          required: ['query'],
        },
      },
    ]
  },
  async callTool(serverId, toolName, args) {
    const response = await fetch('/api/tools/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId, toolName, args }),
    })

    if (!response.ok) {
      throw new Error(`Tool call failed: HTTP ${response.status}`)
    }

    return response.json()
  },
}

const runtime = useLocalChatRuntime({
  modelProviders,
  mcp,
})
```

三个字段的职责如下：

| 字段 | 职责 |
| --- | --- |
| `runtime` | 给页面展示 Server、Tool、启用状态、加载状态和错误 |
| `listTools` | 根据本轮消息的 Server/Tool 快照，返回要暴露给模型的 Tool 定义 |
| `callTool` | 执行模型发起的 Tool 调用，并返回调用结果 |

`listTools` 返回的 `name` 必须在所有模型工具中唯一。推荐格式是 `${serverId}__${toolId}`。`originalName` 用于保存 MCP Server 里的原始 Tool 名称，实际调用时会传给 `callTool`。

`mcp` 与 `mcpServers` 不能同时传入：

```ts
useLocalChatRuntime({
  modelProviders,
  mcpServers,
  mcp,
})
```

上面的写法会抛错。需要默认 Streamable HTTP 接入时使用 `mcpServers`；需要完全自定义 MCP 行为时使用 `mcp`。

## 6. 配置聊天界面

`TrChat` 的 `ui` 属性接收 `ChatUIOptions`。未配置的字段使用默认值。

### 6.1 常用完整示例

```vue
<script setup lang="ts">
import { TrChat, type ChatUIOptions } from '@opentiny/tiny-robot-chat'

const prompts = [
  { label: '总结这段内容' },
  { label: '列出三个可执行步骤' },
]

const ui: ChatUIOptions = {
  layout: {
    contentMaxWidth: 980,
    panelPadding: 12,
    panelGap: 12,
    leftAside: {
      mode: 'dock',
      width: 280,
      collapsedWidth: 56,
      defaultOpen: true,
    },
  },
  brand: {
    name: '我的助手',
  },
  welcome: {
    title: '欢迎使用',
    description: '输入问题开始对话。',
  },
  prompts: {
    items: prompts,
  },
  bubble: {
    autoScroll: true,
    bubbleList: {
      roleConfigs: {
        system: { hidden: true },
      },
    },
  },
  sender: {
    maxLength: 4000,
    placeholder: '输入消息',
  },
  labels: {
    createConversation: '新建对话',
    composerPlaceholder: '请输入消息',
  },
}
</script>

<template>
  <TrChat :runtime="runtime" :ui="ui" />
</template>
```

示例中的 `runtime` 应替换为已经创建好的 `ChatRuntime`。`brand.logo` 可以传入 Vue 组件；未配置时使用包内默认图标。若要自定义消息头像，可在业务项目中安装并导入自己的图标组件。

### 6.2 常用配置说明

| 配置 | 说明 |
| --- | --- |
| `layout.contentMaxWidth` | 内容最大宽度，默认 `980` |
| `layout.panelPadding` | 面板内边距，默认 `12` |
| `layout.panelGap` | 面板间距，默认 `12` |
| `layout.leftAside` | 左侧会话栏；可设置 `mode`、`width`、`collapsedWidth`、`open`、`defaultOpen` |
| `layout.rightAside` | 右侧详情栏的唯一启用开关；未配置或设置为 `false` 时不创建右栏，设置为 `{}` 或具体配置时创建右栏，可配置侧栏模式、宽度、打开状态和关闭按钮 |
| `header` | 顶部栏配置为 `false` 时隐藏顶部栏 |
| `history` | 配置会话列表及菜单项，或设置为 `false` 隐藏会话列表 |
| `welcome` | 空会话欢迎区域，或设置为 `false` 隐藏 |
| `prompts` | 空会话提示项，或设置为 `false` 隐藏 |
| `bubble` | 消息气泡、自动滚动和角色配置 |
| `sender` | 输入框配置，或设置为 `false` 隐藏输入区 |
| `model` | 模型区域开关；当前支持默认配置对象或 `false` |
| `mcp` | MCP 区域开关；当前支持默认配置对象或 `false` |
| `labels` | 覆盖界面文案的部分字段 |

默认值还包括：左侧栏宽度 `300`、折叠宽度 `56`、默认关闭；右侧栏默认关闭；输入区默认支持多行输入、清空、最大长度 `1000` 并显示字数限制；消息自动滚动默认开启。

### 6.3 隐藏功能区

```ts
const ui: ChatUIOptions = {
  header: false,
  history: false,
  model: false,
  mcp: false,
}
```

隐藏页面区域不等于禁用 Runtime 能力。Runtime 仍可以保存模型或 MCP 状态；这里只是不在 `TrChat` 中渲染对应的界面区域。

### 6.4 响应式布局

页面在宽度小于 `960px` 时进入移动端布局。移动端会强制使用抽屉形式的 Aside，并关闭打开状态；左侧栏展开宽度不会超过视口宽度的 `86%`。

- `dock`：桌面端的固定侧栏模式。
- `drawer`：抽屉模式。
- `width`：桌面端展开宽度。
- `collapsedWidth`：桌面端折叠后的宽度。
- `defaultOpen`：非受控模式的初始状态。
- `open`：受控模式的当前状态。

当 `open` 存在时，组件不会用内部状态写回它；用户操作和移动端断点行为仍会通过 `left-aside-open-change` 或 `right-aside-open-change` 通知外部。

## 7. 自定义内容：插槽

只在需要替换或补充某个区域时使用插槽。常用插槽如下：

`layout-right-aside` 和 `layout-right-aside-title` 只提供右栏内容，不会启用右栏。需要先通过 `ui.layout.rightAside` 显式启用：

```vue
<TrChat :runtime="runtime" :ui="{ layout: { rightAside: {} } }">
  <template #layout-right-aside>
    <DetailPanel />
  </template>
</TrChat>
```

| 插槽 | 用途 |
| --- | --- |
| `header-notice` | 顶部标题下方的提示区域 |
| `request-error` | 替换请求错误显示内容，提供 `error` |
| `layout-right-aside` | 右侧详情栏正文 |
| `layout-right-aside-title` | 右侧详情栏标题 |
| `sender-footer` | 输入区底部附加内容 |
| `sender-footer-right` | 输入区底部右侧附加内容 |
| `welcome-footer` | 欢迎区域底部附加内容 |
| `prompts-footer` | 提示项区域底部附加内容 |
| `bubble-prefix` | 消息列表前置内容 |
| `bubble-suffix` | 消息列表后置内容 |
| `bubble-after` | 消息列表之后的内容 |
| `bubble-content-footer` | 消息内容底部附加内容 |

一个可运行的 `header-notice` 示例：

```vue
<template>
  <TrChat :runtime="runtime">
    <template #header-notice>
      <p class="notice">当前会话使用测试环境</p>
    </template>
  </TrChat>
</template>
```

需要完整替换布局时，可以使用以下插槽：

| 插槽 | 可替换区域 |
| --- | --- |
| `layout-header` | 顶部栏 |
| `layout-left-aside` | 左侧会话栏 |
| `layout-main` | 消息主区域 |
| `layout-footer` | 输入区域 |

完整插槽参数可以通过公开类型 `ChatUISlots` 查看。布局插槽会提供会话数据和对应操作函数；`layout-footer` 会提供输入值、输入状态、提交、取消和清空函数。

## 8. 错误处理

`TrChat` 的 `runtime-action-error` 用于接收 Runtime 操作错误：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  TrChat,
  type ChatRuntimeActionErrorPayload,
} from '@opentiny/tiny-robot-chat'

const lastActionError = ref<ChatRuntimeActionErrorPayload | null>(null)

function handleRuntimeActionError(payload: ChatRuntimeActionErrorPayload) {
  lastActionError.value = payload
}
</script>

<template>
  <div v-if="lastActionError" role="alert">
    {{ lastActionError.action }}: {{ String(lastActionError.error) }}
  </div>
  <TrChat :runtime="runtime" @runtime-action-error="handleRuntimeActionError" />
</template>
```

该事件覆盖：

- 发送和取消；
- 创建、切换、重命名和删除会话；
- 模型切换和功能开关；
- MCP Server 添加、删除、启用，以及工具开关。

发送错误会恢复发送前的草稿并继续向调用方抛出；其他由页面触发的 Runtime 操作会通过事件报告，不产生未处理的 Promise rejection。

请求错误会在页面中显示。使用 `request-error` 插槽可以替换默认错误区域：

```vue
<template>
  <TrChat :runtime="runtime">
    <template #request-error="{ error }">
      <strong>请求失败：</strong> {{ String(error) }}
    </template>
  </TrChat>
</template>
```

以下普通事件用于接收界面行为：

- `prompt-click`：用户点击提示项。
- `history-action`：用户触发非默认会话菜单动作。
- `bubble-state-change`：消息气泡状态变化。
- `bubble-event`：消息气泡产生事件。
- `left-aside-open-change`：左侧栏打开状态变化。
- `right-aside-open-change`：右侧栏打开状态变化。

发送、取消、会话、模型和 MCP 操作已经由 `TrChat` 消费，不要在外部再次处理这些对应的 UI 事件。`history-action` 中 ID 为 `delete` 的默认删除行为也已经由 `TrChat` 处理；其他自定义菜单动作由外部处理。

侧栏事件的 payload 为 `{ open, source }`，其中 `source` 是 `user` 或 `viewport`，分别表示用户操作或响应式断点导致的关闭。

## 9. 接入已有 Kit 会话

如果项目已经通过 Kit 创建了 `useConversation` 结果，使用 `useKitChatRuntime` 适配它。会话的具体创建参数由宿主按照 Kit 文档提供：

```vue
<script setup lang="ts">
import { useConversation } from '@opentiny/tiny-robot-kit'
import { TrChat, useKitChatRuntime } from '@opentiny/tiny-robot-chat'

// 按 Kit 文档创建会话，并提供项目已有的消息响应逻辑。
const conversation = useConversation(/* existing Kit conversation options */)

const runtime = useKitChatRuntime({
  conversation,
  titleGenerator: (text) => text.trim().slice(0, 24) || '新对话',
  composer: {
    // 可选：传入宿主维护的 disabled、submitDisabled、model 或 mcp。
  },
})
</script>

<template>
  <TrChat :runtime="runtime" />
</template>
```

宿主负责创建和维护 `useConversation`。Chat Runtime 负责将它转换为 `TrChat` 使用的数据和操作。`composer` 是可选的，用于传入宿主已经维护的 Composer 状态；新项目使用 `useLocalChatRuntime` 时，模型 Provider 和声明式 MCP 应通过对应的 Local Runtime 配置提供。

## 10. 仅使用界面层 TrChatUI

`TrChatUI` 是高级接入方式，不是新项目首选。它接收普通的 `data`、`ui` 和 `inputValue`，通过事件通知外部；它不会创建会话、发送请求或管理模型状态。

下面是一个受控输入的最小示例：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  TrChatUI,
  type ChatSendPayload,
  type ChatUIData,
} from '@opentiny/tiny-robot-chat'

const inputValue = ref('')
const data = ref<ChatUIData>({
  conversation: {
    items: [],
    activeId: null,
    title: '新对话',
  },
  bubble: {
    messages: [],
  },
  sender: {
    loading: false,
    disabled: false,
    submitDisabled: false,
  },
  request: {
    state: 'idle',
  },
})

function handleSubmit(payload: ChatSendPayload) {
  // 在这里接入项目自己的发送逻辑，并按需更新 data。
  console.log(payload.text)
}
</script>

<template>
  <TrChatUI
    :data="data"
    :input-value="inputValue"
    @update:input-value="inputValue = $event"
    @submit="handleSubmit"
  />
</template>
```

受控模式下，外部必须响应 `update:input-value` 并更新 `inputValue`。外部还需要处理会话、请求状态、取消、模型和 MCP 事件，并将最新事实写回 `data`。

## 11. 常见问题

### 页面无法发送消息

检查以下条件：

- 是否配置了 `modelProviders`，或提供了 `conversation.useMessageOptions.responseProvider`；
- `modelProviders` 与 `responseProvider` 是否被同时配置；
- 当前 Provider 是否有 API Key；
- MCP Server 是否仍在读取工具；
- 是否通过 Runtime 的 `disabled` 或 `submitDisabled` 禁用了输入。

### MCP 服务无法连接

检查以下条件：

- `baseUrl` 是否正确；
- 浏览器是否允许跨域请求；
- 相对地址是否被用于非浏览器环境；
- `headers` 或 `validate` 是否导致认证校验失败；
- 远程服务是否支持 Streamable HTTP。

### 更换模型或工具后，当前请求没有变化

模型、功能开关和 MCP 工具选择会在发送时保存为当前消息的请求配置。发送完成后再发生的变更只影响下一条消息，不会修改已经开始的请求。

### 为什么浏览器中不应直接放生产密钥

前端环境变量会进入浏览器构建产物，浏览器用户可以读取请求中的凭证。生产环境应使用后端或 BFF 保存密钥并代发模型和 MCP 请求。

### 应该使用 `TrChat`、`useKitChatRuntime` 还是 `TrChatUI`

| 情况 | 选择 |
| --- | --- |
| 从零开始创建聊天页面 | `useLocalChatRuntime + TrChat` |
| 已经有 Kit 的 `useConversation` | `useKitChatRuntime + TrChat` |
| 已有自己的数据层、请求层和状态管理 | `TrChatUI` |

## 12. API 速查

| 导出 | 用途 |
| --- | --- |
| `TrChat` | 完整聊天页面，连接 `ChatRuntime` 和 `TrChatUI` |
| `TrChatUI` | 纯界面层，接收 `ChatUIData` 和 UI 事件 |
| `useLocalChatRuntime` | 新项目默认 Runtime，组装会话、Provider 和可选 MCP |
| `useKitChatRuntime` | 适配已有 Kit 会话 |
| `ChatUIOptions` | `TrChat` 和 `TrChatUI` 的界面配置类型 |
| `ChatProviderConfig` | 模型服务配置类型 |
| `ChatMcpServers` | 声明式 MCP 服务配置类型 |
| `ChatRuntime` | 自有状态管理接入时实现的 Runtime 协议 |

其他常用公开类型包括 `ChatMcpServerConfig`、`ChatRuntimeActionErrorPayload`、`ChatSendPayload`、`ChatUISlots` 和 `ChatUIData`。
