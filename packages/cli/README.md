# @opentiny/tiny-robot-cli

A lightweight CLI for scaffolding TinyRobot-based product projects.

## Usage

```bash
npx @opentiny/tiny-robot-cli create my-app
pnpm dlx @opentiny/tiny-robot-cli create my-app
```

## Options

- `-t, --template <name>`: template name, currently supports `basic`
- `-h, --help`: show help

## Output

The `basic` template includes:

- Vue 3 + Vite + TypeScript
- TinyRobot and TinyRobot Kit dependencies
- AI chat page with `TrBubbleList`, `TrSender`, model switch, thinking/search toggles
- Conversation management via `useConversation` (create/switch/delete/history)
- SSE streaming `responseProvider` for chat completion APIs
- Assistant markdown rendering support
- Built-in MCP server picker UI (`McpServerPicker`) for add/toggle/delete
- MCP transport support for both `sse` and `streamableHttp`
- Tool calling pipeline through `toolPlugin` + MCP `listTools` / `callTool`
- Theme toggle and responsive layout for desktop/mobile

## Environment Variables

The generated `basic` project uses:

- `VITE_ALIYUN_DASHSCOPE_KEY` (model API + some MCP servers)
- `VITE_DEEPSEEK_API_KEY` (DeepSeek model API)
