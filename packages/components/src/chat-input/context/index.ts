/**
 * ChatInput Context 实现
 */

import { inject } from 'vue'
import { CHAT_INPUT_CONTEXT_KEY } from '../constants'
import { ChatInputContext } from './types'

/**
 * 获取 ChatInput Context
 */
export function useChatInputContext(): ChatInputContext {
  const context = inject<ChatInputContext>(CHAT_INPUT_CONTEXT_KEY)

  if (!context) {
    throw new Error('useChatInputContext must be used within ChatInput component')
  }

  return context
}

export * from './types'
