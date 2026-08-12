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
| 高德地图                   | Streamable HTTP | DashScope API Key |
| Model Context Protocol MCP | Streamable HTTP | None              |

Tools are discovered dynamically with `client.listTools()`. Tool choices are stored in the next user message's `runConfig` metadata snapshot, so changing a Tool affects subsequent turns without modifying a request already in progress.

Server installation, enabling, Tool loading, retry, de-duplication, and Tool calls are handled by the default adapter in `@opentiny/tiny-robot-chat`. If a Server cannot load its Tools, it remains installed but is automatically disabled. Other enabled Servers and normal chat remain available.

## Environment variables

Copy `.env.example` to `.env.local` and configure the Provider keys you need:

```env
VITE_ALIYUN_DASHSCOPE_KEY=your_dashscope_api_key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
```

`VITE_ALIYUN_DASHSCOPE_KEY` is shared by DashScope models and the 高德 MCP Server. A missing Key is rejected before creating the MCP connection.

Variables prefixed with `VITE_` are exposed to browser code. Direct browser connections are intended only for servers without secrets and with CORS enabled. Production applications should keep credentials behind a backend or BFF proxy.

## Development

```bash
pnpm -F chat-basic dev
```

## Build

```bash
pnpm -F chat-basic build
```
