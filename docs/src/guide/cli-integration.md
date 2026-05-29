---
outline: [1, 3]
---

# CLI 接入

TinyRobot 当前提供两种 CLI 快速接入方式：

1. 基于 `basic` 模板创建一个完整工程。
2. 在已有 Vue 项目中注入 `TrChat` 所需依赖和基础配置。

## 什么时候用哪一种

| 场景 | 推荐方式 |
| --- | --- |
| 从 0 开始搭一个 TinyRobot 示例或产品原型 | `create` + `basic` |
| 已经有 Vue 项目，只想补一个可用的聊天能力 | `add chat` |

## 方式一：创建完整工程

这种方式适合新项目。

### 命令

```bash
npx @opentiny/tiny-robot-cli create my-app --template basic
```

### 你会得到什么

- 一个可直接运行的完整 Vue 工程
- 已接好的基础模型配置结构
- 完整的聊天页面和示例交互
- `README`、环境变量示例、启动命令

### 使用步骤

```bash
cd my-app
pnpm install
pnpm dev
```

### 特点

- 上手最快
- 适合先看完整效果
- 适合基于模板继续做业务改造

## 方式二：注入到已有项目

这种方式适合已有 Vue 项目。

### 命令

在你的项目根目录执行：

```bash
npx @opentiny/tiny-robot-cli add chat
```

### CLI 会做什么

- 给当前项目补充 `@opentiny/tiny-robot`、`dompurify`、`markdown-it`
- 生成 `src/tiny-robot/chat.ts`
- 输出后续接入提示

### 注入后的文件

默认会生成一个基础配置文件：

```ts
import type { ChatMcpServerConfig, ChatModelOption } from '@opentiny/tiny-robot/experimental'

export const chatModelOptions: ChatModelOption[] = [
  {
    id: 'deepseek-chat',
    provider: 'deepseek',
    name: 'DeepSeek Chat',
    model: 'deepseek-chat',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  },
]

export const chatMcpServers: Record<string, ChatMcpServerConfig> = {}
```

### 业务侧接入

然后在业务组件中直接引入 `TrChat`：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TrThemeProvider } from '@opentiny/tiny-robot'
import { TrChat } from '@opentiny/tiny-robot/experimental'
import { chatModelOptions, chatMcpServers } from './tiny-robot/chat'

const show = ref(false)
const fullscreen = ref(false)
</script>

<template>
  <TrThemeProvider>
    <TrChat
      v-model:show="show"
      v-model:fullscreen="fullscreen"
      title="AI 助手"
      system-prompt="You are a helpful assistant."
      :model-options="chatModelOptions"
      :mcp-servers="chatMcpServers"
    />
  </TrThemeProvider>
</template>
```

当前 `TrChat` 内部包含主题切换按钮，业务侧接入时需要用 `TrThemeProvider` 包裹，才能提供主题上下文。

同时在入口文件引入样式：

```ts
import '@opentiny/tiny-robot/dist/style.css'
```

### 特点

- 不需要新建工程
- 更适合增量接入
- 业务项目可以继续保留原有目录结构

## 推荐理解

- `basic`：完整脚手架
- `add chat`：能力注入

前者解决“我要一个能跑的工程”，后者解决“我已有工程，只想快速接一个聊天组件”。
