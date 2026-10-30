import type { ChatUIData } from '@opentiny/tiny-robot-chat'
import budget from '../../experiments/tr-chat-web-component-build-budget.json'
import matrix from '../../experiments/tr-chat-web-component-matrix.json'
import { mountChatUI } from './shared/mount'
import type { ExperimentalExampleModule } from './shared/types'

function kibibytes(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KiB`
}

const bundleBudget: ExperimentalExampleModule = {
  id: 'bundle-budget',
  summary: '展示生产构建实测值与可执行 gzip 预算；超限会直接使自动化失败。',
  testedInteractions: ['生产构建', 'JS gzip 预算', 'CSS gzip 预算', '自包含 Vue 策略'],
  async mount(host) {
    const actual = matrix.measurements.experimental
    const status = document.createElement('section')
    status.className = 'bundle-budget-demo'
    status.dataset.testid = 'bundle-budget-status'
    status.innerHTML = `
      <div><strong>构建体积预算通过</strong><span>策略：自包含 Web Component（包含 Vue）</span></div>
      <dl>
        <div><dt>JavaScript gzip</dt><dd>${kibibytes(actual.js.gzipBytes)} / ${kibibytes(budget.jsGzipBytes)}</dd></div>
        <div><dt>CSS gzip</dt><dd>${kibibytes(actual.css.gzipBytes)} / ${kibibytes(budget.cssGzipBytes)}</dd></div>
      </dl>
    `
    host.append(status)

    const data: ChatUIData = {
      conversation: { title: '构建预算', items: [], activeId: null },
      bubble: { messages: [{ role: 'assistant', content: '体积预算是发布门禁，不改变原生 TrChatUI 的视觉和交互。' }] },
      sender: { submitDisabled: true },
    }
    const element = await mountChatUI(host, {
      data,
      ui: { layout: { leftAside: false, rightAside: false }, welcome: false, prompts: false, model: false },
    })
    return () => element.remove()
  },
}

export default bundleBudget
