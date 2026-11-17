import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type {
  ChatRenderers,
  ChatSenderContentRendererContext,
  TrChatHTMLElement,
  TrChatUIHTMLElement,
} from '@opentiny/tiny-robot-chat/experimental'
import { SCOPED_MESSAGES, SCOPED_UI } from '../../../web-component-shared/scoped-slots.js'
import { LOCAL_REPLY } from '../../../web-component-shared/data.js'
import { createLocalRuntime } from '../runtime'
import { fromReact } from '../shared/react-renderer'

type Scope<K extends keyof ChatRenderers> = Parameters<NonNullable<ChatRenderers[K]>>[0]
const inputRenderer = fromReact<ChatSenderContentRendererContext>(
  (scope) => (
    <textarea
      aria-label="自定义输入框"
      className="demo-scoped-input"
      value={scope.value}
      disabled={scope.disabled}
      onChange={(event) => scope.setInputValue(event.target.value)}
    />
  ),
  (scope, update) => scope.subscribe(update),
)

export function ScopedSlotsDemo() {
  const [kind, setKind] = useState('chat')
  const [title, setTitle] = useState('产品咨询')
  const [custom, setCustom] = useState(true)
  const [customInput, setCustomInput] = useState(false)
  const [empty, setEmpty] = useState(true)
  const [mounted, setMounted] = useState(true)
  const [messages, setMessages] = useState<readonly { id: string; role: string; content: string }[]>(SCOPED_MESSAGES)
  const chatRef = useRef<TrChatHTMLElement>(null)
  const uiRef = useRef<TrChatUIHTMLElement>(null)
  const baseRenderers = useMemo<ChatRenderers>(
    () => ({
      'layout-header': fromReact<Scope<'layout-header'>>((scope) => (
        <header className="demo-scoped-header">
          <strong>{scope.title}</strong>
          <button
            type="button"
            onClick={() => {
              scope.createConversation()
              setEmpty(true)
            }}
          >
            新建会话
          </button>
        </header>
      )),
      'bubble-prefix': fromReact<Scope<'bubble-prefix'>>((scope) => (
        <small className="demo-message-meta">
          {scope.role === 'assistant' ? '助手' : '用户'} · 消息 {scope.messageIndexes.join(',')}
        </small>
      )),
      'sender-footer': fromReact<Scope<'sender-footer'>>((scope) => (
        <button
          type="button"
          className="demo-scoped-action"
          disabled={scope.disabled || scope.loading}
          onClick={() => scope.insert('请详细说明')}
        >
          插入追问
        </button>
      )),
      'layout-empty-state': fromReact<Scope<'layout-empty-state'>>((scope) => {
        const composer = scope.renderComposer()
        return (
          <section className="demo-scoped-welcome">
            <h2>开始你的产品咨询</h2>
            <p>描述问题，或使用输入区的快捷追问。</p>
            <div
              ref={(node) => {
                if (node && composer && composer.parentNode !== node) node.append(composer)
              }}
            />
          </section>
        )
      }),
    }),
    [],
  )
  const renderers = useMemo<ChatRenderers>(
    () => ({ ...baseRenderers, 'sender-content': customInput ? inputRenderer : undefined }),
    [baseRenderers, customInput],
  )

  useLayoutEffect(() => {
    if (!mounted) return
    const element = kind === 'chat' ? chatRef.current! : uiRef.current!
    element.ui = SCOPED_UI
    const owned = kind === 'chat' ? createLocalRuntime() : undefined
    if (owned) {
      ;(element as TrChatHTMLElement).runtime = owned.runtime
      void owned.runtime.actions.send({ text: '如何接入聊天组件？' })
    }
    const onSubmit = (event: Event) => {
      const [{ text }] = (event as CustomEvent).detail
      setMessages((previous) => [
        ...previous,
        { id: `question-${previous.length}`, role: 'user', content: text },
        { id: `answer-${previous.length}`, role: 'assistant', content: LOCAL_REPLY },
      ])
      element.clearInput()
      setEmpty(false)
    }
    const onCreate = () => {
      setMessages([])
      element.clearInput()
      setEmpty(true)
    }
    if (kind === 'ui') {
      element.addEventListener('submit', onSubmit)
      element.addEventListener('create-conversation', onCreate)
    }
    return () => {
      element.removeEventListener('submit', onSubmit)
      element.removeEventListener('create-conversation', onCreate)
      owned?.release()
    }
  }, [kind, mounted])
  useLayoutEffect(() => {
    const element = kind === 'chat' ? chatRef.current : uiRef.current
    if (!element) return
    element.renderers = custom ? renderers : undefined
    element.isEmpty = empty
  }, [kind, mounted, custom, renderers, empty])
  useLayoutEffect(() => {
    if (kind === 'chat' && chatRef.current) chatRef.current.title = title
    if (kind === 'ui' && uiRef.current) uiRef.current.data = { conversation: { title }, bubble: { messages } }
  }, [kind, mounted, title, messages])
  return (
    <div className="demo-workspace">
      <aside className="demo-controls">
        <section className="demo-card">
          <label>
            组件
            <select value={kind} onChange={(event) => setKind(event.target.value)}>
              <option value="chat">TrChat</option>
              <option value="ui">TrChatUI</option>
            </select>
          </label>
          <label>
            会话标题
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="toggle">
            <input type="checkbox" checked={custom} onChange={(event) => setCustom(event.target.checked)} />
            显示自定义内容
          </label>
          <label className="toggle">
            <input type="checkbox" checked={customInput} onChange={(event) => setCustomInput(event.target.checked)} />
            自定义输入框
          </label>
          <label className="toggle">
            <input type="checkbox" checked={empty} onChange={(event) => setEmpty(event.target.checked)} />
            显示欢迎区
          </label>
          <button type="button" onClick={() => setMounted(!mounted)}>
            {mounted ? '卸载元素' : '挂载元素'}
          </button>
        </section>
      </aside>
      <section className="demo-preview">
        <div className="demo-chat" data-testid="scoped-preview">
          {mounted &&
            (kind === 'chat' ? (
              <tr-chat ref={chatRef} data-scoped-host />
            ) : (
              <tr-chat-ui ref={uiRef} data-scoped-host />
            ))}
        </div>
      </section>
    </div>
  )
}
