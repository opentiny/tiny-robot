<div align="center">

# 🤖 TinyRobot

**The Vue 3 AI Chat Component Library — Build enterprise-grade AI conversations in minutes, not weeks.**

[![GitHub Stars](https://img.shields.io/github/stars/opentiny/tiny-robot?style=social)](https://github.com/opentiny/tiny-robot/stargazers)
[![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot)
[![npm downloads](https://img.shields.io/npm/dw/@opentiny/tiny-robot)](https://www.npmjs.com/package/@opentiny/tiny-robot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6.svg)](https://www.typescriptlang.org/)

[🚀 Live Demo](https://docs.opentiny.design/tiny-robot/examples/assistant) · [📖 Documentation](https://docs.opentiny.design/tiny-robot/) · [💬 Discussions](https://github.com/opentiny/tiny-robot/discussions) · [🐛 Report Bug](https://github.com/opentiny/tiny-robot/issues)

English | [简体中文](https://github.com/opentiny/tiny-robot/blob/HEAD/README.zh-CN.md)

</div>

---

## ❓ Why TinyRobot?

Building AI chat products from scratch means wrestling with **streaming rendering**, **multi-turn state management**, **tool call display**, **Markdown/code rendering**, and **input enhancements** — all before you even ship.

**TinyRobot solves this.** It gives you production-ready AI interaction components for Vue 3, so you can go from idea to working AI app in hours, not weeks.

```vue
<!-- That's it. A working AI chat in 3 lines. -->
<tr-bubble role="ai" content="Hello! How can I help you?" placement="start" />
<tr-bubble role="user" content="Tell me about TinyRobot" placement="end" />
<tr-sender placeholder="Type your message..." />
```

## ✨ Features

| | Feature | Description |
|---|---------|-------------|
| 🤖 | **Rich AI Components** | Bubble, Sender, Container, Conversations, Prompts, Attachments, Welcome, Suggestion, MCP, and more |
| 🔄 | **Streaming Support** | Built-in streaming AI response rendering with abort control |
| 🧠 | **Agent UI** | ThoughtChain, ToolCall display, MCP Server integration — for AI Agent apps |
| 🎨 | **OpenTiny Design** | Consistent UI/UX following the OpenTiny Design system |
| 🚀 | **Out of the Box** | Get started in minutes with minimal configuration |
| 🎯 | **TypeScript** | Full TypeScript support with complete type definitions |
| 🌈 | **Theme Customization** | Flexible theme system supporting multiple themes and custom styles |
| 📦 | **Tree Shaking** | Optimized for tree shaking — import only what you need |
| 💾 | **Storage Strategy** | Flexible storage strategies (LocalStorage, IndexedDB, custom) |
| 🔌 | **AI Provider** | Built-in OpenAI-compatible provider with composable `useMessage` / `useConversation` |

## 📊 Comparison

How does TinyRobot compare to other AI chat component libraries?

| Feature | TinyRobot | Ant Design X | Element Plus X | TDesign Chat |
|---------|-----------|-------------|---------------|-------------|
| **Framework** | Vue 3 | React | Vue 3 | Vue 3 |
| **Streaming Render** | ✅ | ✅ | ✅ | ✅ |
| **Tool Call Display** | ✅ | ✅ | ❌ | ❌ |
| **MCP Protocol** | ✅ | ❌ | ❌ | ❌ |
| **Agent UI Components** | ✅ | ❌ | ❌ | ❌ |
| **AI Provider Composables** | ✅ | ✅ | ❌ | ❌ |
| **Conversation Management** | ✅ | ✅ | ✅ | ✅ |
| **Theme Customization** | ✅ | ✅ | ✅ | ✅ |
| **Tree Shaking** | ✅ | ✅ | ✅ | ✅ |
| **TypeScript** | ✅ | ✅ | ✅ | ✅ |
| **Skills / Agent Integration** | ✅ | ❌ | ❌ | ❌ |
| **License** | MIT | MIT | MIT | MIT |

> 💡 **TinyRobot is the only Vue 3 AI component library with built-in MCP protocol support and Agent UI components.**

## 🧩 Components

TinyRobot provides a comprehensive set of AI interaction components:

| Component | Description |
|-----------|-------------|
| `TrBubble` | Chat bubble with streaming text, Markdown, code block, and tool call rendering |
| `TrSender` | Message input with file attachment, voice input, and send actions |
| `TrContainer` | Chat layout container with drag-and-drop panel support |
| `TrConversations` | Multi-conversation management sidebar |
| `TrPrompts` | Preset prompt suggestions for quick input |
| `TrAttachments` | File attachment preview and management |
| `TrWelcome` | Welcome screen with suggestions for new conversations |
| `TrSuggestionPills` | Quick suggestion pills for common actions |
| `TrSuggestionPopover` | Popover-style suggestions |
| `TrMcpServerPicker` | MCP server selection and configuration |
| `TrMcpAddForm` | MCP server add/edit form |
| `TrThemeProvider` | Theme configuration provider |
| `TrHistory` | Conversation history display |
| `TrFeedback` | Message feedback (thumbs up/down) |
| `TrActionGroup` | Action button group for messages |

## 📦 Packages

TinyRobot is a monorepo containing the following packages:

| Package | Description | Version |
|---------|-------------|---------|
| [`@opentiny/tiny-robot`](https://www.npmjs.com/package/@opentiny/tiny-robot) | Core component library with all AI interaction components | [![npm](https://img.shields.io/npm/v/@opentiny/tiny-robot.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot) |
| [`@opentiny/tiny-robot-kit`](https://www.npmjs.com/package/@opentiny/tiny-robot-kit) | AI client tools, Vue composables (`useMessage`, `useConversation`), and storage strategies | [![npm](https://img.shields.io/npm/v/@opentiny/tiny-robot-kit.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-kit) |
| [`@opentiny/tiny-robot-svgs`](https://www.npmjs.com/package/@opentiny/tiny-robot-svgs) | SVG icon library for all components | [![npm](https://img.shields.io/npm/v/@opentiny/tiny-robot-svgs.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-svgs) |

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.13.0
- Vue >= 3.2.0
- Package manager: pnpm (recommended), npm, or yarn

### 1. Install

```bash
# Core package (required)
pnpm add @opentiny/tiny-robot

# Kit package (optional — for AI model requests and composables)
pnpm add @opentiny/tiny-robot-kit
```

### 2. Import Styles

In your `main.ts`:

```ts
import '@opentiny/tiny-robot/dist/style.css'
```

### 3. Use Components

```vue
<template>
  <tr-container>
    <tr-bubble role="ai" content="Hello! I'm TinyRobot." placement="start" />
    <tr-bubble role="user" content="How can I get started?" placement="end" />
    <tr-sender placeholder="Type your message..." />
  </tr-container>
</template>

<script setup>
import {
  TrContainer,
  TrBubble,
  TrSender
} from '@opentiny/tiny-robot'
</script>
```

### 4. Use AI Composables (with Kit)

```vue
<script setup>
import { useMessage } from '@opentiny/tiny-robot-kit'

const { messages, sendMessage, isLoading } = useMessage({
  provider: 'openai',
  model: 'gpt-4o-mini'
})
</script>

<template>
  <tr-container>
    <tr-bubble
      v-for="msg in messages"
      :key="msg.id"
      :role="msg.role"
      :content="msg.content"
      :placement="msg.role === 'user' ? 'end' : 'start'"
    />
    <tr-sender @send="sendMessage" :loading="isLoading" />
  </tr-container>
</template>
```

## 📚 Documentation

| Resource | Link |
|----------|------|
| 📖 Full Documentation | [docs.opentiny.design/tiny-robot](https://docs.opentiny.design/tiny-robot/) |
| 🎯 Quick Start Guide | [Get started in minutes](https://docs.opentiny.design/tiny-robot/guide/quick-start) |
| 🎨 Theme Configuration | [Customize themes](https://docs.opentiny.design/tiny-robot/guide/theme-config) |
| 📝 Update Log | [Version history](https://docs.opentiny.design/tiny-robot/guide/update-log) |
| 💡 Examples | [Complete app examples](https://docs.opentiny.design/tiny-robot/examples/assistant) |
| 🤖 TinyRobot Skills | [AI-assisted development](https://gitcode.csdn.net/69bb9b7f54b52172bc628048.html) |

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/opentiny/tiny-robot)

## 🏗️ Project Structure

```
tiny-robot/
├── packages/
│   ├── components/          # Core component library
│   │   └── src/
│   │       ├── bubble/      # Chat bubble components
│   │       ├── sender/      # Message input component
│   │       ├── container/   # Container component
│   │       ├── conversations/ # Multi-conversation management
│   │       ├── prompts/     # Preset prompts
│   │       ├── attachments/ # File attachments
│   │       ├── welcome/     # Welcome screen
│   │       ├── mcp-*/       # MCP server components
│   │       └── ...          # Other components
│   ├── kit/                 # AI tools and Vue composables
│   │   └── src/
│   │       ├── providers/   # AI provider (OpenAI-compatible)
│   │       ├── vue/         # useMessage, useConversation
│   │       └── storage/     # LocalStorage, IndexedDB, custom
│   ├── svgs/                # SVG icon library
│   ├── playground/          # Interactive playground
│   └── test/                # Test suite
├── docs/                    # Documentation site (VitePress)
└── scripts/                 # Build and utility scripts
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start development server (playground + docs)
pnpm dev

# Run tests
pnpm test

# Build all packages
pnpm build
```

## 🤝 Contributing

We love contributions! Whether it's a bug fix, new component, or documentation improvement:

1. Read the [Contributing Guide](https://github.com/opentiny/tiny-robot/blob/HEAD/CONTRIBUTING.md)
2. Pick a [Good First Issue](https://github.com/opentiny/tiny-robot/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)
3. Fork → Branch → PR

[![Contributors](https://img.shields.io/github/contributors/opentiny/tiny-robot)](https://github.com/opentiny/tiny-robot/graphs/contributors)

## 🌟 Ecosystem

TinyRobot is part of the [OpenTiny](https://github.com/opentiny) ecosystem:

- [TinyVue](https://github.com/opentiny/vue) — Enterprise-grade Vue 3 component library
- [TinyEngine](https://github.com/opentiny/tiny-engine) — Low-code engine for building apps
- [TinyRobot](https://github.com/opentiny/tiny-robot) — AI chat component library *(you are here)*
- [OpenTiny NEXT](https://opentiny.design) — Next-gen AI-powered development platform

## 📄 License

[MIT](https://github.com/opentiny/tiny-robot/blob/HEAD/LICENSE) — free for personal and commercial use.

---

<div align="center">

**If TinyRobot helps you build better AI apps, please consider giving us a ⭐!**

[![Star History Chart](https://api.star-history.com/svg?repos=opentiny/tiny-robot&type=Date)](https://star-history.com/#opentiny/tiny-robot&Date)

</div>
