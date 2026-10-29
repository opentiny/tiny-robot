# tiny-robot-svgs

`@opentiny/tiny-robot-svgs` 是 TinyRobot 使用的 SVG 图标库。  
它将每一个图标都封装为独立的 Vue 3 组件，方便在 TinyRobot 内外复用同一套图标资源。

更完整的使用说明和图标集合可以查看文档站的 [SVG 图标](https://docs.opentiny.design/tiny-robot/icons/) 页面。

## 安装

```bash
pnpm add @opentiny/tiny-robot-svgs
# 或
npm install @opentiny/tiny-robot-svgs
yarn add @opentiny/tiny-robot-svgs
```

## 基本用法

```vue
<script setup lang="ts">
import { IconXxx } from '@opentiny/tiny-robot-svgs'
</script>

<template>
  <IconXxx class="icon-xxx-style" />
</template>
```

将 `IconXxx` 替换为你实际需要的图标组件名称（例如 `IconSend`、`IconStop` 等）。

## 适用场景

- 你在使用 **TinyRobot 组件库**，希望在应用其他部分复用同一套图标。
- 你需要一个 **独立的 SVG 图标集合** 来服务任意 Vue 3 项目，而不希望引入完整的 TinyRobot 组件库。
