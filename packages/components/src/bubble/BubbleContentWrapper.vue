<script setup lang="ts">
import { useBubbleContentRenderer, setupBubbleContentMessage } from './composables'
import type { BubbleRendererMessage } from './index.type'

// Accept a single message as props
const props = defineProps<{
  message: BubbleRendererMessage
}>()

/**
 * 向子孙 renderer 组件 provide 当前 message 对象
 * 允许子孙组件直接访问和修改 message 数据，实现状态同步（如切换展开/折叠状态），
 * 而无需显式的 prop drilling 或 event emission
 */
setupBubbleContentMessage(props.message)

const renderer = useBubbleContentRenderer(() => props.message)
</script>

<template>
  <component :is="renderer" v-bind="props.message"></component>
</template>
