<script setup lang="ts">
import { computed } from 'vue'
import { useBubbleContentRenderer, useOmitMessageFields } from '../composables'
import { BubbleContentRendererProps } from '../index.type'
import Tool from './Tool.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<BubbleContentRendererProps>()

const { restMessage, restProps } = useOmitMessageFields(props, ['tool_calls'])
const toolCalls = computed(
  () =>
    props.message.tool_calls?.flatMap((toolCall, index) =>
      toolCall.function.name === 'ask_user' ? [] : [{ toolCall, index }],
    ) ?? [],
)

const renderer = useBubbleContentRenderer(restMessage, props.contentIndex)
</script>

<template>
  <component :is="renderer.renderer" v-bind="{ ...renderer.attributes, ...restProps }" />
  <div v-if="toolCalls.length" class="tr-bubble__tools" v-bind="$attrs">
    <Tool v-for="{ toolCall, index } in toolCalls" :key="toolCall.id" v-bind="props" :tool-call-index="index" />
  </div>
</template>
