import { describe, expect, it } from 'vitest'
import { useMessage, type ChatCompletion, type ChatMessage, type ResponseProvider } from '@opentiny/tiny-robot-kit'
import { errorStatePlugin } from './errorStatePlugin'

const completion = (content: string): ChatCompletion => ({
  id: `completion-${content}`,
  object: 'chat.completion',
  created: 1,
  model: 'mock',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content },
      delta: undefined,
      logprobs: null,
      finish_reason: 'stop',
    },
  ],
})

const findLastAssistant = (messages: ChatMessage[]) =>
  [...messages].reverse().find((message) => message.role === 'assistant')

describe('errorStatePlugin', () => {
  it('stores a serializable provider error on the current turn last assistant message', async () => {
    const providerError = Object.assign(new Error('provider failed'), { code: 'E_PROVIDER' })
    const responseProvider: ResponseProvider = async function* () {
      yield completion('partial answer')
      throw providerError
    }
    const engine = useMessage({
      responseProvider,
      plugins: [
        {
          onCompletionChunk({ currentMessage }) {
            currentMessage.state = { preserved: true }
          },
        },
        errorStatePlugin(),
      ],
    })

    await expect(engine.sendMessage('fail')).rejects.toBe(providerError)

    expect(findLastAssistant(engine.messages.value)).toMatchObject({
      content: 'partial answer',
      state: {
        preserved: true,
        error: {
          name: 'Error',
          message: 'provider failed',
          code: 'E_PROVIDER',
        },
      },
    })
    expect(findLastAssistant(engine.messages.value)?.state?.error).toEqual({
      name: 'Error',
      message: 'provider failed',
      code: 'E_PROVIDER',
    })
  })

  it('normalizes unknown thrown values without retaining the original object', async () => {
    const providerError: Record<string, unknown> = {}
    providerError.circular = providerError
    const engine = useMessage({
      responseProvider: async () => {
        throw providerError
      },
      plugins: [errorStatePlugin()],
    })

    await expect(engine.sendMessage('fail')).rejects.toBe(providerError)

    expect(findLastAssistant(engine.messages.value)?.state?.error).toEqual({
      message: '[object Object]',
    })
  })

  it('omits unsupported Error code values', async () => {
    const providerError = Object.assign(new Error('provider failed'), { code: { internal: true } })
    const engine = useMessage({
      responseProvider: async () => {
        throw providerError
      },
      plugins: [errorStatePlugin()],
    })

    await expect(engine.sendMessage('fail')).rejects.toBe(providerError)

    expect(findLastAssistant(engine.messages.value)?.state?.error).toEqual({
      name: 'Error',
      message: 'provider failed',
    })
  })

  it('creates an assistant error message when onTurnStart fails before a response exists', async () => {
    const turnError = new Error('turn setup failed')
    const engine = useMessage({
      responseProvider: async () => completion('unused'),
      plugins: [
        {
          onTurnStart() {
            throw turnError
          },
        },
        errorStatePlugin(),
      ],
    })

    await expect(engine.sendMessage('fail')).rejects.toBe(turnError)

    expect(engine.messages.value).toMatchObject([
      { role: 'user', content: 'fail' },
      {
        role: 'assistant',
        content: '',
        state: { error: { name: 'Error', message: 'turn setup failed' } },
      },
    ])
  })

  it('creates an assistant error message when onBeforeRequest fails before a response exists', async () => {
    const requestError = new Error('request setup failed')
    const engine = useMessage({
      responseProvider: async () => completion('unused'),
      plugins: [
        {
          onBeforeRequest() {
            throw requestError
          },
        },
        errorStatePlugin(),
      ],
    })

    await expect(engine.sendMessage('fail')).rejects.toBe(requestError)

    expect(engine.messages.value).toMatchObject([
      { role: 'user', content: 'fail' },
      {
        role: 'assistant',
        content: '',
        state: { error: { name: 'Error', message: 'request setup failed' } },
      },
    ])
  })

  it.each([null, undefined])('skips writes when normalizeError returns %s', async (normalizedError) => {
    const providerError = new Error('provider failed')
    const engine = useMessage({
      responseProvider: async () => {
        throw providerError
      },
      plugins: [errorStatePlugin({ normalizeError: () => normalizedError })],
    })

    await expect(engine.sendMessage('fail')).rejects.toBe(providerError)

    expect(findLastAssistant(engine.messages.value)?.state?.error).toBeUndefined()
  })

  it('does not write errors when disabled', async () => {
    const providerError = new Error('provider failed')
    const engine = useMessage({
      responseProvider: async () => {
        throw providerError
      },
      plugins: [errorStatePlugin({ disabled: true })],
    })

    await expect(engine.sendMessage('fail')).rejects.toBe(providerError)

    expect(findLastAssistant(engine.messages.value)?.state?.error).toBeUndefined()
  })

  it('lets a later same-name disabled plugin replace the default plugin', async () => {
    const providerError = new Error('provider failed')
    const engine = useMessage({
      responseProvider: async () => {
        throw providerError
      },
      plugins: [errorStatePlugin(), errorStatePlugin({ disabled: true })],
    })

    await expect(engine.sendMessage('fail')).rejects.toBe(providerError)

    expect(findLastAssistant(engine.messages.value)?.state?.error).toBeUndefined()
  })
})
