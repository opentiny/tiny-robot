import type { ChatCompletion, ResponseProvider } from '@opentiny/tiny-robot-kit'

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
