import { toRaw } from 'vue'
import type { BubbleMessageGroup } from '@opentiny/tiny-robot'
import type { ChatMessageItem, ChatRequestView } from '../../types'

export type ChatStreamMessageState = 'history' | 'current' | 'unknown'

export function createMessageIdentity(scope: string) {
  const objects = new WeakMap<ChatMessageItem, number>()
  let nextId = 0
  return (message: ChatMessageItem, conversationId?: string | null): string => {
    const key = message.renderKey ? ['key', message.renderKey] : message.id ? ['id', message.id] : null
    if (key) return JSON.stringify([scope, conversationId ?? null, ...key])

    const original = toRaw(message)
    if (!objects.has(original)) objects.set(original, ++nextId)
    return JSON.stringify([scope, conversationId ?? null, 'object', objects.get(original)])
  }
}

export function resolveStreamState(
  message: ChatMessageItem,
  request?: ChatRequestView,
  messageState: ChatStreamMessageState = 'history',
): NonNullable<ChatMessageItem['streamState']> {
  if (message.streamState) return message.streamState
  if (request && ['completed', 'aborted', 'paused', 'error'].includes(request.state)) return 'finished'
  if (message.role === 'user' || message.role === 'system') return 'finished'
  if (request?.state === 'processing') {
    if (messageState === 'current' && !['calling-tools', 'pausing'].includes(request.processingState ?? '')) {
      return 'streaming'
    }
    return messageState === 'unknown' ? 'unknown' : 'finished'
  }
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

export function getAdditionalAnchorIndexes(groups: BubbleMessageGroup[], messages: ChatMessageItem[]): Set<number> {
  return new Set(
    groups.flatMap((group) =>
      group.role === 'user' ? group.messageIndexes.slice(1).filter((index) => messages[index]?.role === 'user') : [],
    ),
  )
}
