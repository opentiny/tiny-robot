import { PROMPT_GROUPS, SLOT_UI } from '../../../web-component-shared/ordinary-slots.js'
import { createLocalRuntime } from '../runtime.js'

/** @param {HTMLElement} root */
export function mountOrdinarySlotsDemo(root) {
  root.innerHTML = `<div class="demo-workspace"><aside class="demo-controls"><section class="demo-card">
    <label>组件<select data-control="kind"><option value="chat">TrChat</option><option value="ui">TrChatUI</option></select></label>
    <label>咨询主题<input value="产品接入"></label>
    <label class="toggle"><input type="checkbox" data-control="visibility" checked>显示 Slot 内容</label>
    <div class="demo-buttons"><button data-action="empty">切换空状态</button><button data-action="mount">卸载元素</button></div>
    </section></aside><section class="demo-preview"><div class="demo-chat" data-testid="slot-preview"></div></section></div>`
  const controller = new AbortController()
  const signal = controller.signal
  const preview = /** @type {HTMLElement} */ (root.querySelector('[data-testid=slot-preview]'))
  const input = /** @type {HTMLInputElement} */ (root.querySelector('input:not([type=checkbox])'))
  let owned = createLocalRuntime()
  /** @type {HTMLElement & Record<string, any> | undefined} */
  let element
  let projectionController = new AbortController()
  let showContent = true
  let empty = true
  let promptGroup = 0
  let updateTopic = () => {}
  let updateVisibility = () => {}
  function uiOptions() {
    return { ...SLOT_UI, prompts: { items: PROMPT_GROUPS[promptGroup] } }
  }
  function mount() {
    const kind = /** @type {HTMLSelectElement} */ (root.querySelector('[data-control=kind]')).value
    element = document.createElement(kind === 'chat' ? 'tr-chat' : 'tr-chat-ui')
    element.dataset.slotHost = ''
    element.ui = uiOptions()
    element.isEmpty = empty
    if (kind === 'chat') element.runtime = owned.runtime
    element.innerHTML = `
      <div slot="welcome-footer"><p class="demo-welcome-footer">支持产品咨询、接入指导与问题排查。</p></div>
      <div slot="prompts-footer"><div class="demo-prompts-footer"><button type="button">换一组问题</button></div></div>
      <div slot="sender-header"><p class="demo-sender-note">正在咨询：<strong></strong></p></div>
      <div slot="input-prefix"><span class="demo-input-badge" aria-label="助手">AI</span></div>`
    const welcome = /** @type {HTMLElement} */ (element.querySelector('[slot=welcome-footer]'))
    const prompts = /** @type {HTMLElement} */ (element.querySelector('[slot=prompts-footer]'))
    const sender = /** @type {HTMLElement} */ (element.querySelector('[slot=sender-header]'))
    const prefix = /** @type {HTMLElement} */ (element.querySelector('[slot=input-prefix]'))
    const promptsContent = /** @type {HTMLElement} */ (prompts.firstElementChild)
    const senderContent = /** @type {HTMLElement} */ (sender.firstElementChild)
    updateTopic = () => {
      senderContent.querySelector('strong')?.replaceChildren(input.value)
    }
    updateVisibility = () => {
      if (showContent) element?.append(welcome, prompts, sender, prefix)
      else {
        welcome.remove()
        prompts.remove()
        sender.remove()
        prefix.remove()
      }
    }
    projectionController = new AbortController()
    promptsContent.querySelector('button')?.addEventListener(
      'click',
      () => {
        promptGroup = (promptGroup + 1) % PROMPT_GROUPS.length
        if (element) element.ui = uiOptions()
      },
      { signal: projectionController.signal },
    )
    updateTopic()
    updateVisibility()
    preview.append(element)
  }
  function unmount() {
    projectionController.abort()
    updateTopic = () => {}
    updateVisibility = () => {}
    element?.remove()
    element = undefined
    owned.release()
  }
  root.querySelector('[data-control=kind]')?.addEventListener(
    'change',
    () => {
      unmount()
      owned = createLocalRuntime()
      mount()
    },
    { signal },
  )
  input.addEventListener('input', () => updateTopic(), { signal })
  root.querySelector('[data-control=visibility]')?.addEventListener(
    'change',
    (event) => {
      showContent = /** @type {HTMLInputElement} */ (event.currentTarget).checked
      updateVisibility()
    },
    { signal },
  )
  root.querySelector('[data-action=empty]')?.addEventListener(
    'click',
    () => {
      empty = !empty
      if (element) element.isEmpty = empty
    },
    { signal },
  )
  root.querySelector('[data-action=mount]')?.addEventListener(
    'click',
    (event) => {
      if (element) unmount()
      else {
        owned = createLocalRuntime()
        mount()
      }
      ;/** @type {HTMLButtonElement} */ (event.currentTarget).textContent = element ? '卸载元素' : '挂载元素'
    },
    { signal },
  )
  mount()
  return () => {
    controller.abort()
    unmount()
  }
}
