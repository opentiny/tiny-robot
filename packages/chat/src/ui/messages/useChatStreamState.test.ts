import { effectScope, nextTick, shallowRef } from 'vue'
import type { ShallowRef } from 'vue'
import { describe, expect, it } from 'vitest'
import type { ChatMessageItem, ChatRequestView } from '../../types'
import { createMessageIdentity, resolveStreamState } from './messageIdentity'
import { useChatStreamState } from './useChatStreamState'

function createTracker(
  messages: ShallowRef<ChatMessageItem[]>,
  request: ShallowRef<ChatRequestView>,
  conversationId = shallowRef<string | null>('a'),
) {
  const scope = effectScope()
  const identify = createMessageIdentity('test')
  const state = scope.run(() =>
    useChatStreamState(
      () => messages.value,
      () => request.value,
      () => conversationId.value,
      identify,
    ),
  )!
  return { state, scope, conversationId }
}

describe('useChatStreamState', () => {
  it('confirms an assistant appended after an empty request starts', async () => {
    const messages = shallowRef<ChatMessageItem[]>([])
    const request = shallowRef<ChatRequestView>({ state: 'idle' })
    const tracker = createTracker(messages, request)
    request.value = { state: 'processing' }
    await nextTick()
    const assistant = { id: 'answer', role: 'assistant' }
    messages.value = [assistant]
    await nextTick()
    expect(tracker.state(assistant)).toBe('current')
    expect(resolveStreamState(assistant, request.value, tracker.state(assistant))).toBe('streaming')
    tracker.scope.stop()
  })

  it('keeps snapshots finished and treats a mounted active request as uncertain', async () => {
    const history = { id: 'history', role: 'assistant' }
    const messages = shallowRef<ChatMessageItem[]>([history])
    const request = shallowRef<ChatRequestView>({ state: 'processing' })
    const tracker = createTracker(messages, request)
    const appended = { id: 'later', role: 'assistant' }
    messages.value = [...messages.value, appended]
    await nextTick()
    expect(tracker.state(history)).toBe('history')
    expect(tracker.state(appended)).toBe('unknown')
    tracker.scope.stop()
  })

  it('keeps assistants added with a request start uncertain regardless of update order', async () => {
    const messages = shallowRef<ChatMessageItem[]>([])
    const request = shallowRef<ChatRequestView>({ state: 'idle' })
    const tracker = createTracker(messages, request)
    const assistant = { id: 'same-batch', role: 'assistant' }
    messages.value = [assistant]
    request.value = { state: 'processing' }
    await nextTick()
    expect(tracker.state(assistant)).toBe('unknown')
    tracker.scope.stop()
  })

  it('clears a completed turn before tracking the next assistant', async () => {
    const history = { id: 'history', role: 'assistant' }
    const messages = shallowRef<ChatMessageItem[]>([history])
    const request = shallowRef<ChatRequestView>({ state: 'idle' })
    const tracker = createTracker(messages, request)
    request.value = { state: 'processing' }
    await nextTick()
    expect(tracker.state(history)).toBe('history')
    request.value = { state: 'completed' }
    await nextTick()
    request.value = { state: 'processing' }
    await nextTick()
    const assistant = { id: 'next', role: 'assistant' }
    messages.value = [...messages.value, assistant]
    await nextTick()
    expect(tracker.state(history)).toBe('history')
    expect(tracker.state(assistant)).toBe('current')
    tracker.scope.stop()
  })

  it('retains identity through immutable replacement, pauses and waits for the next assistant after tools', async () => {
    const messages = shallowRef<ChatMessageItem[]>([])
    const request = shallowRef<ChatRequestView>({ state: 'idle' })
    const tracker = createTracker(messages, request)
    request.value = { state: 'processing' }
    await nextTick()
    messages.value = [{ id: 'answer', renderKey: 'turn', role: 'assistant' }]
    await nextTick()
    const replacement = { id: 'server-answer', renderKey: 'turn', role: 'assistant' }
    messages.value = [replacement]
    await nextTick()
    expect(tracker.state(replacement)).toBe('current')
    request.value = { state: 'paused' }
    await nextTick()
    expect(resolveStreamState(replacement, request.value, tracker.state(replacement))).toBe('finished')
    request.value = { state: 'processing', processingState: 'calling-tools' }
    await nextTick()
    expect(resolveStreamState(replacement, request.value, tracker.state(replacement))).toBe('finished')
    const next = { id: 'next', role: 'assistant' }
    messages.value = [...messages.value, next]
    request.value = { state: 'processing' }
    await nextTick()
    expect(tracker.state(replacement)).toBe('history')
    expect(tracker.state(next)).toBe('current')
    tracker.scope.stop()
  })

  it('clears tracking on conversation changes', async () => {
    const messages = shallowRef<ChatMessageItem[]>([])
    const request = shallowRef<ChatRequestView>({ state: 'idle' })
    const tracker = createTracker(messages, request)
    request.value = { state: 'processing' }
    await nextTick()
    messages.value = [{ id: 'answer', role: 'assistant' }]
    await nextTick()
    tracker.conversationId.value = 'b'
    messages.value = [{ id: 'other', role: 'assistant' }]
    await nextTick()
    expect(tracker.state(messages.value[0])).toBe('unknown')
    tracker.scope.stop()
  })
})
