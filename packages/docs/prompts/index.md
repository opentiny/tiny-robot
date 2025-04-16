---
outline: deep
---

# Prompts

<script setup lang="ts">
import Demo from './demo.vue'
import DemoDisabled from './demo-disabled.vue'
import DemoVertical from './demo-vertical.vue'
import DemoWrap from './demo-wrap.vue'
import DemoBadge from './demo-badge.vue'
import DemoResponsive from './demo-responsive.vue'
</script>

## 代码示例

### 基本

基本用法

<Demo />

### 不可用状态

要将 Prompt 标记为禁用，请向 Prompt 添加 `disabled` 属性

<DemoDisabled />

### 徽章

使用 `badge` 属性，给 Prompt 项右上角添加徽章

<DemoBadge />

### 纵向展示

使用 `vertical` 属性，控制 Prompts 展示方向。

<DemoVertical />

### 自动换行

使用 `wrap` 属性，控制 Prompts 超出区域长度时是否可以换行

<DemoWrap />

### 响应式布局

配合 `wrap` 与 `item-style` 或者 `item-class` 实现响应式布局

<DemoResponsive />
