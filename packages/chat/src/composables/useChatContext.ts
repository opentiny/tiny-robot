import { inject } from 'vue'
import { chatContextKey } from '../context'
import type { ChatContext } from '../types'

export function useChatContext(): ChatContext {
  const context = inject(chatContextKey, null)

  if (!context) {
    throw new Error('[tiny-robot-chat] useChatContext must be used inside TrChat.')
  }

  return context
}
