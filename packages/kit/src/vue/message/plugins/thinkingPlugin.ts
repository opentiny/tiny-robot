import type { useMessagePlugin } from '../types'

export const thinkingPlugin = (options: useMessagePlugin = {}): useMessagePlugin => {
  return {
    name: 'length',
    ...options,
    onStreamChunk(context) {
      const { chunk, currentMessage } = context
      const reasoning_content = chunk.choices?.find((choice) => choice.index === 0)?.delta.reasoning_content
      const thinking = typeof reasoning_content === 'string' ? true : undefined
      if (currentMessage.extras) {
        currentMessage.extras.thinking = thinking
      } else {
        currentMessage.extras = { thinking }
      }

      return options.onStreamChunk?.(context)
    },
    onTurnEnd(context) {
      const lastMessage = context.currentTurn.slice(-1)[0]
      if (lastMessage?.extras) {
        lastMessage.extras.thinking = undefined
      }
      return options.onTurnEnd?.(context)
    },
  }
}
