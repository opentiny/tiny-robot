# TinyRobot Chat Basic

`chat-basic` is the integration demo for `@opentiny/tiny-robot-chat`. It covers conversations, streaming responses, cancellation, Markdown rendering, responsive history, themes, model capabilities, and MCP Server/Tool management.

## MCP support

The demo includes three MCP Servers:

| Server                     | Transport       | Authentication    |
| -------------------------- | --------------- | ----------------- |
| 12306 车票查询             | SSE             | DashScope API Key |
| 高德地图                   | SSE             | DashScope API Key |
| Model Context Protocol MCP | Streamable HTTP | None              |

Tools are discovered dynamically with `client.listTools()`. Tool choices are stored in the next user message's `runConfig` metadata snapshot, so changing a Tool affects subsequent turns without modifying a request already in progress.

MCP Server installation, enabling, Tool loading, retry, and de-duplication are handled by the MCP adapter. If a Server cannot load its Tools, it remains installed but is automatically disabled. Other enabled Servers and normal chat remain available.

## Environment variables

Copy `.env.example` to `.env.local` and configure the Provider keys you need:

```env
VITE_ALIYUN_DASHSCOPE_KEY=your_dashscope_api_key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
```

`VITE_ALIYUN_DASHSCOPE_KEY` is shared by DashScope models and the 12306/高德 MCP Servers. A missing Key is rejected before creating the MCP connection.

Variables prefixed with `VITE_` are exposed to browser code. The direct DashScope connection in this package is intended for local demonstration only. Production applications should keep credentials behind a backend or BFF proxy.

## Development

```bash
pnpm -F chat-basic dev
```

## Build

```bash
pnpm -F chat-basic build
```
