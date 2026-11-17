import { BASE_UI, createChatPreview } from '../chat-preview.js'

/** @param {HTMLElement} root */
export function mountPropsDemo(root) {
  root.innerHTML = `<div class="demo-workspace"><aside class="demo-controls" aria-label="属性配置"><section class="demo-card"><h2>属性绑定</h2>
    <form><label>标题<input name="title" value="我的助手" required></label><button class="primary">应用标题</button></form>
    <label class="toggle"><input name="header" type="checkbox" checked>显示页头</label><label class="toggle"><input name="empty" type="checkbox">强制空状态</label>
    <small>标题为字符串，ui 为普通对象，isEmpty 为布尔值。输入框使用本地回复，无需密钥。</small></section></aside><section class="demo-preview" aria-label="聊天预览"></section></div>`
  const preview = createChatPreview(/** @type {HTMLElement} */ (root.querySelector('.demo-preview')))
  const title = /** @type {HTMLInputElement} */ (root.querySelector('[name=title]'))
  const header = /** @type {HTMLInputElement} */ (root.querySelector('[name=header]'))
  const empty = /** @type {HTMLInputElement} */ (root.querySelector('[name=empty]'))
  const controller = new AbortController()
  root.querySelector('form')?.addEventListener(
    'submit',
    (event) => {
      event.preventDefault()
      preview.update({ title: title.value })
    },
    { signal: controller.signal },
  )
  header.addEventListener(
    'change',
    () => preview.update({ ui: { ...BASE_UI, header: header.checked ? undefined : false } }),
    { signal: controller.signal },
  )
  empty.addEventListener('change', () => preview.update({ isEmpty: empty.checked ? true : undefined }), {
    signal: controller.signal,
  })
  preview.mount()
  return () => {
    controller.abort()
    preview.dispose()
  }
}
