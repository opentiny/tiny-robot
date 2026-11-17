import { whenTrChatReady } from '@opentiny/tiny-robot-chat/experimental'
import { createChatPreview } from '../chat-preview.js'

/** @param {HTMLElement} root */
export function mountMethodsDemo(root) {
  root.innerHTML = `<div class="demo-workspace"><aside class="demo-controls" aria-label="公开方法控制"><section class="demo-card"><h2>调用元素方法</h2>
    <label>方法输入<input value="通过元素方法发送"></label><div class="demo-buttons"><button data-action="set" disabled>设置输入</button><button data-action="clear" disabled>清空输入</button><button data-action="focus" disabled>聚焦输入</button><button data-action="send" disabled>调用 send</button></div>
    <p class="demo-help">等待元素就绪后操作。send 使用组件的草稿管理与 Runtime，返回发送是否被接受。</p><output data-testid="method-result" role="status">等待操作</output></section></aside><section class="demo-preview" aria-label="聊天预览"></section></div>`
  const preview = createChatPreview(/** @type {HTMLElement} */ (root.querySelector('.demo-preview')))
  const input = /** @type {HTMLInputElement} */ (root.querySelector('input'))
  const result = /** @type {HTMLElement} */ (root.querySelector('[data-testid=method-result]'))
  const controller = new AbortController()
  /** @param {string} action @param {() => void | Promise<void>} run */
  function on(action, run) {
    root.querySelector(`[data-action=${action}]`)?.addEventListener(
      'click',
      () => {
        Promise.resolve()
          .then(run)
          .catch((error) => {
            if (!controller.signal.aborted) result.textContent = String(error)
          })
      },
      { signal: controller.signal },
    )
  }
  function getChat() {
    const element = preview.element
    if (!element) throw new Error('元素尚未挂载')
    return element
  }
  on('set', () => {
    getChat().setInputValue(input.value)
    result.textContent = '已设置输入'
  })
  on('clear', () => {
    getChat().clearInput()
    result.textContent = '已清空输入'
  })
  on('focus', async () => {
    const focused = await getChat().focusInput()
    if (!controller.signal.aborted) result.textContent = `聚焦结果：${focused}`
  })
  on('send', async () => {
    const accepted = await getChat().send({ text: input.value })
    if (!controller.signal.aborted) result.textContent = `发送结果：${accepted}`
  })
  preview.mount()
  void whenTrChatReady(getChat()).then(() => {
    if (!controller.signal.aborted)
      root.querySelectorAll('button').forEach((button) => {
        button.disabled = false
      })
  })
  return () => {
    controller.abort()
    preview.dispose()
  }
}
