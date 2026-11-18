<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useChatRuntime } from '../../../chat/src'
import { defineTrChatElements, type TrChatHTMLElement, type TrChatUIHTMLElement } from '../../../chat/src/experimental'
import type { LayoutFloatingState } from '../../../chat/src/types'

const props = defineProps<{
  tag: 'tr-chat' | 'tr-chat-ui'
  floatingState: LayoutFloatingState
  mode?: 'normal' | 'floating'
  withHistory?: boolean
}>()
const container = ref<HTMLElement | null>(null)
const initialMessages = props.withHistory
  ? Array.from({ length: 60 }, (_, index) => ({
      role: (index % 2 ? 'assistant' : 'user') as 'assistant' | 'user',
      content: `历史消息 ${index}：${'这是一条历史消息。'.repeat(20)}`,
    }))
  : []
const runtime = useChatRuntime({
  conversation: {
    autoSaveMessages: false,
    useMessageOptions: {
      initialMessages,
      responseProvider: async () => ({
        id: 'floating-local',
        object: 'chat.completion',
        created: 1,
        model: 'local',
        system_fingerprint: null,
        choices: [],
      }),
    },
  },
})
let element: TrChatHTMLElement | TrChatUIHTMLElement | undefined

onMounted(() => {
  defineTrChatElements()
  element = document.createElement(props.tag) as TrChatHTMLElement | TrChatUIHTMLElement
  element.style.cssText = 'display:block;height:600px;width:700px;--tr-layout-height:100%'
  if (props.tag === 'tr-chat') {
    if (props.withHistory) {
      runtime.actions.createConversation({ title: '历史记录' })
    }
    ;(element as TrChatHTMLElement).runtime = runtime
  } else
    (element as TrChatUIHTMLElement).data = {
      conversation: { activeId: 'history' },
      bubble: { messages: initialMessages },
    }
  element.ui = {
    layout: { surface: { mode: props.mode ?? 'floating' }, leftAside: false, rightAside: false },
    header: false,
    welcome: false,
    prompts: false,
    model: false,
    mcp: false,
    sender: false,
  }
  element.floatingState = props.floatingState
  container.value!.append(element)
})

watch(
  () => props.mode,
  (mode) => {
    if (element)
      element.ui = { ...element.ui, layout: { ...element.ui?.layout, surface: { mode: mode ?? 'floating' } } }
  },
)
watch(
  () => props.floatingState,
  (state) => {
    if (element) element.floatingState = state
  },
)
onBeforeUnmount(() => element?.remove())
</script>

<template><div ref="container" style="height: 600px" /></template>
