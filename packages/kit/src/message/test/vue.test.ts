import { describe, expect, it } from 'vitest'
import { toRaw, watch } from 'vue'
import { createVueMessageAdapter } from '../adapters/vue'
import { createMessageEngine } from '../core/engine'
import { lengthPlugin, thinkingPlugin } from '../plugins'
import type { ChatMessage } from '../types'
import { mockResponseProvider } from './mockResponseProvider'

const silentDefaultPlugins = [thinkingPlugin({ disabled: true }), lengthPlugin({ disabled: true })]

describe('createVueMessageAdapter', () => {
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
})
