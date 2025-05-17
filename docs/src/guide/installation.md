
# TinyRobot

TinyRobot是符合OpenTiny Design 设计体系的 AI 组件库，提供了丰富的AI交互组件，助力开发者快速构建AI应用。

## 安装

在项目的根目录中，打开控制台，执行以下命令，为 Vue 3.0 的项目安装 TinyRobot 组件库：

```bash
yarn add @opentiny/tiny-robot @opentiny/tiny-robot-kit @opentiny/tiny-robot-svgs
# 或者
npm install @opentiny/tiny-robot @opentiny/tiny-robot-kit @opentiny/tiny-robot-svgs -S
```
## 引入与使用

### 按需引入(推荐)
先在main.js/main.ts中引入组件库样式：

```ts
import { createApp } from 'vue'
import App from './App.vue'
++ import '@opentiny/tiny-robot/dist/style.css'

const app = createApp(App)
app.mount('#app')
```

之后在Vue文件中，按需引入组件使用, 示例如下：
```vue
<template>
  <tr-bubble-item
    role="ai"
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
  ></tr-bubble-item>
</template>

<script setup>
import { TrBubbleItem } from '@opentiny/tiny-robot'
</script>
```

### 全局引入

全局引入组件库可以快速使用组件库中的所有组件，无需在每个Vue文件中单独引入组件。

先在main.js/main.ts中全量引入组件库：

```ts
import { createApp } from 'vue'
import App from './App.vue'
++ import TinyRobot from '@opentiny/tiny-robot' # 全量引入组件库
++ import '@opentiny/tiny-robot/dist/style.css'  # 引入样式

const app = createApp(App)
++ app.use(TinyRobot)

// 也可以全局按需引入单个组件，例如：
// import { TrBubbleItem, TrSender } from '@opentiny/tiny-robot'
// app.use(TrBubbleItem).use(TrSender)

app.mount('#app')
```

之后即可在Vue组件中直接使用（无需在scripts中引入组件）：
```vue
<template>
  <tr-bubble-item
    role="ai"
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
  ></tr-bubble-item>
</template>
```

更多示例参考组件或演示部分
