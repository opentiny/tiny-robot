import { createChatPreview } from '../chat-preview.js'

/** @param {HTMLElement} root */
export function mountRuntimeDemo(root) {
  root.innerHTML = `<div class="demo-workspace"><aside class="demo-controls" aria-label="Runtime 控制"><section class="demo-card"><h2>生命周期</h2>
    <div class="demo-buttons"><button data-action="late">延后接入</button><button data-action="connect" disabled>接入 Runtime</button><button data-action="unmount">卸载组件</button><button data-action="mount">重新挂载</button></div>
    <p class="demo-help">延后接入会创建一个尚未绑定 Runtime 的元素。重新挂载创建独立的 Runtime。</p></section></aside><section class="demo-preview" aria-label="聊天预览"></section></div>`
  const preview = createChatPreview(/** @type {HTMLElement} */ (root.querySelector('.demo-preview')))
  const connect = /** @type {HTMLButtonElement} */ (root.querySelector('[data-action=connect]'))
  const unmount = /** @type {HTMLButtonElement} */ (root.querySelector('[data-action=unmount]'))
  const controller = new AbortController()
  const signal = controller.signal
  root.querySelector('[data-action=late]')?.addEventListener(
    'click',
    () => {
      preview.mount({ enabled: false })
      connect.disabled = false
      unmount.disabled = false
    },
    { signal },
  )
  connect.addEventListener(
    'click',
    () => {
      preview.connectRuntime()
      connect.disabled = true
    },
    { signal },
  )
  unmount.addEventListener(
    'click',
    () => {
      preview.unmount()
      connect.disabled = true
      unmount.disabled = true
    },
    { signal },
  )
  root.querySelector('[data-action=mount]')?.addEventListener(
    'click',
    () => {
      preview.mount()
      connect.disabled = true
      unmount.disabled = false
    },
    { signal },
  )
  preview.mount()
  return () => {
    controller.abort()
    preview.dispose()
  }
}
