import { BUBBLE_UI, bubbleMessages } from '../../../web-component-shared/bubble-content.js'

/** @param {HTMLElement} root */
export function mountBubbleContentDemo(root) {
  root.innerHTML = `<div class="demo-workspace demo-slot-workspace"><aside class="demo-controls">
    <section class="demo-card"><label>产品名称<input data-setting="title" value="智能助手"></label>
      <button type="button" data-action="append">追加内容</button>
      <button type="button" data-action="mount">卸载元素</button>
    </section><section class="demo-card demo-slot-options"><h2>正文配置</h2>
      <label class="toggle"><input type="checkbox" data-control="product" checked>product-card · 产品正文</label>
      <label class="toggle"><input type="checkbox" data-control="quote">business-quote · 引用正文</label>
      <label class="toggle"><input type="checkbox" data-control="fallback">自定义未匹配正文</label>
      <label class="toggle"><input type="checkbox" data-control="split">按内容项拆分气泡</label>
      <label class="toggle"><input type="checkbox" data-control="fail">模拟产品正文错误</label>
    </section></aside><section class="demo-preview"><div class="demo-chat" data-testid="bubble-preview"></div>
      <section class="demo-card demo-events"><h2>正文事件</h2><output data-testid="bubble-event">尚未选择产品</output>
        <pre data-testid="bubble-state"></pre><p data-testid="bubble-error"></p></section>
    </section></div>`
  const page = new AbortController()
  const title = /** @type {HTMLInputElement} */ (root.querySelector('[data-setting=title]'))
  /** @param {string} name */
  const enabled = (name) => /** @type {HTMLInputElement} */ (root.querySelector(`[data-control="${name}"]`)).checked
  /** @type {import('@opentiny/tiny-robot-chat/experimental').TrChatUIHTMLElement | undefined} */
  let element
  let revision = 0
  /** @type {Record<string, unknown>} */
  let productState = {}
  /** @type {import('@opentiny/tiny-robot-chat/experimental').ChatBubbleContentRendererMatch['renderer']} */
  const productRenderer = (scope, { signal }) => {
    const card = document.createElement('article')
    card.className = 'demo-product-card'
    card.dataset.productCard = ''
    const heading = document.createElement('h3')
    heading.textContent = String(scope.content.title)
    const description = document.createElement('p')
    description.textContent = String(scope.content.description)
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = scope.message.state?.selected ? '已加入清单' : '加入清单'
    button.addEventListener(
      'click',
      () => {
        scope.emit({ name: 'product-select', payload: { title: scope.content.title } })
        scope.setState('selected', true)
      },
      { signal },
    )
    card.append(heading, description, button)
    return card
  }
  /** @type {import('@opentiny/tiny-robot-chat/experimental').ChatBubbleContentRendererMatch['renderer']} */
  const quoteRenderer = (scope) => {
    const quote = document.createElement('blockquote')
    quote.dataset.quoteCard = ''
    quote.textContent = String(scope.content.text)
    return quote
  }
  /** @type {import('@opentiny/tiny-robot-chat/experimental').ChatBubbleContentRendererMatch['renderer']} */
  const fallbackRenderer = (scope) => {
    const text = document.createElement('p')
    text.dataset.contentFallback = ''
    text.textContent = String(scope.content.text ?? scope.content.title ?? scope.content.type)
    return text
  }
  const failedRenderer = () => {
    throw new Error('产品卡片渲染失败')
  }
  function updateData() {
    const messages = bubbleMessages(title.value, revision).map((message) =>
      message.id === 'product' ? { ...message, state: productState } : message,
    )
    if (element) element.data = { conversation: { title: '产品建议' }, bubble: { messages } }
  }
  function configure() {
    if (!element) return
    element.ui = {
      ...BUBBLE_UI,
      bubble: {
        bubbleList: { ...BUBBLE_UI.bubble.bubbleList, contentRenderMode: enabled('split') ? 'split' : 'single' },
      },
    }
    /** @type {import('@opentiny/tiny-robot-chat/experimental').ChatBubbleContentRendererMatch[]} */
    const contentRendererMatches = []
    if (enabled('product'))
      contentRendererMatches.push({
        find: (_message, content) => content.type === 'product-card',
        renderer: enabled('fail') ? failedRenderer : productRenderer,
      })
    if (enabled('quote'))
      contentRendererMatches.push({
        find: (_message, content) => content.type === 'business-quote',
        renderer: quoteRenderer,
      })
    element.bubbleRenderers = {
      contentRendererMatches,
      fallbackContentRenderer: enabled('fallback') ? fallbackRenderer : undefined,
    }
  }
  function mount() {
    element = /** @type {typeof element} */ (document.createElement('tr-chat-ui'))
    if (!element) return
    element.dataset.bubbleDemo = ''
    element.addEventListener('bubble-event', (event) => {
      const [detail] = event.detail
      if (detail.name === 'product-select')
        root.querySelector('[data-testid=bubble-event]')?.replaceChildren(JSON.stringify(detail))
    })
    element.addEventListener('bubble-state-change', (event) => {
      const [detail] = event.detail
      productState = { ...productState, [detail.key]: detail.value }
      root.querySelector('[data-testid=bubble-state]')?.replaceChildren(JSON.stringify(detail))
      updateData()
    })
    element.addEventListener('renderer-error', (event) =>
      root.querySelector('[data-testid=bubble-error]')?.replaceChildren(event.detail[0].name),
    )
    configure()
    updateData()
    root.querySelector('[data-testid=bubble-preview]')?.append(element)
  }
  title.addEventListener('input', updateData, { signal: page.signal })
  root
    .querySelectorAll('[data-control]')
    .forEach((control) => control.addEventListener('change', configure, { signal: page.signal }))
  root.querySelector('[data-action=append]')?.addEventListener(
    'click',
    () => {
      revision++
      updateData()
    },
    { signal: page.signal },
  )
  root.querySelector('[data-action=mount]')?.addEventListener(
    'click',
    (event) => {
      if (element) {
        element.remove()
        element = undefined
      } else mount()
      ;/** @type {HTMLButtonElement} */ (event.currentTarget).textContent = element ? '卸载元素' : '挂载元素'
    },
    { signal: page.signal },
  )
  mount()
  return () => {
    page.abort()
    element?.remove()
    element = undefined
  }
}
