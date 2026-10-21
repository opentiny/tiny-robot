<p align="center">
  <a href="https://opentiny.design" target="_blank" rel="noopener noreferrer">
    <img alt="OpenTiny Logo" src="https://raw.githubusercontent.com/opentiny/tiny-robot/HEAD/logo.svg" height="88" style="max-width:100%;">
  </a>
</p>

<p align="center">
  <a href="https://github.com/opentiny/tiny-robot"><img src="https://img.shields.io/github/stars/opentiny/tiny-robot" alt="GitHub stars"></a>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/Vue-3.x-42b883.svg" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178c6.svg" alt="TypeScript">
</p>

**TinyRobot** is an AI component library and application development suite built with Vue 3 and following the OpenTiny Design system. It helps enterprises quickly build intelligent chat applications and business assistants.

<p align="center">
  <img src="https://raw.githubusercontent.com/opentiny/tiny-robot/HEAD/robot-highlights.gif" alt="TinyRobot MCP tool calls and Skill extensions demo" width="1100">
</p>

## ✨ Core Capabilities

Core capabilities span the Chat suite, composable components, the data layer, and MCP extensions:

- **Chat suite**: Provides a complete chat interface with model service integration, messaging, streaming responses, and management of multiple conversations, plus theme customization and model switching.
- **Composable architecture**: Use Components and Kit to control the interface, runtime, message requests, and conversation data as needed.
- **Tools and MCP**: Supports tool call display, MCP server management, tool selection, and approval workflows.
- **Vue 3 + TypeScript**: Follows the OpenTiny Design system, with support for importing only what you need, theme customization, and typed APIs for extensions.

## 🧭 Capability Overview

<p align="center">
  <img src="https://raw.githubusercontent.com/opentiny/tiny-robot/HEAD/robot-panorama.png" alt="TinyRobot product capability overview" width="1100">
</p>

Combine TinyRobot's capabilities as needed, from project setup and chat interfaces to business extensions.

## 🚀 How to Use

TinyRobot offers three ways to get started: use the CLI, install the complete Chat suite, or combine Components and Kit as needed.

### Package Overview

TinyRobot separates project setup, chat pages, UI components, and the data layer into public packages that can be used independently:

| Package | Description | Version |
| --- | --- | --- |
| [`@opentiny/tiny-robot`](https://www.npmjs.com/package/@opentiny/tiny-robot) | AI chat component library with Bubble, Sender, History, Layout, and more | [![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot) |
| [`@opentiny/tiny-robot-chat`](https://www.npmjs.com/package/@opentiny/tiny-robot-chat) | Chat suite with a complete chat page, runtime, conversation management, and MCP support | [![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot-chat.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-chat) |
| [`@opentiny/tiny-robot-kit`](https://www.npmjs.com/package/@opentiny/tiny-robot-kit) | AI chat toolkit for message management, model service integration, multiple conversations, and data storage | [![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot-kit.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-kit) |
| [`@opentiny/tiny-robot-cli`](https://www.npmjs.com/package/@opentiny/tiny-robot-cli) | CLI for creating projects or adding Chat to an existing Vue project | [![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot-cli.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-cli) |
| [`@opentiny/tiny-robot-svgs`](https://www.npmjs.com/package/@opentiny/tiny-robot-svgs) | SVG icon library for TinyRobot components | [![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot-svgs.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-svgs) |

### 1. Get Started with the CLI

#### Create a New Project

Use the CLI to create a Vue project with Chat capabilities:

```bash
npx @opentiny/tiny-robot-cli create my-app --template basic
cd my-app
pnpm install
pnpm dev
```

#### Add Chat to an Existing Vue Project

```bash
npx @opentiny/tiny-robot-cli add chat
```

The CLI generates `src/tiny-robot-chat/TinyRobotChat.vue` and related configuration. It does not automatically modify `App.vue`, `src/main.*`, or `vite.config.*`, or mount the component. See the [CLI integration guide](https://docs.opentiny.design/tiny-robot/guide/cli-integration) for more options and integration details.

### 2. Use the Complete Chat Suite

For a complete Chat application, install:

```bash
pnpm add @opentiny/tiny-robot @opentiny/tiny-robot-chat
```

Create a chat page with `TrChat` and `useChatRuntime`:

```vue
<script setup lang="ts">
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { TrChat, useChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'openai',
    apiUrl: '/api/chat',
    models: [{ id: 'deepseek-flash', label: 'DeepSeek Flash' }],
  },
]

const runtime = useChatRuntime({ modelProviders })
</script>

<template>
  <tr-chat :runtime="runtime" />
</template>
```

Replace `apiUrl` with your model service URL or a backend endpoint that forwards requests to the model service. The endpoint must use a format compatible with OpenAI's chat API. If you already have your own request and data layers, use `TrChatUI` to integrate just the Chat interface.

### 3. Compose Your Own Chat Application

#### Components

`@opentiny/tiny-robot` provides the basic components for AI chat interfaces, which you can combine to build your own pages:

- Messages and input: `TrBubble`, `TrBubbleList`, `TrSender`, `TrSenderCompat`
- Page structure and extensions: `TrLayout`, `TrContainer`, `TrHistory`, `TrPrompts`, `TrAttachments`, `TrMcpServerPicker`

#### Kit

`@opentiny/tiny-robot-kit` provides message processing, model requests, and conversation management for AI chat applications. Use it with TinyRobot components or your own interface:

- `useMessage`: Manages message state and handles streaming responses.
- `useConversation`: Manages multiple conversations and their messages.
- Conversation storage: Supports LocalStorage, IndexedDB, and custom storage strategies.
- Custom requests: Connects to model services or business APIs through `responseProvider`.

## 📚 Documentation and Examples

- [Full Documentation](https://docs.opentiny.design/tiny-robot/)
- [Quick Start](https://docs.opentiny.design/tiny-robot/guide/quick-start)
- [CLI Integration](https://docs.opentiny.design/tiny-robot/guide/cli-integration)
- [Chat Suite](https://docs.opentiny.design/tiny-robot/suites/quick-start)
- [Chat Example](https://docs.opentiny.design/tiny-robot/examples/chat-tiny-robot)

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

## 📞 Support

- 📖 [Documentation](https://docs.opentiny.design/tiny-robot/)
- 🐛 [Issue Tracker](https://github.com/opentiny/tiny-robot/issues)
- 💬 [Discussions](https://github.com/opentiny/tiny-robot/discussions)

## 🙏 Acknowledgments

Built with ❤️ by the OpenTiny team.

---

**Note**: This project is part of the [OpenTiny](https://github.com/opentiny) ecosystem.
