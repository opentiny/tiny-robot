<script setup lang="ts">
import { computed } from 'vue'
import { useBubbleContentRenderer } from '../composables'
import { BubbleChatMessageItem, BubbleRendererMessage } from '../index.type'
import Tool from './Tool.vue'

const props = defineProps<BubbleRendererMessage<string | BubbleChatMessageItem>>()

const restProps = computed(() => {
  const { tool_calls: _, ...rest } = props
  return rest
})

const renderer = useBubbleContentRenderer(restProps)
</script>

<template>
  <component :is="renderer" v-bind="restProps" />
  <Tool v-for="tool in props.tool_calls" :key="tool.id" v-bind="props" :extras="{ tool_call: tool }" />
</template>
