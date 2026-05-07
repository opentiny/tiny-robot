<script setup lang="ts">
import { useBubbleContentRenderer, useOmitMessageFields, type BubbleContentRendererProps } from '@opentiny/tiny-robot'
import ToolCall from './ToolCallRenderer.vue'

const props = defineProps<BubbleContentRendererProps>()

const { restMessage, restProps } = useOmitMessageFields(props, ['tool_calls'])

const renderer = useBubbleContentRenderer(restMessage, props.contentIndex)
</script>

<template>
  <component :is="renderer" v-bind="restProps" />
  <ToolCall
    v-for="(tool, index) in props.message.tool_calls"
    :key="tool.id"
    v-bind="props"
    :tool-call-index="index"
    data-type="tool-call"
  />
</template>
