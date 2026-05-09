---
outline: [1, 3]
---

# SVG 图标

`@opentiny/tiny-robot-svgs` 是 TinyRobot 的独立图标包。包内图标由 SVG 资源统一生成 Vue 组件，既可以单独安装使用，也可以和 `@opentiny/tiny-robot` 组合使用。

## 安装

::: code-group

```bash [pnpm]
pnpm add @opentiny/tiny-robot-svgs
```

```bash [yarn]
yarn add @opentiny/tiny-robot-svgs
```

```bash [npm]
npm install @opentiny/tiny-robot-svgs
```

:::

## 基本用法

图标包中的每一个导出都是 Vue 组件，可以像普通组件一样直接渲染，也可以作为 props 或 VNode 传递给其他 TinyRobot 组件。

<demo vue="../../demos/icons/BasicUsage.vue" />

常见用法有 3 种：

1. 直接在模板中渲染：`<IconAi />`
2. 作为组件 props 传递：`<TrIconButton :icon="IconNewSession" />`
3. 在需要 VNode 的场景中，使用 `h(IconCheck, { style: { fontSize: '16px' } })`

### 直接引入与渲染

```vue
<script setup lang="ts">
import { IconAi, IconSparkles } from '@opentiny/tiny-robot-svgs'
</script>

<template>
  <IconAi :style="{ fontSize: '28px' }" />
  <IconSparkles :style="{ fontSize: '20px', color: '#1476ff' }" />
</template>
```

### 作为组件 props 传递

```vue
<script setup lang="ts">
import { TrIconButton } from '@opentiny/tiny-robot'
import { IconNewSession } from '@opentiny/tiny-robot-svgs'
</script>

<template>
  <TrIconButton size="32" svg-size="18" :icon="IconNewSession" />
</template>
```

### 作为 VNode 传递

```ts
import { h } from 'vue'
import { IconCheck } from '@opentiny/tiny-robot-svgs'

const item = {
  id: '1',
  title: '已选中会话',
  icon: h(IconCheck, { style: { fontSize: '16px' } }),
}
```

## 样式与命名

- 所有公开图标均以 `Icon` 作为前缀，例如 `IconSend`、`IconHistory`、`IconPlugin`。
- 图标尺寸建议通过 `fontSize`、`width` 或 `height` 控制。
- 图标颜色可优先通过 `color` 或 `fill` 调整，具体效果取决于 SVG 本身的配色方式。
- 本页下面的图标集合基于 `@opentiny/tiny-robot-svgs` 的公共导出生成。
- 插画型和场景态图标会在独立分组中展示，并使用单独的预览尺寸，避免影响常用图标浏览体验。

## 图标集合

图标集合按常用场景分类展示，支持按图标名、分类名和关键词筛选；点击图标卡片可以快速复制图标名称。

<demo vue="../../demos/icons/IconGallery.vue" />
