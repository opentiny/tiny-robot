import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type {
  ChatBubbleContentRendererContext,
  ChatBubbleContentRendererMatch,
  ChatBubbleRenderers,
  TrChatUIHTMLElement,
} from '@opentiny/tiny-robot-chat/experimental'
import { BUBBLE_UI, bubbleMessages } from '../../../web-component-shared/bubble-content.js'
import { fromReact } from '../shared/react-renderer'

const productRenderer = fromReact<ChatBubbleContentRendererContext>((scope) => (
  <article className="demo-product-card" data-product-card>
    <h3>{String(scope.content.title)}</h3>
    <p>{String(scope.content.description)}</p>
    <button
      type="button"
      onClick={() => {
        scope.emit({ name: 'product-select', payload: { title: scope.content.title } })
        scope.setState('selected', true)
      }}
    >
      {scope.message.state?.selected ? '已加入清单' : '加入清单'}
    </button>
  </article>
))
const quoteRenderer = fromReact<ChatBubbleContentRendererContext>((scope) => (
  <blockquote data-quote-card>{String(scope.content.text)}</blockquote>
))
const fallbackRenderer = fromReact<ChatBubbleContentRendererContext>((scope) => (
  <p data-content-fallback>{String(scope.content.text ?? scope.content.title ?? scope.content.type)}</p>
))
const failedRenderer = () => {
  throw new Error('产品卡片渲染失败')
}

export function BubbleContentDemo() {
  const [title, setTitle] = useState('智能助手')
  const [revision, setRevision] = useState(0)
  const [mounted, setMounted] = useState(true)
  const [product, setProduct] = useState(true)
  const [quote, setQuote] = useState(false)
  const [fallback, setFallback] = useState(false)
  const [split, setSplit] = useState(false)
  const [fail, setFail] = useState(false)
  const [productState, setProductState] = useState<Record<string, unknown>>({})
  const [lastEvent, setLastEvent] = useState('尚未选择产品')
  const [lastState, setLastState] = useState('')
  const [error, setError] = useState('')
  const ref = useRef<TrChatUIHTMLElement>(null)
  const renderers = useMemo<ChatBubbleRenderers>(() => {
    const contentRendererMatches: ChatBubbleContentRendererMatch[] = []
    if (product)
      contentRendererMatches.push({
        find: (_message, content) => content.type === 'product-card',
        renderer: fail ? failedRenderer : productRenderer,
      })
    if (quote)
      contentRendererMatches.push({
        find: (_message, content) => content.type === 'business-quote',
        renderer: quoteRenderer,
      })
    return { contentRendererMatches, fallbackContentRenderer: fallback ? fallbackRenderer : undefined }
  }, [product, quote, fallback, fail])
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const onEvent = (event: Event) => {
      const [detail] = (event as CustomEvent).detail
      if (detail.name === 'product-select') setLastEvent(JSON.stringify(detail))
    }
    const onState = (event: Event) => {
      const [detail] = (event as CustomEvent).detail
      setLastState(JSON.stringify(detail))
      setProductState((state) => ({ ...state, [detail.key]: detail.value }))
    }
    const onError = (event: Event) => setError((event as CustomEvent).detail[0].name)
    element.addEventListener('bubble-event', onEvent)
    element.addEventListener('bubble-state-change', onState)
    element.addEventListener('renderer-error', onError)
    return () => {
      element.removeEventListener('bubble-event', onEvent)
      element.removeEventListener('bubble-state-change', onState)
      element.removeEventListener('renderer-error', onError)
    }
  }, [mounted])
  useLayoutEffect(() => {
    if (!ref.current) return
    ref.current.ui = {
      ...BUBBLE_UI,
      bubble: { bubbleList: { ...BUBBLE_UI.bubble.bubbleList, contentRenderMode: split ? 'split' : 'single' } },
    }
    ref.current.bubbleRenderers = renderers
  }, [mounted, split, renderers])
  useLayoutEffect(() => {
    if (ref.current)
      ref.current.data = {
        conversation: { title: '产品建议' },
        bubble: {
          messages: bubbleMessages(title, revision).map((message) =>
            message.id === 'product' ? { ...message, state: productState } : message,
          ),
        },
      }
  }, [mounted, title, revision, productState])
  return (
    <div className="demo-workspace demo-slot-workspace">
      <aside className="demo-controls">
        <section className="demo-card">
          <label>
            产品名称
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <button type="button" onClick={() => setRevision(revision + 1)}>
            追加内容
          </button>
          <button type="button" onClick={() => setMounted(!mounted)}>
            {mounted ? '卸载元素' : '挂载元素'}
          </button>
        </section>
        <section className="demo-card demo-slot-options">
          <h2>正文配置</h2>
          <label className="toggle">
            <input type="checkbox" checked={product} onChange={(event) => setProduct(event.target.checked)} />
            product-card · 产品正文
          </label>
          <label className="toggle">
            <input type="checkbox" checked={quote} onChange={(event) => setQuote(event.target.checked)} />
            business-quote · 引用正文
          </label>
          <label className="toggle">
            <input type="checkbox" checked={fallback} onChange={(event) => setFallback(event.target.checked)} />
            自定义未匹配正文
          </label>
          <label className="toggle">
            <input type="checkbox" checked={split} onChange={(event) => setSplit(event.target.checked)} />
            按内容项拆分气泡
          </label>
          <label className="toggle">
            <input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} />
            模拟产品正文错误
          </label>
        </section>
      </aside>
      <section className="demo-preview">
        <div className="demo-chat" data-testid="bubble-preview">
          {mounted && <tr-chat-ui ref={ref} data-bubble-demo />}
        </div>
        <section className="demo-card demo-events">
          <h2>正文事件</h2>
          <output data-testid="bubble-event">{lastEvent}</output>
          <pre data-testid="bubble-state">{lastState}</pre>
          <p data-testid="bubble-error">{error}</p>
        </section>
      </section>
    </div>
  )
}
