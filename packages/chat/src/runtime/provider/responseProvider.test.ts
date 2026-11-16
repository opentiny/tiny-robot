import { afterEach, describe, expect, it, vi } from 'vitest'
import { createProviderResponseProvider } from './responseProvider'
import type { ChatResolvedProviderModel } from './types'
import { CHAT_PROVIDER_MODEL_ID_REQUEST_KEY } from './requestPlugin'

function responseFor(chunks: unknown[]) {
  const body = chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('') + 'data: [DONE]\n\n'
  return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } })
}

function model(mapUsage: NonNullable<ChatResolvedProviderModel['mapUsage']>): ChatResolvedProviderModel {
  return {
    id: 'model-a',
    label: 'Model A',
    providerType: 'openai',
    providerLabel: 'OpenAI',
    apiUrl: 'https://example.test/chat',
    mapUsage,
  }
}

describe('createProviderResponseProvider usage mapping', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('maps usage-only chunks and preserves response content', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        responseFor([
          { choices: [{ delta: { content: 'hello' } }], usage: null },
          { choices: [], usage: { input_tokens: 4, output_tokens: 2 } },
        ]),
      ),
    )
    const provider = createProviderResponseProvider(() =>
      model((usage, context) => {
        const value = (usage ?? (context.chunk as { usage?: unknown }).usage) as {
          input_tokens?: number
          output_tokens?: number
        }
        if (!value) return undefined
        return { prompt_tokens: value.input_tokens, completion_tokens: value.output_tokens, total_tokens: undefined }
      }),
    )
    const result = await provider(
      { [CHAT_PROVIDER_MODEL_ID_REQUEST_KEY]: 'model-a', messages: [] },
      new AbortController().signal,
    )
    const chunks = []
    for await (const chunk of result as AsyncIterable<Record<string, unknown>>) chunks.push(chunk)

    expect(chunks[0]).toMatchObject({ choices: [{ delta: { content: 'hello' } }] })
    expect(chunks[1]).toMatchObject({ choices: [], usage: { prompt_tokens: 4, completion_tokens: 2 } })
  })

  it('removes invalid or throwing mapped usage without dropping content', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        responseFor([
          { choices: [{ delta: { content: 'first' } }], usage: { private_tokens: 9 } },
          { choices: [{ delta: { content: 'second' } }], usage: { private_tokens: 10 } },
        ]),
      ),
    )
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const mapUsage = vi
      .fn()
      .mockReturnValueOnce({ prompt_tokens: -1 })
      .mockImplementationOnce(() => {
        throw new Error('mapping failed')
      })
    const provider = createProviderResponseProvider(() => model(mapUsage))
    const result = await provider(
      { [CHAT_PROVIDER_MODEL_ID_REQUEST_KEY]: 'model-a', messages: [] },
      new AbortController().signal,
    )
    const chunks = []
    for await (const chunk of result as AsyncIterable<Record<string, unknown>>) chunks.push(chunk)

    expect(chunks).toEqual([
      { choices: [{ delta: { content: 'first' } }] },
      { choices: [{ delta: { content: 'second' } }] },
    ])
    expect(warn).toHaveBeenCalledOnce()
  })
})
