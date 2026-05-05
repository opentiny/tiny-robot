const CHAT_RUNTIME_MESSAGE_ID = Symbol('chatRuntimeMessageId')
const CHAT_RUNTIME_MESSAGE_ID_STATE_KEY = '__trMessageId'

type MessageIdCarrier = {
  [CHAT_RUNTIME_MESSAGE_ID]?: string
}

type MessageStateCarrier = {
  state?: Record<string, unknown>
}

function createRuntimeMessageId() {
  return `tr-msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function getPersistedRuntimeMessageId(target: unknown): string | undefined {
  if (!target || typeof target !== 'object') {
    return undefined
  }

  const state = (target as MessageStateCarrier).state
  const persistedId = state?.[CHAT_RUNTIME_MESSAGE_ID_STATE_KEY]
  return typeof persistedId === 'string' ? persistedId : undefined
}

function persistRuntimeMessageId(target: object, messageId: string) {
  const carrier = target as MessageStateCarrier
  if (!carrier.state || typeof carrier.state !== 'object') {
    carrier.state = {}
  }

  carrier.state[CHAT_RUNTIME_MESSAGE_ID_STATE_KEY] = messageId
}

export function getRuntimeMessageId(target: unknown): string | undefined {
  if (!target || typeof target !== 'object') {
    return undefined
  }

  return (target as MessageIdCarrier)[CHAT_RUNTIME_MESSAGE_ID] ?? getPersistedRuntimeMessageId(target)
}

export function setRuntimeMessageId(target: object, messageId: string): string {
  const carrier = target as MessageIdCarrier
  if (carrier[CHAT_RUNTIME_MESSAGE_ID] !== messageId) {
    Object.defineProperty(carrier, CHAT_RUNTIME_MESSAGE_ID, {
      value: messageId,
      writable: true,
      configurable: true,
      enumerable: false,
    })
  }

  persistRuntimeMessageId(target, messageId)
  return messageId
}

export function ensureRuntimeMessageId(target: object, preferredId?: string): string {
  const existingMessageId = getRuntimeMessageId(target)
  if (existingMessageId) {
    return setRuntimeMessageId(target, existingMessageId)
  }

  return setRuntimeMessageId(target, preferredId ?? createRuntimeMessageId())
}
