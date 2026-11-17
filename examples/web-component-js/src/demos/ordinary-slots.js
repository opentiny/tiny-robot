import { PROMPT_GROUPS, SLOT_UI } from '../../../web-component-shared/ordinary-slots.js'
import { createLocalRuntime } from '../runtime.js'

/** @param {HTMLElement} root */
export function mountOrdinarySlotsDemo(root) {
  root.innerHTML = `<div class="demo-workspace demo-slot-workspace"><aside class="demo-controls"><section class="demo-card">
    <label>组件<select data-control="kind"><option value="chat">TrChat</option><option value="ui">TrChatUI</option></select></label>
    <label class="toggle"><input type="checkbox" data-control="empty" checked>显示欢迎区</label>
    <p class="demo-help">welcome-footer、prompts-footer 在欢迎区显示。</p>
    <button data-action="mount">卸载元素</button>
    </section><section class="demo-card demo-slot-options"><h2>Slot 配置</h2>
    <label class="toggle"><input type="checkbox" data-slot="welcome-footer" >welcome-footer · 欢迎区页脚</label>
    <label>welcome-footer 内容<input data-setting="welcomeText" value="支持产品咨询、接入指导与问题排查。"></label>
    <label class="toggle"><input type="checkbox" data-slot="prompts-footer" >prompts-footer · 提示词页脚</label>
    <label class="toggle"><input type="checkbox" data-slot="sender-header" checked>sender-header · 输入区顶部</label>
    <label>咨询主题<input data-setting="topic" value="产品接入" ></label>
    <label class="toggle"><input type="checkbox" data-slot="input-prefix" >input-prefix · 输入框前缀</label>
    <label>input-prefix 标识<input data-setting="badge" value="AI"></label>
    <label class="toggle"><input type="checkbox" data-slot="sender-footer" >sender-footer · 输入区底部</label>
    <label>sender-footer 内容<input data-setting="footerText" value="请勿发送密码等敏感信息。"></label>
    <label class="toggle"><input type="checkbox" data-slot="sender-footer-right" >sender-footer-right · 输入区右下角</label>
    <label>sender-footer-right 内容<input data-setting="footerRightText" value="Enter 发送"></label>
    </section></aside><section class="demo-preview"><div class="demo-chat" data-testid="slot-preview"></div></section></div>`
  const controller = new AbortController()
  const signal = controller.signal
  const preview = /** @type {HTMLElement} */ (root.querySelector('[data-testid=slot-preview]'))
  const input = /** @type {HTMLInputElement} */ (root.querySelector('[data-setting=topic]'))
  let owned = createLocalRuntime()
  /** @type {HTMLElement & Record<string, any> | undefined} */
  let element
  let projectionController = new AbortController()
  let empty = true
  let promptGroup = 0
  let updateContent = () => {}
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
      <div slot="input-prefix"><span class="demo-input-badge" aria-label="助手">AI</span></div>
      <div slot="sender-footer"><small class="demo-sender-hint"></small></div>
      <div slot="sender-footer-right"><small class="demo-sender-hint"></small></div>`
    const welcome = /** @type {HTMLElement} */ (element.querySelector('[slot=welcome-footer]'))
    const prompts = /** @type {HTMLElement} */ (element.querySelector('[slot=prompts-footer]'))
    const sender = /** @type {HTMLElement} */ (element.querySelector('[slot=sender-header]'))
    const prefix = /** @type {HTMLElement} */ (element.querySelector('[slot=input-prefix]'))
    const footer = /** @type {HTMLElement} */ (element.querySelector('[slot=sender-footer]'))
    const footerRight = /** @type {HTMLElement} */ (element.querySelector('[slot=sender-footer-right]'))
    const promptsContent = /** @type {HTMLElement} */ (prompts.firstElementChild)
    const senderContent = /** @type {HTMLElement} */ (sender.firstElementChild)
    updateContent = () => {
      senderContent.querySelector('strong')?.replaceChildren(input.value)
      welcome.querySelector('p')?.replaceChildren(setting('welcomeText').value)
      prefix.querySelector('span')?.replaceChildren(setting('badge').value)
      footer.querySelector('small')?.replaceChildren(setting('footerText').value)
      footerRight.querySelector('small')?.replaceChildren(setting('footerRightText').value)
    }
    updateVisibility = () => {
      if (toggle('welcome-footer').checked) {
        if (!element?.contains(welcome)) element?.append(welcome)
      } else welcome.remove()
      if (toggle('prompts-footer').checked) {
        if (!element?.contains(prompts)) element?.append(prompts)
      } else prompts.remove()
      if (toggle('sender-header').checked) {
        if (!element?.contains(sender)) element?.append(sender)
      } else sender.remove()
      if (toggle('input-prefix').checked) {
        if (!element?.contains(prefix)) element?.append(prefix)
      } else prefix.remove()
      if (toggle('sender-footer').checked) {
        if (!element?.contains(footer)) element?.append(footer)
      } else footer.remove()
      if (toggle('sender-footer-right').checked) {
        if (!element?.contains(footerRight)) element?.append(footerRight)
      } else footerRight.remove()
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
    updateContent()
    updateVisibility()
    preview.append(element)
  }
  function unmount() {
    projectionController.abort()
    updateContent = () => {}
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
  /** @param {string} name */
  function setting(name) {
    return /** @type {HTMLInputElement} */ (root.querySelector(`[data-setting="${name}"]`))
  }
  /** @param {string} name */
  function toggle(name) {
    return /** @type {HTMLInputElement} */ (root.querySelector(`[data-slot="${name}"]`))
  }
  root
    .querySelectorAll('[data-setting]')
    .forEach((field) => field.addEventListener('input', () => updateContent(), { signal }))
  root.querySelectorAll('[data-slot]').forEach((control) =>
    control.addEventListener(
      'change',
      () => {
        updateVisibility()
      },
      { signal },
    ),
  )
  root.querySelector('[data-control=empty]')?.addEventListener(
    'change',
    (event) => {
      empty = /** @type {HTMLInputElement} */ (event.currentTarget).checked
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
