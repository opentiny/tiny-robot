import { createLocalRuntime } from './runtime.js'

/** @typedef {import('@opentiny/tiny-robot-chat/experimental').TrChatHTMLElement} ChatElement */
/** @typedef {import('@opentiny/tiny-robot-chat/experimental').ChatUIOptions} UIOptions */
/** @typedef {import('@opentiny/tiny-robot-chat').LayoutFloatingState} FloatingState */
/** @type {UIOptions} */
export const BASE_UI = {
  layout: { leftAside: false, rightAside: false, surface: { mode: 'normal' } },
  welcome: { title: '你好，欢迎使用', description: '发送一条消息，体验本地回复。' },
  prompts: false,
  model: false,
  mcp: false,
  sender: { mode: 'multiple', placeholder: '输入消息，点击发送', submitType: 'ctrlEnter' },
}

/**
 * 原生 JS 演示共用的预览；所有元素赋值与监听都由本宿主管理。
 * @param {HTMLElement} root
 * @param {(state: FloatingState) => void} [onFloatingState]
 */
export function createChatPreview(root, onFloatingState) {
  root.innerHTML = `<div class="demo-preview-bar"><strong>真实包 · tr-chat</strong><span class="demo-status" data-testid="ready-state" role="status">等待 Runtime</span></div>
    <div class="demo-chat"></div><section class="demo-card demo-events"><h2>DOM 事件</h2><ol data-testid="event-log" aria-live="polite"></ol></section>`
  const container = /** @type {HTMLElement} */ (root.querySelector('.demo-chat'))
  const status = /** @type {HTMLElement} */ (root.querySelector('[data-testid="ready-state"]'))
  const log = /** @type {HTMLElement} */ (root.querySelector('[data-testid="event-log"]'))
  /** @type {ChatElement | undefined} */
  let chat
  /** @type {ReturnType<typeof createLocalRuntime> | undefined} */
  let owned
  /** @param {Event} event */
  function onEvent(event) {
    const detail = /** @type {CustomEvent} */ (event).detail
    const entry = document.createElement('li')
    entry.textContent = `${event.type} ${JSON.stringify(detail)}`
    log.append(entry)
    if (event.type === 'ready') status.textContent = '已就绪'
    if (event.type === 'floating-state-update') onFloatingState?.(detail[0])
  }
  function unmount() {
    if (chat) {
      chat.removeEventListener('ready', onEvent)
      chat.removeEventListener('floating-state-update', onEvent)
      chat.remove()
    }
    chat = undefined
    owned?.release()
    owned = undefined
    status.textContent = '已卸载'
    container.innerHTML = '<p class="demo-empty">组件已卸载，可重新挂载。</p>'
  }
  return {
    get element() {
      return chat
    },
    /** @param {Partial<ChatElement> & {enabled?: boolean}} [options] */
    mount(options = {}) {
      unmount()
      const { enabled = true, ...properties } = options
      log.replaceChildren()
      status.textContent = '等待 Runtime'
      container.replaceChildren()
      owned = createLocalRuntime()
      chat = /** @type {ChatElement} */ (document.createElement('tr-chat'))
      chat.addEventListener('ready', onEvent)
      chat.addEventListener('floating-state-update', onEvent)
      Object.assign(chat, { title: '我的助手', ui: BASE_UI }, properties)
      if (enabled) chat.runtime = owned.runtime
      container.append(chat)
    },
    /** @param {Partial<ChatElement>} properties */
    update(properties) {
      if (chat) Object.assign(chat, properties)
    },
    connectRuntime() {
      if (chat && owned) chat.runtime = owned.runtime
    },
    unmount,
    dispose() {
      unmount()
      root.replaceChildren()
    },
  }
}
