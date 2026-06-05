import { describe, expect, it } from 'vitest'
import { toRaw, watch } from 'vue'
import { createVueMessageAdapter } from '../adapters/vue'
import { createMessageEngine } from '../core/engine'
import type { ChatMessage } from '../types'
import { mockResponseProvider, silentDefaultPlugins } from './helpers'

describe('createVueMessageAdapter', () => {
  it('throws when adapter is initialized more than once', () => {
    const adapter = createVueMessageAdapter()

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

  it('exposes vue refs that stay in sync with engine state', async () => {
    const adapter = createVueMessageAdapter()
    const engine = createMessageEngine(adapter, {
      initialMessages: [{ role: 'user', content: 'hi' }],
      plugins: silentDefaultPlugins,
      responseProvider: mockResponseProvider(['hello', ' world']),
    })

    expect(adapter.requestState.value).toBe('idle')
    expect(adapter.processingState.value).toBeUndefined()
    expect(adapter.messages.value).toHaveLength(1)
    expect(adapter.isProcessing.value).toBe(false)

    await engine.sendMessage('ping')

    expect(adapter.requestState.value).toBe('completed')
    expect(adapter.processingState.value).toBeUndefined()
    expect(adapter.isProcessing.value).toBe(false)
    expect(adapter.messages.value).toHaveLength(3)
    expect(adapter.messages.value[1]).toMatchObject({ role: 'user', content: 'ping' })
    expect(adapter.messages.value[2]).toMatchObject({ role: 'assistant', content: 'hello world', loading: undefined })
  })

  it('keeps subscribe compatible for filtered message updates', async () => {
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

    const adapter = createVueMessageAdapter()
    const engine = createMessageEngine(adapter, {
      plugins: silentDefaultPlugins,
      responseProvider: mockResponseProvider(['hello', ' world']),
    })

    const subscribeSnapshots: ChatMessage[][] = []
    const unsubscribe = engine.subscribe('messages', (state) => {
      subscribeSnapshots.push(structuredClone(state.messages))
    })

    const watchSnapshots: ChatMessage[][] = []
    watch(
      adapter.messages,
      (messages) => {
        watchSnapshots.push(structuredClone(messages.map((m) => toRaw(m))))
      },
      { flush: 'sync', immediate: true },
    )

    await engine.sendMessage('ping')
    unsubscribe()

    expect(subscribeSnapshots).toHaveLength(expectedMessageSnapshots.length)
    subscribeSnapshots.forEach((snapshot, idx) => {
      expect(snapshot).toMatchObject(expectedMessageSnapshots[idx])
    })

    expect(watchSnapshots).toHaveLength(expectedMessageSnapshots.length)
    watchSnapshots.forEach((snapshot, idx) => {
      expect(snapshot).toMatchObject(expectedMessageSnapshots[idx])
    })
  })

  it('updates nested message content through the reactive assistant message reference', async () => {
    const adapter = createVueMessageAdapter()
    const engine = createMessageEngine(adapter, {
      plugins: silentDefaultPlugins,
      responseProvider: mockResponseProvider(['hello', ' world']),
    })

    const contentSnapshots: string[] = []
    let stopWatch = () => {}

    watch(
      adapter.messages,
      (messages) => {
        const assistantMessage = messages.find((message) => message.role === 'assistant')
        stopWatch()
        if (!assistantMessage) {
          return
        }

        stopWatch = watch(
          () => assistantMessage.content,
          (content) => {
            contentSnapshots.push(content as string)
          },
          { flush: 'sync', immediate: true },
        )
      },
      { flush: 'sync', immediate: true },
    )

    await engine.sendMessage('ping')
    stopWatch()

    const distinctSnapshots = contentSnapshots.filter((content, index) => content !== contentSnapshots[index - 1])
    expect(distinctSnapshots).toEqual(['', 'hello', 'hello world'])
  })
})
