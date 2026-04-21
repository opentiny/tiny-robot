import type { MessageEnginePlugin } from '../types'

export const thinkingPlugin = (options: MessageEnginePlugin = {}): MessageEnginePlugin => {
  const stateShouldUpdate = (state: Record<string, unknown>, thinking: boolean) => {
    return Boolean(state.thinking) !== thinking || Boolean(state.open) !== thinking
  }

  return {
    name: 'thinking',
    ...options,
    onCompletionChunk(context) {
      const { choice, currentMessage, updateCurrentMessage } = context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = choice as any
      const reasoning_content = c?.message?.reasoning_content || c?.delta?.reasoning_content
      const thinking = typeof reasoning_content === 'string'

      if (thinking) {
        if (currentMessage.state && typeof currentMessage.state === 'object') {
          if (stateShouldUpdate(currentMessage.state, thinking)) {
            updateCurrentMessage((message) => {
              message.state!.thinking = true
              message.state!.open = true
            })
          }
        } else {
          updateCurrentMessage((message) => {
            message.state = { thinking, open: thinking }
          })
        }
      } else if (
        currentMessage.state &&
        typeof currentMessage.state === 'object' &&
        'thinking' in currentMessage.state &&
        stateShouldUpdate(currentMessage.state, thinking)
      ) {
        updateCurrentMessage((message) => {
          message.state!.thinking = false
          message.state!.open = false
        })
      }

      return options.onCompletionChunk?.(context)
    },
    onTurnEnd(context) {
      const { currentTurn, mutate } = context

      // 如果不是流式数据或者请求被中断，thinking 状态可能不会被更新，在 onTurnEnd 中手动更新
      const lastMessage = currentTurn.at(-1)

      if (
        lastMessage?.state &&
        typeof lastMessage.state === 'object' &&
        'thinking' in lastMessage.state &&
        stateShouldUpdate(lastMessage.state, Boolean(lastMessage.state.thinking))
      ) {
        mutate('messages', () => {
          lastMessage.state!.thinking = false
          lastMessage.state!.open = false
        })
      }

      return options.onTurnEnd?.(context)
    },
  }
}
