---
outline: [1, 3]
pageClass: demo-container-page-bg
---

# MCP Adapter 与 WebMCP

WebMCP Adapter 将页面工具接入 TinyRobot 的统一 MCP 管理接口。应用通过 WebMCP SDK 初始化 Context、注册工具并实现业务逻辑；Adapter 负责工具发现、状态同步和调用转发。

## 包职责与公共 API

| 使用场景                       | 推荐包                                          | 说明                                                    |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------- |
| WebMCP Adapter 或 MCP 管理能力 | @opentiny/tiny-robot                            | 导出公共 Adapter、MCP 状态契约和组合管理器。            |
| 自己管理消息和模型工具调用     | @opentiny/tiny-robot + @opentiny/tiny-robot-kit | 业务使用公共 Adapter，并用 Kit 完成模型工具调用。       |
| 使用完整聊天页面               | @opentiny/tiny-robot-chat                       | Chat Runtime 复用同一个 Adapter，并负责连接界面和会话。 |

公共 API 参考见 [MCP Adapter 公共 API](../components/mcp-extension#mcp-adapter-公共-api)。完整接入示例包含组件 + Kit、Chat，以及 WebMCP 与外部 MCP 共存三种场景。

> [!IMPORTANT]
> `createWebMcpAdapter` 不负责初始化 WebMCP Polyfill，也不负责注册页面工具。应用需要通过 SDK 或其他方式准备 Context，并负责工具权限和业务副作用。

## 适用场景

选择 WebMCP 接入时，工具通常满足以下特征：

- 工具依赖当前页面、当前路由或当前用户会话；
- 工具执行需要浏览器环境中的状态或页面能力；
- 工具不需要单独部署为外部 MCP 服务；
- 工具的权限确认和业务副作用可以由页面应用控制。

如果工具主要访问服务端数据、需要跨页面复用，或者需要独立的鉴权和部署边界，应优先使用外部 MCP Server。WebMCP 和外部 MCP 可以同时接入同一个工具运行时或 Chat Runtime。

## 接入边界

| 能力           | 应用侧负责                                          | TinyRobot 负责                        |
| -------------- | --------------------------------------------------- | ------------------------------------- |
| 页面工具       | 注册工具、实现工具逻辑和返回结果                    | 不负责注册页面工具                    |
| 权限与副作用   | 登录态、权限校验、用户确认和业务操作                | 不替代业务鉴权                        |
| WebMCP Context | 初始化 `document.modelContext` 或提供自定义 Context | 通过 `getContext` 接入 Context        |
| 工具变化       | 工具增删或更新后触发 `toolchange`                   | 刷新工具列表并更新运行时状态          |
| Server 信息    | 提供稳定的 `id`、`name` 和描述                      | 在 MCP 面板中展示 Server 和 Tool 状态 |
| 组件与 Kit     | 将 Adapter 接入 `toolPlugin` 和自定义工具面板       | 提供统一状态和调用契约                |
| Chat 接入      | 将 Adapter 传入 `useChatRuntime`                    | 完成工具适配、路由和调用结果处理      |

公共 Adapter 的完整参数和生命周期见 [MCP Adapter 公共 API](../components/mcp-extension#mcp-adapter-公共-api)。

业务不需要在标准接入中直接实现工具路由；组件、Kit 和 Chat 分别负责自己的展示与调用链。

## 环境准备与体验前提

示例使用 `@opentiny/next-sdk@0.4.11` 初始化 WebMCP Polyfill 并注册页面工具。文档站可以直接体验工具发现、动态注册/注销、Server/Tool 开关和 `toolchange` 同步。

初始化顺序是先调用 `initializeBuiltinWebMCP()`，再从 `document.modelContext` 获取 Context，通过 `context.registerTool` 注册工具；工具注册返回的 `AbortController` 信号用于注销。示例已将这段流程封装在 `sdk-page-tools.ts` 的 `createSdkPageTools` 中。

```ts
import { initializeBuiltinWebMCP } from '@opentiny/next-sdk'

initializeBuiltinWebMCP()
const context = document.modelContext
const controller = new AbortController()

context?.registerTool(
  {
    name: 'get-page-info',
    description: '读取当前页面信息。',
    inputSchema: { type: 'object', properties: {} },
    execute: async () => ({ content: [{ type: 'text', text: document.title }] }),
  },
  { signal: controller.signal },
)

// 页面卸载或工具移除时注销
controller.abort()
```

文档站当前的模型接口是演示用 Mock，默认只返回文本，不保证返回真实 `tool_calls`。要验证模型实际选择并调用页面工具，请在自己的 Vue 应用中配置支持 Tool Calling 的模型服务，并发送“读取当前页面区域”或“切换到 details”等请求，检查工具结果和页面状态。

真实模型服务需要支持 OpenAI 兼容的 `tools` 请求和 `assistant.tool_calls` 响应：第一轮返回工具调用后，Kit/Chat 执行 `callTool` 并追加 `tool` 消息，再发起下一轮请求获得最终文本。

共存示例中的 `api/mcp/project-knowledge` 是占位地址。接入真实外部 MCP 时，请替换为实际 SSE 或 Streamable HTTP 地址，并确保浏览器 CORS 或服务端代理、认证和权限策略已配置。

## 完整接入示例

本节包含三个可在文档站查看的接入场景：不使用 Chat 的 Kit 接入、Chat 接入，以及 WebMCP 与外部 MCP 共存。三个场景使用同一组页面工具，并通过 OpenTiny WebMCP SDK 完成初始化、注册和注销；真实模型工具调用和外部 MCP 连接需要按“环境准备与体验前提”配置。

### 示例一：Kit 接入 WebMCP

这个示例不依赖 @opentiny/tiny-robot-chat，使用公共 WebMCP Adapter、TinyRobot 组件和 Kit 的 useMessage/toolPlugin 完成工具管理和模型调用。

<demo
  vue="../../demos/best-practices/webmcp-chat-integration/kit.vue"
  :vueFiles="[
    '../../demos/best-practices/webmcp-chat-integration/kit.vue',
    '../../demos/best-practices/webmcp-chat-integration/sdk-page-tools.ts',
  ]"
  title="Kit 接入 WebMCP"
  description="不依赖 Chat 套件，使用公共 Adapter、组件和 Kit 完成工具发现、启停与模型调用。"
/>

### 示例二：Chat 接入

这个示例使用 OpenTiny WebMCP SDK，展示页面 WebMCP 的基础接入链路：

1. 页面提供 `get-page-info` 和 `set-page-section` 两个工具；
2. 点击按钮后动态注册 `get-demo-status`；
3. 再次点击后移除动态工具，恢复初始工具列表；
4. 每次工具变化都触发 `toolchange`，Chat 中的工具列表同步更新；
5. 页面展示当前已发现的工具和 Runtime 操作状态。

<demo
  vue="../../demos/best-practices/webmcp-chat-integration/basic.vue"
  :vueFiles="[
    '../../demos/best-practices/webmcp-chat-integration/basic.vue',
    '../../demos/best-practices/webmcp-chat-integration/sdk-page-tools.ts',
  ]"
  title="Chat 接入 WebMCP"
  description="使用 OpenTiny WebMCP SDK，演示工具发现、动态注册、注销和 toolchange 同步。"
/>

#### 实际接入配置

实际接入通常只需要创建 WebMCP Adapter，并将它放入 `useChatRuntime` 的 `mcp.adapters`：

```ts
const webmcpAdapter = createWebMcpAdapter({
  server: {
    id: 'page-webmcp',
    name: '页面工具',
    description: '当前页面提供的 WebMCP 工具',
  },
})

const runtime = useChatRuntime({
  modelProviders,
  mcp: {
    adapters: [webmcpAdapter],
  },
})
```

应用侧需要关注的只有三件事：

- 在创建 Runtime 前确保 `document.modelContext` 已完成初始化；
- 为页面工具配置稳定且唯一的 Server ID；
- 工具注册、权限确认和业务副作用仍由页面应用自己管理。

示例中的 `sdk-page-tools.ts` 使用 OpenTiny WebMCP SDK 初始化 Polyfill，并通过 `registerTool` 注册工具；工具注销通过 `AbortController.abort()` 完成。实际项目如果已经初始化了 WebMCP Context，也可以省略 `getContext`，让 Adapter 读取默认的 `document.modelContext`。

### 示例三：WebMCP 与外部 MCP 共存

当页面工具和外部 MCP 都需要提供给同一个 Chat 时，使用统一的 `mcp` 配置：

<demo
  vue="../../demos/best-practices/webmcp-chat-integration/combined.vue"
  :vueFiles="[
    '../../demos/best-practices/webmcp-chat-integration/combined.vue',
    '../../demos/best-practices/webmcp-chat-integration/sdk-page-tools.ts',
  ]"
  title="WebMCP 与外部 MCP 共存"
  description="页面工具通过 adapters 接入，外部 MCP Server 通过 servers 接入。"
/>

```ts
const runtime = useChatRuntime({
  modelProviders,
  mcp: {
    servers: externalMcpServers,
    adapters: [webmcpAdapter],
  },
})
```

其中：

- `mcp.servers` 用于配置外部 MCP Server；
- `mcp.adapters` 用于接入 WebMCP、业务 Adapter 或 SDK Adapter；
- TinyRobot 会把它们合并到同一个 MCP Runtime 和 MCP 面板；
- WebMCP 工具在模型侧通常使用 `${serverId}__${toolName}` 命名空间；名称过长时使用稳定短别名，避免超过模型 API 限制并保持原始工具调用映射。

## 接入流程

三个示例都遵循以下接入流程；Kit 示例把“创建 Runtime”替换为创建 Kit 的 `useMessage` 和 `toolPlugin` 调用链：

| 步骤            | 接入操作                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------- |
| 1. 初始化       | 注册页面工具，并确保 `document.modelContext` 或自定义 Context 已可用。                        |
| 2. 创建 Adapter | 使用 `createWebMcpAdapter` 配置 Server 的 `id`、`name` 和 Context。                           |
| 3. 创建调用链   | Chat 将 Adapter 放入 `useChatRuntime` 的 `mcp.adapters`；Kit 使用 `toolPlugin` 接入 Adapter。 |
| 4. 发现工具     | TinyRobot 读取页面工具列表，并在 MCP 面板或自定义工具面板中展示。                             |
| 5. 同步变化     | 工具增删或更新后触发 `toolchange`，让 Adapter 刷新工具列表。                                  |
| 6. 执行调用     | Chat 或 Kit 调用工具后，由工具实现完成权限校验和具体逻辑。                                    |

工具发现发生在 Adapter 初始化和后续刷新阶段。业务只需要维护工具注册和 `toolchange` 通知，不需要自行实现 Adapter 的工具路由。

### 动态 MCP Server 注册和事件兼容

Chat 内置 Runtime 提供 `registerMcpServer` 时，MCP 表单提交会先交给 Runtime 完成连接和工具发现，再通过 `mcp-create-server` 通知应用已注册的 `serverId`。应用仍负责权限校验、认证信息补充、配置持久化和服务端策略。

如果自定义 Runtime 没有提供 `registerMcpServer`，Chat 会继续直接触发 `mcp-create-server`，由应用接管连接、错误处理和列表更新。已有通过该事件接入 MCP 的业务可以继续使用；迁移到内置 Runtime 时，应避免重复连接同一个 Server。

Adapter 的 `refreshServer` 用于按 Server 刷新。一个 Adapter 如果管理多个 Server，建议实现该方法；否则组合 Adapter 只能退回调用整个 Adapter 的 `refresh`，可能让其他禁用 Server 的刷新错误影响当前请求。

## 页面工具实现建议

页面工具会被模型根据名称、描述和 Schema 选择，因此建议在注册工具时遵循以下约定：

| 设计项       | 建议                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| 工具名称     | 使用稳定、能表达动作的英文名称，例如 `get-page-info`、`set-page-section`；不要把临时 ID 或用户数据放入名称 |
| 工具描述     | 说明工具能做什么、作用范围和重要限制，避免只写“执行操作”                                                   |
| 输入 Schema  | 提供 `object` 类型和明确的 `properties`、`required`；字段含义应与业务校验一致                              |
| 权限和副作用 | 读取工具尽量保持无副作用；修改页面或提交数据前，由应用侧完成权限校验和必要的用户确认                       |
| 返回结果     | 返回可序列化、能解释执行结果的内容；失败时返回明确错误，不要静默吞掉异常                                   |
| 动态工具同步 | 工具增删或 Schema 变化后触发 `toolchange`，让 Chat 重新发现工具                                            |

## 接入注意事项

接入时，重点关注工具初始化、权限控制、生命周期和动态状态同步。

### 初始化顺序

建议先完成 WebMCP Context 或 Polyfill 初始化，再创建 Adapter 和 Chat Runtime。这样首次工具发现可以拿到完整列表，避免 Runtime 初始化时工具为空。

如果 Context 的初始化依赖异步业务数据，应在初始化完成后再挂载 Chat；如果工具列表是在 Runtime 创建后变化，则必须触发 `toolchange`。

### 权限与敏感操作

TinyRobot 只负责转发工具调用，不判断当前用户是否有权执行具体操作。以下逻辑应在工具实现内部处理：

- 登录态和资源权限校验；
- 删除、提交、发送等敏感操作的用户确认；
- 请求参数校验和数据范围限制；
- 相关 API 的错误处理和审计记录。

不要把长期有效的 API Key、Cookie 或 Authorization 直接写入页面工具配置。需要访问受保护资源时，应通过业务已有的服务端鉴权或受控的 API 代理完成。

### 生命周期和状态

`removeServer(id)` 会将 Server 设为未安装、禁用，清空工具并停止监听；Server 仍保留在状态列表中，可通过 `addServer(id)` 重新安装。它不会注销应用侧的页面工具。

`removeAdapter(adapter)` 会从组合 Adapter 中移除指定实例并调用其 `close()`。页面卸载时，应用还应注销 SDK 工具（例如调用 `AbortController.abort()`），再关闭 Adapter。

如果业务允许用户切换页面、账号或工作区，需要同步更新工具列表和工具执行上下文，并在变化后触发 `toolchange`，避免 Chat 继续看到旧工具或使用旧业务状态。

### 何时使用自定义 Tool Source

只要业务使用 `document.modelContext`，通常不需要实现 `WebMcpToolSource`。以下情况才考虑传入自定义 `source`：

- 项目没有 `document.modelContext`，但已经有一套兼容的工具目录和调用接口；
- 需要把多个非浏览器工具源组合成一个 WebMCP Server；
- 需要自定义工具发现、调用结果或订阅变化的实现方式。

自定义 Source 至少需要实现 `listTools` 和 `callTool`；如果工具列表会变化，还应实现 `subscribe`。

## 接入检查清单

- 创建 Chat Runtime 前，确保 `document.modelContext` 或自定义 Context 已可用；
- WebMCP Server 使用稳定且唯一的 `id`；
- 工具名称、描述和输入 Schema 足够明确；
- 工具执行函数包含业务权限校验和错误处理；
- 工具列表动态变化后触发 `toolchange`；
- 页面工具与外部 MCP 同时接入时，统一使用 `mcp: { servers, adapters }`；
- 未把长期凭证直接暴露在浏览器配置或工具参数中；
- 确认 `removeServer` 与 `removeAdapter` 的作用对象不同，并在页面卸载时注销 SDK 工具和关闭 Adapter。
