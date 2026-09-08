export const CHAT_DEFAULT_CONVERSATION_TITLE = '新对话'

export function createDefaultChatTitle(text: string) {
  return text.trim().slice(0, 20) || CHAT_DEFAULT_CONVERSATION_TITLE
}

export function resolveChatConversationTitle(title?: string) {
  return title || CHAT_DEFAULT_CONVERSATION_TITLE
}
