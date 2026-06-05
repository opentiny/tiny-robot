import type { ToolCall } from '../../../types'
import type { ChatCompletion, MessageRequestBody, ResponseProvider } from '../types'

type ItemOrItems<T> = T | Array<T>

export type MockContent =
  | ItemOrItems<string>
  | ItemOrItems<{ content: string; reasoning_content?: string } | { content?: string; reasoning_content: string }>

export interface MockResponseStep {
  content?: string
  reasoning_content?: string
  finish_reason?: string | null
  tool_calls?: ToolCall[]
  onRequest?: (requestBody: MessageRequestBody) => void
}

async function* mockStreamOneAssistantReply(content: MockContent): AsyncGenerator<ChatCompletion> {
  const contents = Array.isArray(content) ? content : [content]
  const createdAt = Math.floor(Date.now() / 1000)

  for (let index = 0; index < contents.length; index++) {
    const item = contents[index]

    yield {
      id: 'test-chunk',
      object: 'chat.completion.chunk',
      created: createdAt,
      model: 'mock',
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          message: undefined,
          delta: { role: 'assistant', ...(typeof item === 'string' ? { content: item } : item) },
          logprobs: null,
          finish_reason: index === contents.length - 1 ? 'stop' : null,
        },
      ],
    }
  }
}

export function mockResponseProvider(content: MockContent): ResponseProvider {
  return async () => mockStreamOneAssistantReply(content)
}

function createMockCompletion(step: MockResponseStep, index: number) {
  return {
    id: `test-completion-${index + 1}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'mock',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          ...(step.content !== undefined ? { content: step.content } : {}),
          ...(step.reasoning_content !== undefined ? { reasoning_content: step.reasoning_content } : {}),
          ...(step.tool_calls !== undefined ? { tool_calls: step.tool_calls } : {}),
        },
        delta: undefined,
        logprobs: null,
        finish_reason: step.finish_reason ?? 'stop',
      },
    ],
  }
}

export function mockSequentialResponseProvider(steps: MockResponseStep[]): ResponseProvider {
  let requestCount = 0

  return async (requestBody) => {
    const step = steps[requestCount]

    if (!step) {
      throw new Error(`No mock response step for request #${requestCount + 1}`)
    }

    step.onRequest?.(requestBody)
    requestCount += 1

    return createMockCompletion(step, requestCount - 1)
  }
}
