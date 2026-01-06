/**
 * Sender Context 实现
 */

import { inject } from 'vue'
import { SENDER_CONTEXT_KEY } from '../types/context'
import { SenderContext } from './types'

/**
 * 获取 Sender Context
 */
export function useSenderContext(): SenderContext {
  const context = inject<SenderContext>(SENDER_CONTEXT_KEY)

  if (!context) {
    throw new Error('useSenderContext must be used within Sender component')
  }

  return context
}

export * from './types'
