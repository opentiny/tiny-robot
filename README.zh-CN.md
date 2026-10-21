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

[English](https://github.com/opentiny/tiny-robot/blob/HEAD/README.md) | 简体中文

**TinyRobot** 是一个基于 Vue 3 构建、遵循 OpenTiny Design 设计体系的 AI 组件库与应用开发套件，助力企业快速搭建智能对话与业务助手应用。

<p align="center">
  <img src="https://raw.githubusercontent.com/opentiny/tiny-robot/HEAD/robot-highlights.gif" alt="TinyRobot MCP 工具调用与 Skill 技能扩展演示" width="1100">
</p>

## ✨ 核心能力

核心能力围绕 Chat 套件、可组合组件、数据层和 MCP 扩展展开：

- **Chat 套件**：提供完整聊天界面，集成模型服务接入、消息收发、流式响应和多会话管理，支持主题定制和模型切换。
- **可组合架构**：通过 Components 和 Kit 按需控制界面、Runtime、消息请求和会话数据。
- **工具与 MCP**：支持工具调用展示、MCP Server 管理、工具选择和审批流程。
- **Vue 3 + TypeScript**：遵循 OpenTiny Design 体系，支持按需使用、主题定制和类型安全扩展。

## 🧭 能力全景

<p align="center">
  <img src="https://raw.githubusercontent.com/opentiny/tiny-robot/HEAD/robot-panorama.png" alt="TinyRobot 产品能力全景图" width="1100">
</p>

从工程接入、对话构建到业务扩展，按需组合 TinyRobot 的各项能力。

## 🚀 如何使用

TinyRobot 提供三种接入方式：通过 CLI 快速开始，使用完整的 Chat 套件，或按需组合 Components 和 Kit。

### 包说明

TinyRobot 将工程入口、Chat 页面、UI 组件和数据层拆分为多个可独立使用的公开包：

| 包 | 说明 | 版本 |
| --- | --- | --- |
| [`@opentiny/tiny-robot`](https://www.npmjs.com/package/@opentiny/tiny-robot) | AI 对话组件库，提供 Bubble、Sender、History、Layout 等组件 | [![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot) |
| [`@opentiny/tiny-robot-chat`](https://www.npmjs.com/package/@opentiny/tiny-robot-chat) | Chat 套件，提供完整聊天页面、Runtime、会话和 MCP 能力 | [![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot-chat.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-chat) |
| [`@opentiny/tiny-robot-kit`](https://www.npmjs.com/package/@opentiny/tiny-robot-kit) | AI 对话工具包，支持消息管理、模型服务接入、多会话管理和数据存储 | [![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot-kit.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-kit) |
| [`@opentiny/tiny-robot-cli`](https://www.npmjs.com/package/@opentiny/tiny-robot-cli) | CLI 工具，用于创建项目或向已有 Vue 项目接入 Chat | [![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot-cli.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-cli) |
| [`@opentiny/tiny-robot-svgs`](https://www.npmjs.com/package/@opentiny/tiny-robot-svgs) | SVG 图标库，提供 TinyRobot 组件所需的图标 | [![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot-svgs.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-svgs) |

### 1. CLI 快速开始

#### 创建新项目

使用 CLI 创建一个包含 Chat 能力的 Vue 项目：

```bash
npx @opentiny/tiny-robot-cli create my-app --template basic
cd my-app
pnpm install
pnpm dev
```

#### 接入已有 Vue 项目

```bash
npx @opentiny/tiny-robot-cli add chat
```

CLI 会生成 `src/tiny-robot-chat/TinyRobotChat.vue` 和相关配置，不会自动修改 `App.vue`、`src/main.*` 或 `vite.config.*`，也不会自动挂载组件。更多选项和接入方式请查看 [CLI 接入文档](https://docs.opentiny.design/tiny-robot/guide/cli-integration)。

### 2. 使用完整 Chat 套件

如果需要完整的 Chat 应用，可以直接安装：

```bash
pnpm add @opentiny/tiny-robot @opentiny/tiny-robot-chat
```

使用 `TrChat` 和 `useChatRuntime` 创建聊天页面：

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

将 `apiUrl` 替换为实际的模型服务地址或项目后端的转发接口地址，接口需兼容 OpenAI 的聊天接口格式。如果已有请求层和数据层，可以使用 `TrChatUI`，只接入 Chat 界面。

### 3. 自定义组合

#### Components

`@opentiny/tiny-robot` 提供 AI 对话所需的基础组件，可以按需组合页面：

- 消息与输入：`TrBubble`、`TrBubbleList`、`TrSender`、`TrSenderCompat`
- 页面与扩展：`TrLayout`、`TrContainer`、`TrHistory`、`TrPrompts`、`TrAttachments`、`TrMcpServerPicker`

#### Kit

`@opentiny/tiny-robot-kit` 提供 AI 对话所需的消息处理、模型请求和会话管理能力，可搭配 TinyRobot 组件或自定义界面使用：

- `useMessage`：管理消息状态、处理流式响应；
- `useConversation`：管理多个会话及其消息；
- 会话存储：支持 LocalStorage、IndexedDB 和自定义存储策略；
- 自定义请求：通过 `responseProvider` 对接模型服务或业务 API。

## 📚 文档与示例

- [完整文档](https://docs.opentiny.design/tiny-robot/)
- [快速开始](https://docs.opentiny.design/tiny-robot/guide/quick-start)
- [CLI 接入](https://docs.opentiny.design/tiny-robot/guide/cli-integration)
- [Chat 套件](https://docs.opentiny.design/tiny-robot/suites/quick-start)
- [Chat 示例](https://docs.opentiny.design/tiny-robot/examples/chat-tiny-robot)

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建
pnpm build
```

## 📄 许可证

MIT 许可证 - 查看 [LICENSE](https://github.com/opentiny/tiny-robot/blob/HEAD/LICENSE) 文件了解详情。

## 🤝 贡献

欢迎贡献！请阅读[贡献指南](https://github.com/opentiny/tiny-robot/blob/HEAD/CONTRIBUTING_zh.md)了解推荐的工作流程、Commit 规范以及如何提交 Issue 和 Pull Request。

## 📞 支持

- 📖 [文档](https://docs.opentiny.design/tiny-robot/)
- 🐛 [问题追踪](https://github.com/opentiny/tiny-robot/issues)
- 💬 [讨论](https://github.com/opentiny/tiny-robot/discussions)

## 🙏 致谢

由 OpenTiny 团队用 ❤️ 构建。

---

**注意**：本项目是 [OpenTiny](https://github.com/opentiny) 生态系统的一部分。
