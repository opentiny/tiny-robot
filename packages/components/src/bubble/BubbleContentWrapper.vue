<script setup lang="ts">
import { type Component } from 'vue'
import { setupBubbleContentMessage, setupBubbleContentRenderer, useBubbleContentRenderer } from './composables'
import type { BubbleRendererMessage } from './index.type'

// Accept a single message as props
const props = defineProps<{
  message: BubbleRendererMessage
  fallbackRenderer?: Component
}>()

/**
 * 向子孙 renderer 组件 provide 当前 message 对象
 * 允许子孙组件直接访问和修改 message 数据，实现状态同步（如切换展开/折叠状态），
 * 而无需显式的 prop drilling 或 event emission
 */
setupBubbleContentMessage(props.message)

// 更新子孙 renderer 组件的 fallback renderer
setupBubbleContentRenderer({ fallbackContentRenderer: () => props.fallbackRenderer })

// 由于 provide 不会在当前组件中生效，因此需要手动提供 fallback renderer
const renderer = useBubbleContentRenderer(
  () => props.message,
  () => props.fallbackRenderer,
)
</script>

<template>
  <component :is="renderer" v-bind="props.message"></component>
</template>
