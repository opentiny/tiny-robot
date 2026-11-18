import { useLayoutEffect, useRef, useState } from 'react'
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

export function CopyReply({ text }: { text: string }) {
  const [status, setStatus] = useState('复制')
  const [busy, setBusy] = useState(false)
  const mounted = useRef(false)
  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const copy = async () => {
    setBusy(true)
    let label = '已复制'
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      label = '复制失败，点击重试'
    }
    if (mounted.current) {
      setStatus(label)
      setBusy(false)
    }
  }
  return (
    <div className="reply-actions">
      <button
        type="button"
        className="reply-copy"
        disabled={busy}
        aria-label={status === '复制' ? '复制回复' : status}
        onClick={copy}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <rect x="8" y="8" width="12" height="12" rx="3" />
          <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
        </svg>
        <span className="copy-label" aria-live="polite">
          {status}
        </span>
      </button>
    </div>
  )
}
