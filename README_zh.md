# TinyRobot

<p align="center">
  <a href="https://opentiny.design" target="_blank" rel="noopener noreferrer">
    <img alt="OpenTiny Logo" src="logo.svg" height="100" style="max-width:100%;">
  </a>
</p>

[![npm version](https://img.shields.io/npm/v/@opentiny/tiny-robot.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**TinyRobot** 是一个基于 Vue 3 构建的 AI 组件库，遵循 OpenTiny Design 设计体系。它提供了丰富的 AI 交互组件，帮助开发者快速构建企业级 AI 应用。

## ✨ 特性

- 🤖 **丰富的 AI 组件**：包含聊天气泡、消息输入、会话管理等完整的 AI 交互组件
- 🎨 **OpenTiny Design**：遵循 OpenTiny Design 设计体系，提供一致的 UI/UX
- 🚀 **开箱即用**：几分钟内即可开始使用，配置简单
- 🎯 **TypeScript 支持**：完整的 TypeScript 支持，提供完整的类型定义
- 🌈 **主题定制**：灵活的主题系统，支持多种主题和自定义样式
- 📦 **Tree Shaking**：针对 Tree Shaking 优化，按需导入
- 🔄 **流式支持**：内置流式 AI 响应支持
- 💾 **存储策略**：灵活的存储策略（LocalStorage、IndexedDB、自定义）

[English](README.md) | 简体中文

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/opentiny/tiny-robot)

## 📦 包说明

TinyRobot 是一个 monorepo，包含以下包：

| 包                                              | 说明                                   | 版本                                                                                                                          |
| ----------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [`@opentiny/tiny-robot`](./packages/components) | 核心组件库，包含所有 AI 交互组件       | [![npm](https://img.shields.io/npm/v/@opentiny/tiny-robot.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot)           |
| [`@opentiny/tiny-robot-kit`](./packages/kit)    | 工具函数和 AI 客户端工具，用于模型交互 | [![npm](https://img.shields.io/npm/v/@opentiny/tiny-robot-kit.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-kit)   |
| [`@opentiny/tiny-robot-svgs`](./packages/svgs)  | SVG 图标库，包含所有组件所需的图标     | [![npm](https://img.shields.io/npm/v/@opentiny/tiny-robot-svgs.svg)](https://www.npmjs.com/package/@opentiny/tiny-robot-svgs) |

## 🚀 快速开始

### 环境要求

- Node.js >= 20.13.0
- Vue >= 3.2.0
- 包管理器：npm、yarn 或 pnpm

### 安装

**核心包** — `@opentiny/tiny-robot` 是主包。

```bash
# 使用 pnpm（推荐）
pnpm add @opentiny/tiny-robot

# 使用 npm
npm install @opentiny/tiny-robot

# 使用 yarn
yarn add @opentiny/tiny-robot
```

**可选包**：

- `@opentiny/tiny-robot-kit` — 仅在需要 AI 模型请求或数据处理功能时使用。需要时添加：

  ```bash
  pnpm add @opentiny/tiny-robot-kit
  ```

- `@opentiny/tiny-robot-svgs` — 可选。仅在需要单独使用 SVG 图标库或自定义图标时单独安装：

  ```bash
  pnpm add @opentiny/tiny-robot-svgs
  ```

### 基本用法

#### 1. 引入样式

在 `main.js` 或 `main.ts` 中：

```ts
import { createApp } from 'vue'
import App from './App.vue'
import '@opentiny/tiny-robot/dist/style.css'

const app = createApp(App)
app.mount('#app')
```

#### 2. 使用组件

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

## 📚 文档

- 📖 [完整文档](https://docs.opentiny.design/tiny-robot/) - 完整的 API 参考和指南
- 🎯 [快速开始指南](https://docs.opentiny.design/tiny-robot/guide/quick-start) - 几分钟内快速上手
- 🎨 [主题配置](https://docs.opentiny.design/tiny-robot/guide/theme-config) - 自定义主题
- 📝 [更新日志](https://docs.opentiny.design/tiny-robot/guide/update-log) - 版本历史
- 💡 [示例](https://docs.opentiny.design/tiny-robot/examples/assistant) - 完整的应用示例

## 🏗️ 项目结构

```text
tiny-robot/
├── packages/
│   ├── components/          # 核心组件库
│   │   ├── src/
│   │   │   ├── bubble/      # 聊天气泡组件
│   │   │   ├── sender/      # 消息输入组件
│   │   │   ├── container/   # 容器组件
│   │   │   ├── history/     # 会话历史
│   │   │   ├── attachments/ # 文件附件
│   │   │   └── ...          # 其他组件
│   │   └── package.json
│   ├── kit/                 # 工具函数和 AI 工具
│   │   ├── src/
│   │   │   ├── providers/   # AI 提供商实现
│   │   │   ├── vue/         # Vue 组合式函数
│   │   │   │   ├── message/ # useMessage 组合式函数
│   │   │   │   └── conversation/ # useConversation 组合式函数
│   │   │   └── storage/     # 存储工具
│   │   └── package.json
│   ├── svgs/                # SVG 图标库
│   ├── playground/          # 开发演练场
│   └── test/                # 测试套件
├── docs/                    # 文档站点
│   ├── src/                 # 文档源码
│   └── demos/               # 组件示例
├── scripts/                 # 构建和工具脚本
└── package.json
```

## 🛠️ 开发

### 环境设置

```bash
# 安装依赖
pnpm install

# 启动开发服务器（演练场 + 文档）
pnpm dev
```

### 开发流程

1. **启动开发服务器**：
   - 在项目根目录运行 `pnpm dev`
   - 这将同时启动演练场和文档站点
   - 修改 `packages/components/src/` 中的组件后，更改会自动反映在文档页面中

2. **文档**：
   - 文档源码：`docs/src/`
   - 组件示例：`docs/demos/`

3. **测试**：
   - 运行 `pnpm test` 执行测试

## 📄 许可证

MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 🤝 贡献

欢迎贡献！请阅读[贡献指南](./CONTRIBUTING_zh.md)了解推荐的工作流程、Commit 规范以及如何提交 Issue 和 Pull Request。

## 📞 支持

- 📖 [文档](https://docs.opentiny.design/tiny-robot/)
- 🐛 [问题追踪](https://github.com/opentiny/tiny-robot/issues)
- 💬 [讨论](https://github.com/opentiny/tiny-robot/discussions)

## 🙏 致谢

由 OpenTiny 团队用 ❤️ 构建。

---

**注意**：本项目是 [OpenTiny](https://github.com/opentiny) 生态系统的一部分。
