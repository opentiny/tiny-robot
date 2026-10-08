<div align="center">

# 🤖 TinyRobot

**Vue 3 AI 对话组件库 — 几分钟构建企业级 AI 对话应用，而非几周。**

[![GitHub Stars](https://img.shields.io/github/stars/opentiny/tiny-robot?style=social)](https://github.com/opentiny/tiny-robot/stargazers)
[![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot)
[![npm downloads](https://img.shields.io/npm/dw/@opentiny/tiny-robot)](https://www.npmjs.com/package/@opentiny/tiny-robot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6.svg)](https://www.typescriptlang.org/)

[🚀 在线演示](https://docs.opentiny.design/tiny-robot/examples/assistant) · [📖 完整文档](https://docs.opentiny.design/tiny-robot/) · [💬 社区讨论](https://github.com/opentiny/tiny-robot/discussions) · [🐛 提交问题](https://github.com/opentiny/tiny-robot/issues)

[English](https://github.com/opentiny/tiny-robot/blob/HEAD/README.md) | 简体中文

</div>

---

## ❓ 为什么选择 TinyRobot？

从零构建 AI 对话产品，你需要处理**流式渲染**、**多轮会话状态管理**、**工具调用展示**、**Markdown/代码渲染**、**输入增强**……还没上线就已经耗费数周。

**TinyRobot 帮你解决这些问题。** 它为 Vue 3 提供了生产级 AI 交互组件，让你从想法到可运行的 AI 应用只需数小时。

```vue
<!-- 就这样。3 行代码实现一个 AI 对话界面。 -->
<tr-bubble role="ai" content="你好！有什么可以帮你的？" placement="start" />
<tr-bubble role="user" content="介绍一下 TinyRobot" placement="end" />
<tr-sender placeholder="输入你的消息..." />
```

## ✨ 特性

| | 特性 | 说明 |
|---|------|------|
| 🤖 | **丰富的 AI 组件** | Bubble、Sender、Container、Conversations、Prompts、Attachments、Welcome、Suggestion、MCP 等 |
| 🔄 | **流式支持** | 内置流式 AI 响应渲染，支持中断控制 |
| 🧠 | **Agent UI** | ThoughtChain、ToolCall 展示、MCP Server 集成 — 专为 AI Agent 应用设计 |
| 🎨 | **OpenTiny Design** | 遵循 OpenTiny Design 设计体系，一致的 UI/UX |
| 🚀 | **开箱即用** | 几分钟内即可开始使用，配置简单 |
| 🎯 | **TypeScript** | 完整的 TypeScript 支持，提供完整的类型定义 |
| 🌈 | **主题定制** | 灵活的主题系统，支持多种主题和自定义样式 |
| 📦 | **Tree Shaking** | 针对 Tree Shaking 优化，按需导入 |
| 💾 | **存储策略** | 灵活的存储策略（LocalStorage、IndexedDB、自定义） |
| 🔌 | **AI Provider** | 内置 OpenAI 兼容的 Provider，提供 `useMessage` / `useConversation` 组合式函数 |

## 📊 竞品对比

TinyRobot 与其他 AI 对话组件库的对比：

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

> 💡 **TinyRobot 是目前唯一内置 MCP 协议支持和 Agent UI 组件的 Vue 3 AI 组件库。**

## 🧩 组件一览

TinyRobot 提供了一套完整的 AI 交互组件：

| 组件 | 说明 |
|------|------|
| `TrBubble` | 对话气泡，支持流式文本、Markdown、代码块和工具调用渲染 |
| `TrSender` | 消息输入框，支持文件附件、语音输入和发送操作 |
| `TrContainer` | 对话布局容器，支持拖拽面板 |
| `TrConversations` | 多会话管理侧边栏 |
| `TrPrompts` | 预设提示词，快速输入 |
| `TrAttachments` | 文件附件预览和管理 |
| `TrWelcome` | 欢迎页，新会话的建议引导 |
| `TrSuggestionPills` | 快捷建议胶囊按钮 |
| `TrSuggestionPopover` | 弹出式建议 |
| `TrMcpServerPicker` | MCP 服务器选择和配置 |
| `TrMcpAddForm` | MCP 服务器添加/编辑表单 |
| `TrThemeProvider` | 主题配置提供者 |
| `TrHistory` | 会话历史展示 |
| `TrFeedback` | 消息反馈（点赞/点踩） |
| `TrActionGroup` | 消息操作按钮组 |

## 📦 包说明

TinyRobot 是一个 monorepo，包含以下包：

| 包 | 说明 | 版本 |
|---|------|------|
| [`@opentiny/tiny-robot`](https://www.npmjs.com/package/@opentiny/tiny-robot) | 核心组件库，包含所有 AI 交互组件 | [![npm](https://img.shields.io/npm/v/@opentiny/tiny-robot.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot) |
| [`@opentiny/tiny-robot-kit`](https://www.npmjs.com/package/@opentiny/tiny-robot-kit) | AI 客户端工具、Vue 组合式函数（`useMessage`、`useConversation`）和存储策略 | [![npm](https://img.shields.io/npm/v/@opentiny/tiny-robot-kit.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-kit) |
| [`@opentiny/tiny-robot-svgs`](https://www.npmjs.com/package/@opentiny/tiny-robot-svgs) | SVG 图标库，包含所有组件所需的图标 | [![npm](https://img.shields.io/npm/v/@opentiny/tiny-robot-svgs.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-svgs) |

## 🚀 快速开始

### 环境要求

- Node.js >= 20.13.0
- Vue >= 3.2.0
- 包管理器：pnpm（推荐）、npm 或 yarn

### 1. 安装

```bash
# 核心包（必需）
pnpm add @opentiny/tiny-robot

# Kit 包（可选 — 用于 AI 模型请求和组合式函数）
pnpm add @opentiny/tiny-robot-kit
```

### 2. 引入样式

在 `main.ts` 中：

```ts
import '@opentiny/tiny-robot/dist/style.css'
```

### 3. 使用组件

```vue
<template>
  <tr-container>
    <tr-bubble role="ai" content="你好！我是 TinyRobot。" placement="start" />
    <tr-bubble role="user" content="如何快速上手？" placement="end" />
    <tr-sender placeholder="输入你的消息..." />
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

### 4. 使用 AI 组合式函数（配合 Kit）

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

## 📚 文档

| 资源 | 链接 |
|------|------|
| 📖 完整文档 | [docs.opentiny.design/tiny-robot](https://docs.opentiny.design/tiny-robot/) |
| 🎯 快速开始指南 | [几分钟快速上手](https://docs.opentiny.design/tiny-robot/guide/quick-start) |
| 🎨 主题配置 | [自定义主题](https://docs.opentiny.design/tiny-robot/guide/theme-config) |
| 📝 更新日志 | [版本历史](https://docs.opentiny.design/tiny-robot/guide/update-log) |
| 💡 示例 | [完整应用示例](https://docs.opentiny.design/tiny-robot/examples/assistant) |
| 🤖 TinyRobot Skills | [AI 辅助开发](https://gitcode.csdn.net/69bb9b7f54b52172bc628048.html) |

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/opentiny/tiny-robot)

## 🏗️ 项目结构

```
tiny-robot/
├── packages/
│   ├── components/          # 核心组件库
│   │   └── src/
│   │       ├── bubble/      # 对话气泡组件
│   │       ├── sender/      # 消息输入组件
│   │       ├── container/   # 容器组件
│   │       ├── conversations/ # 多会话管理
│   │       ├── prompts/     # 预设提示词
│   │       ├── attachments/ # 文件附件
│   │       ├── welcome/     # 欢迎页
│   │       ├── mcp-*/       # MCP 服务器组件
│   │       └── ...          # 其他组件
│   ├── kit/                 # AI 工具和 Vue 组合式函数
│   │   └── src/
│   │       ├── providers/   # AI Provider（OpenAI 兼容）
│   │       ├── vue/         # useMessage、useConversation
│   │       └── storage/     # LocalStorage、IndexedDB、自定义
│   ├── svgs/                # SVG 图标库
│   ├── playground/          # 交互式演练场
│   └── test/                # 测试套件
├── docs/                    # 文档站点（VitePress）
└── scripts/                 # 构建和工具脚本
```

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（演练场 + 文档）
pnpm dev

# 运行测试
pnpm test

# 构建所有包
pnpm build
```

## 🤝 贡献

我们欢迎各种形式的贡献！无论是修复 Bug、新增组件还是改进文档：

1. 阅读[贡献指南](https://github.com/opentiny/tiny-robot/blob/HEAD/CONTRIBUTING_zh.md)
2. 选择一个 [Good First Issue](https://github.com/opentiny/tiny-robot/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)
3. Fork → Branch → PR

[![Contributors](https://img.shields.io/github/contributors/opentiny/tiny-robot)](https://github.com/opentiny/tiny-robot/graphs/contributors)

## 🌟 生态

TinyRobot 是 [OpenTiny](https://github.com/opentiny) 生态的一部分：

- [TinyVue](https://github.com/opentiny/vue) — 企业级 Vue 3 组件库
- [TinyEngine](https://github.com/opentiny/tiny-engine) — 低代码引擎，快速构建应用
- [TinyRobot](https://github.com/opentiny/tiny-robot) — AI 对话组件库 *（你在这里）*
- [OpenTiny NEXT](https://opentiny.design) — 下一代 AI 驱动开发平台

## 📄 许可证

[MIT](https://github.com/opentiny/tiny-robot/blob/HEAD/LICENSE) — 个人和商业使用均免费。

---

<div align="center">

**如果 TinyRobot 帮助你构建了更好的 AI 应用，请给我们一个 ⭐！**

[![Star History Chart](https://api.star-history.com/svg?repos=opentiny/tiny-robot&type=Date)](https://star-history.com/#opentiny/tiny-robot&Date)

</div>
