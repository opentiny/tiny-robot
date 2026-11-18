import { useLayoutEffect, useRef } from 'react'
import type { ChatRuntime, ChatUIOptions } from '@opentiny/tiny-robot-chat'
import type { ChatRenderers, TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental'
import { bubbleRenderers } from '../chat/markdown'
import { CopyReply, replyText } from '../chat/reply-actions'
import { fromReact } from '../chat/react-renderer'

const renderers: ChatRenderers = {
  'bubble-after': fromReact((scope) => {
    const text = replyText(scope)
    return text ? <CopyReply text={text} /> : null
  }),
}
export function ChatPage({ runtime, ui }: { runtime: ChatRuntime; ui: ChatUIOptions }) {
  const ref = useRef<TrChatHTMLElement>(null)
  useLayoutEffect(() => {
    const chat = ref.current!
    chat.runtime = runtime
    chat.ui = ui
    chat.renderers = renderers
    chat.bubbleRenderers = bubbleRenderers
  }, [runtime, ui])
  return (
    <main className="app-chat" aria-label="完整聊天">
      <tr-chat id="ai-chat" ref={ref} />
    </main>
  )
}
