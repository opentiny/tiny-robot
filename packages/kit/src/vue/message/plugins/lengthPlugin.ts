import type { UseMessagePlugin } from '../types'

export const lengthPlugin = (options: UseMessagePlugin & { continueContent?: string } = {}): UseMessagePlugin => {
  const { continueContent = 'Please continue with your previous answer.', ...restOptions } = options

  return {
    name: 'length',
    ...restOptions,
    onAfterRequest: async (context) => {
      const { lastChoice, appendMessage, requestNext } = context

      if (lastChoice?.finish_reason === 'length') {
        // 输出长度达到了模型上下文长度限制，或达到了 max_tokens 的限制。自动加上 user 消息
        appendMessage({ role: 'user', content: continueContent })
        requestNext()
      }

      return restOptions.onAfterRequest?.(context)
    },
  }
}
