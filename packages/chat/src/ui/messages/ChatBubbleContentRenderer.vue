<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useMessageContent, type BubbleContentRendererProps } from '@opentiny/tiny-robot'
import type { ChatRenderer } from '../../renderers/domRenderer'
import type { ChatBubbleContentRendererContext } from '../../types'
import { ChatRendererOutlet } from '../renderers/ChatRendererOutlet'

defineOptions({ inheritAttrs: false })

const props = defineProps<
  BubbleContentRendererProps & {
    domRenderer: ChatRenderer<ChatBubbleContentRendererContext>
    onRendererError?: (error: unknown) => void
  }
>()
const attrs = useAttrs()
const { content } = useMessageContent(props)
const context = computed<ChatBubbleContentRendererContext>(() => ({
  message: props.message,
  content: content.value,
  contentIndex: props.contentIndex,
}))

const renderer = computed<ChatRenderer<ChatBubbleContentRendererContext>>(() => {
  const domRenderer = props.domRenderer

  return (context, lifecycle) => {
    const result = domRenderer(context, lifecycle)
    const nodes =
      result === null ? [] : typeof result === 'string' ? [] : result instanceof Node ? [result] : [...result]

    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue
      for (const [name, value] of Object.entries(attrs)) {
        if (value === undefined || value === null || typeof value === 'function') continue
        node.setAttribute(name, String(value))
      }
    }

    return result
  }
})
</script>

<template>
  <ChatRendererOutlet :renderer="renderer" :context="context" :on-error="props.onRendererError" />
</template>
