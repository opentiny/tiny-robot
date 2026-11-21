import type { ChatMessageItem } from '../types'

export const CHAT_ACTION_METADATA_KEY = 'chat_action_metadata'

export function getMessageActionId(message: ChatMessageItem): string | undefined {
  const metadata = message.metadata?.[CHAT_ACTION_METADATA_KEY] as { id?: unknown } | undefined
  return [metadata?.id, message.metadata?.id, message.id].find(
    (id): id is string => typeof id === 'string' && id.length > 0,
  )
}

export function getMessageActionTarget(message: ChatMessageItem): string | undefined {
  const metadata = message.metadata?.[CHAT_ACTION_METADATA_KEY] as { userMessageId?: unknown } | undefined
  return message.role === 'assistant' && typeof metadata?.userMessageId === 'string' && metadata.userMessageId
    ? metadata.userMessageId
    : getMessageActionId(message)
}
