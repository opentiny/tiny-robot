import { shallowRef, type Ref } from 'vue'
import type { ChatCompletion, MessageRequestBody, ResponseProvider } from '@opentiny/tiny-robot-kit'

export type DemoScenario = 'instant' | 'streaming' | 'slow' | 'error' | 'abortable'

export interface DemoEvent {
  id: number
  time: string
  type: 'action' | 'request' | 'response' | 'abort' | 'error'
  label: string
  detail?: unknown
}

export interface DemoScenarioController {
  scenario: Ref<DemoScenario>
  events: Ref<DemoEvent[]>
  record: (type: DemoEvent['type'], label: string, detail?: unknown) => void
  clearEvents: () => void
}

export const demoScenarioOptions: Array<{ value: DemoScenario; label: string; description: string }> = [
  { value: 'instant', label: 'Instant', description: '立即返回完整响应' },
  { value: 'streaming', label: 'Streaming', description: '分块返回，检视流式状态' },
  { value: 'slow', label: 'Slow', description: '延迟后返回完整响应' },
  { value: 'error', label: 'Error', description: '稳定复现请求失败' },
  { value: 'abortable', label: 'Abortable', description: '长流式响应，方便检视取消' },
]

export function useDemoScenarioController(initialScenario: DemoScenario = 'streaming'): DemoScenarioController {
  const scenario = shallowRef<DemoScenario>(initialScenario)
  const events = shallowRef<DemoEvent[]>([])
  let nextId = 1

  function record(type: DemoEvent['type'], label: string, detail?: unknown) {
    events.value = [
      ...events.value,
      {
        id: nextId++,
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        type,
        label,
        detail,
      },
    ].slice(-40)
  }

  function clearEvents() {
    events.value = []
  }

  return {
    scenario,
    events,
    record,
    clearEvents,
  }
}

function getLastUserText(requestBody: MessageRequestBody) {
  const lastMessage = requestBody.messages.at(-1)
  return typeof lastMessage?.content === 'string' ? lastMessage.content : ''
}

function createCompletion(content: string): ChatCompletion {
  return {
    id: 'chat-demo-completion',
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'deterministic-mock',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content,
        },
        delta: undefined,
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  }
}

function createChunk(content: string, isLast: boolean): ChatCompletion {
  return {
    id: 'chat-demo-chunk',
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'deterministic-mock',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: undefined,
        delta: {
          role: 'assistant',
          content,
        },
        logprobs: null,
        finish_reason: isLast ? 'stop' : null,
      },
    ],
  }
}

function createReply(label: string, text: string) {
  return `${label} 回复：${text || '收到'}`
}

function splitReply(reply: string, chunkCount: number) {
  const chunkSize = Math.max(1, Math.ceil(reply.length / chunkCount))
  const chunks: string[] = []

  for (let index = 0; index < reply.length; index += chunkSize) {
    chunks.push(reply.slice(index, index + chunkSize))
  }

  return chunks
}

function waitForDelay(delay: number, abortSignal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (abortSignal.aborted) {
      reject(new DOMException('Demo request aborted', 'AbortError'))
      return
    }

    const timeoutId = window.setTimeout(() => {
      abortSignal.removeEventListener('abort', handleAbort)
      resolve()
    }, delay)

    function handleAbort() {
      window.clearTimeout(timeoutId)
      reject(new DOMException('Demo request aborted', 'AbortError'))
    }

    abortSignal.addEventListener('abort', handleAbort, { once: true })
  })
}

async function* createChunkStream(
  reply: string,
  scenario: 'streaming' | 'abortable',
  abortSignal: AbortSignal,
  controller: DemoScenarioController,
): AsyncGenerator<ChatCompletion> {
  const chunks = splitReply(reply, scenario === 'abortable' ? 10 : 4)
  const delay = scenario === 'abortable' ? 420 : 160

  try {
    for (let index = 0; index < chunks.length; index++) {
      await waitForDelay(delay, abortSignal)
      yield createChunk(chunks[index], index === chunks.length - 1)
    }

    controller.record('response', 'stream completed', { chunks: chunks.length })
  } catch (error) {
    if (abortSignal.aborted) {
      controller.record('abort', 'stream aborted')
    } else {
      controller.record('error', 'stream failed', error)
    }

    throw error
  }
}

export function createDemoResponseProvider(
  label: string,
  controller: DemoScenarioController,
): ResponseProvider<ChatCompletion> {
  return (requestBody, abortSignal) => {
    const scenario = controller.scenario.value
    const text = getLastUserText(requestBody)
    const reply = createReply(label, text)

    controller.record('request', 'responseProvider()', { scenario, text })

    if (scenario === 'streaming' || scenario === 'abortable') {
      return createChunkStream(reply, scenario, abortSignal, controller)
    }

    return (async () => {
      try {
        if (scenario === 'error') {
          await waitForDelay(320, abortSignal)
          throw new Error('Demo response failed by scenario control.')
        }

        if (scenario === 'slow') {
          await waitForDelay(1200, abortSignal)
          controller.record('response', 'slow response completed')
          return createCompletion(reply)
        }

        controller.record('response', 'instant response completed')
        return createCompletion(reply)
      } catch (error) {
        if (abortSignal.aborted) {
          controller.record('abort', 'request aborted')
        } else {
          controller.record('error', 'request failed', error)
        }

        throw error
      }
    })()
  }
}

export async function runExternalDemoResponse(options: {
  label: string
  text: string
  abortSignal: AbortSignal
  controller: DemoScenarioController
  onChunk: (content: string) => void
}) {
  const { abortSignal, controller, label, onChunk, text } = options
  const scenario = controller.scenario.value
  const reply = createReply(label, text)

  controller.record('request', 'custom runtime request', { scenario, text })

  try {
    if (scenario === 'error') {
      await waitForDelay(320, abortSignal)
      throw new Error('Demo response failed by scenario control.')
    }

    if (scenario === 'slow') {
      await waitForDelay(1200, abortSignal)
      onChunk(reply)
      controller.record('response', 'slow response completed')
      return
    }

    if (scenario === 'instant') {
      onChunk(reply)
      controller.record('response', 'instant response completed')
      return
    }

    const chunks = splitReply(reply, scenario === 'abortable' ? 10 : 4)
    const delay = scenario === 'abortable' ? 420 : 160

    for (const chunk of chunks) {
      await waitForDelay(delay, abortSignal)
      onChunk(chunk)
    }

    controller.record('response', 'stream completed', { chunks: chunks.length })
  } catch (error) {
    if (abortSignal.aborted) {
      controller.record('abort', 'custom runtime request aborted')
    } else {
      controller.record('error', 'custom runtime request failed', error)
    }

    throw error
  }
}
