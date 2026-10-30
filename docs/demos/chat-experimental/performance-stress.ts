import type { ChatMessage, ChatUIData } from '@opentiny/tiny-robot-chat'
import { whenTrChatReady, type TrChatUIHTMLElement } from '@opentiny/tiny-robot-chat/experimental'
import { addButton, addControls, mountChatUI } from './shared/mount'
import type { ExperimentalExampleModule } from './shared/types'

const INITIAL_MESSAGES = 20
const STRESS_MESSAGES = 200
const UPDATE_COUNT = 100
const SWAP_COUNT = 30
const REMOUNT_COUNT = 30

function messages(count: number, suffix = ''): ChatMessage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `stress-${suffix}-${index}`,
    role: index % 2 === 0 ? 'user' : 'assistant',
    content: `长会话消息 ${index + 1}${suffix ? ` · ${suffix}` : ''}`,
  }))
}

function data(messageItems: ChatMessage[], activeId = 'long-session'): ChatUIData {
  return {
    conversation: {
      title: '长会话稳定性',
      items: [
        { id: 'long-session', title: '长会话' },
        { id: 'alternate-session', title: '备用会话' },
      ],
      activeId,
    },
    bubble: { messages: messageItems },
    sender: { loading: false, disabled: false, submitDisabled: false },
  }
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

const performanceStress: ExperimentalExampleModule = {
  id: 'performance-stress',
  summary: '按需验证 200 条消息、连续增量更新、会话切换和反复挂载下的布局稳定性。',
  testedInteractions: ['200 条消息', '100 次增量更新', '30 次会话切换', '30 次重挂载'],
  async mount(host) {
    const controls = addControls(host)
    const status = document.createElement('p')
    status.className = 'tr-chat-experiment-status'
    status.dataset.testid = 'performance-status'
    host.append(status)

    let element = await mountChatUI(host, {
      data: data(messages(INITIAL_MESSAGES)),
      ui: { layout: { leftAside: false, rightAside: false } },
    })
    await nextFrame()
    status.textContent = `初始完成 · messages=${INITIAL_MESSAGES}`

    addButton(controls, '执行长会话压力', async () => {
      const startedAt = performance.now()
      let currentMessages = messages(STRESS_MESSAGES, 'stress')
      for (let index = 0; index < UPDATE_COUNT; index += 1) {
        currentMessages = [
          ...currentMessages.slice(0, -1),
          { ...currentMessages.at(-1)!, content: `连续更新 ${index + 1}` },
        ]
        element.data = data(currentMessages)
        if ((index + 1) % 10 === 0) await nextFrame()
      }
      for (let index = 0; index < SWAP_COUNT; index += 1) {
        element.data = data(currentMessages, index % 2 === 0 ? 'alternate-session' : 'long-session')
        if ((index + 1) % 10 === 0) await nextFrame()
      }
      await nextFrame()
      status.textContent = [
        '长会话压力完成',
        `messages=${STRESS_MESSAGES}`,
        `updates=${UPDATE_COUNT}`,
        `swaps=${SWAP_COUNT}`,
        `duration=${Math.round(performance.now() - startedAt)}ms`,
      ].join(' · ')
    })

    addButton(controls, '执行重挂载压力', async () => {
      const startedAt = performance.now()
      for (let index = 0; index < REMOUNT_COUNT; index += 1) {
        element.remove()
        element = document.createElement('tr-chat-ui') as TrChatUIHTMLElement
        element.data = data(messages(20, `remount-${index + 1}`))
        element.ui = { layout: { leftAside: false, rightAside: false } }
        host.append(element)
        await whenTrChatReady(element)
      }
      await nextFrame()
      status.textContent = [
        '重挂载压力完成',
        `remounts=${REMOUNT_COUNT}`,
        `layouts=${element.querySelectorAll('.tr-layout').length}`,
        `duration=${Math.round(performance.now() - startedAt)}ms`,
      ].join(' · ')
    })

    return () => element.remove()
  },
}

export default performanceStress
