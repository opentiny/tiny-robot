<script setup lang="ts">
import { useBubbleContentRenderer, useOmitMessageFields } from '../composables'
import { BubbleContentRendererProps } from '../index.type'
import Tool from './Tool.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<BubbleContentRendererProps>()

const { restMessage, restProps } = useOmitMessageFields(props, ['tool_calls'])

const renderer = useBubbleContentRenderer(restMessage, props.contentIndex)
</script>

<template>
  <component :is="renderer.renderer" v-bind="{ ...renderer.attributes, ...restProps }" />
  <div class="tr-bubble__tools" v-bind="$attrs">
    <Tool v-for="(tool, index) in props.message.tool_calls" :key="tool.id" v-bind="props" :tool-call-index="index" />
  </div>
</template>
