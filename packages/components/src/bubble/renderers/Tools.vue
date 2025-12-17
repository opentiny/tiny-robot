<script setup lang="ts">
import { computed } from 'vue'
import { useBubbleContentRenderer } from '../composables'
import { BubbleContentRendererProps } from '../index.type'
import Tool from './Tool.vue'

const props = defineProps<BubbleContentRendererProps>()

const restMessage = computed(() => {
  const { tool_calls: _, ...rest } = props.message
  return rest
})

const renderer = useBubbleContentRenderer(restMessage, props.contentIndex)
</script>

<template>
  <component :is="renderer" :message="restMessage" :content-index="props.contentIndex" />
  <Tool v-for="(tool, index) in props.message.tool_calls" :key="tool.id" v-bind="props" :tool-index="index" />
</template>
