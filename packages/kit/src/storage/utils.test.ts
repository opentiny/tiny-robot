import { reactive } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { ChatMessage } from '../types'
import { transformMessages, unwrapProxy } from './utils'

describe('unwrapProxy', () => {
  it('creates a serializable graph while preserving supported values and shared references', () => {
    const shared = { value: 1 }
    const source: Record<string, unknown> = {
      nested: shared,
      list: [shared],
      date: new Date('2026-09-08T00:00:00.000Z'),
      regexp: /robot/gi,
      buffer: new Uint8Array([1, 2, 3]).buffer,
      blob: new Blob(['hello'], { type: 'text/plain' }),
      callback: () => 'ignored',
      token: Symbol('ignored'),
    }
    Object.defineProperty(source, 'computed', { enumerable: true, get: () => 'ignored' })
    source.self = source

    const result = unwrapProxy(reactive(source))

    expect(result).not.toBe(source)
    expect(result.nested).toEqual({ value: 1 })
    expect(result.nested).toBe((result.list as unknown[])[0])
    expect(result.date).toBe(source.date)
    expect(result.regexp).toBe(source.regexp)
    expect(result.buffer).toBe(source.buffer)
    expect(result.blob).toBe(source.blob)
    expect(result.self).toBe(result)
    expect(result).not.toHaveProperty('callback')
    expect(result).not.toHaveProperty('token')
    expect(result).not.toHaveProperty('computed')
  })

  it('passes through null, undefined, and primitive values', () => {
    expect(unwrapProxy(null)).toBeNull()
    expect(unwrapProxy(undefined)).toBeUndefined()
    expect(unwrapProxy('text')).toBe('text')
    expect(unwrapProxy(42)).toBe(42)
  })

  it('falls back to an empty container when an object cannot be inspected', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const inaccessible = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error('cannot inspect')
        },
      },
    )

    expect(unwrapProxy(inaccessible)).toEqual({})
  })
})

describe('transformMessages', () => {
  it('preserves modern message content', () => {
    const message: ChatMessage = { role: 'user', content: 'already modern' }

    expect(transformMessages([message])).toEqual([{ role: 'user', content: 'already modern' }])
  })

  it('combines legacy reasoning and text segments and removes renderContent', () => {
    const message = {
      role: 'assistant',
      content: 'old',
      metadata: { id: 'message-1' },
      renderContent: [
        { type: 'collapsible-text', content: 'reason ' },
        { type: 'collapsible-text', content: 'complete' },
        { type: 'markdown', content: 'new ' },
        { type: 'text', content: 'answer' },
        { type: 'image', content: 'ignored' },
      ],
    } as ChatMessage

    expect(transformMessages([message])).toEqual([
      {
        role: 'assistant',
        content: 'new answer',
        reasoning_content: 'reason complete',
        metadata: { id: 'message-1' },
      },
    ])
  })
})
