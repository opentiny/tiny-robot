---
outline: [1, 3]
---

# MCP 扩展添加与详情

`McpExtensionForm` 收集一条 MCP 连接配置，支持表单和 JSON 两种输入方式；`McpExtensionDetail` 展示已加载的 MCP 信息与工具开关。两者都是可嵌入页面或弹窗的内容组件，适合在应用处理扩展管理操作后分别呈现添加和详情界面。

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

工具开关使用带工具名称的原生复选框，并提供 switch 语义；禁用项不进入可操作状态。详情中的名称或描述过长时会在单行截断，应用应在承载容器中留出足够宽度。弹窗焦点管理、标题、关闭按钮与返回焦点由宿主负责。

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
