import type { ChatCompletion, ChatCompletionChunk, ResponseProvider } from '@opentiny/tiny-robot-kit'

export const mockResponseProvider: ResponseProvider = async (request) => {
  const prompt = String(request.messages.at(-1)?.content ?? '')
  const completion: ChatCompletion = {
    id: 'web-component-demo',
    object: 'chat.completion',
    created: 1,
    model: 'mock-web-component',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: `Web Component 已收到：${prompt}` },
        delta: undefined,
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  }
  return completion
}

export const mockStreamingResponseProvider: ResponseProvider = async function* (_request, signal) {
  const chunks = ['Web Component ', '流式响应', '已完成']

  for (const [index, content] of chunks.entries()) {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(resolve, 150)
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeout)
          reject(new DOMException('Request aborted', 'AbortError'))
        },
        { once: true },
      )
    })
    yield {
      id: 'web-component-stream',
      object: 'chat.completion.chunk',
      created: 1,
      model: 'mock-web-component',
      choices: [
        {
          index: 0,
          delta: { role: 'assistant', content },
          finish_reason: index === chunks.length - 1 ? 'stop' : null,
        },
      ],
    } as ChatCompletionChunk
  }
}
