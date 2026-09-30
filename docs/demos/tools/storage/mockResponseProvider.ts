import type { ChatCompletion, MessageRequestBody } from '@opentiny/tiny-robot-kit'

export async function* mockResponseProvider(
  _requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
): AsyncGenerator<ChatCompletion> {
  const reply = '这是一条本地模拟回复，可以直接观察消息保存结果。'

  for (let index = 0; index < reply.length && !abortSignal.aborted; index += 1) {
    await new Promise((resolve) => setTimeout(resolve, 30))
    if (abortSignal.aborted) return
    const content = reply[index]

    yield {
      id: 'storage-demo-response',
      object: 'chat.completion.chunk',
      created: 0,
      model: 'mock',
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          message: undefined,
          delta: index === 0 ? { role: 'assistant', content } : { content },
          finish_reason: index === reply.length - 1 ? 'stop' : null,
          logprobs: null,
        },
      ],
    }
  }
}
