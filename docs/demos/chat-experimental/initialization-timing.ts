import type { ChatUIData, ChatUIOptions } from '@opentiny/tiny-robot-chat'
import {
  TrChatUIElement,
  whenTrChatReady,
  type TrChatRenderers,
  type TrChatUIHTMLElement,
} from '@opentiny/tiny-robot-chat/experimental'
import { addButton, addControls } from './shared/mount'
import type { ExperimentalExampleModule } from './shared/types'

const timingTag = 'tr-chat-ui-timing'

const initializationTiming: ExperimentalExampleModule = {
  id: 'initialization-timing',
  summary: '验证延迟注册、升级前 Property、连接后写入、ready 一次性和重连后的公开方法。',
  testedInteractions: ['延迟注册', 'pre-upgrade property', 'ready once', '公开方法', '断开重连'],
  async mount(host) {
    const controls = addControls(host)
    const status = document.createElement('p')
    status.className = 'tr-chat-experiment-status'
    status.dataset.testid = 'initialization-status'
    status.textContent = '未注册 · ready=0 · pre-upgrade property=待验证'
    host.append(status)

    const data: ChatUIData = {
      conversation: { items: [], activeId: null, title: '初始化时序' },
      bubble: { messages: [] },
      sender: { loading: false, disabled: false, submitDisabled: true },
    }
    const ui: ChatUIOptions = {
      layout: {
        leftAside: false,
        rightAside: { panels: [{ id: 'preview', title: '初始化面板' }] },
      },
      welcome: { title: '初始化完成', description: '升级前数据和连接后状态均由原版 TrChatUI 渲染。' },
      prompts: false,
      model: false,
    }
    const renderers: TrChatRenderers = {
      'layout-right-aside-panel': ({ panelId }) => {
        const panel = document.createElement('p')
        panel.textContent = `公开方法已打开：${panelId ?? 'none'}`
        return panel
      },
    }
    const element = document.createElement(timingTag) as TrChatUIHTMLElement
    element.data = data
    element.ui = ui
    element.renderers = renderers
    element.activeRightAsidePanelId = 'missing'
    element.setAttribute('input-value', '升级前草稿')
    element.setAttribute('right-aside-open', '')

    let readyCount = 0
    let rightAsideUpdateCount = 0
    let activePanelBeforeUpdate: string | undefined
    let activePanelUpdateCount = 0
    element.addEventListener('ready', () => {
      readyCount += 1
    })
    element.addEventListener('right-aside-open-update', (event) => {
      rightAsideUpdateCount += 1
      element.rightAsideOpen = (event as CustomEvent<boolean>).detail
    })
    element.addEventListener('active-right-aside-panel-id-update', (event) => {
      activePanelBeforeUpdate ??= element.activeRightAsidePanelId
      activePanelUpdateCount += 1
      element.activeRightAsidePanelId = (event as CustomEvent<string | undefined>).detail
    })
    const readyBeforeUpgrade = whenTrChatReady(element)
    host.append(element)

    addButton(controls, '执行延迟注册', async () => {
      if (!customElements.get(timingTag)) {
        customElements.define(timingTag, class extends TrChatUIElement {})
      }
      await customElements.whenDefined(timingTag)
      await readyBeforeUpgrade
      status.textContent = [
        '已升级',
        `ready=${readyCount}`,
        `data=${element.data === data ? '保留' : '丢失'}`,
        `renderers=${element.renderers === renderers ? '保留' : '丢失'}`,
        `input=${element.inputValue}`,
        `initialPanel=${activePanelBeforeUpdate}`,
        `panel=${element.activeRightAsidePanelId}`,
        `panelUpdates=${activePanelUpdateCount}`,
        `rightAsideOpen=${element.rightAsideOpen}`,
        `layouts=${element.querySelectorAll('.tr-layout').length}`,
      ].join(' · ')
    })

    addButton(controls, '连接后写入 Property', async () => {
      await whenTrChatReady(element)
      element.inputValue = '连接后草稿'
      element.rightAsideOpen = false
      await Promise.resolve()
      status.textContent = `连接后写入 · input=${element.inputValue} · rightAsideOpen=${element.rightAsideOpen} · ready=${readyCount}`
    })

    addButton(controls, '调用公开方法', async () => {
      await whenTrChatReady(element)
      element.openRightAside('preview')
      await Promise.resolve()
      status.textContent = `公开方法 · rightAsideOpen=${element.rightAsideOpen} · rightUpdates=${rightAsideUpdateCount} · ready=${readyCount}`
    })

    addButton(controls, '移除并重新连接', async () => {
      element.remove()
      host.append(element)
      await whenTrChatReady(element)
      await new Promise((resolve) => window.setTimeout(resolve, 0))
      status.textContent = `已重连 · ready=${readyCount} · input=${element.inputValue}`
    })

    return () => element.remove()
  },
}

export default initializationTiming
