import type { ChatMessage } from '@opentiny/tiny-robot-kit'

const CHAT_RENDER_SOURCE_MESSAGE = Symbol('chat-render-source-message')
const CHAT_RENDER_MESSAGE_INDEX = Symbol('chat-render-message-index')

type ChatRenderAnnotatedMessage = ChatMessage & {
  [CHAT_RENDER_SOURCE_MESSAGE]?: ChatMessage
  [CHAT_RENDER_MESSAGE_INDEX]?: number
}

function defineHiddenProperty<T extends object, K extends PropertyKey>(target: T, key: K, value: unknown) {
  Object.defineProperty(target, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: false,
  })
}

export function normalizeChatRenderMessages(messages: ChatMessage[]): ChatMessage[] {
  messages.forEach((message, index) => {
    const annotatedMessage = message as ChatRenderAnnotatedMessage

    if (annotatedMessage[CHAT_RENDER_SOURCE_MESSAGE] !== message) {
      defineHiddenProperty(annotatedMessage, CHAT_RENDER_SOURCE_MESSAGE, message)
    }

    if (annotatedMessage[CHAT_RENDER_MESSAGE_INDEX] !== index) {
      defineHiddenProperty(annotatedMessage, CHAT_RENDER_MESSAGE_INDEX, index)
    }
  })

  return messages
}

export function getChatRenderSourceMessage(message: ChatMessage | null | undefined): ChatMessage | undefined {
  if (!message) {
    return undefined
  }

  const annotatedMessage = message as ChatRenderAnnotatedMessage
  return annotatedMessage[CHAT_RENDER_SOURCE_MESSAGE] ?? message
}

export function getChatRenderMessageIndex(message: ChatMessage | null | undefined): number | undefined {
  if (!message) {
    return undefined
  }

  return (message as ChatRenderAnnotatedMessage)[CHAT_RENDER_MESSAGE_INDEX]
}

export function unwrapChatRenderMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) => getChatRenderSourceMessage(message) ?? message)
}
