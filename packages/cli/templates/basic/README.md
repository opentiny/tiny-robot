# __PROJECT_NAME__

TinyRobot AI chat starter built with Vue 3 + Vite.

## Features

- Vue 3 + Vite + TypeScript project scaffold
- TinyRobot chat UI with `TrBubbleList`, `TrSender`, and markdown rendering
- Conversation management via `useConversation`
- Model switch with thinking/search capability toggles
- MCP server picker for add/toggle/delete server usage
- MCP transport support for both `sse` and `streamableHttp`
- Tool calling pipeline through `toolPlugin` + MCP `listTools` / `callTool`
- Theme toggle and responsive layout for desktop/mobile

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Fill your provider keys in `.env`:

```env
VITE_ALIYUN_DASHSCOPE_KEY=your_dashscope_key
VITE_DEEPSEEK_API_KEY=your_deepseek_key
```

`VITE_ALIYUN_DASHSCOPE_KEY` is also used by configured MCP servers that require DashScope authorization.

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
pnpm preview
```
