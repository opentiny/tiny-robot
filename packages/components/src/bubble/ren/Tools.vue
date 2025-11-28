<script setup lang="ts">
import { computed } from 'vue'
import { BubbleRendererMessage } from '../index.type'
import { getContentRenderer } from './renderers'
import Tool from './Tool.vue'

const props = defineProps<BubbleRendererMessage>()

const renderer = computed(() => {
  const { tool_calls: _, ...restProps } = props
  return getContentRenderer(restProps)
})
</script>

<template>
  <component :is="renderer" v-bind="props" />
  <Tool v-for="tool in props.tool_calls" :key="tool.id" v-bind="props" :extras="{ tool_call: tool }" />
</template>
