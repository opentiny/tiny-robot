<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useAttrs } from 'vue'
import type {
  BubbleBoxRendererContext,
  BubbleBoxRendererProps,
  BubbleMessage,
  ChatMessageContentItem,
} from '@opentiny/tiny-robot'
import type { ChatRenderer } from '../../renderers/domRenderer'
import type { ChatBubbleBoxRendererContext as ChatBubbleBoxRendererContextValue } from '../../types'
import { ChatRendererOutlet } from '../renderers/ChatRendererOutlet'

defineOptions({ inheritAttrs: false })

const props = defineProps<
  BubbleBoxRendererProps & {
    messages: BubbleMessage[]
    content?: ChatMessageContentItem
    contentIndex?: number
    boxContext: BubbleBoxRendererContext
    domRenderer: ChatRenderer<ChatBubbleBoxRendererContextValue>
    onRendererError?: (error: unknown) => void
  }
>()
const attrs = useAttrs()
const contentRoot = document.createElement('div')
contentRoot.style.display = 'contents'
contentRoot.dataset.trChatBubbleContentRoot = ''
const contentReady = ref(false)

const context = computed<ChatBubbleBoxRendererContextValue>(() => ({
  messages: props.messages,
  content: props.content,
  contentIndex: props.contentIndex,
  placement: props.placement,
  shape: props.shape,
  contentRenderMode: props.boxContext.contentRenderMode,
  resolvedMessageContent: props.boxContext.resolvedMessageContent,
  contentRoot,
}))

const renderer = computed<ChatRenderer<ChatBubbleBoxRendererContextValue>>(() => {
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

onMounted(async () => {
  await nextTick()
  contentReady.value = true
})
</script>

<template>
  <ChatRendererOutlet :renderer="renderer" :context="context" :on-error="props.onRendererError" />
  <Teleport v-if="contentReady" :to="contentRoot"><slot /></Teleport>
</template>
