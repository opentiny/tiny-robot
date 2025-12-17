<script setup lang="ts">
import { setupBubbleStateChangeFn, useBubbleContentRenderer } from './composables'
import type { BubbleContent } from './index.type'

const props = defineProps<{
  message: BubbleContent
  contentIndex?: number
}>()

const renderer = useBubbleContentRenderer(() => props.message, props.contentIndex)

const emit = defineEmits<{
  (e: 'update:state', payload: { key: string; value: unknown }): void
}>()

const handleStateChange = (key: string, value: unknown) => {
  emit('update:state', { key, value })
}

setupBubbleStateChangeFn(handleStateChange)
</script>

<template>
  <component :is="renderer" v-bind="props"></component>
</template>
