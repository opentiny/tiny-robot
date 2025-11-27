<script setup lang="ts">
import { provide } from 'vue'
import { BUBBLE_CONTENT_MESSAGE_KEY } from './constants'
import type { BubbleRendererMessage } from './index.type'
import { getContentRenderer } from './ren/renderers'

// Accept a single message as props
const props = defineProps<{
  message: BubbleRendererMessage
}>()

/**
 * 向子孙 renderer 组件 provide 当前 message 对象
 * 允许子孙组件直接访问和修改 message 数据，实现状态同步（如切换展开/折叠状态），
 * 而无需显式的 prop drilling 或 event emission
 */
provide(BUBBLE_CONTENT_MESSAGE_KEY, props.message)
</script>

<template>
  <component :is="getContentRenderer(props.message)" v-bind="props.message"></component>
</template>
