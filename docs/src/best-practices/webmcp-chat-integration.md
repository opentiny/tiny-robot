---
outline: [1, 3]
pageClass: demo-container-page-bg
---

# MCP Adapter 与 WebMCP

MCP Adapter 是 TinyRobot 的公共工具接入能力，不属于 Chat 套件专属实现。它负责把不同来源的工具转换为统一的 MCP Server/Tool 管理契约，供组件、Kit 或 Chat Runtime 复用。

WebMCP 是 MCP 的一种工具来源，适合把当前页面中的业务能力提供给模型工具调用链，例如读取当前页面状态、切换页面区域、查询当前用户可见的数据，或触发经过确认的页面操作。

## 包职责与公共 API

| 使用场景                       | 推荐包                                          | 说明                                                    |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------- |
| WebMCP Adapter 或 MCP 管理能力 | @opentiny/tiny-robot                            | 导出公共 Adapter、MCP 状态契约和组合管理器。            |
| 自己管理消息和模型工具调用     | @opentiny/tiny-robot + @opentiny/tiny-robot-kit | 业务使用公共 Adapter，并用 Kit 完成模型工具调用。       |
| 使用完整聊天页面               | @opentiny/tiny-robot-chat                       | Chat Runtime 复用同一个 Adapter，并负责连接界面和会话。 |

公共入口包括 createWebMcpAdapter、createWebMcpToolSource、createCompositeMcpAdapter 和 McpAdapter。Chat 仍兼容从 @opentiny/tiny-robot-chat 导入 createWebMcpAdapter，但新代码建议从 @opentiny/tiny-robot 导入。

普通 MCP、WebMCP、业务工具或 SDK 工具可以实现同一个 McpAdapter 契约，并通过 createCompositeMcpAdapter 合并。组合管理器负责按 Server ID 路由工具发现、调用、启用/禁用、刷新和关闭；各 Adapter 负责具体工具来源的连接和执行。

WebMCP Adapter 不负责初始化 Polyfill、注册页面工具或维护业务 Schema。应用仍负责工具注册、权限校验、用户确认、业务副作用和审计。

WebMCP 适合把当前页面中的业务能力提供给模型工具调用链，例如读取当前页面状态、切换页面区域、查询当前用户可见的数据，或触发经过确认的页面操作。本页通过 TrChat 示例展示完整 Chat 接入，公共 Adapter 契约与生命周期也在本页说明。

`createWebMcpAdapter` 属于 MCP 公共能力，主入口从 `@opentiny/tiny-robot` 导出。使用完整 Chat 套件时，再将 Adapter 传给 `@opentiny/tiny-robot-chat` 的 `useChatRuntime`；不使用 Chat 时，也可以复用同一个 Adapter，交给业务自己的 Kit 工具调用链或其他 MCP Runtime。公共契约和生命周期说明见本文。

本实践约定：应用负责注册页面工具、实现工具逻辑和控制权限；TinyRobot 负责把页面工具转换为 Chat Runtime 可以识别的 MCP Server/Tool，发现工具变化，并把调用结果返回给 Chat。

> [!IMPORTANT]
> `createWebMcpAdapter` 不负责初始化 WebMCP Polyfill，也不负责注册页面工具。接入前，应用需要确保 `document.modelContext` 已经可用；如果使用自定义 WebMCP Context，则通过 `getContext` 注入。

## 适用场景

选择 WebMCP 接入时，工具通常满足以下特征：

- 工具依赖当前页面、当前路由或当前用户会话；
- 工具执行需要浏览器环境中的状态或页面能力；
- 工具不需要单独部署为外部 MCP 服务；
- 工具的权限确认和业务副作用可以由页面应用控制。

如果工具主要访问服务端数据、需要跨页面复用，或者需要独立的鉴权和部署边界，应优先使用外部 MCP Server。WebMCP 和外部 MCP 可以同时接入同一个 Chat Runtime。

## 接入边界

| 能力           | 应用侧负责                                          | TinyRobot 负责                        |
| -------------- | --------------------------------------------------- | ------------------------------------- |
| 页面工具       | 注册工具、实现工具逻辑和返回结果                    | 不负责注册页面工具                    |
| 权限与副作用   | 登录态、权限校验、用户确认和业务操作                | 不替代业务鉴权                        |
| WebMCP Context | 初始化 `document.modelContext` 或提供自定义 Context | 通过 `getContext` 接入 Context        |
| 工具变化       | 工具增删或更新后触发 `toolchange`                   | 刷新工具列表并更新 Chat 状态          |
| Server 信息    | 提供稳定的 `id`、`name` 和描述                      | 在 MCP 面板中展示 Server 和 Tool 状态 |
| Chat 接入      | 将 Adapter 传入 `useChatRuntime`                    | 完成工具适配、路由和调用结果处理      |

业务不需要在标准接入中直接实现 `ChatMcpAdapter`、工具路由或 Chat 面板状态管理。

## 完整接入示例

本节包含两个可独立运行的接入场景：基础 WebMCP 接入，以及 WebMCP 与外部 MCP 共存。

### 示例一：基础 WebMCP 接入

第一个示例模拟一个页面工具 Context，展示页面 WebMCP 的基础接入链路：

1. 页面提供 `get-page-info` 和 `set-page-section` 两个工具；
2. 点击按钮后动态注册 `get-demo-status`；
3. 再次点击后移除动态工具，恢复初始工具列表；
4. 每次工具变化都触发 `toolchange`，Chat 中的工具列表同步更新；
5. 页面展示当前已发现的工具和 Runtime 操作状态。

<demo
  vue="../../demos/best-practices/webmcp-chat-integration/basic.vue"
  :vueFiles="[
    '../../demos/best-practices/webmcp-chat-integration/basic.vue',
    '../../demos/best-practices/webmcp-chat-integration/page-tools.ts',
  ]"
  title="基础 WebMCP 接入"
  description="模拟页面 Context，演示工具发现、动态注册、重置和 toolchange 同步。"
/>

#### 实际接入配置

实际接入通常只需要创建 WebMCP Adapter，并将它放入 `useChatRuntime` 的 `mcp.adapters`：

```ts
const webmcpAdapter = createWebMcpAdapter({
  getContext: () => document.modelContext,
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

示例中的 `page-tools.ts` 只是为了让文档 Demo 不依赖浏览器 Polyfill。实际项目可以保留相同的 Adapter 写法，只把 `getContext` 指向项目实际使用的 `document.modelContext`。

### 示例二：WebMCP 与外部 MCP 共存

当页面工具和外部 MCP 都需要提供给同一个 Chat 时，使用统一的 `mcp` 配置：

<demo
  vue="../../demos/best-practices/webmcp-chat-integration/combined.vue"
  :vueFiles="[
    '../../demos/best-practices/webmcp-chat-integration/combined.vue',
    '../../demos/best-practices/webmcp-chat-integration/page-tools.ts',
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

两个示例都遵循以下接入流程：

| 步骤            | 接入操作                                                               |
| --------------- | ---------------------------------------------------------------------- |
| 1. 初始化       | 注册页面工具，并确保 `document.modelContext` 或自定义 Context 已可用。 |
| 2. 创建 Adapter | 使用 `createWebMcpAdapter` 配置 Server 的 `id`、`name` 和 Context。    |
| 3. 创建 Runtime | 将 Adapter 放入 `useChatRuntime` 的 `mcp.adapters`。                   |
| 4. 发现工具     | TinyRobot 读取页面工具列表，并在 MCP 面板中展示。                      |
| 5. 同步变化     | 工具增删或更新后触发 `toolchange`，让 Chat 刷新工具列表。              |
| 6. 执行调用     | Chat 调用工具后，由工具实现完成权限校验和具体逻辑。                    |

工具发现发生在 Adapter 初始化和后续刷新阶段。业务只需要维护工具注册和 `toolchange` 通知，不需要自行实现 Chat 侧的工具路由。

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

`removeServer` 只会把 Server 从当前 Chat Runtime 中移除，并不会注销应用侧的页面工具。页面工具的注册和注销仍由应用代码负责。

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
- 确认 `removeServer` 只影响 Chat Runtime，不代替页面工具注销。
