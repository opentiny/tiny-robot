import { SCOPED_MESSAGES, SCOPED_UI } from '../../../web-component-shared/scoped-slots.js'
import { LOCAL_REPLY } from '../../../web-component-shared/data.js'
import { createLocalRuntime } from '../runtime.js'

/** @param {HTMLElement} root */
export function mountScopedSlotsDemo(root) {
  root.innerHTML = `<div class="demo-workspace demo-slot-workspace"><aside class="demo-controls"><section class="demo-card">
    <label>组件<select data-control="kind"><option value="chat">TrChat</option><option value="ui">TrChatUI</option></select></label>
    <label>会话标题<input value="产品咨询"></label>
    <label class="toggle"><input type="checkbox" data-control="empty" checked>显示欢迎区</label>
    <p class="demo-help">关闭欢迎区可查看消息 Slot。</p>
    <button type="button" data-action="mount">卸载元素</button>
    </section><section class="demo-card demo-slot-options"><h2>Slot 配置</h2>
    <label class="toggle"><input type="checkbox" data-slot="layout-header" checked>layout-header · 页头与会话操作</label>
    <label class="toggle"><input type="checkbox" data-slot="layout-empty-state" >layout-empty-state · 欢迎区与原生输入区</label>
    <label>layout-empty-state 标题<input data-setting="welcomeTitle" value="开始你的产品咨询"></label>
    <label class="toggle"><input type="checkbox" data-slot="bubble-prefix" >bubble-prefix · 消息前缀</label>
    <label class="toggle"><input type="checkbox" data-slot="bubble-suffix" >bubble-suffix · 消息发送状态</label>
    <label class="toggle"><input type="checkbox" data-slot="bubble-content-footer" >bubble-content-footer · 消息内容来源</label>
    <label>bubble-content-footer 来源<input data-setting="sourceText" value="产品知识库"></label>
    <label class="toggle"><input type="checkbox" data-slot="composer-before" >composer-before · 输入区上方草稿</label>
    <label class="toggle"><input type="checkbox" data-slot="sender-content" >sender-content · 自定义输入框</label>
    <label class="toggle"><input type="checkbox" data-slot="sender-footer" >sender-footer · 输入区追问按钮</label>
    <label>sender-footer 追问内容<input data-setting="followup" value="请详细说明"></label>
    <label class="toggle"><input type="checkbox" data-slot="sender-footer-right" >sender-footer-right · 输入区聚焦按钮</label>
    </section></aside><section class="demo-preview"><div class="demo-chat" data-testid="scoped-preview"></div></section></div>`
  const page = new AbortController()
  const preview = /** @type {HTMLElement} */ (root.querySelector('[data-testid=scoped-preview]'))
  const title = /** @type {HTMLInputElement} */ (root.querySelector('input:not([type=checkbox])'))
  const kind = /** @type {HTMLSelectElement} */ (root.querySelector('[data-control=kind]'))
  const empty = /** @type {HTMLInputElement} */ (root.querySelector('[data-control=empty]'))
  /** @type {{id: string, role: string, content: string}[]} */
  let messages = SCOPED_MESSAGES.map((message) => ({ ...message }))
  /** @type {HTMLElement & Record<string, any> | undefined} */
  let element
  /** @type {ReturnType<typeof createLocalRuntime> | undefined} */
  let owned
  /** @param {string} name */
  function setting(name) {
    return /** @type {HTMLInputElement} */ (root.querySelector(`[data-setting="${name}"]`))
  }
  /** @param {string} name */
  function toggle(name) {
    return /** @type {HTMLInputElement} */ (root.querySelector(`[data-slot="${name}"]`))
  }
  let disposeSettings = () => {}
  let updateRenderers = () => {}
  function updateData() {
    if (!element) return
    if (kind.value === 'chat') element.title = title.value
    else element.data = { conversation: { title: title.value }, bubble: { messages } }
  }
  function mount() {
    element = document.createElement(kind.value === 'chat' ? 'tr-chat' : 'tr-chat-ui')
    element.dataset.scopedHost = ''
    element.ui = SCOPED_UI
    element.isEmpty = empty.checked
    if (kind.value === 'chat') {
      owned = createLocalRuntime()
      element.runtime = owned.runtime
      void owned.runtime.actions.send({ text: '如何接入聊天组件？' })
    } else {
      element.addEventListener('submit', (event) => {
        if (!(event instanceof CustomEvent)) return
        const [{ text }] = event.detail
        messages = [
          ...messages,
          { id: `question-${messages.length}`, role: 'user', content: text },
          { id: `answer-${messages.length}`, role: 'assistant', content: LOCAL_REPLY },
        ]
        updateData()
        element?.clearInput()
        empty.checked = false
        if (element) element.isEmpty = false
      })
      element.addEventListener('create-conversation', () => {
        messages = []
        updateData()
        element?.clearInput()
      })
    }
    /** @type {import('@opentiny/tiny-robot-chat/experimental').ChatRenderers} */
    const base = {
      'layout-header': (scope, { signal }) => {
        const header = document.createElement('header')
        header.className = 'demo-scoped-header'
        const heading = document.createElement('strong')
        heading.textContent = scope.title
        const button = document.createElement('button')
        button.type = 'button'
        button.textContent = '新建会话'
        button.addEventListener(
          'click',
          () => {
            scope.createConversation()
            empty.checked = true
            if (element) element.isEmpty = true
          },
          { signal },
        )
        header.append(heading, button)
        return header
      },
      'bubble-prefix': (scope) => {
        const meta = document.createElement('small')
        meta.className = 'demo-message-meta'
        meta.textContent = `${scope.role === 'assistant' ? '助手' : '用户'} · 消息 ${scope.messageIndexes.join(',')}`
        return meta
      },
      'bubble-suffix': (scope) => {
        const status = document.createElement('small')
        status.className = 'demo-message-status'
        status.textContent = scope.role === 'assistant' ? '已回复' : '已发送'
        return status
      },
      'bubble-content-footer': (scope) => {
        const source = document.createElement('small')
        source.className = 'demo-message-source'
        source.textContent = `${setting('sourceText').value} · 消息 ${scope.messageIndexes.join(',')}`
        return source
      },
      'composer-before': (scope) => {
        const context = document.createElement('p')
        context.className = 'demo-composer-context'
        context.textContent = `当前草稿：${scope.value || '尚未输入'}`
        return context
      },
      'sender-footer-right': (scope, { signal }) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'demo-scoped-action'
        button.textContent = '聚焦输入框'
        button.disabled = scope.disabled
        button.addEventListener('click', () => void scope.focus(), { signal })
        return button
      },
      'sender-footer': (scope, { signal }) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'demo-scoped-action'
        button.textContent = '插入追问'
        button.disabled = scope.disabled || scope.loading
        button.addEventListener('click', () => scope.insert(setting('followup').value), { signal })
        return button
      },
      'layout-empty-state': (scope) => {
        const section = document.createElement('section')
        section.className = 'demo-scoped-welcome'
        const heading = document.createElement('h2')
        heading.textContent = setting('welcomeTitle').value
        const description = document.createElement('p')
        description.textContent = '描述问题，或使用输入区的快捷追问。'
        section.append(heading, description)
        const composer = scope.renderComposer()
        if (composer) section.append(composer)
        return section
      },
    }
    /** @type {import('@opentiny/tiny-robot-chat/experimental').ChatRenderers['sender-content']} */
    const inputRenderer = (scope, { signal }) => {
      const input = document.createElement('textarea')
      input.className = 'demo-scoped-input'
      input.setAttribute('aria-label', '自定义输入框')
      const unsubscribe = scope.subscribe(({ value, disabled }) => {
        if (input.value !== value) input.value = value
        input.disabled = disabled
      })
      input.addEventListener('input', () => scope.setInputValue(input.value), { signal })
      signal.addEventListener('abort', unsubscribe, { once: true })
      return input
    }
    let welcomeRenderer = base['layout-empty-state']
    let footerRenderer = base['sender-footer']
    let sourceRenderer = base['bubble-content-footer']
    updateRenderers = () => {
      if (element)
        element.renderers = {
          'layout-header': toggle('layout-header').checked ? base['layout-header'] : undefined,
          'layout-empty-state': toggle('layout-empty-state').checked ? welcomeRenderer : undefined,
          'bubble-prefix': toggle('bubble-prefix').checked ? base['bubble-prefix'] : undefined,
          'bubble-suffix': toggle('bubble-suffix').checked ? base['bubble-suffix'] : undefined,
          'bubble-content-footer': toggle('bubble-content-footer').checked ? sourceRenderer : undefined,
          'composer-before': toggle('composer-before').checked ? base['composer-before'] : undefined,
          'sender-content': toggle('sender-content').checked ? inputRenderer : undefined,
          'sender-footer': toggle('sender-footer').checked ? footerRenderer : undefined,
          'sender-footer-right': toggle('sender-footer-right').checked ? base['sender-footer-right'] : undefined,
        }
    }
    // Configuration changes refresh their own Renderer, preserving other host views.
    const rendererSettings = new AbortController()
    root.querySelectorAll('[data-setting]').forEach((field) =>
      field.addEventListener(
        'input',
        () => {
          if (!element) return
          if (field === setting('followup') && toggle('sender-footer').checked)
            footerRenderer = (scope, lifecycle) => base['sender-footer']?.(scope, lifecycle) ?? null
          if (field === setting('welcomeTitle') && toggle('layout-empty-state').checked)
            welcomeRenderer = (scope, lifecycle) => base['layout-empty-state']?.(scope, lifecycle) ?? null
          if (field === setting('sourceText') && toggle('bubble-content-footer').checked)
            sourceRenderer = (scope, lifecycle) => base['bubble-content-footer']?.(scope, lifecycle) ?? null
          updateRenderers()
        },
        { signal: rendererSettings.signal },
      ),
    )
    disposeSettings = () => rendererSettings.abort()
    updateData()
    updateRenderers()
    preview.append(element)
  }
  function unmount() {
    disposeSettings()
    element?.remove()
    element = undefined
    owned?.release()
    owned = undefined
    updateRenderers = () => {}
  }
  title.addEventListener('input', updateData, { signal: page.signal })
  root.querySelectorAll('[data-slot]').forEach((control) =>
    control.addEventListener(
      'change',
      () => {
        updateRenderers()
      },
      { signal: page.signal },
    ),
  )
  empty.addEventListener(
    'change',
    () => {
      if (element) element.isEmpty = empty.checked
    },
    { signal: page.signal },
  )
  kind.addEventListener(
    'change',
    () => {
      unmount()
      mount()
    },
    { signal: page.signal },
  )
  root.querySelector('[data-action=mount]')?.addEventListener(
    'click',
    (event) => {
      if (element) unmount()
      else mount()
      ;/** @type {HTMLButtonElement} */ (event.currentTarget).textContent = element ? '卸载元素' : '挂载元素'
    },
    { signal: page.signal },
  )
  mount()
  return () => {
    page.abort()
    unmount()
  }
}
