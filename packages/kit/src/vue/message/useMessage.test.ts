import { describe, expect, it, vi } from 'vitest'
import type { ChatMessage } from '../../types'
import { mockResponseProvider, mockSequentialResponseProvider } from './mockResponseProvider'
import { lengthPlugin } from './plugins/lengthPlugin'
import { toolPlugin } from './plugins/toolPlugin'
import type { ResponseProvider } from './types'
import { useMessage } from './useMessage'

const waitFor = async (condition: () => boolean, timeout = 1000) => {
  const startedAt = Date.now()

  while (!condition()) {
    if (Date.now() - startedAt > timeout) {
      throw new Error('Timed out waiting for condition')
    }

    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

describe('useMessage', () => {
  it('uses the core vue adapter while keeping the original return shape', async () => {
    const engine = useMessage({
      initialMessages: [{ role: 'system', content: 'hello' }],
      responseProvider: mockResponseProvider(['foo', 'bar']),
    })

    expect(engine.requestState.value).toBe('idle')
    expect(engine.processingState.value).toBeUndefined()
    expect(engine.messages.value).toHaveLength(1)
    expect(engine.isProcessing.value).toBe(false)
    expect(typeof engine.sendMessage).toBe('function')
    expect(typeof engine.abortRequest).toBe('function')

    await engine.sendMessage('ping')

    expect(engine.requestState.value).toBe('completed')
    expect(engine.messages.value).toHaveLength(3)
    expect(engine.messages.value[1]).toMatchObject({ role: 'user', content: 'ping' })
    expect(engine.messages.value[2]).toMatchObject({ role: 'assistant', content: 'foobar', loading: undefined })
  })

  it('keeps responseProvider as a writable ref', async () => {
    const engine = useMessage({
      responseProvider: mockResponseProvider('first'),
    })

    engine.responseProvider.value = mockResponseProvider('second')
    await engine.sendMessage('ping')

    expect(engine.messages.value[1]).toMatchObject({ role: 'assistant', content: 'second' })
  })

  it('uses vue lengthPlugin to continue when finish_reason is length', async () => {
    const continueContent = 'Continue please.'
    let requestCount = 0

    const responseProvider = mockSequentialResponseProvider([
      {
        content: 'partial answer',
        finish_reason: 'length',
        onRequest() {
          requestCount += 1
        },
      },
      {
        content: 'final answer',
        onRequest(requestBody) {
          requestCount += 1
          expect(requestBody.messages.at(-1)).toMatchObject({
            role: 'user',
            content: continueContent,
          })
        },
      },
    ])

    const engine = useMessage({
      responseProvider,
      plugins: [lengthPlugin({ continueContent })],
    })

    await engine.sendMessage('ping')

    expect(requestCount).toBe(2)
    expect(engine.messages.value).toHaveLength(4)
    expect(engine.messages.value[0]).toMatchObject({ role: 'user', content: 'ping' })
    expect(engine.messages.value[1]).toMatchObject({ role: 'assistant', content: 'partial answer' })
    expect(engine.messages.value[2]).toMatchObject({ role: 'user', content: continueContent })
    expect(engine.messages.value[3]).toMatchObject({ role: 'assistant', content: 'final answer' })
  })

  it('lets vue toolPlugin callbacks mutate reactive messages while core handles tool flow', async () => {
    let capturedAssistantMessage: Record<string, unknown> | undefined
    let capturedMessages: ChatMessage[] | undefined

    const responseProvider: ResponseProvider = async (requestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        return {
          id: 'tool-call',
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'mock',
          system_fingerprint: null,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '',
                tool_calls: [
                  {
                    index: 0,
                    id: 'call-1',
                    type: 'function',
                    function: {
                      name: 'lookup',
                      arguments: '{}',
                    },
                  },
                ],
              },
              delta: undefined,
              logprobs: null,
              finish_reason: 'tool_calls',
            },
          ],
        }
      }

      return {
        id: 'tool-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'done',
            },
            delta: undefined,
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
      }
    }

    const engine = useMessage({
      responseProvider,
      plugins: [
        toolPlugin({
          async getTools() {
            return [
              {
                type: 'function',
                function: {
                  name: 'lookup',
                },
              },
            ]
          },
          async beforeCallTools(_toolCalls, context) {
            capturedAssistantMessage = context.assistantMessage
            capturedMessages = context.messages
            context.assistantMessage.state = { fromVueWrapper: true }
          },
          async *callTool(_toolCall, context) {
            expect(context.messages[context.messages.length - 1].role).toBe('tool')
            expect(context.assistantMessage).toBe(capturedAssistantMessage)
            expect(context.currentMessage).toBe(capturedAssistantMessage)

            context.messages[context.messages.length - 1].content = 'prefix '
            yield 'result'
          },
        }),
      ],
    })

    await engine.sendMessage('ping')

    expect(Array.isArray(capturedMessages)).toBe(true)
    expect(capturedMessages?.[1]).toBe(capturedAssistantMessage)
    expect(capturedMessages?.some((message) => message.role === 'tool')).toBe(true)
    expect(capturedAssistantMessage).toBe(engine.messages.value[1])
    expect(engine.messages.value).toHaveLength(4)
    expect(engine.messages.value[1]).toMatchObject({
      role: 'assistant',
      state: { fromVueWrapper: true, toolCall: { 'call-1': { status: 'success' } } },
    })
    expect(engine.messages.value[2]).toMatchObject({
      role: 'tool',
      tool_call_id: 'call-1',
      content: 'prefix result',
    })
    expect(engine.messages.value[3]).toMatchObject({
      role: 'assistant',
      content: 'done',
    })
  })

  it('waits for submitted tool results before continuing confirmed tool calls', async () => {
    const callTool = vi.fn()
    const secondRequestToolMessages: ChatMessage[] = []
    let requestCount = 0

    const responseProvider = mockSequentialResponseProvider([
      {
        finish_reason: 'tool_calls',
        content: '',
        tool_calls: [
          {
            index: 0,
            id: 'call-allow',
            type: 'function',
            function: {
              name: 'lookup',
              arguments: '{}',
            },
          },
          {
            index: 1,
            id: 'call-deny',
            type: 'function',
            function: {
              name: 'delete',
              arguments: '{}',
            },
          },
        ],
      },
      {
        content: 'done',
        onRequest(requestBody) {
          requestCount += 1
          secondRequestToolMessages.push(
            ...(requestBody.messages.filter((message) => message.role === 'tool') as ChatMessage[]),
          )
        },
      },
    ])

    const engine = useMessage({
      responseProvider,
      plugins: [
        toolPlugin({
          async getTools() {
            return [
              {
                type: 'function',
                function: {
                  name: 'lookup',
                },
              },
              {
                type: 'function',
                function: {
                  name: 'delete',
                },
              },
            ]
          },
          confirmToolCall(toolCall, context) {
            expect(context.assistantMessage.tool_calls?.some((item) => item.id === toolCall.id)).toBe(true)
            return true
          },
          callTool,
        }),
      ],
    })

    await engine.sendMessage('ping')

    await waitFor(() => engine.messages.value[1]?.state?.toolCall?.['call-allow']?.status === 'awaiting-approval')
    expect(engine.requestState.value).toBe('processing')
    expect(engine.processingState.value).toBe('awaiting-tool-results')
    expect(engine.isProcessing.value).toBe(true)
    expect(engine.messages.value[1]).toMatchObject({
      role: 'assistant',
      state: {
        toolCall: {
          'call-allow': { status: 'awaiting-approval' },
          'call-deny': { status: 'awaiting-approval' },
        },
      },
    })
    expect(callTool).not.toHaveBeenCalled()
    expect(engine.messages.value).toHaveLength(2)

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await engine.sendMessage('should be blocked while awaiting tool results')
    expect(warnSpy).toHaveBeenCalledWith('Cannot send message while processing is in progress')
    warnSpy.mockRestore()
    expect(engine.messages.value).toHaveLength(2)

    await engine.submitToolResult({
      role: 'tool',
      tool_call_id: 'call-allow',
      content: 'result:call-allow',
      metadata: { toolCallStatus: 'success' },
    })

    expect(requestCount).toBe(0)
    expect(engine.requestState.value).toBe('processing')
    expect(engine.processingState.value).toBe('awaiting-tool-results')
    expect(engine.messages.value[1]).toMatchObject({
      role: 'assistant',
      state: {
        toolCall: {
          'call-allow': { status: 'success' },
          'call-deny': { status: 'awaiting-approval' },
        },
      },
    })

    await engine.submitToolResult({
      role: 'tool',
      tool_call_id: 'call-deny',
      content: 'Tool call denied.',
      metadata: { toolCallStatus: 'denied' },
    })

    expect(requestCount).toBe(1)
    expect(engine.requestState.value).toBe('completed')
    expect(engine.processingState.value).toBeUndefined()
    expect(engine.isProcessing.value).toBe(false)
    expect(secondRequestToolMessages).toMatchObject([
      {
        role: 'tool',
        tool_call_id: 'call-allow',
        content: 'result:call-allow',
      },
      {
        role: 'tool',
        tool_call_id: 'call-deny',
        content: 'Tool call denied.',
      },
    ])
    expect(engine.messages.value[1]).toMatchObject({
      role: 'assistant',
      state: {
        toolCall: {
          'call-allow': { status: 'success' },
          'call-deny': { status: 'denied' },
        },
      },
    })
    expect(engine.messages.value.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'done',
    })
  })

  it('continues after submitToolResult receives every tool call result at once', async () => {
    const secondRequestToolMessages: ChatMessage[] = []
    let requestCount = 0

    const responseProvider = mockSequentialResponseProvider([
      {
        finish_reason: 'tool_calls',
        content: '',
        tool_calls: [
          {
            index: 0,
            id: 'call-a',
            type: 'function',
            function: {
              name: 'lookup',
              arguments: '{}',
            },
          },
          {
            index: 1,
            id: 'call-b',
            type: 'function',
            function: {
              name: 'lookup',
              arguments: '{}',
            },
          },
        ],
      },
      {
        content: 'done',
        onRequest(requestBody) {
          requestCount += 1
          secondRequestToolMessages.push(
            ...(requestBody.messages.filter((message) => message.role === 'tool') as ChatMessage[]),
          )
        },
      },
    ])

    const engine = useMessage({
      responseProvider,
      plugins: [
        toolPlugin({
          async getTools() {
            return [
              {
                type: 'function',
                function: {
                  name: 'lookup',
                },
              },
            ]
          },
          confirmToolCall() {
            return true
          },
          async callTool() {
            return 'unused'
          },
        }),
      ],
    })

    await engine.sendMessage('ping')

    await waitFor(() => engine.messages.value[1]?.state?.toolCall?.['call-a']?.status === 'awaiting-approval')
    await engine.submitToolResult([
      {
        role: 'tool',
        tool_call_id: 'call-a',
        content: 'result:a',
      },
      {
        role: 'tool',
        tool_call_id: 'call-b',
        content: 'result:b',
      },
    ])

    expect(requestCount).toBe(1)
    expect(secondRequestToolMessages).toMatchObject([
      { role: 'tool', tool_call_id: 'call-a', content: 'result:a' },
      { role: 'tool', tool_call_id: 'call-b', content: 'result:b' },
    ])
    expect(engine.messages.value[1]).toMatchObject({
      role: 'assistant',
      state: {
        toolCall: {
          'call-a': { status: 'success' },
          'call-b': { status: 'success' },
        },
      },
    })
    expect(engine.messages.value.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'done',
    })
  })
})
