import {
  defineTrChatElements,
  whenTrChatReady,
  type TrChatHTMLElement,
  type TrChatUIHTMLElement,
} from '@opentiny/tiny-robot-chat/experimental'
import type { ChatRuntime, ChatUIData, ChatUIOptions } from '@opentiny/tiny-robot-chat'
import { createDemoRuntimeOptions } from './createRuntime'

defineTrChatElements()

export function addControls(host: HTMLElement) {
  const controls = document.createElement('div')
  controls.className = 'tr-chat-experiment-controls'
  controls.dataset.controls = ''
  host.append(controls)
  return controls
}

export function addButton(controls: HTMLElement, label: string, action: () => void | Promise<void>) {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = label
  button.dataset.action = label
  button.addEventListener('click', () => void action())
  controls.append(button)
  return button
}

export function addLog(host: HTMLElement) {
  const log = document.createElement('div')
  log.className = 'tr-chat-experiment-log'
  log.dataset.eventLog = ''
  log.textContent = '等待交互'
  host.append(log)
  return (message: string) => {
    log.textContent = message
  }
}

export async function mountChatUI(
  host: HTMLElement,
  options: {
    data?: Readonly<ChatUIData>
    ui?: Readonly<ChatUIOptions>
    inputValue?: string
    defaultInputValue?: string
    configure?: (element: TrChatUIHTMLElement) => void
  } = {},
) {
  const element = document.createElement('tr-chat-ui') as TrChatUIHTMLElement
  element.data = options.data ?? emptyData()
  element.ui = options.ui
  element.inputValue = options.inputValue
  element.defaultInputValue = options.defaultInputValue
  options.configure?.(element)
  host.append(element)
  await whenTrChatReady(element)
  return element
}

export async function mountChat(
  host: HTMLElement,
  options: {
    runtime?: ChatRuntime
    runtimeOptions?: TrChatHTMLElement['runtimeOptions']
    ui?: Readonly<ChatUIOptions>
    configure?: (element: TrChatHTMLElement) => void
  } = {},
) {
  const element = document.createElement('tr-chat') as TrChatHTMLElement
  element.runtime = options.runtime
  element.runtimeOptions = options.runtimeOptions ?? (options.runtime ? undefined : createDemoRuntimeOptions())
  element.ui = options.ui
  options.configure?.(element)
  host.append(element)
  await whenTrChatReady(element)
  return element
}

export function emptyData(title = 'Web Component Prototype'): ChatUIData {
  return {
    conversation: { title, items: [], activeId: null },
    bubble: { messages: [] },
    sender: { loading: false, disabled: false, submitDisabled: false },
  }
}

export function messageData(title = 'Web Component Prototype'): ChatUIData {
  return {
    conversation: { title, items: [{ id: 'demo', title }], activeId: 'demo' },
    bubble: {
      messages: [
        { role: 'user', content: '请验证 Web Component。' },
        { role: 'assistant', content: '消息渲染、布局和交互均由原 TrChat Vue 组件提供。' },
      ],
    },
    sender: { loading: false, disabled: false, submitDisabled: false },
  }
}

export function createStaticRuntime(overrides: Partial<ChatRuntime> = {}): ChatRuntime {
  const runtime: ChatRuntime = {
    conversations: { value: [] },
    activeConversation: { value: null },
    composer: {},
    actions: {
      send: async () => true,
      clearActiveConversation: () => undefined,
      createConversation: () => undefined,
      switchConversation: () => undefined,
      renameConversation: () => undefined,
      deleteConversation: () => undefined,
    },
    ...overrides,
  }
  return runtime
}
