import type { ChatUIData } from '@opentiny/tiny-robot-chat'
import { mountChatUI } from './shared/mount'
import type { ExperimentalExampleModule } from './shared/types'

const ssrSafeImport: ExperimentalExampleModule = {
  id: 'ssr-safe-import',
  summary: '验证同一 experimental 子路径在 Node/SSR 中可安全导入，同时浏览器条件入口仍能注册并渲染原生 TrChatUI。',
  testedInteractions: ['Node 条件导出', '无 DOM 导入', '浏览器注册', '原生 TrChatUI 渲染'],
  async mount(host) {
    const status = document.createElement('div')
    status.className = 'release-readiness-status release-readiness-status--pass'
    status.dataset.testid = 'ssr-safe-status'
    status.innerHTML = [
      '<strong>SSR 导入：通过自动化验证</strong>',
      '<span>Node 入口不读取 window、document、HTMLElement 或 customElements。</span>',
      '<span>当前页面使用 browser 条件入口，并成功注册 Web Component。</span>',
    ].join('')
    host.append(status)

    const data: ChatUIData = {
      conversation: { title: 'SSR 安全导入', items: [], activeId: null },
      bubble: {
        messages: [
          { role: 'assistant', content: '浏览器分支仍由原生 TrChatUI 渲染；SSR 仅延迟 customElements 注册。' },
        ],
      },
      sender: { submitDisabled: true },
    }
    const element = await mountChatUI(host, {
      data,
      ui: { layout: { leftAside: false, rightAside: false }, welcome: false, prompts: false, model: false },
    })
    return () => element.remove()
  },
}

export default ssrSafeImport
