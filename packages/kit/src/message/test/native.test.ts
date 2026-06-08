import { describe, expect, it, vi } from 'vitest'
import type { ChatCompletionMessageToolCall } from 'openai/resources/index'
import { createNativeMessageAdapter } from '../adapters/native'
import { thinkingPlugin, toolPlugin } from '../plugins'
import type {
  ChatMessage,
  MessageRequestBody,
  PublicMessageState,
  RequestProcessingState,
  RequestState,
  ResponseProvider,
} from '../types'
import {
  createAssistantCompletion,
  createTestMessageEngine,
  createToolCall,
  createToolCallsCompletion,
  mockResponseProvider,
  silentDefaultPlugins,
  testTool,
} from './helpers'

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

  it('does not run plugin commands while processing is in progress', async () => {
    let releaseResponse: () => void = () => {}
    const responseStarted = new Promise<void>((resolve) => {
      releaseResponse = resolve
    })
    const responseProvider = vi.fn(async () => {
      await responseStarted
      return createAssistantCompletion('done')
    })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const commandHandler = vi.fn((_payload, { appendMessage, requestNext }) => {
      appendMessage({ role: 'user', content: 'queued by command' })
      requestNext()
    })

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        {
          name: 'command',
          commands: {
            continue: commandHandler,
          },
        },
      ],
      responseProvider,
    })

    const sendMessagePromise = engine.sendMessage('ping')

    await vi.waitFor(() => {
      expect(engine.getState().requestState).toBe('processing')
    })

    const commandResult = await engine.runPluginCommand('command', 'continue')
    releaseResponse()
    await sendMessagePromise

    expect(commandResult.success).toBe(false)
    expect(responseProvider).toHaveBeenCalledTimes(1)
    expect(commandHandler).not.toHaveBeenCalled()
    expect(engine.getState().messages.map((message) => message.content)).not.toContain('queued by command')
    expect(warnSpy).toHaveBeenCalledWith('Cannot run plugin command while processing is in progress')

    warnSpy.mockRestore()
  })

  it('pauses a tool call before callTool and keeps displayable pending state', async () => {
    const callTool = vi.fn(async () => 'tool result')
    const responseProvider = vi.fn(async () => createToolCallsCompletion([createToolCall('call-1')]))

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: async () => [testTool],
          shouldPauseToolCall: async () => true,
          callTool,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('lookup')

    const { messages, requestState, processingState } = engine.getState()
    const assistantMessage = messages[1]
    const toolMessage = messages[2]

    expect(requestState).toBe('paused')
    expect(processingState).toBeUndefined()
    expect(responseProvider).toHaveBeenCalledTimes(1)
    expect(callTool).not.toHaveBeenCalled()
    expect(assistantMessage).toMatchObject({
      role: 'assistant',
      tool_calls: [expect.objectContaining({ id: 'call-1' })],
      state: { toolCall: { 'call-1': { status: 'awaiting-approval' } } },
    })
    expect(toolMessage).toMatchObject({
      role: 'tool',
      tool_call_id: 'call-1',
      content: '',
    })
  })

  it('resumes a paused tool call, runs callTool, and continues the model request', async () => {
    const callTool = vi.fn(async () => 'tool result')
    const responseProvider = vi
      .fn()
      .mockResolvedValueOnce(createToolCallsCompletion([createToolCall('call-1')]))
      .mockResolvedValueOnce(createAssistantCompletion('final answer'))

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: async () => [testTool],
          shouldPauseToolCall: async () => true,
          callTool,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('lookup')
    const commandResult = await engine.runPluginCommand('tool', 'resumeToolCall', { toolCallId: 'call-1' })

    expect(commandResult.success).toBe(true)
    await vi.waitFor(() => {
      expect(responseProvider).toHaveBeenCalledTimes(2)
      expect(engine.getState().requestState).toBe('completed')
    })

    const { messages, requestState } = engine.getState()
    const secondRequestBody = responseProvider.mock.calls[1]?.[0]

    expect(requestState).toBe('completed')
    expect(callTool).toHaveBeenCalledTimes(1)
    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(secondRequestBody.messages.at(-1)).toMatchObject({
      role: 'tool',
      tool_call_id: 'call-1',
      content: 'tool result',
    })
    expect(messages[1]).toMatchObject({
      role: 'assistant',
      state: { toolCall: { 'call-1': { status: 'success' } } },
    })
    expect(messages[2]).toMatchObject({
      role: 'tool',
      tool_call_id: 'call-1',
      content: 'tool result',
    })
    expect(messages[3]).toMatchObject({
      role: 'assistant',
      content: 'final answer',
    })
  })

  it('keeps a mixed tool-call group paused until all pending calls are resumed', async () => {
    let releaseRunningTool: () => void = () => {}
    const runningToolStarted = new Promise<void>((resolve) => {
      releaseRunningTool = resolve
    })
    const callTool = vi.fn(async (toolCall: ChatCompletionMessageToolCall) => {
      if (toolCall.id === 'call-run') {
        await runningToolStarted
      }

      return `result:${toolCall.id}`
    })
    const responseProvider = vi
      .fn()
      .mockResolvedValueOnce(
        createToolCallsCompletion([
          createToolCall('call-pause-1'),
          createToolCall('call-run'),
          createToolCall('call-pause-2'),
        ]),
      )
      .mockResolvedValueOnce(createAssistantCompletion('all done'))

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: async () => [testTool],
          shouldPauseToolCall: async (toolCall) => toolCall.id !== 'call-run',
          callTool,
        }),
      ],
      responseProvider,
    })

    const sendMessagePromise = engine.sendMessage('lookup two things')

    await vi.waitFor(() => {
      expect(engine.getState().messages[1]).toMatchObject({
        state: {
          toolCall: {
            'call-pause-1': { status: 'awaiting-approval' },
            'call-pause-2': { status: 'awaiting-approval' },
          },
        },
      })
      expect(engine.getState().requestState).toBe('processing')
    })

    releaseRunningTool()
    await sendMessagePromise

    expect(engine.getState().requestState).toBe('paused')
    expect(responseProvider).toHaveBeenCalledTimes(1)
    expect(callTool).toHaveBeenCalledTimes(1)
    expect(callTool).toHaveBeenCalledWith(expect.objectContaining({ id: 'call-run' }), expect.any(Object))
    expect(engine.getState().messages[1]).toMatchObject({
      state: {
        toolCall: {
          'call-run': { status: 'success' },
          'call-pause-1': { status: 'awaiting-approval' },
          'call-pause-2': { status: 'awaiting-approval' },
        },
      },
    })

    const firstCommandResult = await engine.runPluginCommand('tool', 'resumeToolCall', { toolCallId: 'call-pause-1' })

    expect(firstCommandResult.success).toBe(true)
    expect(engine.getState().requestState).toBe('paused')
    expect(callTool).toHaveBeenCalledTimes(2)
    expect(responseProvider).toHaveBeenCalledTimes(1)
    expect(engine.getState().messages[1]).toMatchObject({
      state: {
        toolCall: {
          'call-run': { status: 'success' },
          'call-pause-1': { status: 'success' },
          'call-pause-2': { status: 'awaiting-approval' },
        },
      },
    })

    const repeatedCommandResult = await engine.runPluginCommand('tool', 'resumeToolCall', {
      toolCallId: 'call-pause-1',
    })

    expect(repeatedCommandResult.success).toBe(false)
    expect(repeatedCommandResult.error).toBeInstanceOf(Error)
    expect((repeatedCommandResult.error as Error).message).toBe('Tool call is not awaiting approval: call-pause-1')
    expect(engine.getState().requestState).toBe('paused')
    expect(callTool).toHaveBeenCalledTimes(2)
    expect(responseProvider).toHaveBeenCalledTimes(1)

    const secondCommandResult = await engine.runPluginCommand('tool', 'resumeToolCall', { toolCallId: 'call-pause-2' })

    expect(secondCommandResult.success).toBe(true)
    await vi.waitFor(() => {
      expect(responseProvider).toHaveBeenCalledTimes(2)
      expect(engine.getState().requestState).toBe('completed')
    })

    expect(callTool).toHaveBeenCalledTimes(3)
    expect(engine.getState().messages[1]).toMatchObject({
      state: {
        toolCall: {
          'call-run': { status: 'success' },
          'call-pause-1': { status: 'success' },
          'call-pause-2': { status: 'success' },
        },
      },
    })
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'all done',
    })
  })

  it('resumes a paused tool call restored from initialMessages', async () => {
    const restoredToolCall = createToolCall('call-restored')
    const initialMessages: ChatMessage[] = [
      { role: 'user', content: 'lookup after reload' },
      {
        role: 'assistant',
        content: '',
        tool_calls: [restoredToolCall],
        state: { toolCall: { 'call-restored': { status: 'awaiting-approval' } } },
      },
      { role: 'tool', tool_call_id: 'call-restored', content: '' },
    ]
    const callTool = vi.fn(async () => 'restored result')
    const onTurnStart = vi.fn()
    const onTurnResume = vi.fn()
    const responseProvider = vi.fn<ResponseProvider>(
      async (_requestBody: MessageRequestBody, _abortSignal: AbortSignal) =>
        createAssistantCompletion('restored final'),
    )

    const engine = createTestMessageEngine({
      initialMessages,
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: async () => [testTool],
          callTool,
        }),
        {
          name: 'lifecycle-spy',
          onTurnStart,
          onTurnResume: (context) => {
            onTurnResume(context.currentTurn.map((message) => message.role))
          },
        },
      ],
      responseProvider,
    })

    const commandResult = await engine.runPluginCommand('tool', 'resumeToolCall', { toolCallId: 'call-restored' })

    expect(commandResult.success).toBe(true)
    await vi.waitFor(() => {
      expect(responseProvider).toHaveBeenCalledTimes(1)
      expect(engine.getState().requestState).toBe('completed')
    })

    const { messages, requestState } = engine.getState()

    expect(requestState).toBe('completed')
    expect(onTurnStart).not.toHaveBeenCalled()
    expect(onTurnResume).toHaveBeenCalledWith(['user', 'assistant', 'tool'])
    expect(callTool).toHaveBeenCalledTimes(1)
    const firstRequestBody = responseProvider.mock.calls[0]?.[0]
    expect(firstRequestBody?.messages).toMatchObject([
      { role: 'user', content: 'lookup after reload' },
      { role: 'assistant', tool_calls: [expect.objectContaining({ id: 'call-restored' })] },
      { role: 'tool', tool_call_id: 'call-restored', content: 'restored result' },
    ])
    expect(messages[1]).toMatchObject({
      state: { toolCall: { 'call-restored': { status: 'success' } } },
    })
    expect(messages[3]).toMatchObject({
      role: 'assistant',
      content: 'restored final',
    })
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
