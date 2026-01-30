import type { ChatCompletion, MessageRequestBody } from '@opentiny/tiny-robot-kit'
import { useMessage } from '@opentiny/tiny-robot-kit'

// 模拟流式：按字符逐个 yield 固定回复内容
async function* mockStream(_requestBody: MessageRequestBody, abortSignal: AbortSignal): AsyncGenerator<ChatCompletion> {
  const reply = '这是一条模拟流式回复，无需真实 API。'
  const id = 'mock-' + Date.now()
  for (let i = 0; i < reply.length && !abortSignal.aborted; i++) {
    await new Promise((r) => setTimeout(r, 30))
    const deltaContent = reply[i]
    yield {
      id,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: 'mock',
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          message: undefined,
          delta: i === 0 ? { role: 'assistant', content: deltaContent } : { content: deltaContent },
          finish_reason: i === reply.length - 1 ? 'stop' : null,
          logprobs: null,
        },
      ],
    }
  }
}

/**
 * useMessage 模拟流式：responseProvider 为 AsyncGenerator，不依赖真实 API
 */
export function useMessageMockStream() {
  return useMessage({
    responseProvider: mockStream,
    initialMessages: [
      {
        content: '本示例使用模拟的 responseProvider，无需真实 API，适合离线开发。',
        role: 'assistant',
      },
    ],
  })
}
