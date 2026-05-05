import type { ComputedRef } from 'vue'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { getRuntimeMessageId } from '@/runtime/core/messageIdentity'
import { isChatMessageEditing, setChatMessageEditing } from '../engine/chatMessageState'

interface UseChatMessagesOptions {
  messages: ComputedRef<ChatMessage[]>
  resendMessage: (content: string, options?: { preserveUserMessageId?: string }) => void
  onOptimisticEdit?: (payload: { messageIndex: number; removedMessages: ChatMessage[]; newContent: string }) => void
}

export function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      // Fall through to the recursive clone below when structuredClone cannot serialize the value.
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, cloneValue(item)]),
    ) as T
  }

  return value
}

export function cloneMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) => cloneValue(message))
}

export function useChatMessages(options: UseChatMessagesOptions) {
  function startEditMessage(messageIndex: number): void {
    const message = options.messages.value[messageIndex]
    if (!message) {
      console.warn(`[useChatMessages] startEditMessage: invalid messageIndex ${messageIndex}`)
      return
    }

    setChatMessageEditing(message, true)
  }

  function cancelEditMessage(messageIndex: number): void {
    const message = options.messages.value[messageIndex]
    setChatMessageEditing(message ?? null, false)
  }

  function isMessageEditing(messageIndex: number): boolean {
    return isChatMessageEditing(options.messages.value[messageIndex])
  }

  function editMessage(messageIndex: number, newContent: string): void {
    const currentMessages = options.messages.value
    if (messageIndex < 0 || messageIndex >= currentMessages.length) {
      console.warn(`[useChatMessages] editMessage: invalid messageIndex ${messageIndex}`)
      return
    }

    if (!newContent.trim()) {
      console.warn('[useChatMessages] editMessage: newContent cannot be empty')
      return
    }

    const message = currentMessages[messageIndex]
    const preservedUserMessageId = getRuntimeMessageId(message)
    options.onOptimisticEdit?.({
      messageIndex,
      removedMessages: cloneMessages(currentMessages.slice(messageIndex)),
      newContent,
    })
    currentMessages.splice(messageIndex)
    options.resendMessage(newContent, { preserveUserMessageId: preservedUserMessageId })
  }

  return {
    startEditMessage,
    cancelEditMessage,
    isMessageEditing,
    editMessage,
  }
}
