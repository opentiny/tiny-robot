import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { getChatMessageError, isChatMessageEditing } from '@/runtime/engine/chatMessageState'
import type { ChatRuntime, ChatStatus } from '@/types'

interface FallbackRuntime {
  messages: ComputedRef<ChatMessage[]>
  status: ComputedRef<ChatStatus>
  isMessageEditing: (messageIndex: number) => boolean
}

export interface UseFeedbackVisibilityOptions {
  role?: string
  enabled?: boolean
  messages: ComputedRef<ChatMessage[]>
  primaryMessage: ComputedRef<ChatMessage | undefined>
  primaryMessageId: ComputedRef<string | undefined>
  messageIndexes: number[]
  runtime: ChatRuntime | null
  fallbackRuntime: FallbackRuntime | null
  runtimeFeedbackEnabled: ComputedRef<boolean>
}

export interface UseFeedbackVisibilityReturn {
  isEditing: ComputedRef<boolean>
  isPendingAssistantTurn: ComputedRef<boolean>
  hasError: ComputedRef<boolean>
  shouldRender: ComputedRef<boolean>
}

export function useFeedbackVisibility(options: UseFeedbackVisibilityOptions): UseFeedbackVisibilityReturn {
  const {
    role,
    messages,
    primaryMessage,
    primaryMessageId,
    messageIndexes,
    runtime,
    fallbackRuntime,
    runtimeFeedbackEnabled,
  } = options

  const primarySourceError = computed(() => getChatMessageError(primaryMessage.value))
  const primarySourceEditing = computed(() => isChatMessageEditing(primaryMessage.value))
  const primarySourceStreaming = computed(() => Boolean(primaryMessage.value?.loading))

  const latestAssistantIndex = computed(() => {
    if (!fallbackRuntime) return undefined
    const allMessages = fallbackRuntime.messages.value
    for (let index = allMessages.length - 1; index >= 0; index--) {
      if (allMessages[index]?.role === 'assistant') return index
    }
    return undefined
  })

  const isEditing = computed(() => {
    if (primaryMessageId.value && runtime) {
      const runtimeEditing = runtime.message.getViewState(primaryMessageId.value)?.editing
      if (runtimeEditing !== undefined) return Boolean(runtimeEditing)
    }

    if (primarySourceEditing.value) return true

    if (!fallbackRuntime) return false
    const primaryMessageIndex = messageIndexes[0]
    if (primaryMessageIndex === undefined) return false
    return Boolean(fallbackRuntime.isMessageEditing(primaryMessageIndex))
  })

  const isPendingAssistantTurn = computed(() => {
    if (role !== 'assistant') return false

    if (primaryMessageId.value && runtime) {
      const status = runtime.message.getViewState(primaryMessageId.value)?.status
      if (status !== undefined) return status === 'pending' || status === 'streaming'
    }

    if (primarySourceStreaming.value) return true

    if (!fallbackRuntime) return false
    const latestIndex = latestAssistantIndex.value
    if (latestIndex === undefined) return false
    return messageIndexes.includes(latestIndex) && fallbackRuntime.status.value !== 'ready'
  })

  const hasError = computed(() => {
    if (primaryMessageId.value && runtime) {
      const runtimeError = runtime.message.getViewState(primaryMessageId.value)?.error
      if (runtimeError !== undefined) return Boolean(runtimeError)
    }

    if (primarySourceError.value) return true

    return messages.value.some((message) => Boolean(getChatMessageError(message)))
  })

  const shouldRender = computed(() => {
    if (!runtimeFeedbackEnabled.value) return false
    if (isEditing.value) return false
    if (role === 'assistant') {
      if (hasError.value) return false
      if (isPendingAssistantTurn.value) return false
    }
    return true
  })

  return { isEditing, isPendingAssistantTurn, hasError, shouldRender }
}
