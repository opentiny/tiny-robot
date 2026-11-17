import { BASE_UI, createChatPreview } from '../chat-preview.js'
import { INITIAL_FLOATING } from '../../../web-component-shared/data.js'

/** @param {HTMLElement} root */
export function mountFloatingDemo(root) {
  root.innerHTML = `<div class="demo-workspace"><aside class="demo-controls" aria-label="浮窗配置"><section class="demo-card"><h2>浮窗配置</h2>
    <label class="toggle"><input name="floating" type="checkbox" checked>浮窗模式</label>
    <form><label>浮窗位置<select name="placement"><option value="bottom-right">右下</option><option value="top-right">右上</option><option value="top-left">左上</option><option value="bottom-left">左下</option><option value="center">居中</option></select></label>
    <div class="demo-grid"><label>浮窗宽度<input name="width" type="number" value="500" min="320" required></label><label>浮窗高度<input name="height" type="number" value="400" min="300" required></label><label>横向偏移<input name="offsetX" type="number" value="24" min="0" required></label><label>纵向偏移<input name="offsetY" type="number" value="24" min="0" required></label></div><button>应用浮窗状态</button></form>
    <p class="demo-help">拖动浮窗顶部手柄可更新状态；切换模式会重建聊天，清空对话。</p></section></aside><section class="demo-preview" aria-label="聊天预览"></section></div>`
  /** @typedef {import('@opentiny/tiny-robot-chat').LayoutFloatingState} FloatingState */
  /** @type {FloatingState} */
  let state = { ...INITIAL_FLOATING }
  const preview = createChatPreview(/** @type {HTMLElement} */ (root.querySelector('.demo-preview')), (next) => {
    state = next
    preview.update({ floatingState: next })
  })
  /** @param {string} name */
  const input = (name) => /** @type {HTMLInputElement} */ (root.querySelector(`[name=${name}]`))
  const mode = input('floating')
  const controller = new AbortController()
  function mount() {
    preview.mount({
      ui: { ...BASE_UI, layout: { ...BASE_UI.layout, surface: { mode: mode.checked ? 'floating' : 'normal' } } },
      floatingState: state,
    })
  }
  mode.addEventListener('change', mount, { signal: controller.signal })
  root.querySelector('form')?.addEventListener(
    'submit',
    (event) => {
      event.preventDefault()
      state = {
        placement: /** @type {FloatingState['placement']} */ (input('placement').value),
        width: input('width').valueAsNumber,
        height: input('height').valueAsNumber,
        offsetX: input('offsetX').valueAsNumber,
        offsetY: input('offsetY').valueAsNumber,
      }
      preview.update({ floatingState: state })
    },
    { signal: controller.signal },
  )
  mount()
  return () => {
    controller.abort()
    preview.dispose()
  }
}
