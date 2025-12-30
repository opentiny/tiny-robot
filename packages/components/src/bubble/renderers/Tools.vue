<script setup lang="ts">
import { useBubbleContentRenderer, useOmitMessageFields } from '../composables'
import { BubbleContentRendererProps } from '../index.type'
import Tool from './Tool.vue'

const props = defineProps<BubbleContentRendererProps>()

const { restMessage, restProps } = useOmitMessageFields(props, ['tool_calls'])

const renderer = useBubbleContentRenderer(restMessage, props.contentIndex)
</script>

<template>
  <component :is="renderer" v-bind="restProps" />
  <Tool v-for="(tool, index) in props.message.tool_calls" :key="tool.id" v-bind="props" :tool-index="index" />
</template>
