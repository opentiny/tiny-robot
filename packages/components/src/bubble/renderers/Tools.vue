<script setup lang="ts">
import { computed } from 'vue'
import {
  getAskUserContentFromToolCall,
  isAskUserContent,
  useBubbleContentRenderer,
  useMessageContent,
  useOmitMessageFields,
} from '../composables'
import AskUser from './AskUser.vue'
import { BubbleContentRendererProps } from '../index.type'
import Tool from './Tool.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<BubbleContentRendererProps>()

const { restMessage, restProps } = useOmitMessageFields(props, ['tool_calls'])
const { content } = useMessageContent(props)
const toolCalls = computed(
  () =>
    props.message.tool_calls?.flatMap((toolCall, index) =>
      toolCall.function.name === 'ask_user' && getAskUserContentFromToolCall(toolCall) ? [] : [{ toolCall, index }],
    ) ?? [],
)
const rendersSyntheticAskUser = computed(() => {
  if (!isAskUserContent(content.value)) {
    return false
  }

  const rawContent = props.message.content
  return !(Array.isArray(rawContent) && isAskUserContent(rawContent[props.contentIndex]))
})
const askUserContentOwnsAttributes = computed(() => isAskUserContent(content.value))
const renderer = useBubbleContentRenderer(restMessage, props.contentIndex)
</script>

<template>
  <component :is="renderer.renderer" v-bind="{ ...renderer.attributes, ...restProps }" />
  <AskUser v-if="rendersSyntheticAskUser" v-bind="{ ...$attrs, ...props }" />
  <div v-if="toolCalls.length" class="tr-bubble__tools" v-bind="askUserContentOwnsAttributes ? {} : $attrs">
    <Tool v-for="{ toolCall, index } in toolCalls" :key="toolCall.id" v-bind="props" :tool-call-index="index" />
  </div>
</template>
