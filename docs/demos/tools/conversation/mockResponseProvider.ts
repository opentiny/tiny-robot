import type { ChatCompletion, MessageRequestBody } from '@opentiny/tiny-robot-kit'

/**
 * Mock stream: simulates AI response without real API
 */
export async function* mockResponseProvider(
  _requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
): AsyncGenerator<ChatCompletion> {
  const reply = '这是模拟回复，无需真实 API。你可以切换会话、创建新对话体验完整流程。'
  const id = 'mock-' + Date.now()
  for (let i = 0; i < reply.length && !abortSignal.aborted; i++) {
    await new Promise((r) => setTimeout(r, 150))
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
