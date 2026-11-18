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
  const [slots, setSlots] = useState({
    header: true,
    welcome: false,
    prefix: false,
    suffix: false,
    source: false,
    before: false,
    input: false,
    footer: false,
    footerRight: false,
  })
  const [followup, setFollowup] = useState('请详细说明')
  const [welcomeTitle, setWelcomeTitle] = useState('开始你的产品咨询')
  const [sourceText, setSourceText] = useState('产品知识库')
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
      'bubble-suffix': fromReact<Scope<'bubble-suffix'>>((scope) => (
        <small className="demo-message-status">{scope.role === 'assistant' ? '已回复' : '已发送'}</small>
      )),
      'composer-before': fromReact<Scope<'composer-before'>>((scope) => (
        <p className="demo-composer-context">当前草稿：{scope.value || '尚未输入'}</p>
      )),
      'sender-footer-right': fromReact<Scope<'sender-footer-right'>>((scope) => (
        <button
          type="button"
          className="demo-scoped-action"
          disabled={scope.disabled}
          onClick={() => void scope.focus()}
        >
          聚焦输入框
        </button>
      )),
    }),
    [],
  )
  const sourceRenderer = useMemo(
    () =>
      fromReact<Scope<'bubble-content-footer'>>((scope) => (
        <small className="demo-message-source">
          {sourceText} · 消息 {scope.messageIndexes.join(',')}
        </small>
      )),
    [sourceText],
  )
  const footerRenderer = useMemo(
    () =>
      fromReact<Scope<'sender-footer'>>((scope) => (
        <button
          type="button"
          className="demo-scoped-action"
          disabled={scope.disabled || scope.loading}
          onClick={() => scope.insert(followup)}
        >
          插入追问
        </button>
      )),
    [followup],
  )
  const welcomeRenderer = useMemo(
    () =>
      fromReact<Scope<'layout-empty-state'>>((scope) => {
        const composer = scope.renderComposer()
        return (
          <section className="demo-scoped-welcome">
            <h2>{welcomeTitle}</h2>
            <p>描述问题，或使用输入区的快捷追问。</p>
            <div
              ref={(node) => {
                if (node && composer && composer.parentNode !== node) node.append(composer)
              }}
            />
          </section>
        )
      }),
    [welcomeTitle],
  )
  const renderers = useMemo<ChatRenderers>(
    () => ({
      'layout-header': slots.header ? baseRenderers['layout-header'] : undefined,
      'layout-empty-state': slots.welcome ? welcomeRenderer : undefined,
      'bubble-prefix': slots.prefix ? baseRenderers['bubble-prefix'] : undefined,
      'bubble-suffix': slots.suffix ? baseRenderers['bubble-suffix'] : undefined,
      'bubble-content-footer': slots.source ? sourceRenderer : undefined,
      'composer-before': slots.before ? baseRenderers['composer-before'] : undefined,
      'sender-content': slots.input ? inputRenderer : undefined,
      'sender-footer': slots.footer ? footerRenderer : undefined,
      'sender-footer-right': slots.footerRight ? baseRenderers['sender-footer-right'] : undefined,
    }),
    [baseRenderers, slots, sourceRenderer, footerRenderer, welcomeRenderer],
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
      owned?.dispose()
    }
  }, [kind, mounted])
  useLayoutEffect(() => {
    const element = kind === 'chat' ? chatRef.current : uiRef.current
    if (!element) return
    element.renderers = renderers
    element.isEmpty = empty
  }, [kind, mounted, renderers, empty])
  useLayoutEffect(() => {
    if (kind === 'chat' && chatRef.current) chatRef.current.title = title
    if (kind === 'ui' && uiRef.current) uiRef.current.data = { conversation: { title }, bubble: { messages } }
  }, [kind, mounted, title, messages])
  return (
    <div className="demo-workspace demo-slot-workspace">
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
            <input type="checkbox" checked={empty} onChange={(event) => setEmpty(event.target.checked)} />
            显示欢迎区
          </label>
          <p className="demo-help">关闭欢迎区可查看消息 Slot。</p>
          <button type="button" onClick={() => setMounted(!mounted)}>
            {mounted ? '卸载元素' : '挂载元素'}
          </button>
        </section>
        <section className="demo-card demo-slot-options">
          <h2>Slot 配置</h2>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.header}
              onChange={(event) => setSlots({ ...slots, header: event.target.checked })}
            />
            layout-header · 页头与会话操作
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.welcome}
              onChange={(event) => setSlots({ ...slots, welcome: event.target.checked })}
            />
            layout-empty-state · 欢迎区与原生输入区
          </label>
          <label>
            layout-empty-state 标题
            <input value={welcomeTitle} onChange={(event) => setWelcomeTitle(event.target.value)} />
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.prefix}
              onChange={(event) => setSlots({ ...slots, prefix: event.target.checked })}
            />
            bubble-prefix · 消息前缀
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.suffix}
              onChange={(event) => setSlots({ ...slots, suffix: event.target.checked })}
            />
            bubble-suffix · 消息发送状态
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.source}
              onChange={(event) => setSlots({ ...slots, source: event.target.checked })}
            />
            bubble-content-footer · 消息内容来源
          </label>
          <label>
            bubble-content-footer 来源
            <input value={sourceText} onChange={(event) => setSourceText(event.target.value)} />
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.before}
              onChange={(event) => setSlots({ ...slots, before: event.target.checked })}
            />
            composer-before · 输入区上方草稿
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.input}
              onChange={(event) => setSlots({ ...slots, input: event.target.checked })}
            />
            sender-content · 自定义输入框
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.footer}
              onChange={(event) => setSlots({ ...slots, footer: event.target.checked })}
            />
            sender-footer · 输入区追问按钮
          </label>
          <label>
            sender-footer 追问内容
            <input value={followup} onChange={(event) => setFollowup(event.target.value)} />
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={slots.footerRight}
              onChange={(event) => setSlots({ ...slots, footerRight: event.target.checked })}
            />
            sender-footer-right · 输入区聚焦按钮
          </label>
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
