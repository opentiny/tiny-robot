import { describe, expect, it } from 'vitest'
import type { ChatMessage } from '../../types'
import { mockResponseProvider, mockSequentialResponseProvider } from './mockResponseProvider'
import { lengthPlugin } from './plugins/lengthPlugin'
import { toolPlugin } from './plugins/toolPlugin'
import type { ResponseProvider } from './types'
import { useMessage } from './useMessage'

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
})
