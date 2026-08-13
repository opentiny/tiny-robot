import { afterEach, describe, expect, it, vi } from 'vitest'
import { normalizeChatCompletionsUrl, resolveProviderModels } from '../../src/runtime/provider/presets'
import { createProviderRequestPlugin } from '../../src/runtime/provider/requestPlugin'
import { createProviderResponseProvider } from '../../src/runtime/provider/responseProvider'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('provider helpers', () => {
  it('normalizes chat completion URLs', () => {
    expect(normalizeChatCompletionsUrl('https://example.com/v1')).toBe('https://example.com/v1/chat/completions')
    expect(normalizeChatCompletionsUrl('https://example.com/v1/')).toBe('https://example.com/v1/chat/completions')
    expect(normalizeChatCompletionsUrl('https://example.com/chat/completions')).toBe(
      'https://example.com/chat/completions',
    )
  })

  it('merges preset and model feature configuration', () => {
    const models = resolveProviderModels([
      {
        type: 'deepseek',
        apiKey: 'key',
        models: [{ id: 'model-a', label: 'A', featureBody: { thinking: { enabled: { custom: true } } } }],
      },
    ])
    expect(models[0].featureBody?.thinking?.enabled).toEqual({ custom: true })
  })

  it('rejects duplicate model ids', () => {
    expect(() =>
      resolveProviderModels([
        { type: 'openai', models: [{ id: 'same', label: 'A' }] },
        { type: 'openai', models: [{ id: 'same', label: 'B' }] },
      ]),
    ).toThrow('Duplicate model id')
  })

  it('rejects unknown provider types', () => {
    expect(() =>
      resolveProviderModels([{ type: 'unknown' as never, models: [{ id: 'model-a', label: 'A' }] }]),
    ).toThrow('Unknown provider type: unknown')
  })

  it('maps thinking and search request bodies', () => {
    const plugin = createProviderRequestPlugin(() => ({
      id: 'model-a',
      label: 'A',
      providerType: 'openai',
      providerLabel: 'OpenAI',
      apiUrl: 'url',
      apiKey: 'key',
      featureBody: {
        thinking: { enabled: { thinking: { type: 'enabled' } }, disabled: { thinking: { type: 'disabled' } } },
        search: { enabled: { search: true }, disabled: { search: false } },
      },
      reasoning: { efforts: ['high'], effortParam: 'effort' },
    }))
    const requestBody: Record<string, unknown> = {}
    plugin.onBeforeRequest?.({
      customContext: {
        run_config_context: {
          modelId: 'model-a',
          features: { thinking: true, search: false },
          reasoning: { enabled: true, effort: 'high' },
        },
      },
      requestBody,
    } as never)

    expect(requestBody).toMatchObject({
      __chat_provider_model_id: 'model-a',
      thinking: { type: 'enabled' },
      search: false,
      effort: 'high',
    })
  })

  it('creates a response provider with provider headers and body', async () => {
    const fetchMock = vi.fn(async (_url, init) => new Response('', { status: 200, headers: init?.headers }))
    vi.stubGlobal('fetch', fetchMock)
    const responseProvider = createProviderResponseProvider((id) =>
      id === 'model-a'
        ? {
            id,
            label: 'A',
            providerType: 'openai',
            providerLabel: 'OpenAI',
            apiUrl: 'https://example.com',
            apiKey: 'key',
            headers: { 'X-Test': 'yes' },
          }
        : undefined,
    )
    const signal = new AbortController().signal

    await responseProvider({ __chat_provider_model_id: 'model-a', messages: [] }, signal)
    expect(fetchMock).toHaveBeenCalledWith('https://example.com', expect.objectContaining({ signal, method: 'POST' }))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toMatchObject({ model: 'model-a', stream: true })
  })

  it('rejects missing model, key and failed HTTP responses', async () => {
    const responseProvider = createProviderResponseProvider(() => undefined)
    await expect(responseProvider({ messages: [] }, new AbortController().signal)).rejects.toThrow('No model selected')

    const missingKey = createProviderResponseProvider(() => ({
      id: 'a',
      label: 'A',
      providerType: 'openai',
      providerLabel: 'OpenAI',
      apiUrl: 'url',
    }))
    await expect(
      missingKey({ __chat_provider_model_id: 'a', messages: [] }, new AbortController().signal),
    ).rejects.toThrow('Missing API key')

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('bad', { status: 500, statusText: 'Server Error' })),
    )
    const failed = createProviderResponseProvider(() => ({
      id: 'a',
      label: 'A',
      providerType: 'openai',
      providerLabel: 'OpenAI',
      apiUrl: 'url',
      apiKey: 'key',
    }))
    await expect(failed({ __chat_provider_model_id: 'a', messages: [] }, new AbortController().signal)).rejects.toThrow(
      'HTTP 500',
    )
  })

  it('keeps the timeout active while reading the stream', async () => {
    vi.useFakeTimers()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"choices":[]}\n\n'))
      },
    })
    const fetchMock = vi.fn(async () => new Response('', { status: 200 }))
    fetchMock.mockResolvedValueOnce(new Response(stream, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const responseProvider = createProviderResponseProvider(() => ({
      id: 'a',
      label: 'A',
      providerType: 'openai',
      providerLabel: 'OpenAI',
      apiUrl: 'url',
      apiKey: 'key',
      timeout: 10,
    }))

    const result = (await responseProvider(
      { __chat_provider_model_id: 'a', messages: [] },
      new AbortController().signal,
    )) as AsyncGenerator
    const iterator = result[Symbol.asyncIterator]()
    await expect(iterator.next()).resolves.toEqual({ done: false, value: { choices: [] } })

    const timedOut = iterator.next()
    const timedOutExpectation = expect(timedOut).rejects.toThrow('The operation was aborted')
    await vi.advanceTimersByTimeAsync(10)
    await timedOutExpectation
    expect(fetchMock).toHaveBeenCalledWith('url', expect.objectContaining({ signal: expect.any(AbortSignal) }))
    vi.useRealTimers()
  })

  it('keeps external abort on the fetch signal', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn(async (_url) => {
      return new Response('', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const responseProvider = createProviderResponseProvider(() => ({
      id: 'a',
      label: 'A',
      providerType: 'openai',
      providerLabel: 'OpenAI',
      apiUrl: 'url',
      apiKey: 'key',
    }))

    await responseProvider({ __chat_provider_model_id: 'a', messages: [] }, controller.signal)
    expect(fetchMock).toHaveBeenCalledWith('url', expect.objectContaining({ signal: controller.signal }))
  })
})
