import type { ChatCompletionChunk } from 'openai/resources/index'
import { describe, expect, it, vi } from 'vitest'
import { createMessageEngine } from '../core/engine'
import type {
  ChatMessage,
  CreateMessageEngineOptions,
  PublicMessageState,
  RequestProcessingState,
  RequestState,
  ResponseProvider,
} from '../types'
import { AbortError } from '../core/utils'
import { lengthPlugin, thinkingPlugin } from '../plugins'
import { createNativeMessageAdapter } from './native'

/** Yields one SSE-style chunk with assistant text and finish_reason stop. */
async function* mockStreamOneAssistantReplyWithDelay(
  content: string | string[],
  { abortSignal, delay = 0 }: { delay: number; abortSignal: AbortSignal },
): AsyncGenerator<ChatCompletionChunk> {
  const contents = Array.isArray(content) ? content : [content]

  for (let i = 0; i < contents.length; i++) {
    const content = contents[i]

    if (abortSignal.aborted) {
      throw new AbortError('Request aborted')
    }

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    yield {
      id: 'test-chunk',
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: 'mock',
      choices: [
        {
          index: 0,
          delta: { role: 'assistant', content },
          finish_reason: i === contents.length - 1 ? 'stop' : null,
        },
      ],
    } as ChatCompletionChunk
  }
}

function mockResponseProvider(content: string | string[], delay: number = 0): ResponseProvider {
  return (_body, abortSignal) => mockStreamOneAssistantReplyWithDelay(content, { abortSignal, delay })
}

/** Default engine plugins add thinking/length behavior; disable them for predictable assertions. */
const silentDefaultPlugins = [thinkingPlugin({ disabled: true }), lengthPlugin({ disabled: true })]

const createTestMessageEngine = (options: CreateMessageEngineOptions) =>
  createMessageEngine(createNativeMessageAdapter(), options)

describe('createMessageEngine', () => {
  it('exposes initial messages and idle state', () => {
    const engine = createTestMessageEngine({
      initialMessages: [{ role: 'user', content: 'hi' }],
      plugins: silentDefaultPlugins,
      responseProvider: mockResponseProvider('noop'),
    })
    const s = engine.getState()
    expect(s.requestState).toBe('idle')
    expect(s.messages).toHaveLength(1)
    expect(s.messages[0].content).toBe('hi')
    expect(s.isProcessing).toBe(false)
  })

  it('sendMessage runs responseProvider and appends assistant content', async () => {
    const engine = createTestMessageEngine({
      plugins: silentDefaultPlugins,
      responseProvider: mockResponseProvider('assistant reply'),
    })
    await engine.sendMessage('hello')
    const { messages, requestState } = engine.getState()
    expect(requestState).toBe('completed')

    const userMessage = messages[0]
    const assistantMessage = messages[1]

    expect(userMessage?.role).toBe('user')
    expect(userMessage?.content).toBe('hello')
    expect(assistantMessage?.role).toBe('assistant')
    expect(assistantMessage?.content).toBe('assistant reply')

    expect(userMessage?.metadata?.createdAt).toBeDefined()
    expect(userMessage?.metadata?.updatedAt).toBeDefined()
    expect(assistantMessage?.metadata?.createdAt).toBeDefined()
    expect(assistantMessage?.metadata?.updatedAt).toBeDefined()
  })

  it('notifies message and request state subscribers with snapshots of message updates and request state transitions during message processing', async () => {
    // Prepare the snapshots arrays
    const snapshotsForMessages: ChatMessage[][] = []
    const snapshotsForRequestState: [RequestState, RequestProcessingState | undefined][] = []

    // Generic listener factory to avoid repetition
    const createListener = <T>(snapshotsArray: T[], mapFn: (state: PublicMessageState) => T) =>
      vi.fn((state: PublicMessageState) => {
        const snapshot = mapFn(state)
        snapshotsArray.push(snapshot)
      })

    // Listeners for message and request state
    const listenerForMessages = createListener(snapshotsForMessages, (state) => structuredClone(state.messages))
    const listenerForRequestState = createListener(snapshotsForRequestState, (state) => [
      state.requestState,
      state.processingState,
    ])

    // Setup message engine and subscribe to events
    const engine = createTestMessageEngine({
      plugins: silentDefaultPlugins,
      responseProvider: mockResponseProvider(['hello', ' world']),
    })
    engine.subscribe('messages', listenerForMessages)
    engine.subscribe('requestState', listenerForRequestState)

    // Send a message and process it
    await engine.sendMessage('ping')

    // Expected snapshots for messages
    const expectedMessageSnapshots: ChatMessage[][] = [
      [],
      [{ role: 'user', content: 'ping' }],
      [
        { role: 'user', content: 'ping' },
        { role: 'assistant', content: '', loading: true },
      ],
      [
        { role: 'user', content: 'ping' },
        { role: 'assistant', content: '', loading: undefined },
      ],
      [
        { role: 'user', content: 'ping' },
        { role: 'assistant', content: 'hello' },
      ],
      [
        { role: 'user', content: 'ping' },
        { role: 'assistant', content: 'hello world' },
      ],
    ]

    // Expect message snapshots to match the expected sequence
    expect(snapshotsForMessages).toHaveLength(expectedMessageSnapshots.length)
    snapshotsForMessages.forEach((snapshot, idx) => {
      expect(snapshot).toMatchObject(expectedMessageSnapshots[idx])
    })

    // Expected snapshots for request state
    const expectedRequestStateSequence: [RequestState, RequestProcessingState | undefined][] = [
      ['idle', undefined],
      ['processing', 'requesting'],
      ['processing', 'completing'],
      ['completed', undefined],
    ]

    // Expect request state snapshots to match the expected sequence
    expect(snapshotsForRequestState).toHaveLength(expectedRequestStateSequence.length)
    snapshotsForRequestState.forEach((snapshot, idx) => {
      expect(snapshot).toEqual(expectedRequestStateSequence[idx])
    })
  })

  it('runs onBeforeRequest with current request body before assistant is appended', async () => {
    const onBeforeRequest = vi.fn()
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        {
          name: 'spy',
          onBeforeRequest: (ctx) => {
            onBeforeRequest(ctx.requestBody.messages.length)
          },
        },
      ],
      responseProvider: mockResponseProvider('ok'),
    })
    await engine.sendMessage('one user turn')

    expect(onBeforeRequest).toHaveBeenCalled()
    expect(onBeforeRequest.mock.calls[0]?.[0]).toBe(1)
  })

  it('later plugin with same name replaces earlier (deduplication)', async () => {
    const first = vi.fn()
    const second = vi.fn()
    const engine = createTestMessageEngine({
      plugins: [...silentDefaultPlugins, { name: 'dup', onTurnStart: first }, { name: 'dup', onTurnStart: second }],
      responseProvider: mockResponseProvider('y'),
    })
    await engine.sendMessage('dedupe')

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalled()
  })

  it('should execute multiple plugin hooks in the correct order', async () => {
    const beforeRequest = vi.fn()
    const completionChunk = vi.fn()
    const afterRequest = vi.fn()

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        {
          name: 'plugin1',
          onBeforeRequest: (ctx) => {
            beforeRequest('plugin1', ctx.requestBody.messages.length)
          },
          onCompletionChunk: (ctx) => {
            completionChunk('plugin1', ctx.chunk)
          },
          onAfterRequest: (ctx) => {
            afterRequest('plugin1', ctx.currentMessage.content)
          },
        },
        {
          name: 'plugin2',
          onBeforeRequest: (ctx) => {
            beforeRequest('plugin2', ctx.requestBody.messages.length)
          },
          onCompletionChunk: (ctx) => {
            completionChunk('plugin2', ctx.chunk)
          },
          onAfterRequest: (ctx) => {
            afterRequest('plugin2', ctx.currentMessage.content)
          },
        },
      ],
      responseProvider: mockResponseProvider('assistant reply'),
    })

    await engine.sendMessage('hello')

    expect(beforeRequest).toHaveBeenNthCalledWith(1, 'plugin1', 1)
    expect(beforeRequest).toHaveBeenNthCalledWith(2, 'plugin2', 1)

    expect(completionChunk).toHaveBeenNthCalledWith(
      1,
      'plugin1',
      expect.objectContaining({
        choices: expect.arrayContaining([
          expect.objectContaining({
            delta: expect.objectContaining({ content: 'assistant reply' }),
            finish_reason: 'stop',
          }),
        ]),
      }),
    )

    expect(completionChunk).toHaveBeenNthCalledWith(
      2,
      'plugin2',
      expect.objectContaining({
        choices: expect.arrayContaining([
          expect.objectContaining({
            delta: expect.objectContaining({ content: 'assistant reply' }),
            finish_reason: 'stop',
          }),
        ]),
      }),
    )

    expect(afterRequest).toHaveBeenNthCalledWith(1, 'plugin1', 'assistant reply')
    expect(afterRequest).toHaveBeenNthCalledWith(2, 'plugin2', 'assistant reply')
  })

  it('should handle abort correctly during message processing with delayed chunks', async () => {
    const engine = createTestMessageEngine({
      plugins: silentDefaultPlugins,
      responseProvider: mockResponseProvider(['first chunk', ' second chunk'], 100),
    })

    const sendMessagePromise = engine.sendMessage('ping')

    setTimeout(() => {
      engine.abort()
    }, 50)

    await sendMessagePromise

    const { messages, requestState } = engine.getState()
    expect(requestState).toBe('aborted')
    expect(messages).toHaveLength(2)
    expect(messages[1]).toMatchObject({ role: 'assistant', content: 'first chunk', loading: undefined })
  })
})
