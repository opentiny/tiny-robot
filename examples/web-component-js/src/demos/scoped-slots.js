import { SCOPED_MESSAGES, SCOPED_UI } from '../../../web-component-shared/scoped-slots.js'
import { LOCAL_REPLY } from '../../../web-component-shared/data.js'
import { createLocalRuntime } from '../runtime.js'

/** @param {HTMLElement} root */
export function mountScopedSlotsDemo(root) {
  root.innerHTML = `<div class="demo-workspace"><aside class="demo-controls"><section class="demo-card">
    <label>组件<select data-control="kind"><option value="chat">TrChat</option><option value="ui">TrChatUI</option></select></label>
    <label>会话标题<input value="产品咨询"></label>
    <label class="toggle"><input type="checkbox" data-control="custom" checked>显示自定义内容</label>
    <label class="toggle"><input type="checkbox" data-control="input">自定义输入框</label>
    <label class="toggle"><input type="checkbox" data-control="empty" checked>显示欢迎区</label>
    <button type="button" data-action="mount">卸载元素</button>
    </section></aside><section class="demo-preview"><div class="demo-chat" data-testid="scoped-preview"></div></section></div>`
  const page = new AbortController()
  const preview = /** @type {HTMLElement} */ (root.querySelector('[data-testid=scoped-preview]'))
  const title = /** @type {HTMLInputElement} */ (root.querySelector('input:not([type=checkbox])'))
  const kind = /** @type {HTMLSelectElement} */ (root.querySelector('[data-control=kind]'))
  const custom = /** @type {HTMLInputElement} */ (root.querySelector('[data-control=custom]'))
  const customInput = /** @type {HTMLInputElement} */ (root.querySelector('[data-control=input]'))
  const empty = /** @type {HTMLInputElement} */ (root.querySelector('[data-control=empty]'))
  /** @type {{id: string, role: string, content: string}[]} */
  let messages = SCOPED_MESSAGES.map((message) => ({ ...message }))
  /** @type {HTMLElement & Record<string, any> | undefined} */
  let element
  /** @type {ReturnType<typeof createLocalRuntime> | undefined} */
  let owned
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
      'sender-footer': (scope, { signal }) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'demo-scoped-action'
        button.textContent = '插入追问'
        button.disabled = scope.disabled || scope.loading
        button.addEventListener('click', () => scope.insert('请详细说明'), { signal })
        return button
      },
      'layout-empty-state': (scope) => {
        const section = document.createElement('section')
        section.className = 'demo-scoped-welcome'
        section.innerHTML = '<h2>开始你的产品咨询</h2><p>描述问题，或使用输入区的快捷追问。</p>'
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
    updateRenderers = () => {
      if (element)
        element.renderers = custom.checked
          ? { ...base, 'sender-content': customInput.checked ? inputRenderer : undefined }
          : undefined
    }
    updateData()
    updateRenderers()
    preview.append(element)
  }
  function unmount() {
    element?.remove()
    element = undefined
    owned?.release()
    owned = undefined
    updateRenderers = () => {}
  }
  title.addEventListener('input', updateData, { signal: page.signal })
  custom.addEventListener('change', () => updateRenderers(), { signal: page.signal })
  customInput.addEventListener('change', () => updateRenderers(), { signal: page.signal })
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
