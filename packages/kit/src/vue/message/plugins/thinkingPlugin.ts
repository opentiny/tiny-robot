import type { useMessagePlugin } from '../types'

export const thinkingPlugin = (options: useMessagePlugin = {}): useMessagePlugin => {
  return {
    name: 'thinking',
    ...options,
    onCompletionChunk(context) {
      const { choice, currentMessage } = context
      const reasoning_content = choice?.message?.reasoning_content || choice?.delta?.reasoning_content
      const thinking = typeof reasoning_content === 'string'
      if (currentMessage.state) {
        currentMessage.state.thinking = thinking
      } else {
        currentMessage.state = { thinking }
      }

      return options.onCompletionChunk?.(context)
    },
    onTurnEnd(context) {
      // 如果不是流式数据或者请求被中断，thinking 状态可能不会被更新，在 onTurnEnd 中手动更新
      const lastMessage = context.currentTurn.slice(-1)[0]
      if (lastMessage?.state) {
        lastMessage.state.thinking = undefined
      }
      return options.onTurnEnd?.(context)
    },
  }
}
