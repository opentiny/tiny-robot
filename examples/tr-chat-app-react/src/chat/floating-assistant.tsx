import './floating-assistant.css'
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { ChatHeaderSlotProps, ChatRuntime, ChatUIOptions, LayoutFloatingState } from '@opentiny/tiny-robot-chat'
import type { ChatRenderers, TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental'
import { bubbleRenderers } from './markdown'
import { CopyReply, replyText } from './reply-actions'
import { fromReact } from './react-renderer'

function WindowHeader({
  scope,
  fullscreen,
  historyOpen,
  toggleHistory,
  closeHistory,
  toggleMode,
  close,
}: {
  scope: ChatHeaderSlotProps
  fullscreen: boolean
  historyOpen: boolean
  toggleHistory: () => void
  closeHistory: () => void
  toggleMode: () => void
  close: () => void
}) {
  return (
    <header className="assistant-window-header" data-fullscreen={fullscreen}>
      <strong>TinyRobot</strong>
      <div className="assistant-window-actions">
        <button
          type="button"
          className="assistant-icon-button"
          aria-label="新建会话"
          title="新建会话"
          onClick={() => {
            scope.createConversation()
            closeHistory()
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button
          type="button"
          className="assistant-icon-button assistant-history-trigger"
          aria-label="历史会话"
          title="历史会话"
          aria-expanded={historyOpen}
          aria-controls="assistant-history"
          onClick={toggleHistory}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 11a8 8 0 1 1 2 6M4 5v6h6M12 8v5l3 2" />
          </svg>
        </button>
        <button
          type="button"
          className="assistant-icon-button assistant-mode-toggle"
          aria-label={fullscreen ? '切换为悬浮窗口' : '切换为全屏模式'}
          title={fullscreen ? '切换为悬浮窗口' : '切换为全屏模式'}
          onClick={toggleMode}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {fullscreen ? (
              <>
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M11 11h9v9h-9z" />
              </>
            ) : (
              <path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" />
            )}
          </svg>
        </button>
        <button type="button" className="assistant-icon-button" aria-label="关闭 AI 助手" title="关闭" onClick={close}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M6 18 18 6" />
          </svg>
        </button>
      </div>
    </header>
  )
}

function HistoryPanel({
  scope,
  runtime,
  position,
  closeHistory,
}: {
  scope: ChatHeaderSlotProps
  runtime: ChatRuntime
  position: CSSProperties
  closeHistory: () => void
}) {
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string>()
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const search = useRef<HTMLInputElement>(null)
  useLayoutEffect(() => {
    search.current?.focus()
  }, [])
  const items = (scope.conversation.items ?? []).filter((item) => (item.title || '未命名会话').includes(query.trim()))
  const act = async (action: () => Promise<void> | void, done?: () => void) => {
    setError('')
    try {
      await action()
      done?.()
    } catch {
      setError('会话操作失败，请重试。')
    }
  }
  return (
    <section id="assistant-history" className="assistant-history" style={position} role="dialog" aria-label="历史会话">
      <div className="assistant-history-head">
        <h2>历史会话</h2>
        <button type="button" className="assistant-icon-button" aria-label="关闭历史会话" onClick={closeHistory}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M6 18 18 6" />
          </svg>
        </button>
      </div>
      <input
        ref={search}
        type="search"
        aria-label="搜索历史会话"
        placeholder="搜索会话"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {error && <p role="alert">{error}</p>}
      <ul>
        {items.map((item) => (
          <li key={item.id} data-active={scope.conversation.activeId === item.id}>
            {editingId === item.id ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  if (title.trim())
                    void act(
                      () => runtime.actions.renameConversation(item.id, title.trim()),
                      () => setEditingId(undefined),
                    )
                }}
              >
                <input
                  aria-label="会话标题"
                  autoFocus
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.stopPropagation()
                      setEditingId(undefined)
                    }
                  }}
                />
                <button type="submit" disabled={!title.trim()}>
                  保存标题
                </button>
                <button type="button" onClick={() => setEditingId(undefined)}>
                  取消
                </button>
              </form>
            ) : (
              <>
                <button
                  type="button"
                  className="assistant-history-title"
                  onClick={() => void act(() => runtime.actions.switchConversation(item.id), closeHistory)}
                >
                  {item.title || '未命名会话'}
                </button>
                <div className="assistant-history-item-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id)
                      setTitle(item.title || '')
                    }}
                  >
                    重命名
                  </button>
                  <button type="button" onClick={() => void act(() => runtime.actions.deleteConversation(item.id))}>
                    删除
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {!items.length && <p className="assistant-history-empty">{query.trim() ? '未找到匹配的会话' : '暂无历史会话'}</p>}
    </section>
  )
}

export function FloatingAssistant({ runtime, ui }: { runtime: ChatRuntime; ui: ChatUIOptions }) {
  const ref = useRef<TrChatHTMLElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [viewport, setViewport] = useState({ width: innerWidth, height: innerHeight })
  const [floatingState, setFloatingState] = useState<LayoutFloatingState>(() => ({
    placement: 'center',
    offsetX: 24,
    offsetY: 24,
    width: Math.min(640, innerWidth - 32),
    height: Math.min(760, innerHeight - 32),
  }))
  const savedState = useRef<LayoutFloatingState>(undefined)
  const [headerScope, setHeaderScope] = useState<ChatHeaderSlotProps>()
  const [historyPosition, setHistoryPosition] = useState<CSSProperties>({})
  const historyFrame = useRef<number | undefined>(undefined)
  const placeHistory = () => {
    if (historyFrame.current !== undefined) cancelAnimationFrame(historyFrame.current)
    historyFrame.current = requestAnimationFrame(() => {
      const header = document.querySelector<HTMLElement>('.assistant-window-header')
      const surface = header?.closest<HTMLElement>('.tr-layout--floating')
      if (!header || !surface) return
      const rect = header.getBoundingClientRect()
      const bottom = Math.min(innerHeight, surface.getBoundingClientRect().bottom)
      const width = Math.min(320, rect.width - 24)
      const next = {
        left: rect.right - width - 12,
        top: rect.bottom + 8,
        width,
        maxHeight: Math.max(0, Math.min(560, bottom - rect.bottom - 24)),
        zIndex: (Number.parseInt(getComputedStyle(surface).zIndex) || 1000) + 1,
      }
      setHistoryPosition((current) =>
        Object.keys(next).every((key) => current[key as keyof CSSProperties] === next[key as keyof typeof next])
          ? current
          : next,
      )
    })
  }
  const closeHistory = () => {
    setHistoryOpen(false)
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.assistant-history-trigger')?.focus())
  }
  const close = () => {
    setHistoryOpen(false)
    setOpen(false)
    requestAnimationFrame(() => launcher.current?.focus())
  }
  const toggleMode = () => {
    if (!fullscreen) {
      savedState.current = { ...floatingState }
      setFloatingState({ placement: 'top-left', offsetX: 0, offsetY: 0, width: innerWidth, height: innerHeight })
    } else if (savedState.current) {
      setFloatingState({
        ...savedState.current,
        width: Math.min(savedState.current.width ?? 640, innerWidth - 32),
        height: Math.min(savedState.current.height ?? 760, innerHeight - 32),
      })
    }
    setFullscreen(!fullscreen)
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.assistant-mode-toggle')?.focus())
  }
  const renderers = useMemo<ChatRenderers>(() => {
    const header = fromReact<ChatHeaderSlotProps>((scope) => (
      <WindowHeader
        scope={scope}
        fullscreen={fullscreen}
        historyOpen={historyOpen}
        toggleHistory={() => {
          placeHistory()
          setHistoryOpen(!historyOpen)
        }}
        closeHistory={closeHistory}
        toggleMode={toggleMode}
        close={close}
      />
    ))
    return {
      'layout-header': (scope, lifecycle) => {
        queueMicrotask(() => {
          if (!lifecycle.signal.aborted) setHeaderScope(scope)
        })
        placeHistory()
        return header(scope, lifecycle)
      },
      'bubble-after': fromReact((scope) => {
        const text = replyText(scope)
        return text ? <CopyReply text={text} /> : null
      }),
    }
  }, [runtime, fullscreen, historyOpen, floatingState])
  const chatUI = useMemo<ChatUIOptions>(
    () => ({
      ...ui,
      history: false,
      welcome: {
        ...ui.welcome,
        title: 'TinyRobot',
        description: '你好，我是你的 AI 助手，随时为你解答问题。',
      },
      prompts: { ...ui.prompts, wrap: true },
      layout: {
        ...ui.layout,
        heightMode: 'parent',
        leftAside: false,
        rightAside: { mode: 'drawer', width: 400 },
        emptyState: 'center',
        composer: { welcome: 'footer' },
        panelPadding: 0,
        panelGap: 0,
        surface: {
          mode: open ? 'floating' : 'normal',
          floatingOptions: {
            draggable: !fullscreen,
            resizable: !fullscreen,
            minWidth: fullscreen ? undefined : Math.min(360, viewport.width - 32),
            minHeight: fullscreen ? undefined : Math.min(480, viewport.height - 32),
          },
        },
      },
    }),
    [ui, open, fullscreen, viewport],
  )
  useLayoutEffect(() => {
    const chat = ref.current!
    chat.runtime = runtime
    chat.ui = chatUI
    chat.renderers = renderers
    chat.bubbleRenderers = bubbleRenderers
    chat.floatingState = floatingState
  }, [runtime, chatUI, renderers, floatingState])
  useLayoutEffect(() => {
    const chat = ref.current!
    const update = (event: CustomEvent<[LayoutFloatingState]>) => setFloatingState(event.detail[0])
    chat.addEventListener('floating-state-update', update)
    return () => chat.removeEventListener('floating-state-update', update)
  }, [])
  useLayoutEffect(() => {
    const resize = () => {
      setViewport({ width: innerWidth, height: innerHeight })
      if (fullscreen)
        setFloatingState({ placement: 'top-left', offsetX: 0, offsetY: 0, width: innerWidth, height: innerHeight })
    }
    const keydown = (event: KeyboardEvent) => {
      if (!open || event.key !== 'Escape') return
      if (historyOpen) closeHistory()
      else if (fullscreen) toggleMode()
    }
    const outside = (event: PointerEvent) => {
      if (
        historyOpen &&
        event.target instanceof Element &&
        !event.target.closest('.assistant-window-header, .assistant-history')
      )
        setHistoryOpen(false)
    }
    window.addEventListener('resize', resize)
    window.addEventListener('keydown', keydown)
    window.addEventListener('pointerdown', outside)
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('pointerdown', outside)
    }
  }, [open, fullscreen, historyOpen, floatingState])
  useLayoutEffect(() => {
    placeHistory()
    return () => {
      if (historyFrame.current !== undefined) cancelAnimationFrame(historyFrame.current)
    }
  }, [historyOpen, floatingState, viewport])
  return (
    <>
      {historyOpen &&
        headerScope &&
        createPortal(
          <HistoryPanel scope={headerScope} runtime={runtime} position={historyPosition} closeHistory={closeHistory} />,
          document.body,
        )}
      <section className="floating-assistant-host" hidden={!open} aria-label="AI 助手">
        <tr-chat id="floating-chat" ref={ref} />
      </section>
      <button
        ref={launcher}
        type="button"
        className="assistant-launcher"
        hidden={open}
        aria-label="打开 AI 助手"
        aria-controls="floating-chat"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <img src="/assistant.svg" alt="" />
      </button>
    </>
  )
}
