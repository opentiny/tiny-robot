import type { ChatConversation, ChatConversationInfo, ChatRuntime } from '../../types'

export interface TrChatRuntimeSnapshot {
  readonly conversations: readonly ChatConversationInfo[]
  readonly activeConversation: ChatConversation | null
  readonly composer: Readonly<{
    disabled?: boolean
    submitDisabled?: boolean
  }>
}

export function createRuntimeSnapshot(runtime: ChatRuntime | undefined): TrChatRuntimeSnapshot | undefined {
  if (!runtime) return undefined

  const activeConversation = runtime.activeConversation.value

  return {
    conversations: runtime.conversations.value.map((conversation) => ({ ...conversation })),
    activeConversation: activeConversation
      ? {
          ...activeConversation,
          messages: activeConversation.messages.map((message) => ({ ...message })),
        }
      : null,
    composer: {
      ...(runtime.composer.disabled ? { disabled: runtime.composer.disabled.value } : {}),
      ...(runtime.composer.submitDisabled ? { submitDisabled: runtime.composer.submitDisabled.value } : {}),
    },
  }
}
