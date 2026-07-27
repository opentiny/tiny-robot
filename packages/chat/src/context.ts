import type { InjectionKey, Ref } from 'vue'
import type { ChatRuntime, ChatUi } from './types'
import type { ChatInput } from './composables/useChatInput'

export interface ChatContext {
  runtime: Readonly<Ref<ChatRuntime>>
  input: ChatInput
  ui: Readonly<Ref<ChatUi>>
}

export const chatContextKey: InjectionKey<ChatContext> = Symbol('tiny-robot-chat-context')
