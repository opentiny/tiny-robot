import type { ChatBubbleSlotProps, ChatMessageItem } from '@opentiny/tiny-robot-chat'

/** 复制助手可读正文，保留 Markdown，不包含思考过程和工具信息。 */
export function replyText(scope: ChatBubbleSlotProps): string {
  if (
    scope.role !== 'assistant' ||
    scope.messages.some(
      (message: ChatMessageItem) =>
        message.loading || (message.streamState !== undefined && message.streamState !== 'finished'),
    )
  )
    return ''
  return scope.messages
    .filter((message) => message.role === 'assistant')
    .map((message) => {
      if (typeof message.content === 'string') return message.content
      return (message.content ?? [])
        .filter((item) => item.type === 'text' && typeof item.text === 'string')
        .map((item) => item.text)
        .join('\n\n')
    })
    .filter(Boolean)
    .join('\n\n')
}

export async function copyReply(text: string, button: HTMLButtonElement) {
  button.disabled = true
  let label = '已复制'
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    label = '复制失败，点击重试'
  }
  if (!button.isConnected) return
  button.disabled = false
  button.setAttribute('aria-label', label)
  button.querySelector('.copy-label')!.textContent = label
}
