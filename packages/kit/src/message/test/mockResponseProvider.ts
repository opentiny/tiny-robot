import type { ChatCompletionChunk } from 'openai/resources/index'
import type { ResponseProvider } from '../types'
import { AbortError } from '../utils'

type ItemOrItems<T> = T | Array<T>

export type MockContent =
  | ItemOrItems<string>
  | ItemOrItems<{ content: string; reasoning_content?: string } | { content?: string; reasoning_content: string }>

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
