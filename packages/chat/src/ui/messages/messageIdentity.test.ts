import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { getBubbleMessageGroups } from '../../../../components/src/bubble/messageGroups'
import type { ChatMessageItem } from '../../types'
import {
  createMessageIdentity,
  getAdditionalAnchorIndexes,
  getMessageAnchorText,
  resolveStreamState,
} from './messageIdentity'

describe('Chat message identity', () => {
  it('keeps explicit keys across immutable replacement and server ID changes', () => {
    const identify = createMessageIdentity('chat')
    expect(identify({ renderKey: 'turn', id: 'temporary' }, 'a')).toBe(
      identify({ renderKey: 'turn', id: 'server' }, 'a'),
    )
    expect(identify({ id: 'server' }, 'a')).toBe(identify({ id: 'server', content: 'updated' }, 'a'))
  })

  it('falls back from empty render keys to stable message IDs', () => {
    const identify = createMessageIdentity('chat')
    const key = identify({ renderKey: '', id: 'first' }, 'a')
    expect(key).toBe(identify({ id: 'first', content: 'updated' }, 'a'))
    expect(identify({ renderKey: '', id: 'second' }, 'a')).not.toBe(key)
  })

  it.each([{ renderKey: '' }, { id: '' }, { renderKey: '', id: '' }])(
    'uses object identity for empty identifiers %j',
    (identifiers) => {
      const identify = createMessageIdentity('chat')
      const message = { ...identifiers }
      const key = identify(message, 'a')
      expect(identify({ ...identifiers }, 'a')).not.toBe(key)
      expect(identify(message, 'a')).toBe(key)
      expect(identify(reactive(message), 'a')).toBe(key)
    },
  )

  it('isolates conversations and Chat instances, and recognizes raw/proxied originals', () => {
    const identify = createMessageIdentity('chat-a')
    const message = { content: 'hello' }
    const key = identify(message, 'a')
    expect(identify(reactive(message), 'a')).toBe(key)
    expect(identify({ content: 'hello' }, 'a')).not.toBe(key)
    expect(identify(message, 'b')).not.toBe(key)
    expect(createMessageIdentity('chat-b')(message, 'a')).not.toBe(key)
    expect(message).not.toHaveProperty('renderKey')
  })
})

describe('Chat stream state', () => {
  it('keeps history finished when streaming fields are absent', () => {
    expect(resolveStreamState({ role: 'assistant' })).toBe('finished')
    expect(resolveStreamState({ role: 'assistant' }, { state: 'processing' }, 'history')).toBe('finished')
    expect(resolveStreamState({ role: 'assistant' }, { state: 'completed' }, 'current')).toBe('finished')
  })

  it('keeps explicit state first and ignores loading for automatic state', () => {
    expect(resolveStreamState({ streamState: 'streaming', loading: false })).toBe('streaming')
    expect(resolveStreamState({ streamState: 'unknown', loading: false })).toBe('unknown')
    expect(resolveStreamState({ streamState: 'finished', loading: true })).toBe('finished')
    expect(resolveStreamState({ loading: true }, { state: 'processing' }, 'history')).toBe('finished')
    expect(resolveStreamState({ loading: false }, { state: 'processing' }, 'current')).toBe('streaming')
    expect(resolveStreamState({}, { state: 'processing' }, 'unknown')).toBe('unknown')
  })

  it('finishes user, system, tool-stage and completed request messages', () => {
    expect(resolveStreamState({ role: 'user' }, { state: 'processing' }, 'current')).toBe('finished')
    expect(resolveStreamState({ role: 'system' }, { state: 'processing' }, 'current')).toBe('finished')
    expect(resolveStreamState({}, { state: 'processing', processingState: 'calling-tools' }, 'current')).toBe(
      'finished',
    )
    for (const state of ['completed', 'aborted', 'paused', 'error'] as const) {
      expect(resolveStreamState({}, { state }, 'current')).toBe('finished')
    }
  })
})

describe('Chat user message anchor text', () => {
  it('prefers display content and joins text parts without exposing nontext objects', () => {
    expect(getMessageAnchorText({ content: 'raw', state: { content: 'display' } })).toBe('display')
    expect(
      getMessageAnchorText({
        content: [{ type: 'text', text: 'one' }, { type: 'image_url' }, { type: 'text', text: 'two' }],
      }),
    ).toBe('one two')
    expect(getMessageAnchorText({ content: 'raw', state: { content: '' } })).toBe('')
  })

  it('includes statements and instructions from user messages', () => {
    expect(getMessageAnchorText({ role: 'user', content: '这是当前会话的背景信息。' })).toBe('这是当前会话的背景信息。')
    expect(getMessageAnchorText({ role: 'user', content: '请保留当前输入草稿' })).toBe('请保留当前输入草稿')
  })
})

describe('Chat user message anchor targets', () => {
  it('includes consecutive user messages when assistant is the divider role', () => {
    const messages = [
      { role: 'user', content: 'first' },
      { role: 'user', content: 'second' },
      { role: 'assistant', content: 'reply' },
    ] as ChatMessageItem[]
    const groups = getBubbleMessageGroups(messages, 'divider', 'assistant')

    expect(groups.map((group) => group.messageIndexes)).toEqual([[0, 1], [2]])
    expect([...getAdditionalAnchorIndexes(groups, messages)]).toEqual([1])
  })
})
