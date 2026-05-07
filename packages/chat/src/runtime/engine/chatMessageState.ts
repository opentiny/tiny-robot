import type { ChatErrorInfo } from '@/types'

type MessageStateCarrier = {
  state?: Record<string, unknown>
}

export interface ChatMessageRuntimeState extends Record<string, unknown> {
  error?: ChatErrorInfo
  isEditing?: boolean
  optimistic?: boolean
  turnId?: string
}

function asMessageStateCarrier(message: unknown): MessageStateCarrier | null | undefined {
  return message as MessageStateCarrier | null | undefined
}

export function getChatMessageState(message: unknown): ChatMessageRuntimeState | undefined {
  return asMessageStateCarrier(message)?.state as ChatMessageRuntimeState | undefined
}

export function ensureChatMessageState(message: unknown): ChatMessageRuntimeState {
  const stateCarrier = message as MessageStateCarrier
  stateCarrier.state ??= {}
  return stateCarrier.state as ChatMessageRuntimeState
}

export function getChatMessageError(message: unknown): ChatErrorInfo | undefined {
  return getChatMessageState(message)?.error
}

export function hasChatMessageError(message: unknown): boolean {
  return Boolean(getChatMessageError(message))
}

export function setChatMessageError(message: unknown, error: ChatErrorInfo | undefined) {
  if (!message) return

  const state = ensureChatMessageState(message)
  state.error = error
}

export function isChatMessageEditing(message: unknown): boolean {
  return getChatMessageState(message)?.isEditing === true
}

export function setChatMessageEditing(message: unknown, isEditing: boolean) {
  if (!message) return

  const state = ensureChatMessageState(message)
  state.isEditing = isEditing || undefined
}

export function getChatMessageTurnId(message: unknown) {
  const turnId = getChatMessageState(message)?.turnId
  return typeof turnId === 'string' ? turnId : undefined
}

export function setChatMessageTurnId(message: unknown, turnId: string) {
  if (!message) return

  const state = ensureChatMessageState(message)
  state.turnId = turnId
}

export function setChatMessageOptimistic(message: unknown, isOptimistic: boolean) {
  if (!message) return

  const state = ensureChatMessageState(message)
  state.optimistic = isOptimistic || undefined
}

export function isChatMessageOptimistic(message: unknown): boolean {
  return getChatMessageState(message)?.optimistic === true
}
