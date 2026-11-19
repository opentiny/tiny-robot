import { isAutoContinuationMessage } from '@opentiny/tiny-robot-kit'
import type { UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import { getMessageActionId } from '../messageActionIdentity'
import { CHAT_ACTION_METADATA_KEY } from '../useChatRuntimeFromConversation'

function generateActionId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function createChatActionStatePlugin(): UseMessagePlugin {
  return {
    name: 'chat-action-state',
    onTurnStart({ currentTurn }) {
      const user = [...currentTurn]
        .reverse()
        .find((message) => message.role === 'user' && !isAutoContinuationMessage(message))
      if (!user) return
      user.metadata ??= {}
      const metadata = user.metadata[CHAT_ACTION_METADATA_KEY] as { id?: string; turnState?: string } | undefined
      user.metadata[CHAT_ACTION_METADATA_KEY] = {
        ...metadata,
        id: metadata?.id ?? getMessageActionId(user) ?? generateActionId(),
        turnState: 'processing',
      }
    },
    onCompletionChunk({ currentTurn, currentMessage, updateCurrentMessage }) {
      if (currentMessage.role !== 'assistant') return
      const user = [...currentTurn]
        .reverse()
        .find((message) => message.role === 'user' && !isAutoContinuationMessage(message))
      const userMetadata = user?.metadata?.[CHAT_ACTION_METADATA_KEY] as { id?: string } | undefined
      if (!userMetadata?.id) return
      const existing = currentMessage.metadata?.[CHAT_ACTION_METADATA_KEY] as Record<string, unknown> | undefined
      if (existing?.id && existing.userMessageId === userMetadata.id && existing.turnState === 'processing') return
      updateCurrentMessage((message) => {
        message.metadata = {
          ...message.metadata,
          [CHAT_ACTION_METADATA_KEY]: {
            ...existing,
            id: existing?.id ?? generateActionId(),
            userMessageId: userMetadata.id,
            turnState: 'processing',
          },
        }
      })
    },
    onFinally({ currentTurn, requestState }) {
      const user = [...currentTurn]
        .reverse()
        .find((message) => message.role === 'user' && !isAutoContinuationMessage(message))
      const userMetadata = user?.metadata?.[CHAT_ACTION_METADATA_KEY] as { id?: string } | undefined
      if (!userMetadata?.id) return
      const turnState = requestState === 'paused' ? 'paused' : requestState
      for (const message of currentTurn) {
        if (message.role !== 'assistant') continue
        const existing = message.metadata?.[CHAT_ACTION_METADATA_KEY] as Record<string, unknown> | undefined
        message.metadata = {
          ...message.metadata,
          [CHAT_ACTION_METADATA_KEY]: {
            ...existing,
            id: existing?.id ?? generateActionId(),
            userMessageId: userMetadata.id,
            turnState,
          },
        }
      }
      const currentUserMetadata = user!.metadata![CHAT_ACTION_METADATA_KEY] as Record<string, unknown>
      currentUserMetadata.turnState = turnState
    },
    onTurnAbort({ currentTurn, requestState }) {
      if (requestState !== 'paused') return
      const user = [...currentTurn]
        .reverse()
        .find((message) => message.role === 'user' && !isAutoContinuationMessage(message))
      const userMetadata = user?.metadata?.[CHAT_ACTION_METADATA_KEY] as { id?: string } | undefined
      if (!userMetadata?.id) return
      for (const message of currentTurn) {
        if (message.role !== 'assistant') continue
        const existing = message.metadata?.[CHAT_ACTION_METADATA_KEY] as Record<string, unknown> | undefined
        message.metadata = {
          ...message.metadata,
          [CHAT_ACTION_METADATA_KEY]: {
            ...existing,
            id: existing?.id ?? generateActionId(),
            userMessageId: userMetadata.id,
            turnState: 'aborted',
          },
        }
      }
      const currentUserMetadata = user!.metadata![CHAT_ACTION_METADATA_KEY] as Record<string, unknown>
      currentUserMetadata.turnState = 'aborted'
    },
  }
}
