import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import type { ChatUIOptions, TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental'
import type { LayoutFloatingState } from '@opentiny/tiny-robot-chat'
import { createLocalRuntime } from './runtime'

export const BASE_UI: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false, surface: { mode: 'normal' } },
  welcome: { title: '你好，欢迎使用', description: '发送一条消息，体验本地回复。' },
  prompts: false,
  model: false,
  mcp: false,
  sender: { mode: 'multiple', placeholder: '输入消息，点击发送', submitType: 'ctrlEnter' },
}

type HostProps = {
  title: string
  ui: ChatUIOptions
  floatingState: LayoutFloatingState | undefined
  isEmpty: boolean | undefined
  enabled: boolean
  elementRef?: RefObject<TrChatHTMLElement | null>
  onEvent: (event: CustomEvent) => void
}

function ChatHost({ title, ui, floatingState, isEmpty, enabled, onEvent, elementRef }: HostProps) {
  const internalRef = useRef<TrChatHTMLElement>(null)
  const ref = elementRef ?? internalRef
  const owned = useRef<ReturnType<typeof createLocalRuntime> | null>(null)
  useLayoutEffect(() => {
    const chat = ref.current!
    const local = createLocalRuntime()
    owned.current = local
    const listener = (event: Event) => onEvent(event as CustomEvent)
    chat.addEventListener('ready', listener)
    chat.addEventListener('floating-state-update', listener)
    return () => {
      chat.removeEventListener('ready', listener)
      chat.removeEventListener('floating-state-update', listener)
      chat.runtime = undefined
      owned.current = null
      local.dispose()
    }
  }, [onEvent, ref])
  useLayoutEffect(() => {
    const chat = ref.current!
    chat.title = title
    chat.ui = ui
    chat.floatingState = floatingState
    chat.isEmpty = isEmpty
    chat.runtime = enabled ? owned.current!.runtime : undefined
  }, [title, ui, floatingState, isEmpty, enabled, onEvent, ref])
  return <tr-chat ref={ref} />
}

type DemoProps = {
  elementRef?: RefObject<TrChatHTMLElement | null>
  title?: string
  ui?: ChatUIOptions
  floatingState?: LayoutFloatingState
  isEmpty?: boolean
  enabled?: boolean
  mounted?: boolean
  onFloatingState?: (state: LayoutFloatingState) => void
}
export function ChatDemo({
  elementRef,
  title = '我的助手',
  ui = BASE_UI,
  floatingState,
  isEmpty,
  enabled = true,
  mounted = true,
  onFloatingState,
}: DemoProps) {
  const [ready, setReady] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const onEvent = useCallback(
    (event: CustomEvent) => {
      setEvents((previous) => [...previous, `${event.type} ${JSON.stringify(event.detail)}`])
      if (event.type === 'ready') setReady(true)
      if (event.type === 'floating-state-update') onFloatingState?.(event.detail[0])
    },
    [onFloatingState],
  )
  return (
    <section className="demo-preview" aria-label="聊天预览">
      <div className="demo-preview-bar">
        <strong>真实包 · tr-chat</strong>
        <span className="demo-status" data-testid="ready-state" role="status">
          {!mounted ? '已卸载' : ready ? '已就绪' : '等待 Runtime'}
        </span>
      </div>
      <div className="demo-chat">
        {mounted ? (
          <ChatHost
            elementRef={elementRef}
            title={title}
            ui={ui}
            floatingState={floatingState}
            isEmpty={isEmpty}
            enabled={enabled}
            onEvent={onEvent}
          />
        ) : (
          <p className="demo-empty">组件已卸载，可重新挂载。</p>
        )}
      </div>
      <section className="demo-card demo-events">
        <h2>DOM 事件</h2>
        <ol data-testid="event-log" aria-live="polite">
          {events.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ol>
      </section>
    </section>
  )
}
