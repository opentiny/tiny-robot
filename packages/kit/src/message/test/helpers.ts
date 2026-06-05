import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from 'openai/resources/index'
import { createNativeMessageAdapter } from '../adapters/native'
import { createMessageEngine } from '../core/engine'
import { lengthPlugin, thinkingPlugin } from '../plugins'
import type { CreateMessageEngineOptions, ResponseProvider } from '../types'
import { AbortError } from '../utils'

type ItemOrItems<T> = T | Array<T>

export type MockContent =
  | ItemOrItems<string>
  | ItemOrItems<{ content: string; reasoning_content?: string } | { content?: string; reasoning_content: string }>

/** Default engine plugins add thinking/length behavior; disable them for predictable assertions. */
export const silentDefaultPlugins = [thinkingPlugin({ disabled: true }), lengthPlugin({ disabled: true })]

export const createTestMessageEngine = (options: CreateMessageEngineOptions) =>
  createMessageEngine(createNativeMessageAdapter(), options)

export const testTool: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'lookup',
  },
}

export const createToolCall = (id: string, name = 'lookup'): ChatCompletionMessageToolCall => ({
  id,
  type: 'function',
  function: {
    name,
    arguments: '{}',
  },
})

export const createCompletion = (
  message: ChatCompletion['choices'][number]['message'],
  finishReason: ChatCompletion['choices'][number]['finish_reason'] = 'stop',
): ChatCompletion => ({
  id: `test-${finishReason}`,
  object: 'chat.completion',
  created: Math.floor(Date.now() / 1000),
  model: 'mock',
  choices: [
    {
      index: 0,
      message,
      logprobs: null,
      finish_reason: finishReason,
    },
  ],
})

export const createToolCallsCompletion = (toolCalls: ChatCompletionMessageToolCall[]) =>
  createCompletion({ role: 'assistant', content: '', refusal: null, tool_calls: toolCalls }, 'tool_calls')

export const createAssistantCompletion = (content: string) =>
  createCompletion({ role: 'assistant', content, refusal: null })

/** Yields one SSE-style chunk with assistant text and finish_reason stop. */
async function* mockStreamOneAssistantReplyWithDelay(
  content: MockContent,
  { abortSignal, delay = 0 }: { delay?: number; abortSignal: AbortSignal },
): AsyncGenerator<ChatCompletionChunk> {
  const contents = Array.isArray(content) ? content : [content]
  const createdAt = Math.floor(Date.now() / 1000)

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
      created: createdAt,
      model: 'mock',
      choices: [
        {
          index: 0,
          delta: { role: 'assistant', ...(typeof content === 'string' ? { content } : content) },
          finish_reason: i === contents.length - 1 ? 'stop' : null,
        },
      ],
    } as ChatCompletionChunk
  }
}

export function mockResponseProvider(content: MockContent, delay: number = 0): ResponseProvider {
  return (_body, abortSignal) => mockStreamOneAssistantReplyWithDelay(content, { abortSignal, delay })
}
