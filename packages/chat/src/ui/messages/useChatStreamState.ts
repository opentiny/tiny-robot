import { nextTick, watch } from 'vue'
import type { ChatMessageItem, ChatRequestView } from '../../types'
import type { ChatStreamMessageState } from './messageIdentity'

export function useChatStreamState(
  getMessages: () => readonly ChatMessageItem[],
  getRequest: () => ChatRequestView | undefined,
  getConversationId: () => string | null | undefined,
  identify: (message: ChatMessageItem, conversationId?: string | null) => string,
) {
  let conversationId = getConversationId() ?? null
  let active = false
  let trusted = false
  let snapshot = new Set<string>()
  let assistants = new Set<string>()
  let unknownAssistants = new Set<string>()
  let pendingAssistants = new Set<string>()
  let knownMessages = new Set(getMessages().map((message) => identify(message, conversationId)))
  let currentAssistant: string | null = null
  let navigationPending = false

  const capture = (canInfer: boolean) => {
    active = true
    trusted = canInfer
    snapshot = new Set(getMessages().map((message) => identify(message, conversationId)))
    assistants = new Set()
    unknownAssistants = new Set([...pendingAssistants].filter((key) => snapshot.has(key)))
    pendingAssistants = new Set()
    currentAssistant = null
  }
  const clear = () => {
    active = false
    trusted = false
    snapshot = new Set()
    assistants = new Set()
    unknownAssistants = new Set()
    pendingAssistants = new Set()
    currentAssistant = null
  }
  const observeMessages = () => {
    const messages = getMessages()
    const keys = new Set(messages.map((message) => identify(message, conversationId)))
    if (!active) {
      for (const message of messages) {
        const key = identify(message, conversationId)
        if (message.role === 'assistant' && !knownMessages.has(key)) pendingAssistants.add(key)
      }
      knownMessages = keys
      void nextTick(() => {
        pendingAssistants = new Set()
      })
      return
    }
    knownMessages = keys
    if (!trusted || getRequest()?.state !== 'processing') return
    for (const message of messages) {
      const key = identify(message, conversationId)
      if (message.role === 'assistant' && !snapshot.has(key)) {
        assistants.add(key)
        currentAssistant = key
      }
    }
  }
  const requestState = getRequest()?.state
  if (requestState === 'processing' || requestState === 'paused') capture(false)

  watch(
    [getConversationId, () => getRequest()?.state],
    ([nextId, state], [previousId, previousState]) => {
      if (nextId !== previousId) {
        conversationId = nextId ?? null
        navigationPending = true
        void nextTick(() => {
          navigationPending = false
        })
        if (state === 'processing' || state === 'paused') capture(false)
        else clear()
      } else if (state === 'processing' && previousState !== 'processing' && previousState !== 'paused') {
        capture(!navigationPending)
      } else if (state === 'paused' && !active) capture(previousState === 'processing')
      else if (state !== 'processing' && state !== 'paused') {
        clear()
      }
    },
    { flush: 'sync' },
  )
  watch(() => getMessages().map((message) => identify(message, conversationId)), observeMessages, { flush: 'sync' })

  return (message: ChatMessageItem): ChatStreamMessageState => {
    const key = identify(message, conversationId)
    if (unknownAssistants.has(key)) return 'unknown'
    if (!active || snapshot.has(key) || assistants.has(key)) {
      return key === currentAssistant ? 'current' : 'history'
    }
    return message.role === 'assistant' ? 'unknown' : 'history'
  }
}
