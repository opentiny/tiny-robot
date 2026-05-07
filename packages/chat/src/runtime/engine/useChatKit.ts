import { computed, shallowRef, watch, watchEffect } from 'vue'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import type { UseChatKitOptions, UseChatKitReturn, UseMessageResponseProvider } from '@/types/core'
import { getRuntimeMessageId, setRuntimeMessageId } from '@/runtime/core/messageIdentity'
import { useChatConversation } from '../engine/useChatConversation'
import { cloneMessages, useChatMessages } from './useChatMessages'
import { useChatRequest } from './useChatRequest'
import {
  getChatMessageTurnId,
  setChatMessageError,
  setChatMessageOptimistic,
  setChatMessageTurnId,
} from '../engine/chatMessageState'

interface RetryContext {
  conversationId: string
  turnId: string
  userContent: string
}

interface OptimisticTurnContext {
  conversationId: string
  turnId: string
  userMessage: ChatMessage | null
  assistantMessage: ChatMessage | null
}

interface EditRollbackContext {
  conversationId: string
  messageIndex: number
  removedMessages: ChatMessage[]
}

interface ResendMessageOptions {
  preserveUserMessageId?: string
  attachments?: unknown[]
}

function createTurnId() {
  return `turn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function findLatestUserMessageWithoutTurnId(messages: ChatMessage[]): ChatMessage | null {
  return [...messages].reverse().find((message) => message.role === 'user' && !getChatMessageTurnId(message)) ?? null
}

function findUserMessageByTurnId(messages: ChatMessage[], turnId: string): ChatMessage | null {
  return messages.find((message) => message.role === 'user' && getChatMessageTurnId(message) === turnId) ?? null
}

function findAssistantMessageByTurnId(messages: ChatMessage[], turnId: string): ChatMessage | null {
  return messages.find((message) => getChatMessageTurnId(message) === turnId && message.role !== 'user') ?? null
}

function findAssistantMessageForTurn(messages: ChatMessage[], userMessage: ChatMessage | null): ChatMessage | null {
  if (!userMessage) return null

  const userIndex = messages.findIndex((message) => message === userMessage)
  if (userIndex === -1) return null

  return (
    messages
      .slice(userIndex + 1)
      .find((message) => message.loading || message.role === 'assistant' || message.role === '') ?? null
  )
}

function findPreviousUserMessageIndex(messages: ChatMessage[], startIndex: number): number {
  for (let index = startIndex; index >= 0; index -= 1) {
    if (messages[index]?.role === 'user') {
      return index
    }
  }

  return -1
}

export function useChatKit(options: UseChatKitOptions): UseChatKitReturn {
  const responseProviderRef = shallowRef<UseMessageResponseProvider>(
    options.responseProvider as UseMessageResponseProvider,
  )
  const retryContext = shallowRef<RetryContext | null>(null)
  const optimisticTurn = shallowRef<OptimisticTurnContext | null>(null)
  const editRollbackContext = shallowRef<EditRollbackContext | null>(null)

  function clearFailureState() {
    retryContext.value = null
    request.clearLastError()
  }

  function clearOptimisticTurn() {
    if (!optimisticTurn.value) return

    setChatMessageOptimistic(optimisticTurn.value.userMessage, false)
    setChatMessageOptimistic(optimisticTurn.value.assistantMessage, false)
    optimisticTurn.value = null
  }

  function clearPendingEditRollback() {
    editRollbackContext.value = null
  }

  function resetTransientState() {
    clearFailureState()
    clearOptimisticTurn()
    clearPendingEditRollback()
  }

  const conversation = useChatConversation({
    plugins: options.plugins,
    storage: options.storage,
    initialMessages: options.initialMessages,
    messageTransforms: options.messageTransforms,
    onAfterReceive: options.onAfterReceive,
    onFinish: options.onFinish,
    onError: options.onError,
    onTurnError: ({ context, error }) => {
      const normalizedError = request.captureError(error)
      const currentConversationId = conversation.activeConversationId.value
      const userMessage = context.currentTurn.find(
        (message) => message.role === 'user' && typeof message.content === 'string' && message.content.trim(),
      )
      const failedAssistantMessage = [...context.currentTurn].reverse().find((message) => message !== userMessage)

      if (failedAssistantMessage) {
        failedAssistantMessage.role = failedAssistantMessage.role || 'assistant'
        failedAssistantMessage.loading = undefined
        setChatMessageError(failedAssistantMessage, normalizedError)
      }

      if (
        editRollbackContext.value &&
        currentConversationId &&
        editRollbackContext.value.conversationId === currentConversationId
      ) {
        const activeMessages = conversation.activeConversation.value?.engine.messages.value
        if (activeMessages) {
          activeMessages.splice(
            editRollbackContext.value.messageIndex,
            activeMessages.length - editRollbackContext.value.messageIndex,
            ...editRollbackContext.value.removedMessages,
          )
        }
        clearPendingEditRollback()
      }

      if (
        currentConversationId &&
        userMessage &&
        typeof userMessage.content === 'string' &&
        normalizedError.retryable
      ) {
        const turnId = getChatMessageTurnId(userMessage) ?? createTurnId()
        setChatMessageTurnId(userMessage, turnId)
        setChatMessageTurnId(failedAssistantMessage ?? null, turnId)

        retryContext.value = {
          conversationId: currentConversationId,
          turnId,
          userContent: userMessage.content,
        }
      } else {
        retryContext.value = null
      }
    },
    responseProviderRef,
  })

  const request = useChatRequest({
    conversation,
    responseProviderRef,
  })
  const activeEngine = computed(() => conversation.activeConversation.value?.engine ?? null)
  const runtimeRequestState = computed(() => activeEngine.value?.requestState.value ?? 'idle')
  const runtimeProcessingState = computed(() => activeEngine.value?.processingState.value)
  const runtimeIsProcessing = computed(() => activeEngine.value?.isProcessing.value ?? false)

  const messages = computed<ChatMessage[]>(() => conversation.activeConversation.value?.engine.messages.value ?? [])

  function resendMessage(content: string, options: ResendMessageOptions = {}) {
    conversation.sendMessage(content, options.attachments ? { attachments: options.attachments } : undefined)
    markOptimisticTurn(options)
  }

  const messageActions = useChatMessages({
    messages,
    resendMessage,
    onOptimisticEdit: ({ messageIndex, removedMessages }) => {
      const currentConversationId = conversation.activeConversationId.value
      if (!currentConversationId) return

      clearFailureState()
      clearPendingEditRollback()
      editRollbackContext.value = {
        conversationId: currentConversationId,
        messageIndex,
        removedMessages,
      }
    },
  })

  function markOptimisticTurn(options: ResendMessageOptions = {}) {
    const currentConversationId = conversation.activeConversationId.value
    const activeMessages = conversation.activeConversation.value?.engine.messages.value
    if (!currentConversationId || !activeMessages) return

    const turnId = createTurnId()
    const userMessage = findLatestUserMessageWithoutTurnId(activeMessages)
    if (!userMessage) return

    if (options.preserveUserMessageId) {
      setRuntimeMessageId(userMessage, options.preserveUserMessageId)
    }

    setChatMessageTurnId(userMessage, turnId)
    const assistantMessage = findAssistantMessageForTurn(activeMessages, userMessage)
    setChatMessageTurnId(assistantMessage, turnId)
    setChatMessageOptimistic(userMessage, true)
    setChatMessageOptimistic(assistantMessage, true)

    optimisticTurn.value = {
      conversationId: currentConversationId,
      turnId,
      userMessage,
      assistantMessage,
    }
  }

  watchEffect(() => {
    if (!optimisticTurn.value) return

    const currentConversationId = conversation.activeConversationId.value
    const activeMessages = conversation.activeConversation.value?.engine.messages.value ?? []
    if (!currentConversationId || currentConversationId !== optimisticTurn.value.conversationId) {
      clearOptimisticTurn()
      return
    }

    if (!optimisticTurn.value.userMessage) {
      optimisticTurn.value.userMessage = findUserMessageByTurnId(activeMessages, optimisticTurn.value.turnId)
      setChatMessageOptimistic(optimisticTurn.value.userMessage, true)
    }

    if (!optimisticTurn.value.assistantMessage) {
      optimisticTurn.value.assistantMessage =
        findAssistantMessageByTurnId(activeMessages, optimisticTurn.value.turnId) ??
        findAssistantMessageForTurn(activeMessages, optimisticTurn.value.userMessage)
      setChatMessageTurnId(optimisticTurn.value.assistantMessage, optimisticTurn.value.turnId)
      setChatMessageOptimistic(optimisticTurn.value.assistantMessage, true)
    }

    if (request.status.value === 'ready' || request.status.value === 'error') {
      clearOptimisticTurn()
    }

    if (request.status.value === 'ready') {
      clearPendingEditRollback()
    }
  })

  watch(
    () => conversation.activeConversationId.value,
    (conversationId, previousConversationId) => {
      if (previousConversationId != null && conversationId !== previousConversationId) {
        resetTransientState()
      }
    },
  )

  function sendMessage(content: string, options?: { attachments?: unknown[] }): void {
    if (!content.trim()) return
    clearFailureState()
    resendMessage(content, { attachments: options?.attachments })
  }

  async function retry(): Promise<boolean> {
    const currentRetryContext = retryContext.value
    const currentError = request.lastError.value

    if (!currentRetryContext || !currentError?.retryable) {
      return false
    }

    if (conversation.activeConversationId.value !== currentRetryContext.conversationId) {
      return false
    }

    const activeMessages = conversation.activeConversation.value?.engine.messages.value
    if (!activeMessages) {
      return false
    }

    const failedTurnStartIndex = activeMessages.findIndex(
      (message) => message.role === 'user' && getChatMessageTurnId(message) === currentRetryContext.turnId,
    )

    if (failedTurnStartIndex >= 0) {
      const preservedUserMessageId = getRuntimeMessageId(activeMessages[failedTurnStartIndex])
      activeMessages.splice(failedTurnStartIndex)
      clearFailureState()
      resendMessage(currentRetryContext.userContent, { preserveUserMessageId: preservedUserMessageId })
      return true
    }

    clearFailureState()
    resendMessage(currentRetryContext.userContent)
    return true
  }

  async function regenerate(messageIndex?: number): Promise<boolean> {
    const currentConversationId = conversation.activeConversationId.value
    const activeMessages = conversation.activeConversation.value?.engine.messages.value

    if (!currentConversationId || !activeMessages?.length) {
      return false
    }

    const targetAssistantIndex =
      typeof messageIndex === 'number'
        ? messageIndex
        : [...activeMessages]
            .map((message, index) => ({ message, index }))
            .reverse()
            .find(({ message }) => message.role === 'assistant')?.index

    if (
      targetAssistantIndex === undefined ||
      targetAssistantIndex < 0 ||
      targetAssistantIndex >= activeMessages.length
    ) {
      return false
    }

    const userMessageIndex = findPreviousUserMessageIndex(activeMessages, targetAssistantIndex)
    if (userMessageIndex < 0) {
      return false
    }

    const userMessage = activeMessages[userMessageIndex]
    if (!userMessage || typeof userMessage.content !== 'string' || !userMessage.content.trim()) {
      return false
    }

    const preservedUserMessageId = getRuntimeMessageId(userMessage)

    clearFailureState()
    clearPendingEditRollback()
    editRollbackContext.value = {
      conversationId: currentConversationId,
      messageIndex: userMessageIndex,
      removedMessages: cloneMessages(activeMessages.slice(userMessageIndex)),
    }

    activeMessages.splice(userMessageIndex)
    resendMessage(userMessage.content, { preserveUserMessageId: preservedUserMessageId })
    return true
  }

  return {
    conversations: conversation.conversations,
    activeConversationId: conversation.activeConversationId,
    activeConversation: conversation.activeConversation,
    createConversation: conversation.createConversation,
    switchConversation: conversation.switchConversation,
    deleteConversation: conversation.deleteConversation,
    updateConversationTitle: conversation.updateConversationTitle,
    abortActiveRequest: conversation.abortActiveRequest,
    messages,
    status: request.status,
    lastError: request.lastError,
    sendMessage,
    updateResponseProvider: request.updateResponseProvider,
    abort: request.abort,
    retry,
    regenerate,
    runtime: {
      activeEngine,
      requestState: runtimeRequestState,
      processingState: runtimeProcessingState,
      isProcessing: runtimeIsProcessing,
      clear: conversation.clear,
      saveMessages: conversation.saveMessages,
    },
    startEditMessage: messageActions.startEditMessage,
    cancelEditMessage: messageActions.cancelEditMessage,
    isMessageEditing: messageActions.isMessageEditing,
    editMessage: messageActions.editMessage,
  }
}
