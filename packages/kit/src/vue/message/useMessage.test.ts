import type { ChatCompletionChunk } from 'openai/resources/index'
import { describe, expect, it } from 'vitest'
import type { ChatMessage } from '../../types'
import { toolPlugin } from './plugins/toolPlugin'
import type { UseMessageOptions } from './types'
import { useMessage } from './useMessage'

async function* mockStreamOneAssistantReply(content: string | string[]): AsyncGenerator<ChatCompletionChunk> {
  const contents = Array.isArray(content) ? content : [content]

  for (let index = 0; index < contents.length; index++) {
    yield {
      id: 'test-chunk',
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: 'mock',
      choices: [
        {
          index: 0,
          delta: { role: 'assistant', content: contents[index] },
          finish_reason: index === contents.length - 1 ? 'stop' : null,
        },
      ],
    }
  }
}

const createResponseProvider = (content: string | string[]): UseMessageOptions['responseProvider'] => {
  return async () => mockStreamOneAssistantReply(content)
}

describe('useMessage', () => {
  it('uses the core vue adapter while keeping the original return shape', async () => {
    const engine = useMessage({
      initialMessages: [{ role: 'system', content: 'hello' }],
      responseProvider: createResponseProvider(['foo', 'bar']),
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
      responseProvider: createResponseProvider('first'),
    })

    engine.responseProvider.value = createResponseProvider('second')
    await engine.sendMessage('ping')

    expect(engine.messages.value[1]).toMatchObject({ role: 'assistant', content: 'second' })
  })

  it('lets vue toolPlugin callbacks mutate reactive messages while core handles tool flow', async () => {
    let capturedAssistantMessage: Record<string, unknown> | undefined
    let capturedMessages: ChatMessage[] | undefined

    const responseProvider: UseMessageOptions['responseProvider'] = async (requestBody) => {
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
