import Chat from './Chat.vue'
import Root from './Root.vue'
import Composer from './components/Composer.vue'
import Conversations from './components/Conversations.vue'
import Header from './components/Header.vue'
import Messages from './components/Messages.vue'

export * from './types'
export * from './context'

export { Chat }
export { Root, Root as TrChatRoot }
export { Header, Header as TrChatHeader }
export { Conversations, Conversations as TrChatConversations }
export { Messages, Messages as TrChatMessages }
export { Composer, Composer as TrChatComposer }

export const TrChat = Object.assign(Chat, {
  Root,
  Header,
  Conversations,
  Messages,
  Composer,
})

export { useChatContext } from './composables/useChatContext'
export { useKitChatRuntime } from './composables/useKitChatRuntime'
export { useManagedChatRuntime } from './composables/useManagedChatRuntime'
export type { UseKitChatRuntimeOptions } from './composables/useKitChatRuntime'
