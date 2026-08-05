import type { ChatLabels, ChatViewState } from '../types'

export type ResolvedChatViewState = ReturnType<typeof resolveChatViewState>

export function resolveChatViewState(state: ChatViewState | undefined, labels: ChatLabels) {
  return {
    conversation: {
      items: state?.conversation?.items ?? [],
      activeId: state?.conversation?.activeId ?? null,
      title: state?.conversation?.title || labels.newConversationTitle,
    },
    messages: state?.messages ?? [],
    composer: {
      loading: state?.composer?.loading ?? false,
      disabled: state?.composer?.disabled ?? false,
      submitDisabled: state?.composer?.submitDisabled ?? false,
    },
    model: state?.model,
    mcp: state?.mcp,
  }
}
