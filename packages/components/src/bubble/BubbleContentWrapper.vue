<script setup lang="ts">
import { setupBubbleStateChangeFn, useBubbleContentRenderer } from './composables'
import type { BubbleContentRendererProps } from './index.type'

const props = defineProps<BubbleContentRendererProps>()

const renderer = useBubbleContentRenderer(() => props.message, props.contentIndex)

const emit = defineEmits<{
  (e: 'update:state', payload: { key: string; value: unknown; contentIndex?: number }): void
}>()

const handleStateChange = (key: string, value: unknown) => {
  emit('update:state', {
    key,
    value,
    contentIndex: props.contentIndex,
  })
}

setupBubbleStateChangeFn(handleStateChange)
</script>

<template>
  <component :is="renderer" v-bind="props"></component>
</template>
