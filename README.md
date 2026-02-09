# TinyRobot

<p align="center">
  <a href="https://opentiny.design" target="_blank" rel="noopener noreferrer">
    <img alt="OpenTiny Logo" src="logo.svg" height="100" style="max-width:100%;">
  </a>
</p>

[![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**TinyRobot** is an AI component library built for Vue 3, following the OpenTiny Design system. It provides rich AI interaction components to help developers quickly build enterprise-level AI applications.

## ✨ Features

- 🤖 **Rich AI Components**: Comprehensive set of AI interaction components including chat bubbles, message input, conversation management, and more
- 🎨 **OpenTiny Design**: Follows OpenTiny Design system for consistent UI/UX
- 🚀 **Out of the Box**: Get started in minutes with minimal configuration
- 🎯 **TypeScript Support**: Full TypeScript support with complete type definitions
- 🌈 **Theme Customization**: Flexible theme system supporting multiple themes and custom styles
- 📦 **Tree Shaking**: Optimized for tree shaking, import only what you need
- 🔄 **Streaming Support**: Built-in support for streaming AI responses
- 💾 **Storage Strategy**: Flexible storage strategies (LocalStorage, IndexedDB, custom)

English | [简体中文](README_zh.md)

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/opentiny/tiny-robot)

## 📦 Packages

TinyRobot is a monorepo containing the following packages:

| Package                                         | Description                                                  | Version                                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| [`@opentiny/tiny-robot`](./packages/components) | Core component library with all AI interaction components    | [![npm](https://img.shields.io/npm/v/@opentiny/tiny-robot.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot)           |
| [`@opentiny/tiny-robot-kit`](./packages/kit)    | Utility functions and AI client tools for model interactions | [![npm](https://img.shields.io/npm/v/@opentiny/tiny-robot-kit.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-kit)   |
| [`@opentiny/tiny-robot-svgs`](./packages/svgs)  | SVG icon library with all component icons                    | [![npm](https://img.shields.io/npm/v/@opentiny/tiny-robot-svgs.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-svgs) |

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.13.0
- Vue >= 3.2.0
- Package manager: npm, yarn, or pnpm

### Installation

**Core package** — `@opentiny/tiny-robot` is the main package.

```bash
# Using pnpm (recommended)
pnpm add @opentiny/tiny-robot

# Using npm
npm install @opentiny/tiny-robot

# Using yarn
yarn add @opentiny/tiny-robot
```

**Optional packages**:

- `@opentiny/tiny-robot-kit` — Only needed if you use AI model request or data-processing features. Add it when required:

  ```bash
  pnpm add @opentiny/tiny-robot-kit
  ```

- `@opentiny/tiny-robot-svgs` — Optional. Install separately only if you need to use the SVG icon library standalone or with custom icons:

  ```bash
  pnpm add @opentiny/tiny-robot-svgs
  ```

### Basic Usage

#### 1. Import Styles

In your `main.js` or `main.ts`:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import '@opentiny/tiny-robot/dist/style.css'

const app = createApp(App)
app.mount('#app')
```

#### 2. Use Components

```vue
<template>
  <div class="chat-container">
    <tr-bubble role="ai" content="Hello! I'm TinyRobot, an AI component library for Vue 3." placement="start" />
    <tr-bubble role="user" content="That's great! How can I get started?" placement="end" />
  </div>
</template>

<script setup>
import { TrBubble } from '@opentiny/tiny-robot'
</script>
```

## 📚 Documentation

- 📖 [Full Documentation](https://docs.opentiny.design/tiny-robot/) - Complete API reference and guides
- 🎯 [Quick Start Guide](https://docs.opentiny.design/tiny-robot/guide/quick-start) - Get started in minutes
- 🎨 [Theme Configuration](https://docs.opentiny.design/tiny-robot/guide/theme-config) - Customize themes
- 📝 [Update Log](https://docs.opentiny.design/tiny-robot/guide/update-log) - Version history
- 💡 [Examples](https://docs.opentiny.design/tiny-robot/examples/assistant) - Complete application examples

## 🏗️ Project Structure

```text
tiny-robot/
├── packages/
│   ├── components/          # Core component library
│   │   ├── src/
│   │   │   ├── bubble/      # Chat bubble components
│   │   │   ├── sender/      # Message input component
│   │   │   ├── container/   # Container component
│   │   │   ├── history/     # Conversation history
│   │   │   ├── attachments/ # File attachments
│   │   │   └── ...          # Other components
│   │   └── package.json
│   ├── kit/                 # Utility functions and AI tools
│   │   ├── src/
│   │   │   ├── providers/   # AI provider implementations
│   │   │   ├── vue/         # Vue composables
│   │   │   │   ├── message/ # useMessage composable
│   │   │   │   └── conversation/ # useConversation composable
│   │   │   └── storage/     # Storage utilities
│   │   └── package.json
│   ├── svgs/                # SVG icon library
│   ├── playground/          # Development playground
│   └── test/                # Test suite
├── docs/                    # Documentation site
│   ├── src/                 # Documentation source
│   └── demos/               # Component demos
├── scripts/                 # Build and utility scripts
└── package.json
```

## 🛠️ Development

### Setup

```bash
# Install dependencies
pnpm install

# Start development server (playground + docs)
pnpm dev
```

### Development Workflow

1. **Start Development Server**:
   - Run `pnpm dev` in the project root directory
   - This starts both the playground and documentation site
   - After modifying components in `packages/components/src/`, changes will be automatically reflected in the documentation page

2. **Documentation**:
   - Documentation source: `docs/src/`
   - Component demos: `docs/demos/`

3. **Testing**:
   - Run `pnpm test` to execute tests

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- 📖 [Documentation](https://docs.opentiny.design/tiny-robot/)
- 🐛 [Issue Tracker](https://github.com/opentiny/tiny-robot/issues)
- 💬 [Discussions](https://github.com/opentiny/tiny-robot/discussions)

## 🙏 Acknowledgments

Built with ❤️ by the OpenTiny team.

---

**Note**: This project is part of the [OpenTiny](https://github.com/opentiny) ecosystem.
