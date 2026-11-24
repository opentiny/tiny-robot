import { describe, expect, it, vi } from 'vitest'
import type { ChatMessageItem } from '../../types'
import { formatChatMessageTimestamp, resolveChatMessageTimestamp } from './messageTimestamp'

describe('chat message timestamp', () => {
  it('formats messages from today as local HH:mm', () => {
    const now = new Date(2026, 10, 17, 15, 30)
    const timestamp = new Date(2026, 10, 17, 9, 5).getTime() / 1000

    expect(formatChatMessageTimestamp(timestamp, now)).toBe('09:05')
  })

  it('formats earlier dates with date and time, including the year when needed', () => {
    const now = new Date(2026, 10, 17, 15, 30)
    const previousDay = new Date(2026, 10, 16, 20, 49).getTime() / 1000
    const previousYear = new Date(2025, 8, 29, 20, 49).getTime() / 1000

    expect(formatChatMessageTimestamp(previousDay, now)).toBe('11月16日 20:49')
    expect(formatChatMessageTimestamp(previousYear, now)).toBe('2025年9月29日 20:49')
  })

  it('only resolves completed assistant messages and supports a formatter override', () => {
    const message: ChatMessageItem = {
      role: 'assistant',
      streamState: 'finished',
      metadata: { completedAt: 1_800_000_000 },
    }
    const format = vi.fn(() => 'custom time')

    expect(resolveChatMessageTimestamp(message, format)?.label).toBe('custom time')
    expect(format).toHaveBeenCalledWith(1_800_000_000, { message })
    expect(resolveChatMessageTimestamp({ ...message, streamState: 'streaming' })).toBeUndefined()
    expect(resolveChatMessageTimestamp({ ...message, role: 'user' })).toBeUndefined()
    expect(resolveChatMessageTimestamp({ ...message, metadata: {} })).toBeUndefined()
    expect(resolveChatMessageTimestamp({ ...message, metadata: { completedAt: NaN } })).toBeUndefined()
  })

  it.each([NaN, Infinity, -Infinity, 1e20, '1800000000', null])(
    'rejects invalid completion time %s before calling the formatter',
    (completedAt) => {
      const format = vi.fn(() => 'custom time')
      expect(
        resolveChatMessageTimestamp({ role: 'assistant', streamState: 'finished', metadata: { completedAt } }, format),
      ).toBeUndefined()
      expect(format).not.toHaveBeenCalled()
    },
  )

  it.each([undefined, '', '   '])('hides timestamps when the formatter returns %s', (label) => {
    expect(
      resolveChatMessageTimestamp(
        { role: 'assistant', streamState: 'finished', metadata: { completedAt: 1_800_000_000 } },
        () => label,
      ),
    ).toBeUndefined()
  })

  it('isolates formatter errors and can recover on the next resolution', () => {
    const message: ChatMessageItem = {
      role: 'assistant',
      streamState: 'finished',
      metadata: { completedAt: 1_800_000_000 },
    }
    expect(
      resolveChatMessageTimestamp(message, () => {
        throw new Error('formatter failed')
      }),
    ).toBeUndefined()
    expect(resolveChatMessageTimestamp(message, () => 'recovered')?.label).toBe('recovered')
  })

  it('uses the supplied current date when the same message crosses midnight and a year boundary', () => {
    const message: ChatMessageItem = {
      role: 'assistant',
      streamState: 'finished',
      metadata: { completedAt: new Date(2026, 11, 31, 23, 59).getTime() / 1000 },
    }
    expect(resolveChatMessageTimestamp(message, undefined, new Date(2026, 11, 31, 23, 59))?.label).toBe('23:59')
    expect(resolveChatMessageTimestamp(message, undefined, new Date(2027, 0, 1))?.label).toBe('2026年12月31日 23:59')
  })
})
