# **PROJECT_NAME**

This project is generated from the TinyRobot Chat Basic template. It covers conversations, streaming responses, cancellation, Markdown rendering, responsive history, themes, model capabilities, and MCP Server/Tool management.

## MCP support

The demo declares MCP Servers through `mcpServers`:

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

`installed: true` means initially installed only. The Server remains disabled and does not connect or discover Tools until enabled.

| Server                     | Transport       | Authentication   |
| -------------------------- | --------------- | ---------------- |
| 高德地图                   | Streamable HTTP | Optional API Key |
| Model Context Protocol MCP | Streamable HTTP | None             |

Tools are discovered dynamically with `client.listTools()`. Tool choices are stored in the next user message's `runConfig` metadata snapshot, so changing a Tool affects subsequent turns without modifying a request already in progress.

Server installation, enabling, Tool loading, retry, de-duplication, and Tool calls are handled by the default adapter in `@opentiny/tiny-robot-chat`. If a Server cannot load its Tools, it remains installed but is automatically disabled. Other enabled Servers and normal chat remain available.

## Model connection modes

- API Key only: connects directly to the official Qwen or DeepSeek endpoint.
- `apiUrl` + API Key: connects to a custom service with frontend authentication.
- `apiUrl` only: connects to a backend proxy without frontend authentication.

The Chat package does not prompt for or validate missing API Keys. The upstream service or backend proxy decides whether authentication is required.

MCP follows the same three modes: the official endpoint with an optional API Key, a custom `baseUrl` with optional headers, or a proxy `baseUrl` without headers.

The basic template already includes the Model Context MCP proxy in `vite.config.ts`. If you use `add chat` in an existing project, the CLI does not modify that project's Vite configuration; add the same `/modelcontextprotocol-mcp` proxy under `server.proxy` manually and restart Vite.

## Model capabilities

Qwen models support deep thinking and web search. DeepSeek models support deep thinking. Unsupported capabilities remain visible as disabled buttons so the available model capabilities are clear.

DeepSeek models inherit the provider's thinking effort options: `low`, `high`, and `max`, with `high` as the default. The effort selector appears only after `深度思考` is enabled. To customize a model, set `efforts` and `defaultEffort` on that model in `src/App.vue`; use `thinkingRequired: true` only for models that cannot disable thinking.

## Environment variables

Copy `.env.example` to `.env.local`. Leave endpoint variables blank for official Provider/MCP defaults, or set them for custom services and backend proxies:

```env
VITE_QWEN_API_URL=
VITE_DEEPSEEK_API_URL=
VITE_AMAP_MCP_URL=
VITE_ALIYUN_DASHSCOPE_KEY=
VITE_DEEPSEEK_API_KEY=
```

For a proxy setup, set for example `VITE_QWEN_API_URL=/api/chat/qwen`, `VITE_DEEPSEEK_API_URL=/api/chat/deepseek`, and `VITE_AMAP_MCP_URL=/api/mcp/amap-maps`, then leave the API Key variables blank.

Variables prefixed with `VITE_` are exposed to browser code. Direct browser connections are intended only for servers without secrets and with CORS enabled. Production applications should keep credentials behind a backend or BFF proxy.

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```
