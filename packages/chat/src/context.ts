import type { InjectionKey } from 'vue'
import type { ChatContext } from './types'

export const chatContextKey: InjectionKey<ChatContext> = Symbol('tiny-robot-chat-context')
