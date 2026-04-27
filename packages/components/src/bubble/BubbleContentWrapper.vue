<script setup lang="ts">
import { computed } from 'vue'
import { setupBubbleStateChangeFn, useBubbleContentRenderer } from './composables'
import type { BubbleContentRendererProps } from './index.type'

const props = defineProps<BubbleContentRendererProps>()

const renderer = useBubbleContentRenderer(() => props.message, props.contentIndex)
const componentProps = computed(() => ({
  ...renderer.value.attributes,
  message: props.message,
  contentIndex: props.contentIndex,
}))

const emit = defineEmits<{
  (e: 'state-change', payload: { key: string; value: unknown; contentIndex: number }): void
}>()

const handleStateChange = (key: string, value: unknown) => {
  emit('state-change', {
    key,
    value,
    contentIndex: props.contentIndex,
  })
}

setupBubbleStateChangeFn(handleStateChange)
</script>

<template>
  <component :is="renderer.renderer" v-bind="componentProps"></component>
</template>
