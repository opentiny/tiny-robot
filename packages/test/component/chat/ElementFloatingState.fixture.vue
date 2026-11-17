<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useChatRuntime } from '../../../chat/src'
import { defineTrChatElements, type TrChatHTMLElement, type TrChatUIHTMLElement } from '../../../chat/src/experimental'
import type { LayoutFloatingState } from '../../../chat/src/types'

const props = defineProps<{ tag: 'tr-chat' | 'tr-chat-ui'; floatingState: LayoutFloatingState }>()
const container = ref<HTMLElement | null>(null)
const runtime = useChatRuntime({
  conversation: {
    autoSaveMessages: false,
    useMessageOptions: {
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
  if (props.tag === 'tr-chat') (element as TrChatHTMLElement).runtime = runtime
  element.ui = {
    layout: { surface: { mode: 'floating' }, leftAside: false, rightAside: false },
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
  () => props.floatingState,
  (state) => {
    if (element) element.floatingState = state
  },
)
onBeforeUnmount(() => element?.remove())
</script>

<template><div ref="container" /></template>
