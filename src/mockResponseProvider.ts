import type { ChatCompletion, ResponseProvider } from '@opentiny/tiny-robot-kit'

const defaultReply = '这是模拟的流式回复。Kit 会持续合并消息，页面只需要绑定状态和组件。'
const longReply =
  '这是用于演示多会话隔离的长回复。当前会话会持续接收字符，切换到其他会话后仍会保持自己的消息和请求状态。'
    .repeat(20)
    .slice(0, 300)

export const mockResponseProvider: ResponseProvider = async function* ({ messages }, signal) {
  const prompt = messages.at(-1)?.content
  const reply = typeof prompt === 'string' && prompt.startsWith('/long') ? longReply : defaultReply
  const characters = [...reply]

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
