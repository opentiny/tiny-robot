import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { createMessageIdentity, getMessageAnchorText, resolveStreamState } from './messageIdentity'

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
    expect(resolveStreamState({ role: 'assistant' }, { state: 'processing' }, false)).toBe('finished')
    expect(resolveStreamState({ role: 'assistant' }, { state: 'completed' }, true)).toBe('finished')
  })

  it('separates explicit streams, completed messages and insufficient active state', () => {
    expect(resolveStreamState({ loading: true })).toBe('streaming')
    expect(resolveStreamState({ loading: false }, { state: 'processing' }, true)).toBe('finished')
    expect(resolveStreamState({ role: 'assistant' }, { state: 'processing' }, true)).toBe('unknown')
    expect(resolveStreamState({ streamState: 'unknown', loading: false })).toBe('unknown')
    expect(resolveStreamState({ streamState: 'finished', loading: true })).toBe('finished')
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
