import { describe, expect, it, vi } from 'vitest'
import { createNativeMessageAdapter } from '../adapters/native'
import { createMessageEngine } from '../core/engine'
import { lengthPlugin, thinkingPlugin } from '../plugins'
import type {
  ChatMessage,
  CreateMessageEngineOptions,
  PublicMessageState,
  RequestProcessingState,
  RequestState,
  ResponseProvider,
} from '../types'
import { mockResponseProvider } from './mockResponseProvider'

/** Default engine plugins add thinking/length behavior; disable them for predictable assertions. */
const silentDefaultPlugins = [thinkingPlugin({ disabled: true }), lengthPlugin({ disabled: true })]

const createTestMessageEngine = (options: CreateMessageEngineOptions) =>
  createMessageEngine(createNativeMessageAdapter(), options)

describe('createMessageEngine', () => {
  it('throws when adapter is initialized more than once', () => {
    const adapter = createNativeMessageAdapter()

    adapter.initialize({
      requestState: 'idle',
      processingState: undefined,
      messages: [],
    })

    expect(() =>
      adapter.initialize({
        requestState: 'completed',
        processingState: undefined,
        messages: [{ role: 'user', content: 'unexpected' }],
      }),
    ).toThrow('Message state adapter is already initialized')
  })

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
    expect(s.isCurrentTurn).toBe(false)
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
    expectedMessageSnapshots.forEach((expected, idx) => {
      expect(snapshotsForMessages[idx], `messages snapshot mismatch at index ${idx}`).toMatchObject(expected)
    })
    expect(snapshotsForMessages).toHaveLength(expectedMessageSnapshots.length)

    // Expected snapshots for request state
    const expectedRequestStateSequence: [RequestState, RequestProcessingState | undefined][] = [
      ['idle', undefined],
      ['processing', 'requesting'],
      ['processing', 'completing'],
      ['completed', undefined],
    ]

    // Expect request state snapshots to match the expected sequence
    expectedRequestStateSequence.forEach((expected, idx) => {
      expect(snapshotsForRequestState[idx], `request state snapshot mismatch at index ${idx}`).toEqual(expected)
    })
    expect(snapshotsForRequestState).toHaveLength(expectedRequestStateSequence.length)
  })

  it('keeps notifying other subscribers when one subscriber throws', () => {
    const adapter = createNativeMessageAdapter()
    adapter.initialize({
      requestState: 'idle',
      processingState: undefined,
      messages: [],
    })

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const healthyListener = vi.fn()

    adapter.subscribe('requestState', () => {
      throw new Error('subscriber failed')
    })
    adapter.subscribe('requestState', healthyListener)

    adapter.mutate('requestState', (draft) => {
      draft.requestState = 'processing'
      draft.processingState = 'requesting'
    })

    expect(healthyListener).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        requestState: 'idle',
        processingState: undefined,
      }),
    )
    expect(healthyListener).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        requestState: 'processing',
        processingState: 'requesting',
      }),
    )
    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
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

  it('passes the latest initialized messages to later plugins', () => {
    let laterInitialMessages: ChatMessage[] | undefined
    const initializedMessage = { role: 'user' as const, content: 'initialized' }

    createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        {
          name: 'initializer',
          onInit: () => ({ messages: [initializedMessage] }),
        },
        {
          name: 'observer',
          onInit: ({ initialMessages }) => {
            laterInitialMessages = initialMessages
          },
        },
      ],
      responseProvider: mockResponseProvider('noop'),
    })

    expect(laterInitialMessages).toEqual([initializedMessage])
  })

  it('keeps the turn paused when a plugin fails during turn resume', async () => {
    const onTurnResume = vi.fn(() => {
      throw new Error('resume failed')
    })
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        {
          onInit: () => ({ requestState: 'paused' as const, turnId: 'resume-error', currentTurn: [] }),
          onTurnResume,
          commands: {
            resume: (_payload, context) => {
              context.requestNext(true)
            },
          },
        },
      ],
      responseProvider: mockResponseProvider('unused'),
    })

    await expect(engine.dispatchCommand('resume')).rejects.toThrow('resume failed')
    expect(onTurnResume).toHaveBeenCalledOnce()
    expect(engine.getState()).toMatchObject({ requestState: 'paused', isCurrentTurn: true })
  })

  it('aborts an asynchronous command while the turn is paused', async () => {
    let markCommandStarted!: () => void
    const commandStarted = new Promise<void>((resolve) => {
      markCommandStarted = resolve
    })
    let releaseCommand!: () => void
    const commandBlocked = new Promise<void>((resolve) => {
      releaseCommand = resolve
    })
    let commandSignal!: AbortSignal
    const responseProvider = vi.fn<ResponseProvider>(async () => {
      throw new Error('responseProvider should not run after abort')
    })

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        {
          onInit: () => ({ requestState: 'paused' as const, turnId: 'async-command' }),
          commands: {
            resume: async (_payload, context) => {
              commandSignal = context.abortSignal
              markCommandStarted()
              await commandBlocked
              context.requestNext(true)
            },
          },
        },
      ],
      responseProvider,
    })

    const command = engine.dispatchCommand('resume')
    await commandStarted
    await engine.abort()

    expect(commandSignal.aborted).toBe(true)
    expect(engine.getState()).toMatchObject({ requestState: 'aborted', isCurrentTurn: false })

    releaseCommand()
    await command

    expect(responseProvider).not.toHaveBeenCalled()
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

  it('thinking plugin should update thinking state correctly', async () => {
    const engine = createTestMessageEngine({
      plugins: [...silentDefaultPlugins, thinkingPlugin()],
      responseProvider: mockResponseProvider([
        { reasoning_content: 'thinking...' },
        { reasoning_content: ' thinking done' },
        { content: 'hello' },
        { content: ' world' },
      ]),
    })

    const snapshots: ChatMessage[][] = []
    engine.subscribe('messages', (state) => {
      snapshots.push(structuredClone(state.messages))
    })

    await engine.sendMessage('hello')

    const expectedMessageSnapshots: ChatMessage[][] = [
      [],
      [{ role: 'user', content: 'hello' }],
      [
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: '', loading: true },
      ],
      [
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: '', loading: undefined },
      ],
      [
        { role: 'user', content: 'hello' },
        { role: 'assistant', reasoning_content: 'thinking...' },
      ],
      [
        { role: 'user', content: 'hello' },
        { role: 'assistant', reasoning_content: 'thinking...', state: { thinking: true, open: true } },
      ],
      [
        { role: 'user', content: 'hello' },
        { role: 'assistant', reasoning_content: 'thinking... thinking done', state: { thinking: true, open: true } },
      ],
      [
        { role: 'user', content: 'hello' },
        {
          role: 'assistant',
          content: 'hello',
          reasoning_content: 'thinking... thinking done',
          state: { thinking: true, open: true },
        },
      ],
      [
        { role: 'user', content: 'hello' },
        {
          role: 'assistant',
          content: 'hello',
          reasoning_content: 'thinking... thinking done',
          state: { thinking: false, open: false },
        },
      ],
      [
        { role: 'user', content: 'hello' },
        {
          role: 'assistant',
          content: 'hello world',
          reasoning_content: 'thinking... thinking done',
          state: { thinking: false, open: false },
        },
      ],
    ]

    expectedMessageSnapshots.forEach((expected, idx) => {
      expect(snapshots[idx], `messages snapshot mismatch at index ${idx}`).toMatchObject(expected)
    })
    expect(snapshots).toHaveLength(expectedMessageSnapshots.length)
  })
})
