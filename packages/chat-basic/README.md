# TinyRobot Chat Basic

`chat-basic` is the integration demo for `@opentiny/tiny-robot-chat`. It covers conversations, streaming responses, cancellation, Markdown rendering, responsive history, themes, model capabilities, and MCP Server/Tool management.

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

| Server                     | Transport       | Authentication    |
| -------------------------- | --------------- | ----------------- |
| 高德地图                   | Streamable HTTP | Optional API Key |
| Model Context Protocol MCP | Streamable HTTP | None              |

Tools are discovered dynamically with `client.listTools()`. Tool choices are stored in the next user message's `runConfig` metadata snapshot, so changing a Tool affects subsequent turns without modifying a request already in progress.

Server installation, enabling, Tool loading, retry, de-duplication, and Tool calls are handled by the default adapter in `@opentiny/tiny-robot-chat`. If a Server cannot load its Tools, it remains installed but is automatically disabled. Other enabled Servers and normal chat remain available.

## Model connection modes

- API Key only: connects directly to the official Qwen or DeepSeek endpoint.
- `apiUrl` + API Key: connects to a custom service with frontend authentication.
- `apiUrl` only: connects to a backend proxy without frontend authentication.

The Chat package does not prompt for or validate missing API Keys. The upstream service or backend proxy decides whether authentication is required.

MCP follows the same three modes: the official endpoint with an optional API Key, a custom `baseUrl` with optional headers, or a proxy `baseUrl` without headers.

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
pnpm -F chat-basic dev
```

## Build

```bash
pnpm -F chat-basic build
```
