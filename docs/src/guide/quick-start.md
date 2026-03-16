---
outline: deep
---

# 快速开始

TinyRobot 是符合 OpenTiny Design 设计体系的 AI 组件库，提供了丰富的 AI 交互组件，助力开发者快速构建企业级 AI 应用。

## 环境要求

在开始使用 TinyRobot 之前，请确保你的开发环境满足以下要求：

- Node.js 版本 >= 20.13.0
- Vue 版本 >= 3.2.0
- 包管理器：npm、yarn 或 pnpm

## 安装

### 依赖说明

TinyRobot 由以下几个核心包组成：

- `@opentiny/tiny-robot`：核心组件库，包含所有 AI 交互组件
- `@opentiny/tiny-robot-kit`：工具函数库，提供常用的辅助方法和工具
- `@opentiny/tiny-robot-svgs`：图标库，包含组件所需的 SVG 图标资源

### 安装命令

在项目的根目录中，打开控制台，执行以下命令安装 TinyRobot 组件库：

::: code-group

```bash [pnpm]
pnpm add @opentiny/tiny-robot @opentiny/tiny-robot-kit @opentiny/tiny-robot-svgs
```

```bash [yarn]
yarn add @opentiny/tiny-robot @opentiny/tiny-robot-kit @opentiny/tiny-robot-svgs
```

```bash [npm]
npm install @opentiny/tiny-robot @opentiny/tiny-robot-kit @opentiny/tiny-robot-svgs
```

:::

## 引入与使用

TinyRobot 支持两种引入方式：按需引入和全局引入。推荐使用按需引入方式，可以有效减小打包体积。

### 按需引入（推荐）

按需引入可以只打包使用到的组件，有效减小项目体积，提升加载性能。

#### 步骤 1：引入样式

在 `main.js` 或 `main.ts` 中引入组件库样式：

```ts
import { createApp } from 'vue'
import App from './App.vue'
import '@opentiny/tiny-robot/dist/style.css' // [!code ++]

const app = createApp(App)
app.mount('#app')
```

#### 步骤 2：按需引入组件

在 Vue 文件中，按需引入所需的组件：

```vue
<template>
  <div class="chat-container">
    <tr-bubble
      role="ai"
      content="TinyRobot 是一个专为 AI 应用设计的 Vue 3 组件库，提供了丰富的对话、输入、展示等交互组件。"
    />
    <tr-bubble
      role="user"
      content="听起来很不错，我想了解更多！"
    />
  </div>
</template>

<script setup>
import { TrBubble } from '@opentiny/tiny-robot'
</script>

<style scoped>
.chat-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
```

### 全局引入

全局引入适合快速原型开发或小型项目，可以在任何组件中直接使用所有组件，无需单独引入。

#### 步骤 1：全局注册组件库

在 `main.js` 或 `main.ts` 中全局引入并注册组件库：

```ts
import { createApp } from 'vue'
import App from './App.vue'
import TinyRobot from '@opentiny/tiny-robot' // 全量引入组件库 [!code ++]
import '@opentiny/tiny-robot/dist/style.css'  // 引入样式 [!code ++]

const app = createApp(App)
app.use(TinyRobot)  // 注册所有组件 [!code ++]

app.mount('#app')
```

#### 步骤 2：直接使用组件

全局注册后，可以在任何 Vue 组件中直接使用，无需在 `<script>` 中引入：

```vue
<template>
  <div class="chat-app">
    <tr-bubble
      role="ai"
      content="全局引入后，所有组件都可以直接使用，无需单独引入。"
    />  
  </div>
</template>

<!-- 无需在 script 中引入组件 -->
```

## 注意事项

1. **样式引入**：无论使用哪种引入方式，都必须在 `main.js/main.ts` 中引入样式文件 `@opentiny/tiny-robot/dist/style.css`

2. **按需引入优势**：
   - 减小打包体积，只打包使用到的组件
   - 提升应用加载速度
   - 更好的 Tree Shaking 支持

3. **全局引入注意**：
   - 会打包所有组件，增加打包体积
   - 适合快速原型开发或组件使用较多的场景

4. **TypeScript 支持**：TinyRobot 完全支持 TypeScript，提供了完整的类型定义

5. **组件命名**：所有组件都以 `Tr` 前缀开头（TinyRobot 的缩写），例如 `TrBubble`、`TrSender` 等

## 下一步

现在你已经成功安装并引入了 TinyRobot，可以：

- 查看[**主题配置**](/guide/theme-config)了解如何自定义主题样式
- 浏览[**更新日志**](/guide/update-log)查看最新版本变更
- 探索[**组件文档**](/components/container)了解所有可用组件
- 查看[**综合示例**](/examples/assistant)获取完整的应用演示

如果遇到问题，欢迎在 [GitHub Issues](https://github.com/opentiny/tiny-robot/issues) 中反馈。
