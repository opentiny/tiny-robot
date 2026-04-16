import type { MessageEnginePlugin } from '../core/types'

export const thinkingPlugin = (options: MessageEnginePlugin = {}): MessageEnginePlugin => {
  return {
    name: 'thinking',
    ...options,
    onCompletionChunk(context) {
      const { choice, currentMessage, updateCurrentMessage } = context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = choice as any
      const reasoning_content = c?.message?.reasoning_content || c?.delta?.reasoning_content
      const thinking = typeof reasoning_content === 'string'

      if (currentMessage.state) {
        if (Boolean(currentMessage.state.thinking) !== thinking || Boolean(currentMessage.state.open) !== thinking) {
          updateCurrentMessage((message) => {
            message.state!.thinking = thinking
            message.state!.open = thinking
          })
        }
      } else {
        updateCurrentMessage((message) => {
          message.state = { thinking, open: thinking }
        })
      }

      return options.onCompletionChunk?.(context)
    },
    onTurnEnd(context) {
      // 如果不是流式数据或者请求被中断，thinking 状态可能不会被更新，在 onTurnEnd 中手动更新
      const lastMessage = context.currentTurn.at(-1)
      if (lastMessage?.state?.thinking) {
        lastMessage.state.thinking = false
        lastMessage.state.open = false
      }
      return options.onTurnEnd?.(context)
    },
  }
}
