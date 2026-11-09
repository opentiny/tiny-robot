# __PROJECT_NAME__

本项目由 TinyRobot Chat Basic 模板生成，包含对话、流式响应、取消请求、Markdown 渲染、响应式历史记录、主题、模型功能选项，以及 MCP 服务和工具管理。

## MCP 支持

示例通过 `mcpServers` 声明 MCP 服务：

```ts
const mcpServers = [
  { id: 'amap-maps', name: '高德地图', baseUrl: 'https://...' },
  {
    id: 'model-context-protocol-mcp',
    name: 'Model Context Protocol MCP',
    baseUrl: '/modelcontextprotocol-mcp',
    installed: true,
  },
]
```

`installed: true` 仅表示初始状态为已安装。服务仍处于禁用状态，启用后才会建立连接并发现工具。

| 服务                       | 传输方式        | 认证方式         |
| -------------------------- | --------------- | ---------------- |
| 高德地图                   | Streamable HTTP | 可选 API Key     |
| Model Context Protocol MCP | Streamable HTTP | 无需认证         |

工具通过 `client.listTools()` 动态发现。所选工具会保存到下一条用户消息的 `runConfig` 元数据快照中，因此修改工具选择仅影响后续对话，不会改变正在进行的请求。

服务安装、启用、工具加载、重试、去重和工具调用均由 `@opentiny/tiny-robot-chat` 的默认适配器处理。如果某个服务无法加载工具，它会保留已安装状态，但会被自动禁用。其他已启用的服务和普通对话仍可正常使用。

## 模型连接方式

- 仅配置 API Key：直接连接 Qwen 或 DeepSeek 的官方接口。
- 配置 `apiUrl` 和 API Key：连接自定义服务，由前端提供认证信息。
- 仅配置 `apiUrl`：连接后端代理，前端不提供认证信息。

Chat 包不会提示补充或校验缺失的 API Key，是否需要认证由上游服务或后端代理决定。

MCP 同样支持三种方式：官方接口搭配可选 API Key、自定义 `baseUrl` 搭配可选请求头，或使用不携带认证请求头的代理 `baseUrl`。

basic 模板已在 `vite.config.ts` 中配置 Model Context MCP 代理。通过 `add chat` 接入现有项目时，CLI 不会修改该项目的 Vite 配置，需要手动在 `server.proxy` 中添加相同的 `/modelcontextprotocol-mcp` 代理，并重启 Vite。

## 模型功能选项

Qwen 模型通过模型选择器中的选项提供思考强度和联网搜索设置，DeepSeek 模型通过相同方式提供思考强度设置。

在 `src/App.vue` 中为模型配置 `features`，并通过 `mapFeatureValues` 将所选值映射为请求参数。必须开启思考的模型不提供「关闭」选项。

## 环境变量

复制 `.env.example` 为 `.env.local`。接口地址变量留空时使用模型服务或 MCP 的默认官方地址；接入自定义服务或后端代理时，填写对应地址：

```env
VITE_QWEN_API_URL=
VITE_DEEPSEEK_API_URL=
VITE_AMAP_MCP_URL=
VITE_ALIYUN_DASHSCOPE_KEY=
VITE_DEEPSEEK_API_KEY=
```

使用代理时，可将地址配置为 `VITE_QWEN_API_URL=/api/chat/qwen`、`VITE_DEEPSEEK_API_URL=/api/chat/deepseek` 和 `VITE_AMAP_MCP_URL=/api/mcp/amap-maps`，并将 API Key 变量留空。

以 `VITE_` 为前缀的变量会暴露给浏览器代码。浏览器直连仅适用于无需保密凭证且已启用 CORS 的服务。生产应用应通过后端或 BFF 代理保管凭证。

## 本地开发

```bash
pnpm dev
```

## 构建

```bash
pnpm build
```
