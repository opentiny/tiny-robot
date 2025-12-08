<script setup lang="ts">
import { useBubbleContentRenderer } from '../composables'
import { BubbleChatMessageItem, BubbleRendererMessage } from '../index.type'
import Tool from './Tool.vue'

const props = defineProps<BubbleRendererMessage<string | BubbleChatMessageItem>>()

const renderer = useBubbleContentRenderer(() => {
  const { tool_calls: _, ...restProps } = props
  return restProps
})
</script>

<template>
  <component :is="renderer" v-bind="props" />
  <Tool v-for="tool in props.tool_calls" :key="tool.id" v-bind="props" :extras="{ tool_call: tool }" />
</template>
