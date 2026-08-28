import type { ChatCompletion, ResponseProvider } from '@opentiny/tiny-robot-kit'

const characters = [...'这是模拟的流式回复。Kit 会持续合并消息，页面只需要绑定状态和组件。']

export const mockResponseProvider: ResponseProvider = async function* (_, signal) {
  for (const [index, content] of characters.entries()) {
    await new Promise((resolve) => setTimeout(resolve, 40))
    if (signal.aborted) return

    yield {
      id: 'mock-response',
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: 'mock',
      system_fingerprint: null,
      choices: [
        {
          index: 0,
          message: undefined,
          delta: { role: index === 0 ? 'assistant' : undefined, content },
          finish_reason: index === characters.length - 1 ? 'stop' : null,
          logprobs: null,
        },
      ],
    } satisfies ChatCompletion
  }
}
