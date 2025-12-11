import type { useMessagePlugin } from '../types'

export const lengthPlugin = (options: useMessagePlugin & { continueContent?: string } = {}): useMessagePlugin => {
  const { continueContent = 'Please continue with your previous answer.', ...restOptions } = options

  return {
    name: 'length',
    ...restOptions,
    onAfterRequest: async (context) => {
      const { lastChoiceChunk, appendMessage, requestNext } = context

      if (lastChoiceChunk?.finish_reason !== 'length') {
        return
      }

      // 输出长度达到了模型上下文长度限制，或达到了 max_tokens 的限制。自动加上 user 消息
      appendMessage({ role: 'user', content: continueContent })
      requestNext()

      return restOptions.onAfterRequest?.(context)
    },
  }
}
