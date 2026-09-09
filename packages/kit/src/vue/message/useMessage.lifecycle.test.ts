import { describe, expect, it } from 'vitest'
import type { ChatMessage } from '../../types'
import type { ChatCompletion, MessageRequestBody, ResponseProvider } from './types'
import { useMessage } from './useMessage'

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

describe('useMessage lifecycle', () => {
  it('exposes reactive lifecycle context and plugin-produced messages to consumers', async () => {
    let requestBody: MessageRequestBody | undefined
    let turnId: string | null = null
    let requestTurnId: string | null = null
    let turnStartedWith: string | undefined
    let initializedWith: string | undefined
    let turnEndedAs: string | undefined
    let finalizedAs: string | undefined
    const responseProvider: ResponseProvider = async (body) => {
      requestBody = structuredClone(body)
      return completion('answer')
    }
    const engine = useMessage({
      responseProvider,
      plugins: [
        {
          name: 'lifecycle',
          onInit: ({ initialMessages }) => {
            initializedWith = initialMessages[0]?.content
          },
          onTurnStart: (context) => {
            turnId = context.turnId
            turnStartedWith = context.currentTurn[0]?.content
            context.setCustomContext({ traceId: 'trace-1' })
          },
          onBeforeRequest: (context) => {
            requestTurnId = context.turnId
            context.requestBody.traceId = context.customContext.traceId
          },
          onCompletionChunk: ({ currentMessage }) => {
            currentMessage.metadata = { observedByPlugin: true }
          },
          onAfterRequest: ({ appendMessage }) => {
            appendMessage({ role: 'system', content: 'audit complete' })
          },
          onTurnEnd: (context) => {
            turnEndedAs = context.requestState
          },
          onFinally: (context) => {
            finalizedAs = context.requestState
          },
        },
      ],
    })

    await engine.sendMessage('question')

    expect(turnId).not.toBeNull()
    expect(requestTurnId).toBe(turnId)
    expect(initializedWith).toBeUndefined()
    expect(turnStartedWith).toBe('question')
    expect(requestBody).toMatchObject({
      traceId: 'trace-1',
      messages: [{ role: 'user', content: 'question' }],
    })
    expect(engine.messages.value).toMatchObject([
      { role: 'user', content: 'question' },
      { role: 'assistant', content: 'answer', metadata: { observedByPlugin: true } },
      { role: 'system', content: 'audit complete' },
    ])
    expect(turnEndedAs).toBe('completed')
    expect(finalizedAs).toBe('completed')
  })

  it('evaluates reactive disabled predicates for each turn', async () => {
    let disabled = true
    const bodies: MessageRequestBody[] = []
    const engine = useMessage({
      responseProvider: async (body) => {
        bodies.push(structuredClone(body))
        return completion('ok')
      },
      plugins: [
        {
          disabled: () => disabled,
          onBeforeRequest: ({ requestBody }) => {
            requestBody.pluginEnabled = true
          },
        },
      ],
    })

    await engine.sendMessage('first')
    disabled = false
    await engine.sendMessage('second')

    expect(bodies.map((body) => body.pluginEnabled)).toEqual([undefined, true])
  })

  it('runs generic plugin commands and exposes appended messages', async () => {
    const engine = useMessage({
      responseProvider: async () => completion('unused'),
      plugins: [
        {
          commands: {
            append: (payload, { appendMessage }) => {
              appendMessage({ role: 'system', content: String(payload) })
              return 'appended'
            },
          },
        },
      ],
    })

    await expect(engine.dispatchCommand('append', 'manual context')).resolves.toBe('appended')
    expect(engine.messages.value).toEqual([{ role: 'system', content: 'manual context' }])
  })

  it('lets the global completion hook replace default streaming merge behavior', async () => {
    const responseProvider: ResponseProvider = async function* () {
      yield {
        ...completion(''),
        choices: [
          {
            index: 0,
            message: undefined,
            delta: { role: 'assistant', content: 'one' },
            logprobs: null,
            finish_reason: null,
          },
        ],
      }
      yield {
        ...completion(''),
        choices: [
          {
            index: 0,
            message: undefined,
            delta: { content: 'two' },
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
      }
    }
    const engine = useMessage({
      responseProvider,
      onCompletionChunk: ({ choice, currentMessage }) => {
        const content = choice.delta?.content ?? ''
        currentMessage.content += `[${content}]`
      },
    })

    await engine.sendMessage('stream')

    expect(engine.messages.value.at(-1)).toMatchObject({
      role: 'assistant',
      content: '[one][two]',
    })
  })

  it('applies request field inclusion and exclusion without mutating displayed messages', async () => {
    let requestMessages: Partial<ChatMessage>[] = []
    const engine = useMessage({
      responseProvider: async (body) => {
        requestMessages = structuredClone(body.messages)
        return completion('ok')
      },
      requestMessageFields: ['role', 'content', 'metadata', 'state'],
      requestMessageFieldsExclude: ['state'],
    })
    const message: ChatMessage = {
      role: 'user',
      content: 'raw message',
      metadata: { id: 'message-1' },
      state: { selected: true },
      extra: 'display-only',
    }

    await engine.send(message)

    expect(requestMessages).toEqual([{ role: 'user', content: 'raw message', metadata: { id: 'message-1' } }])
    expect(engine.messages.value[0]).toMatchObject({
      state: { selected: true },
      extra: 'display-only',
    })
  })

  it('exposes provider failures through error and finally hooks', async () => {
    const providerError = new Error('provider failed')
    let observedError: unknown
    let finalState: string | undefined
    const engine = useMessage({
      responseProvider: async () => {
        throw providerError
      },
      plugins: [
        {
          onError: ({ error }) => {
            observedError = error
          },
          onFinally: ({ requestState }) => {
            finalState = requestState
          },
        },
      ],
    })

    await engine.sendMessage('fail')

    expect(observedError).toBe(providerError)
    expect(finalState).toBe('error')
    expect(engine.requestState.value).toBe('error')
    expect(engine.isProcessing.value).toBe(false)
  })

  it('aborts an active provider and publishes the aborted lifecycle state', async () => {
    let markStarted!: () => void
    const started = new Promise<void>((resolve) => {
      markStarted = resolve
    })
    let abortHookState: string | undefined
    const responseProvider: ResponseProvider = (_body, signal) =>
      new Promise<ChatCompletion>((_resolve, reject) => {
        markStarted()
        signal.addEventListener(
          'abort',
          () => {
            const error = new Error('cancelled')
            error.name = 'AbortError'
            reject(error)
          },
          { once: true },
        )
      })
    const engine = useMessage({
      responseProvider,
      plugins: [
        {
          onTurnAbort: ({ requestState }) => {
            abortHookState = requestState
          },
        },
      ],
    })

    const turn = engine.sendMessage('wait')
    await started
    await engine.abortRequest()
    await turn

    expect(abortHookState).toBe('processing')
    expect(engine.requestState.value).toBe('aborted')
    expect(engine.isProcessing.value).toBe(false)
    expect(engine.canStartTurn.value).toBe(true)
  })
})
