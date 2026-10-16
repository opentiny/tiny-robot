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

**TinyRobot** 是面向 Vue 3 的 AI 工具套件，支持流式对话、工具调用、MCP 集成和可扩展的消息渲染。

<p align="center">
  <img src="docs/public/readme/tiny-robot-showcase-placeholder.svg" alt="TinyRobot 界面展示占位图" width="1100">
</p>

## 📦 安装

### 使用 CLI

CLI 可以创建 TinyRobot 项目，也可以向已有 Vue 项目中接入 Chat：

```bash
npx @opentiny/tiny-robot-cli create my-app --template basic

# 或向已有项目中添加 Chat
npx @opentiny/tiny-robot-cli add chat
```

<p align="center">
  <img src="docs/public/readme/tiny-robot-cli-demo-placeholder.svg" alt="TinyRobot CLI 演示占位图" width="920">
</p>

详细选项请查看 [CLI 接入文档](https://docs.opentiny.design/tiny-robot/guide/cli-integration)。

### 安装 Chat 套件

如果需要完整的 Chat 应用，请安装 `@opentiny/tiny-robot-chat`。

```bash
# 项目推荐使用 pnpm
pnpm add @opentiny/tiny-robot @opentiny/tiny-robot-chat
```

## 💬 用法

使用 `TrChat` 和 `useChatRuntime` 快速搭建完整聊天页面：

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

已有自己的数据层和请求层时，可以使用 `TrChatUI`。更多配置请查看 [Chat UI 文档](https://docs.opentiny.design/tiny-robot/suites/chat) 和 [Chat Runtime 文档](https://docs.opentiny.design/tiny-robot/suites/chat-runtime)。

## ✨ 特色亮点

- **CLI 优先的开发体验**：一条命令创建 Chat 项目，也可以接入已有 Vue 项目
- **完整 Chat UI**：开箱即用的聊天页面，也支持按需组合界面组件
- **Runtime 与 UI 解耦**：使用 `TrChat`，或通过 `TrChatUI` 接入已有数据层
- **工具与 MCP 工作流**：支持流式响应、工具调用、审批、错误处理和 MCP 扩展
- **Vue 3 + OpenTiny**：TypeScript 优先，支持主题定制和可扩展的数据管理

生产环境请通过服务端 BFF 保存 Provider 密钥，不要将长期密钥暴露在浏览器中。

## 🔌 模型与后端接入

TinyRobot 将 Chat UI、Runtime 与数据请求层解耦，可以根据项目后端选择合适的接入方式：

- **OpenAI 兼容接口**：通过 `modelProviders` 配置模型服务。
- **自定义 Provider**：支持自定义 `responseProvider` 和 Provider 实现，接入已有模型服务或业务 API。
- **流式响应**：支持 SSE 流式响应及自定义 chunk 处理。
- **工具与 MCP**：支持工具调用流程和 MCP Server 集成。
- **会话存储**：支持多会话管理，以及 LocalStorage、IndexedDB 和自定义存储策略。

## 📊 竞品对比

TinyRobot 与其他 AI 对话组件库的功能对比（仅供选型参考，具体能力以各项目当前版本文档为准）：

| 特性 | TinyRobot | Ant Design X | Element Plus X | TDesign Chat |
|------|-----------|-------------|---------------|-------------|
| **框架** | Vue 3 | React | Vue 3 | Vue 3 |
| **流式渲染** | ✅ | ✅ | ✅ | ✅ |
| **工具调用展示** | ✅ | ✅ | ❌ | ❌ |
| **MCP 协议** | ✅ | ❌ | ❌ | ❌ |
| **Agent UI 组件** | ✅ | ❌ | ❌ | ❌ |
| **AI Provider 组合式函数** | ✅ | ✅ | ❌ | ❌ |
| **会话管理** | ✅ | ✅ | ✅ | ✅ |
| **主题定制** | ✅ | ✅ | ✅ | ✅ |
| **Tree Shaking** | ✅ | ✅ | ✅ | ✅ |
| **TypeScript** | ✅ | ✅ | ✅ | ✅ |
| **Skills / Agent 集成** | ✅ | ❌ | ❌ | ❌ |
| **开源协议** | MIT | MIT | MIT | MIT |

## 📚 文档

- 📖 [完整文档](https://docs.opentiny.design/tiny-robot/)
- 🧰 [CLI 接入](https://docs.opentiny.design/tiny-robot/guide/cli-integration)
- 💬 [Chat UI](https://docs.opentiny.design/tiny-robot/suites/chat)
- ⚙️ [Chat Runtime](https://docs.opentiny.design/tiny-robot/suites/chat-runtime)
- 💡 [示例](https://docs.opentiny.design/tiny-robot/examples/chat-tiny-robot)

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

## 💬 支持

- 📖 [文档](https://docs.opentiny.design/tiny-robot/)
- 🐛 [问题追踪](https://github.com/opentiny/tiny-robot/issues)
- 💬 [讨论](https://github.com/opentiny/tiny-robot/discussions)

由 [OpenTiny](https://github.com/opentiny) 团队维护。
