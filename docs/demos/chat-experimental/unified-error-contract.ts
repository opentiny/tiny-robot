import type { MessageRequestBody, ResponseProvider } from '@opentiny/tiny-robot-kit'
import {
  dispatchTrChatError,
  type TrChatErrorDetail,
  type TrChatHTMLElement,
} from '@opentiny/tiny-robot-chat/experimental'
import { addButton, addControls, mountChat } from './shared/mount'
import { createDemoRuntimeOptions } from './shared/createRuntime'
import type { ExperimentalExampleModule } from './shared/types'

function completion(content: string) {
  return {
    id: 'unified-error-recovery',
    object: 'chat.completion' as const,
    created: 1,
    model: 'local-demo',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: { role: 'assistant' as const, content },
        delta: undefined,
        logprobs: null,
        finish_reason: 'stop' as const,
      },
    ],
  }
}

const unifiedErrorContract: ExperimentalExampleModule = {
  id: 'unified-error-contract',
  summary: '验证 Runtime、Renderer、网络/适配器及宿主回调统一为稳定的 tr-chat-error，同时保留旧错误事件。',
  testedInteractions: ['runtime', 'renderer', 'network/adapter', 'host callback', '恢复发送'],
  async mount(host) {
    let shouldFail = true
    const responseProvider: ResponseProvider = async (request: MessageRequestBody) => {
      if (shouldFail) throw new Error('模拟 Runtime 请求失败')
      const text = String(request.messages.at(-1)?.content ?? '')
      return completion(`恢复成功：${text}`)
    }
    const controls = addControls(host)
    const panel = document.createElement('section')
    panel.className = 'unified-error-demo'
    panel.dataset.testid = 'unified-error-panel'
    const headline = document.createElement('strong')
    headline.textContent = '尚未触发错误'
    const fields = document.createElement('code')
    fields.textContent = 'source=— · code=— · recoverable=—'
    const count = document.createElement('span')
    count.textContent = '统一事件 0 次'
    panel.append(headline, fields, count)
    host.append(panel)

    let eventCount = 0
    const renderDetail = (detail: TrChatErrorDetail) => {
      eventCount += 1
      panel.classList.remove('unified-error-demo--recovered')
      panel.classList.add('unified-error-demo--failed')
      headline.textContent = `已捕获：${detail.source}`
      fields.textContent = `source=${detail.source} · code=${detail.code} · recoverable=${detail.recoverable}`
      count.textContent = `统一事件 ${eventCount} 次`
    }

    const element: TrChatHTMLElement = await mountChat(host, {
      runtimeOptions: createDemoRuntimeOptions({ responseProvider }),
      ui: { layout: { leftAside: false, rightAside: false }, welcome: false, prompts: false, model: false },
      configure(target) {
        target.addEventListener('tr-chat-error', (event) => renderDetail(event.detail))
      },
    })

    addButton(controls, '触发 Runtime 错误', () => element.send({ text: '失败请求' }))
    addButton(controls, '触发 Renderer 错误', async () => {
      element.renderers = {
        'layout-header': () => {
          throw new Error('模拟 Renderer 失败')
        },
      }
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
      element.renderers = undefined
    })
    addButton(controls, '上报网络错误', () =>
      dispatchTrChatError(element, {
        source: 'network',
        code: 'network_unavailable',
        cause: new Error('模拟网络不可用'),
        recoverable: true,
      }),
    )
    addButton(controls, '上报宿主回调错误', () =>
      dispatchTrChatError(element, {
        source: 'host',
        code: 'host_callback_failed',
        cause: new Error('模拟 Angular 宿主回调失败'),
        recoverable: true,
      }),
    )
    addButton(controls, '恢复并发送', async () => {
      shouldFail = false
      const sent = await element.send({ text: '恢复验证' })
      panel.classList.remove('unified-error-demo--failed')
      panel.classList.add('unified-error-demo--recovered')
      headline.textContent = sent ? '恢复成功：同一元素继续可用' : '恢复等待中'
      fields.textContent = '旧事件保留 · tr-chat-error 契约稳定 · 无需重建元素'
    })

    return () => element.remove()
  },
}

export default unifiedErrorContract
