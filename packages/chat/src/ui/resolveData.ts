import type { ChatLabels, ChatUIData } from '../types'
import { createDefaultChatUIData } from './defaults'

export type ResolvedChatUIData = ReturnType<typeof resolveChatUIData>

export function resolveChatUIData(data: ChatUIData | undefined, labels: ChatLabels) {
  const defaults = createDefaultChatUIData(labels)

  return {
    conversation: {
      items: data?.conversation?.items ?? defaults.conversation.items,
      activeId: data?.conversation?.activeId ?? defaults.conversation.activeId,
      title: data?.conversation?.title ?? defaults.conversation.title,
    },
    bubble: {
      messages: data?.bubble?.messages ?? defaults.bubble.messages,
    },
    sender: {
      inputValue: data?.sender?.inputValue,
      loading: data?.sender?.loading ?? defaults.sender.loading,
      disabled: data?.sender?.disabled ?? defaults.sender.disabled,
      submitDisabled: data?.sender?.submitDisabled ?? defaults.sender.submitDisabled,
    },
    model: data?.model ?? defaults.model,
    mcp: data?.mcp ?? defaults.mcp,
  }
}
