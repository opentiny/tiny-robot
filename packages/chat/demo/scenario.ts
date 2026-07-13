import type { ChatCompletion, MessageRequestBody, ResponseProvider } from '@opentiny/tiny-robot-kit'

export function createDemoReply(label: string, text: string) {
  return `${label} 回复：${text || '收到'}`
}

export function createDemoResponseProvider(label: string): ResponseProvider<ChatCompletion> {
  return (requestBody: MessageRequestBody) => {
    const lastMessage = requestBody.messages.at(-1)
    const text = typeof lastMessage?.content === 'string' ? lastMessage.content : ''

    return Promise.resolve({
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
            content: createDemoReply(label, text),
          },
          delta: undefined,
          logprobs: null,
          finish_reason: 'stop',
        },
      ],
    })
  }
}
