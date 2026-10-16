<p align="center">
  <a href="https://opentiny.design" target="_blank" rel="noopener noreferrer">
    <img alt="OpenTiny Logo" src="https://raw.githubusercontent.com/opentiny/tiny-robot/HEAD/logo.svg" height="100" style="max-width:100%;">
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@opentiny/tiny-robot" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/@opentiny/tiny-robot.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@opentiny/tiny-robot" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/dw/@opentiny/tiny-robot" alt="npm downloads"></a>
  <a href="https://github.com/opentiny/tiny-robot" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/github/stars/opentiny/tiny-robot" alt="GitHub stars"></a>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/Vue-3.x-42b883.svg" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178c6.svg" alt="TypeScript">
</p>

**TinyRobot** is a Vue 3 AI toolkit for streaming conversations, tool calls, MCP integrations, and extensible message rendering.

<p align="center">
  <img src="docs/public/readme/tiny-robot-showcase-placeholder.svg" alt="TinyRobot UI showcase placeholder" width="1100">
</p>

## 📦 Installation

### Start with the CLI

The CLI can create a TinyRobot project or add Chat to an existing Vue project:

```bash
npx @opentiny/tiny-robot-cli create my-app --template basic

# Or add Chat to an existing project
npx @opentiny/tiny-robot-cli add chat
```

<p align="center">
  <img src="docs/public/readme/tiny-robot-cli-demo-placeholder.svg" alt="TinyRobot CLI demo placeholder" width="920">
</p>

See the [CLI integration guide](https://docs.opentiny.design/tiny-robot/guide/cli-integration) for available options.

### Install the Chat package

For a complete chat application, install `@opentiny/tiny-robot-chat`.

```bash
# pnpm is recommended for this project
pnpm add @opentiny/tiny-robot @opentiny/tiny-robot-chat
```

## 💬 Usage

Build a complete chat page with `TrChat` and `useChatRuntime`:

```vue
<script setup lang="ts">
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { TrChat, useChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  { type: 'openai', apiUrl: '/api', models: [{ id: 'deepseek-flash', label: 'DeepSeek Flash' }] },
]

const runtime = useChatRuntime({ modelProviders })
</script>

<template>
  <tr-chat :runtime="runtime" />
</template>
```

Use `TrChatUI` when you already have your own data and request layer. See the [Chat UI documentation](https://docs.opentiny.design/tiny-robot/suites/chat) and [Chat Runtime documentation](https://docs.opentiny.design/tiny-robot/suites/chat-runtime) for configuration details.

## ✨ Highlights

- **CLI-first development experience**: Create a Chat project with one command or add it to an existing Vue project
- **Complete Chat UI**: Start with a ready-to-use chat page or compose the interface from primitives
- **Runtime/UI separation**: Use `TrChat`, or connect `TrChatUI` to your existing data layer
- **Tool and MCP workflows**: Support streaming responses, tool calls, approval, error handling, and MCP extensions
- **Vue 3 + OpenTiny**: TypeScript-first APIs, theme customization, and extensible data management

For production deployments, keep provider credentials in a server-side BFF instead of exposing them in the browser.

## 🔌 Models and Backends

TinyRobot separates the Chat UI, runtime, and data request layer so you can choose the integration that fits your backend:

- **OpenAI-compatible APIs**: Configure model services through `modelProviders`.
- **Custom providers**: Use a custom `responseProvider` or provider implementation to connect existing model services or business APIs.
- **Streaming responses**: Support SSE streaming and custom chunk processing.
- **Tools and MCP**: Support tool-calling workflows and MCP Server integration.
- **Conversation storage**: Support multi-conversation management with LocalStorage, IndexedDB, or custom storage strategies.

## 📊 Comparison

Feature comparison between TinyRobot and other AI chat component libraries (for reference; see each project's current documentation for definitive capabilities):

| Feature | TinyRobot | Ant Design X | Element Plus X | TDesign Chat |
|---------|-----------|--------------|----------------|--------------|
| **Framework** | Vue 3 | React | Vue 3 | Vue 3 |
| **Streaming rendering** | ✅ | ✅ | ✅ | ✅ |
| **Tool call display** | ✅ | ✅ | ❌ | ❌ |
| **MCP protocol** | ✅ | ❌ | ❌ | ❌ |
| **Agent UI components** | ✅ | ❌ | ❌ | ❌ |
| **AI provider composables** | ✅ | ✅ | ❌ | ❌ |
| **Conversation management** | ✅ | ✅ | ✅ | ✅ |
| **Theme customization** | ✅ | ✅ | ✅ | ✅ |
| **Tree shaking** | ✅ | ✅ | ✅ | ✅ |
| **TypeScript** | ✅ | ✅ | ✅ | ✅ |
| **Skills / Agent integration** | ✅ | ❌ | ❌ | ❌ |
| **License** | MIT | MIT | MIT | MIT |

## 📚 Documentation

- 📖 [Full Documentation](https://docs.opentiny.design/tiny-robot/)
- 🧰 [CLI Integration](https://docs.opentiny.design/tiny-robot/guide/cli-integration)
- 💬 [Chat UI](https://docs.opentiny.design/tiny-robot/suites/chat)
- ⚙️ [Chat Runtime](https://docs.opentiny.design/tiny-robot/suites/chat-runtime)
- 💡 [Examples](https://docs.opentiny.design/tiny-robot/examples/chat-tiny-robot)

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build
pnpm build
```

## 📄 License

MIT License - see [LICENSE](https://github.com/opentiny/tiny-robot/blob/HEAD/LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/opentiny/tiny-robot/blob/HEAD/CONTRIBUTING.md) to understand the recommended workflow, commit message conventions, and how to submit Issues and Pull Requests.

## 💬 Support

- 📖 [Documentation](https://docs.opentiny.design/tiny-robot/)
- 🐛 [Issue Tracker](https://github.com/opentiny/tiny-robot/issues)
- 💬 [Discussions](https://github.com/opentiny/tiny-robot/discussions)

Maintained by the [OpenTiny](https://github.com/opentiny) team.
