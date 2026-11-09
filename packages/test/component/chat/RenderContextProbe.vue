<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { useMessageContent, type BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { useChatRenderContext } from '../../../chat/src/composables/useChatRenderContext'

const props = defineProps<BubbleContentRendererProps>()
const context = useChatRenderContext(props)!
const { contentText } = useMessageContent(props)
const height = computed(() =>
  props.message.role === 'assistant' ? `${Math.max(200, contentText.value.length)}px` : undefined,
)
const instance = getCurrentInstance()!.uid
</script>

<template>
  <div
    class="context-probe"
    :data-key="context.messageKey.value"
    :data-thread="context.conversationId.value"
    :data-index="context.contentIndex.value"
    :data-state="context.streamState.value"
    :data-root="context.scrollRoot.value?.classList.contains('chat-main-scroll-host')"
    :data-instance="instance"
    :style="{ minHeight: height }"
  >
    {{ contentText }}
  </div>
</template>
