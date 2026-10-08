---
outline: [1, 3]
---

# Container 迁移指南

从 v0.5.1 升级到 v1.0 时，`Container` 自 v1.0 起弃用，未来会移除。新布局请使用 [`Layout`](/components/layout)（`TrLayout`）。旧组件在兼容期仍可使用，API 见 [Container](/components/container)。

## 先选择布局形态

`Container` 把显示、全屏和内容区域放在一个组件中。`Layout` 提供更完整的页面骨架：`normal` 模式参与文档流，适合完整聊天页；`floating` 模式提供可定位、拖拽和缩放的浮层，适合悬浮工作区。它还有左右侧栏及抽屉、五个区域插槽和可选的代理滚动条。迁移时应先根据页面用途选择布局模式，再接入内容，而不是把旧属性逐个改名。

| `Container` | `Layout` 或应用层 | 迁移说明 |
| --- | --- | --- |
| `v-model:show` | 应用控制 `v-if`，或由页面路由决定是否渲染 | `Layout` 不管理宿主的显示状态。完整页面通常由路由进入；悬浮面板可由应用控制开关。 |
| `v-model:fullscreen` | 根据用途选择 `mode="normal"` 或 `mode="floating"`；必要时由应用控制宿主样式 | 两种布局模式不等同于旧全屏开关。全屏页面优先使用 `normal`，不要假设 `Layout` 有全屏状态。 |
| `title`、`title` 插槽、`operations` 插槽 | `header` 插槽 | 在头部自行组合标题和操作按钮。 |
| 默认插槽 | `main` 插槽 | 主内容放入 `main`，需要时再加入侧栏与代理滚动条。 |
| `footer` 插槽 | `footer` 插槽 | 底部内容移入同名区域。 |
| `close` 事件 | 应用的关闭按钮和状态处理 | `Layout` 不发出旧组件的 `close` 事件；关闭悬浮面板时由应用更新显示状态并按需处理焦点返回。 |
| `--tr-container-*` CSS 变量、`.fullscreen` 选择器 | `Layout` 的区域样式和 CSS 变量 | 旧选择器与变量不会自动作用于新组件。请按新 DOM 结构调整样式，参见 [Layout CSS 变量](/components/layout#css-变量)。 |

## 从旧容器切换到页面布局

原有代码通过 `Container` 的显示和全屏状态控制一个聊天容器：

```vue
<TrContainer v-model:show="show" v-model:fullscreen="fullscreen" title="助手" @close="show = false">
  <ChatContent />
  <template #operations><ChatActions /></template>
  <template #footer><ChatInput /></template>
</TrContainer>
```

如果目标是完整聊天页，直接使用 `Layout` 的页面骨架，并按需要加入侧栏：

```vue
<script setup lang="ts">
import { TrLayout } from '@opentiny/tiny-robot'
import ChatContent from './ChatContent.vue'
import ChatActions from './ChatActions.vue'
import ChatInput from './ChatInput.vue'
</script>

<template>
  <TrLayout mode="normal">
    <template #header>
      <h1>助手</h1>
      <ChatActions />
    </template>
    <template #main><ChatContent /></template>
    <template #footer><ChatInput /></template>
  </TrLayout>
</template>
```

如果原容器用于悬浮窗口，使用 `floating` 模式。应用继续负责打开、关闭和外层焦点管理；`Layout` 负责浮层的位置与尺寸行为：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import ChatContent from './ChatContent.vue'
import ChatInput from './ChatInput.vue'

const open = ref(false)
</script>

<template>
  <button type="button" @click="open = true">打开助手</button>
  <TrLayout
    v-if="open"
    mode="floating"
    :default-floating-state="{ placement: 'bottom-right', offsetX: 24, offsetY: 24, width: 440, height: 600 }"
    :floating-options="{ draggable: true, resizable: true }"
  >
    <template #header>
      <span>助手</span>
      <button type="button" @click="open = false">关闭</button>
    </template>
    <template #main><ChatContent /></template>
    <template #footer><ChatInput /></template>
  </TrLayout>
</template>
```

更多布局能力和可运行示例见 [Layout 文档](/components/layout)：侧栏与抽屉、受控浮层状态以及代理滚动条可按页面需求逐步接入。
