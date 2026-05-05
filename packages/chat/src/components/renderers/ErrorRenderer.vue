<script setup lang="ts">
import { useBubbleContentRenderer, type BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { computed, inject } from 'vue'
import { getChatMessageError, getChatMessageState } from '@/runtime/engine/chatMessageState'
import { getRuntimeMessageId } from '@/runtime/core/messageIdentity'
import { CHAT_KIT_KEY, CHAT_RUNTIME_KEY } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'
import type { ChatRuntime } from '@/types'
import type { UseChatKitReturn } from '@/types/core'

const props = defineProps<
  BubbleContentRendererProps<
    string,
    {
      error?: {
        message?: string
        retryable?: boolean
      }
    }
  >
>()

const error = computed(() => getChatMessageError(props.message))
const chatKit = inject<UseChatKitReturn | null>(CHAT_KIT_KEY, null)
const chatRuntime = inject<ChatRuntime | null>(CHAT_RUNTIME_KEY, null)
const chatMessages = useResolvedChatMessages()
const messageId = computed(() => getRuntimeMessageId(props.message))
const canRetry = computed(() => {
  if (chatRuntime && messageId.value) {
    return Boolean(chatRuntime.message.getViewState(messageId.value)?.error?.retryable)
  }

  return Boolean(error.value?.retryable && chatKit?.lastError.value?.retryable)
})
const messageWithoutError = computed(() => {
  const messageState = getChatMessageState(props.message)

  return {
    ...props.message,
    state: {
      ...(messageState ?? {}),
      error: undefined,
    },
  }
})

const renderer = useBubbleContentRenderer(messageWithoutError, props.contentIndex)

function handleRetry() {
  if (!canRetry.value) return

  if (chatRuntime && messageId.value) {
    void chatRuntime.conversation.retry(messageId.value)
    return
  }

  if (!chatKit) return
  void chatKit.retry()
}
</script>

<template>
  <component :is="renderer" v-bind="props" :message="messageWithoutError" />
  <div class="error-renderer">
    <code>{{ error?.message || chatMessages.error.defaultMessage }}</code>
    <button
      v-if="canRetry"
      class="error-renderer__retry"
      data-testid="chat-error-retry"
      type="button"
      @click="handleRetry"
    >
      {{ chatMessages.error.retry }}
    </button>
  </div>
</template>

<style lang="less" scoped>
.error-renderer {
  font-size: 12px;
  padding: 0.5rem;
  margin: 0.25rem 0;
  background-color: var(--rc-color-danger-light);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.error-renderer__retry {
  border: 1px solid var(--chat-error-retry-border);
  background: var(--chat-error-retry-bg);
  color: var(--chat-error-retry-text);
  border-radius: 999px;
  padding: 4px 12px;
  cursor: pointer;
}
</style>
