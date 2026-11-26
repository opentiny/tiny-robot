---
outline: [1, 3]
---

# MCP 扩展添加与详情

`McpExtensionForm` 收集一条 MCP 连接配置，支持表单和 JSON 两种输入方式；`McpExtensionDetail` 展示已加载的 MCP 信息与工具开关。两者都是可嵌入页面或弹窗的内容组件，适合在应用处理扩展管理操作后分别呈现添加和详情界面。

MCP Extension 组件主要服务于基于 URL、Transport 和请求头配置的外部 MCP Server 管理。WebMCP 是 MCP 的另一种工具来源，但不使用这套连接表单；它通过 MCP Adapter 接入公共工具管理契约。公共接口和生命周期说明见本文的 [MCP Adapter 公共 API](#mcp-adapter-公共-api)，完整接入示例见 [MCP Adapter 与 WebMCP](/best-practices/webmcp-chat-integration)。

## 概览

### 适用场景

- 用 `McpExtensionForm` 让用户填写一条 SSE 或 Streamable HTTP 连接，并把校验后的配置交给应用。
- 用 `McpExtensionDetail` 展示名称、描述和工具列表，让应用接收工具开关意图。
- 与 [ExtensionManager](./extension-manager.md) 组合时，由应用根据用户的添加或查看操作打开相应界面。

### 职责边界

表单负责收集和校验连接配置，详情组件展示应用传入的信息与工具状态。两者都不会替应用加载详情或保存数据，也不拥有弹窗标题和关闭行为。应用负责调用服务、保存结果、更新界面，并处理取消和关闭操作。

MCP 存储工具是独立的公开入口，表单不会自动调用它们；具体接口见文末。已有的 `McpAddForm` 也是独立公共组件。

## 用法示例

### 添加一条 MCP 连接

为必填的 `model-value` 提供初始值。用户输入可转换为配置时，`v-model` 会更新；点击“确定”通过校验后，应用收到完整配置和输入方式。示例只在页面显示收到的结果，真实保存由应用实现。

<demo
  vue="../../demos/mcp-extension-form/basic.vue"
  title="填写并提交连接"
  description="填写名称和 HTTP 地址后提交；取消和重置都可在页面观察。"
/>

### 使用 JSON 配置

`mode` 是受控值：提供它时，应用应处理 `update:mode` 并同步新值。未提供 `mode` 时，组件自行切换方式，初始方式由 `default-mode` 决定。切换方式会从最近可表示的 `model-value` 建立新草稿；暂时无效的 JSON 留在当前编辑器内，不会覆盖绑定值。

代码方式要求顶层包含 `mcpServers`，且恰好只有一个服务器。`sse`、`http` 和 `streamableHttp` 可以解析，`http` 会规范化为 `streamableHttp`；不支持 stdio。示例可以改坏 JSON 后点击“确定”查看错误，再恢复示例配置。

<demo
  vue="../../demos/mcp-extension-form/code-mode.vue"
  title="代码方式与受控添加方式"
  description="编辑单条 MCP JSON 配置，观察提交来源和错误恢复。"
/>

### 显示并切换工具

`McpExtensionDetail` 按传入的 `tools` 展示开关。用户操作时，它只触发 `tool-toggle`，不会自行修改 `tools`。示例由应用更新数组，因此开关状态会在事件后保持；禁用项不能触发切换。

<demo
  vue="../../demos/mcp-extension-detail/basic.vue"
  title="应用更新工具状态"
  description="切换工具后由应用更新传入数据，并可一键恢复初始状态。"
/>

## 可访问性与设计约束

表单使用有名称的输入框和单选组。提交未通过校验时，错误会关联到对应字段，并把焦点移到第一个无效字段；修正字段后，相应错误会清除。缩略图 URL 加载失败时会显示本地默认图和可见错误提示。代码编辑器也会在提交失败时获得焦点。

工具开关使用带工具名称的原生复选框，并提供 switch 语义；禁用项不进入可操作状态。详情摘要中的名称和描述会按可用宽度换行，单个工具的名称和描述则以单行省略；应用应为详情区域提供合适的宽度。弹窗焦点管理、标题、关闭按钮与返回焦点由宿主负责。

## API

组件和以下类型均从 `@opentiny/tiny-robot` 导入；示例使用 `TrMcpExtensionForm`、`TrMcpExtensionDetail` 及对应的 `<tr-*>` 标签。两个组件都没有公开 Slots 或 Expose 方法。

### McpExtensionForm

#### Props

| 属性名         | 说明                                                                         | 类型                    | 默认值   | 必填 |
| -------------- | ---------------------------------------------------------------------------- | ----------------------- | -------- | ---- |
| `model-value`  | 当前连接配置；草稿可转换时通过 `update:model-value` 请求更新，父组件需同步。 | `McpExtensionFormValue` | —        | 是   |
| `mode`         | 受控的添加方式；提供时优先于 `default-mode`，父组件需处理 `update:mode`。    | `McpExtensionFormMode`  | —        | 否   |
| `default-mode` | 未提供 `mode` 时使用的初始添加方式。                                         | `McpExtensionFormMode`  | `'form'` | 否   |

#### Events

| 事件名               | 触发时机                                                                             | 回调参数                                                                   |
| -------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `update:model-value` | 表单草稿可转换为配置，或代码草稿可解析时；可能早于完整提交校验。父组件需更新绑定值。 | `(value: McpExtensionFormValue) => void`                                   |
| `update:mode`        | 用户选择另一种添加方式时；提供 `mode` 的父组件需同步新值。                           | `(mode: McpExtensionFormMode) => void`                                     |
| `submit`             | 点击“确定”且当前方式校验通过后；组件先更新绑定值，再交由应用保存。                   | `(value: McpExtensionFormValue, meta: McpExtensionFormSubmitMeta) => void` |
| `cancel`             | 用户点击“取消”时；组件不清空草稿或关闭宿主。                                         | `() => void`                                                               |

#### Types

| 类型名                       | 类型或签名 | 说明                                |
| ---------------------------- | ---------- | ----------------------------------- |
| `McpExtensionFormMode`       | union      | `'form' \| 'code'`。                |
| `McpExtensionFormValue`      | interface  | 一条经过表单或代码编辑的连接配置。  |
| `McpExtensionFormProps`      | interface  | 表单的公开 Props。                  |
| `McpExtensionFormSubmitMeta` | interface  | 提交来源，`source` 为当前输入方式。 |
| `McpExtensionFormEmits`      | interface  | 表单的四个公开事件签名。            |

以下是 `McpExtensionFormValue` 与 `McpExtensionFormSubmitMeta` 的完整定义：

```ts
interface McpExtensionFormValue {
  name: string
  description?: string
  type: 'sse' | 'streamableHttp'
  url: string
  headers?: Record<string, string>
  thumbnail?: string | null
}

interface McpExtensionFormSubmitMeta {
  source: McpExtensionFormMode
}
```

`name` 和 `url` 在提交时必填，`url` 必须为 HTTP 或 HTTPS 地址。表单中的 `headers` 输入是 JSON 对象；可转换的数字、布尔值会成为字符串。空白的可选字段在提交结果中省略。`thumbnail` 是图片 URL 或空值，图片加载失败时仅回退预览，不自动替换应用保存的 URL。

### McpExtensionDetail

#### Props

| 属性名        | 说明                                     | 类型                 | 默认值 | 必填 |
| ------------- | ---------------------------------------- | -------------------- | ------ | ---- |
| `id`          | MCP 标识；详情组件不根据它加载数据。     | `string`             | —      | 是   |
| `name`        | 展示的 MCP 名称。                        | `string`             | —      | 是   |
| `tools`       | 应用提供的工具列表；事件不会直接修改它。 | `McpExtensionTool[]` | —      | 是   |
| `description` | 描述；为空时显示“暂无描述”。             | `string`             | —      | 否   |
| `updated-at`  | 已格式化的更新时间文本；未提供时不显示。 | `string`             | —      | 否   |

#### Events

| 事件名        | 触发时机                                                 | 回调参数                                       |
| ------------- | -------------------------------------------------------- | ---------------------------------------------- |
| `tool-toggle` | 用户切换可用工具时；仅提供下一状态，应用需更新 `tools`。 | `(event: McpExtensionToolToggleEvent) => void` |

#### Types

| 类型名                        | 类型或签名 | 说明                           |
| ----------------------------- | ---------- | ------------------------------ |
| `McpExtensionTool`            | interface  | 工具标识、显示信息与开关状态。 |
| `McpExtensionDetailProps`     | interface  | 详情的公开 Props。             |
| `McpExtensionToolToggleEvent` | interface  | 被切换工具的 ID 和目标状态。   |
| `McpExtensionDetailEmits`     | interface  | `tool-toggle` 的公开事件签名。 |

以下是 `McpExtensionTool` 与 `McpExtensionToolToggleEvent` 的完整定义：

```ts
interface McpExtensionTool {
  id: string
  name: string
  description?: string
  enabled: boolean
  disabled?: boolean
}

interface McpExtensionToolToggleEvent {
  toolId: string
  enabled: boolean
}
```

`id` 应在列表中稳定且唯一；`disabled: true` 时不能切换。工具数量直接来自 `tools.length`，`updated-at` 只展示传入文本，不会自行格式化日期。

## 公开 MCP 存储工具

MCP 存储是工具函数，不是组件。`McpExtensionStorage` 在一个实例中分别管理连接定义 `data` 和配置 `options`。`source + id` 是稳定身份；名称只用于显示，因此不同来源可以同名。卸载时调用 `deleteData`，工具开关和应用配置仍保留；再次安装同一身份会恢复这些配置。

```ts
import { createMemoryMcpExtensionStorage } from '@opentiny/tiny-robot'

const storage = createMemoryMcpExtensionStorage({
  parseBusinessOptions(value) {
    if (typeof value !== 'object' || value === null || !('enabled' in value) || typeof value.enabled !== 'boolean') {
      throw new Error('启用配置无效')
    }
    return { enabled: value.enabled }
  },
})
const identity = { source: 'remote', id: 'weather' }
await storage.upsertData({
  ...identity,
  version: 1,
  name: '天气服务',
  type: 'streamableHttp',
  url: 'https://example.com/mcp',
  tools: [{ id: 'forecast', name: '天气预报', enabled: true }],
})
await storage.setOptions(identity, {
  toolPolicy: { default: 'enabled', overrides: {} },
  business: { enabled: false },
})
await storage.deleteData(identity) // 配置仍可用 getOptions(identity) 读取
```

`createMcpExtensionStorage()` 默认使用浏览器 `localStorage`，也可传入 DOM `Storage` 或异步 `adapter`。`createMemoryMcpExtensionStorage()` 每次返回独立实例；页面刷新后清空。表单只发出提交数据，应用需要在保存成功后更新界面。

| 公开入口                          | 签名                                                                                                                           | 用途                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| `createMcpExtensionStorage`       | `<TBusiness>(options?: McpExtensionStorageOptions<TBusiness>) => McpExtensionStorage<TBusiness>`                               | Web Storage 或异步文档适配器。 |
| `createMemoryMcpExtensionStorage` | `<TBusiness>(options?: Pick<McpExtensionStorageOptions<TBusiness>, 'parseBusinessOptions'>) => McpExtensionStorage<TBusiness>` | 独立的内存实例。               |

所有方法均返回 Promise。`identity` 是 `{ source, id }`。

| 方法                                                             | 返回值                                                 | 行为                                                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `listData()`                                                     | `Promise<McpExtensionData[]>`                          | 读取已保存的定义。                                                                        |
| `getData(identity)`                                              | `Promise<McpExtensionData \| undefined>`               | 按稳定身份读取定义。                                                                      |
| `upsertData(input)`                                              | `Promise<McpExtensionData>`                            | 保存定义；较高 `version` 更新，较低版本保持原定义，同版本内容冲突时报错；不修改 options。 |
| `deleteData(identity)`                                           | `Promise<void>`                                        | 删除定义，保留 options；定义不存在时报错。                                                |
| `getOptions(identity)`                                           | `Promise<McpExtensionOptions<TBusiness> \| undefined>` | 配置可以独立于定义存在。                                                                  |
| `setOptions(identity, options)`                                  | `Promise<McpExtensionOptions<TBusiness>>`              | 保存工具策略及应用配置。                                                                  |
| `deleteOptions(identity)`                                        | `Promise<void>`                                        | 显式清除配置。                                                                            |
| `setToolEnabled(identity, toolId, enabled)`                      | `Promise<McpExtensionOptions<TBusiness>>`              | 只修改工具覆盖值，保留其他配置；没有定义时也可调用。                                      |
| `create(input)` / `createFromConfig(config)`                     | `Promise<McpExtensionData>`                            | 手动添加：生成 `manual` 来源的 UUID、版本 1；配置文本仅接受单个服务器。                   |
| `update(identity, input)` / `updateFromConfig(identity, config)` | `Promise<McpExtensionData>`                            | 编辑已保存的连接字段并递增版本；保留身份和 options。                                      |

以下为本节存储类型的完整字段；`McpExtensionStorage<TBusiness>` 的全部方法列在上表。`McpExtensionTool` 的字段见前文详情组件 API。

```ts
type McpExtensionTransportType = 'sse' | 'streamableHttp'

interface McpExtensionInput {
  name: string
  description?: string
  type: McpExtensionTransportType
  url: string
  headers?: Record<string, unknown>
  thumbnail?: string | null
}

interface McpExtensionIdentity {
  source: string
  id: string
}

interface McpExtensionDataInput extends McpExtensionIdentity, McpExtensionInput {
  version: number
  tools: McpExtensionTool[]
}

interface McpExtensionData extends McpExtensionIdentity {
  version: number
  name: string
  description: string
  type: McpExtensionTransportType
  url: string
  headers: Record<string, string>
  thumbnail: string | null
  tools: McpExtensionTool[]
  createdAt: string
  updatedAt: string
}

interface McpExtensionToolPolicy {
  default: 'enabled' | 'disabled'
  overrides: Record<string, boolean>
}

interface McpExtensionOptions<TBusiness = never> {
  toolPolicy: McpExtensionToolPolicy
  business?: TBusiness
}

interface McpExtensionStorageAdapter {
  read(key: string): Promise<string | null>
  write(key: string, value: string): Promise<void>
}

interface McpExtensionStorageOptions<TBusiness = never> {
  namespace?: string
  storage?: Storage
  adapter?: McpExtensionStorageAdapter
  parseBusinessOptions?: (value: unknown) => TBusiness
}
```

`version` 是非负整数，用于比较同一身份的定义。`options` 中的 `toolPolicy` 是组件提供的基础字段；`business` 由应用定义，读取时必须提供 `parseBusinessOptions` 校验。`storage` 与 `adapter` 只能二选一。异步适配器以完整文档读写；同一实例会串行执行修改，跨客户端并发控制由实际后端负责。Web Storage 会把请求头以普通 JSON 文本保存；有凭据时应选择合适的应用存储。

## MCP Adapter 公共 API

MCP Adapter 是 `@opentiny/tiny-robot` 提供的公共工具接入契约。WebMCP、外部 MCP 和业务自定义工具源都可以通过 Adapter 接入统一的 Server/Tool 状态、发现、调用和生命周期管理。

完整接入示例见 [MCP Adapter 与 WebMCP](/best-practices/webmcp-chat-integration)。

### 最小用法

```ts
import { createWebMcpAdapter } from '@opentiny/tiny-robot'

const adapter = createWebMcpAdapter({
  server: {
    id: 'page-webmcp',
    name: '页面工具',
  },
})

const server = adapter.runtime.servers.value[0]
const tools = adapter.runtime.tools.value['page-webmcp'] ?? []

if (server?.enabled) {
  const definitions = await adapter.listTools(['page-webmcp'], {
    'page-webmcp': tools.filter((tool) => tool.enabled).map((tool) => tool.id),
  })
  const definition = definitions[0]
  if (definition) await adapter.callTool(definition.serverId, definition.originalName, {})
}

await adapter.runtime.setToolEnabled('page-webmcp', 'get-page-info', false)
await adapter.close?.()
```

状态操作统一使用 `await`，这样可以同时兼容同步完成和异步返回的 Adapter 实现。

### `createWebMcpAdapter`

```ts
interface CreateWebMcpAdapterOptions {
  server?: WebMcpServerOptions
  source?: WebMcpToolSource
  getContext?: () => WebMcpContext | undefined
}
```

`source` 和 `getContext` 只能选择一个：

- 未传 `source` 时，Adapter 通过 `getContext` 读取 WebMCP Context；省略 `getContext` 时读取 `document.modelContext`；
- 传入 `source` 时，业务负责实现工具发现、调用和变化订阅；
- 同时传入 `source` 和 `getContext` 会抛出配置错误；
- Adapter 不负责初始化 WebMCP Polyfill，也不负责注册页面工具。

### `McpAdapter`

```ts
interface McpAdapter {
  runtime: McpRuntime
  listTools: (
    serverIds: readonly string[],
    toolIds: Readonly<Record<string, readonly string[]>>,
  ) => Promise<readonly McpToolDefinition[]>
  callTool: (serverId: string, toolName: string, args: Record<string, unknown>) => Promise<unknown>
  /** @deprecated Use `runtime.registerMcpServer` instead. */
  registerMcpServer?: (config: McpServerRegistrationConfig) => Promise<string>
  refreshServer?: (serverId: string) => void | Promise<void>
  refresh?: () => void | Promise<void>
  close?: () => void | Promise<void>
}
```

`listTools` 返回的 `name` 是提供给模型的名称，`originalName` 是工具源中的原始名称。工具名称过长或包含模型 API 不支持的字符时，Adapter 会生成稳定别名，调用时仍使用 `originalName`。

`refreshServer` 用于请求范围内的单 Server 刷新。一个 Adapter 管理多个 Server 时应实现它；没有该方法时，组合 Adapter 会退回调用该 Adapter 的整体 `refresh`。

### `McpRuntime`

```ts
interface McpRuntime {
  servers: { readonly value: readonly McpServerInfo[] }
  tools: { readonly value: McpToolState }
  registerMcpServer?: (config: McpServerRegistrationConfig) => Promise<string>
  addServer(id: string): void | Promise<void>
  removeServer(id: string): void | Promise<void>
  setServerEnabled(id: string, enabled: boolean): void | Promise<void>
  setToolEnabled(serverId: string, toolId: string, enabled: boolean): void | Promise<void>
}
```

动态 URL Server 的注册参数如下：

```ts
interface McpServerRegistrationConfig {
  name: string
  description?: string
  type: 'sse' | 'streamableHttp'
  url: string
  headers?: Record<string, string>
  thumbnail?: string | null
}
```

`runtime.registerMcpServer` 是动态注册 URL 型 MCP Server 的正式入口。Adapter 顶层的 `registerMcpServer` 仅为旧代码保留，已标记为弃用。

#### Server 和 Tool 状态

- `servers.value` 是当前 Adapter 管理的 Server；`installed: false` 表示已卸载但仍可通过 `addServer(id)` 重新安装；
- `enabled: false` 时，Server 不参与模型工具发现和调用；
- `loading` 表示正在发现或连接工具；`error` 表示最近一次发现失败；
- `tools.value[serverId]` 是该 Server 当前已发现的工具及其启用状态。

#### 生命周期操作

- `removeServer(id)` 卸载 Server、清空工具并停止相关监听；它不会注销应用侧已注册的 WebMCP 工具；
- `addServer(id)` 重新安装并发现工具；
- `setServerEnabled` 和 `setToolEnabled` 的返回值可能是同步 `void`，也可能是 Promise，调用方应使用 `await`；
- `close()` 释放连接和监听。页面卸载时，应用还应注销 SDK 工具，例如调用对应 `AbortController.abort()`。

### `createCompositeMcpAdapter`

```ts
const composite = createCompositeMcpAdapter({
  adapters: [webmcpAdapter, businessAdapter],
})

await composite.addAdapter(otherAdapter)
await composite.removeAdapter(otherAdapter)
await composite.close()
```

组合 Adapter 会按 Server ID 路由工具发现、调用和状态操作。`removeAdapter(adapter)` 按 Adapter 实例移除，并调用该实例的 `close()`；它不依赖当前 Server 列表，因此也适用于暂时没有 Server 的 Adapter。

组合 Adapter 的 `registrationAdapter` 用于指定动态 URL Server 的注册归属；如果未指定，Chat Runtime 会选择提供 `runtime.registerMcpServer` 的 Adapter。注册归属 Adapter 被移除或组合关闭后，注册请求会被拒绝。

### 组件、Kit 与 Chat 的接入方式

| 场景              | 接入方式                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| 组件 + Kit        | 读取 `adapter.runtime`，用 `toolPlugin` 提供 `getTools/callTool`，组件负责展示和触发状态操作。           |
| Chat              | 将 Adapter 放入 `useChatRuntime({ mcp: { adapters: [adapter] } })`，Chat 负责会话、模型请求和 MCP 面板。 |
| WebMCP + 外部 MCP | 使用 `mcp: { servers: externalServers, adapters: [webmcpAdapter] }`。                                    |

页面工具注册、权限确认、认证、业务副作用和持久化始终由应用负责。
