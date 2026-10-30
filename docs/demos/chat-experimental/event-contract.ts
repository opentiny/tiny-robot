import type { ChatHistoryActionPayload, ChatUIData } from '@opentiny/tiny-robot-chat'
import type { ExperimentalExampleModule } from './shared/types'
import { mountChatUI } from './shared/mount'

const eventContract: ExperimentalExampleModule = {
  id: 'event-contract',
  summary: '通过真实 TrChatUI 交互验证 DOM detail、传播默认值、重复派发和可取消事件。',
  testedInteractions: ['直接 detail', 'bubbles / composed', '重复派发', '可取消 history-action'],
  async mount(host) {
    const inputStatus = document.createElement('p')
    inputStatus.className = 'tr-chat-experiment-status'
    inputStatus.dataset.testid = 'event-contract-input'
    inputStatus.textContent = '等待 input-value-update'

    const cancelStatus = document.createElement('p')
    cancelStatus.className = 'tr-chat-experiment-status'
    cancelStatus.dataset.testid = 'event-contract-cancel'
    cancelStatus.textContent = '等待 history-action'
    host.append(inputStatus, cancelStatus)

    let inputCount = 0
    let historyCount = 0
    const handleInput = (event: Event) => {
      const customEvent = event as CustomEvent<string>
      inputCount += 1
      inputStatus.textContent = [
        `detail=${customEvent.detail}`,
        `bubbles=${customEvent.bubbles}`,
        `composed=${customEvent.composed}`,
        `cancelable=${customEvent.cancelable}`,
        `count=${inputCount}`,
      ].join(' · ')
    }
    const handleHistory = (event: Event) => {
      const customEvent = event as CustomEvent<ChatHistoryActionPayload>
      historyCount += 1
      customEvent.preventDefault()
      cancelStatus.textContent = [
        'history-action',
        `bubbles=${customEvent.bubbles}`,
        `composed=${customEvent.composed}`,
        `cancelable=${customEvent.cancelable}`,
        `prevented=${customEvent.defaultPrevented}`,
        `count=${historyCount}`,
      ].join(' · ')
    }
    host.addEventListener('input-value-update', handleInput)
    host.addEventListener('history-action', handleHistory)

    const data: ChatUIData = {
      conversation: {
        items: [{ id: 'protocol', title: '协议会话' }],
        activeId: 'protocol',
        title: '协议会话',
      },
      bubble: {
        messages: [{ role: 'assistant', content: '输入内容或尝试删除会话，观察 DOM 事件协议。' }],
      },
      sender: { loading: false, disabled: false, submitDisabled: true },
    }
    const element = await mountChatUI(host, {
      data,
      ui: { layout: { rightAside: false } },
      inputValue: '',
    })

    return () => {
      host.removeEventListener('input-value-update', handleInput)
      host.removeEventListener('history-action', handleHistory)
      element.remove()
    }
  },
}

export default eventContract
