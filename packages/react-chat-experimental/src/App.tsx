import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  defineTrChatElements,
  type CreateChatRuntimeOptions,
  type TrChatHTMLElement,
  type TrChatRenderers,
  type TrChatUIHTMLElement,
} from '@opentiny/tiny-robot-chat/experimental'

defineTrChatElements()

type AsidePanel = 'preview' | 'sources'
type FloatingState = NonNullable<TrChatUIHTMLElement['floatingState']>

const runtimeOptions = {
  storageKey: 'tiny-robot-react-contract-probe',
  autoSaveMessages: false,
  responseProvider: async () => ({
    id: 'react-contract-probe',
    object: 'chat.completion' as const,
    created: 1,
    model: 'local-contract-probe',
    system_fingerprint: null,
    choices: [],
  }),
  initialMessages: [
    {
      role: 'assistant',
      content: 'React 只验证公开 Web Component 契约；完整产品应用继续由 Angular 承载。',
    },
  ],
} satisfies CreateChatRuntimeOptions

const ui = {
  layout: {
    leftAside: false,
    rightAside: {
      width: 344,
      panels: [
        { id: 'preview', title: '发布预览' },
        { id: 'sources', title: '参考资料' },
      ],
    },
  },
  sender: false,
} satisfies NonNullable<TrChatHTMLElement['ui']>

const renderers: TrChatRenderers = {
  'layout-right-aside-panel': ({ panelId, activateRightAsidePanel }, lifecycle) => {
    const panel = document.createElement('section')
    const heading = document.createElement('h2')
    heading.textContent = panelId === 'sources' ? 'React 参考资料' : 'React 发布方案'
    const description = document.createElement('p')
    description.textContent =
      panelId === 'sources'
        ? 'Renderer context 的动作会通过 CustomEvent 回写 React state。'
        : 'React state 通过公开 property 控制原生 TrChat 右侧面板。'
    panel.append(heading, description)
    if (panelId === 'sources') {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = '切换到发布预览'
      const activate = () => activateRightAsidePanel('preview')
      button.addEventListener('click', activate)
      lifecycle.signal.addEventListener('abort', () => button.removeEventListener('click', activate), { once: true })
      panel.append(button)
    }
    return panel
  },
}

const floatingData: NonNullable<TrChatUIHTMLElement['data']> = {
  conversation: { activeId: 'react-floating', title: 'React 浮动探针' },
  bubble: {
    messages: [
      {
        role: 'assistant',
        content: '拖动或缩放后，React 会把新的完整 floatingState 写回元素。',
      },
    ],
  },
  sender: { submitDisabled: true },
}

const floatingUi: NonNullable<TrChatUIHTMLElement['ui']> = {
  layout: {
    surface: {
      mode: 'floating',
      floatingOptions: {
        draggable: true,
        resizable: true,
        minWidth: 360,
        maxWidth: 760,
        minHeight: 420,
        maxHeight: 720,
      },
    },
    leftAside: false,
    rightAside: false,
  },
}

export function App() {
  const chatRef = useRef<TrChatHTMLElement>(null)
  const floatingRef = useRef<TrChatUIHTMLElement>(null)
  const [rightAsideOpen, setRightAsideOpen] = useState(false)
  const [activePanelId, setActivePanelId] = useState<AsidePanel>('preview')
  const [floatingOpen, setFloatingOpen] = useState(false)
  const [floatingState, setFloatingState] = useState<FloatingState>({
    placement: 'top-right',
    offsetX: 24,
    offsetY: 72,
    width: 520,
    height: 520,
  })

  useEffect(() => {
    const element = chatRef.current
    if (!element) return

    const updateOpenState = (event: Event) => {
      setRightAsideOpen((event as CustomEvent<boolean>).detail)
    }
    const updateActivePanel = (event: Event) => {
      const panelId = (event as CustomEvent<string | undefined>).detail
      if (panelId === 'preview' || panelId === 'sources') setActivePanelId(panelId)
    }
    element.addEventListener('right-aside-open-update', updateOpenState)
    element.addEventListener('active-right-aside-panel-id-update', updateActivePanel)
    return () => {
      element.removeEventListener('right-aside-open-update', updateOpenState)
      element.removeEventListener('active-right-aside-panel-id-update', updateActivePanel)
    }
  }, [])

  useLayoutEffect(() => {
    const element = chatRef.current
    if (!element) return
    element.runtimeOptions = runtimeOptions
    element.ui = ui
    element.renderers = renderers
    element.rightAsideOpen = rightAsideOpen
    element.activeRightAsidePanelId = activePanelId
  }, [activePanelId, rightAsideOpen])

  useEffect(() => {
    const element = floatingRef.current
    if (!floatingOpen || !element) return

    const updateFloatingState = (event: Event) => {
      setFloatingState({ ...(event as CustomEvent<FloatingState>).detail })
    }
    element.addEventListener('floating-state-update', updateFloatingState)
    return () => element.removeEventListener('floating-state-update', updateFloatingState)
  }, [floatingOpen])

  useLayoutEffect(() => {
    const element = floatingRef.current
    if (!floatingOpen || !element) return
    element.data = floatingData
    element.ui = floatingUi
    element.floatingState = floatingState
  }, [floatingOpen, floatingState])

  return (
    <main className="probe-shell">
      <header>
        <p>React 19 · Compatibility Probe</p>
        <h1>TrChat 跨框架契约探针</h1>
      </header>
      <section className="probe-card" aria-label="React TrChat 探针">
        <tr-chat ref={chatRef} data-testid="react-tr-chat" />
      </section>
      <section className="probe-controls" aria-label="React 受控状态">
        <strong>右侧面板</strong>
        <button type="button" onClick={() => setRightAsideOpen(true)}>
          打开发布预览
        </button>
        <button
          type="button"
          onClick={() => {
            setActivePanelId('sources')
            setRightAsideOpen(true)
          }}
        >
          打开参考资料
        </button>
        <span data-testid="aside-binding-status">
          右侧面板：{rightAsideOpen ? '打开' : '关闭'} · 当前面板：
          {activePanelId === 'sources' ? '参考资料' : '发布预览'}
        </span>
      </section>
      <section className="probe-controls" aria-label="React 浮动状态">
        <strong>浮动状态</strong>
        <button type="button" onClick={() => setFloatingOpen(true)}>
          打开浮动验收
        </button>
        <button type="button" disabled={!floatingOpen} onClick={() => setFloatingOpen(false)}>
          关闭浮动验收
        </button>
        <span data-testid="floating-binding-status">
          浮动窗口：{floatingOpen ? '打开' : '关闭'} · x {floatingState.offsetX}px · y
          {` ${floatingState.offsetY}px · ${floatingState.width} × ${floatingState.height}px`}
        </span>
      </section>
      {floatingOpen ? <tr-chat-ui ref={floatingRef} data-testid="react-floating-chat" /> : null}
    </main>
  )
}
