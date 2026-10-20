import { toRaw } from 'vue'
import type { ChatMessageItem, ChatRequestView } from '../../types'

export function createMessageIdentity(scope: string) {
  const objects = new WeakMap<ChatMessageItem, number>()
  let nextId = 0
  return (message: ChatMessageItem, conversationId?: string | null): string => {
    const key = message.renderKey != null ? ['key', message.renderKey] : message.id != null ? ['id', message.id] : null
    if (key) return JSON.stringify([scope, conversationId ?? null, ...key])

    const original = toRaw(message)
    if (!objects.has(original)) objects.set(original, ++nextId)
    return JSON.stringify([scope, conversationId ?? null, 'object', objects.get(original)])
  }
}

export function resolveStreamState(
  message: ChatMessageItem,
  request?: ChatRequestView,
  isLatest = false,
): NonNullable<ChatMessageItem['streamState']> {
  if (message.streamState) return message.streamState
  if (message.loading === true) return 'streaming'
  if (message.loading === false || message.role === 'user' || message.role === 'system') return 'finished'
  if (request?.state === 'processing' && isLatest) return 'unknown'
  return 'finished'
}

export function getMessageAnchorText(message: ChatMessageItem): string {
  const content = message.state?.content ?? message.content
  if (typeof content === 'string') return content.trim()
  if (Array.isArray(content))
    return content
      .filter((part) => part && part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text)
      .join(' ')
      .trim()
  return ''
}
