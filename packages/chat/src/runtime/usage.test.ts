import { describe, expect, it } from 'vitest'
import { isChatTokenUsage, resolveChatTokenUsage } from './usage'

describe('chat token usage', () => {
  it('accepts partial integer snapshots including zero', () => {
    expect(isChatTokenUsage({ prompt_tokens: 0 })).toBe(true)
    expect(isChatTokenUsage({ prompt_tokens: 4, completion_tokens: 2, total_tokens: undefined })).toBe(true)
    expect(resolveChatTokenUsage({ prompt_tokens: undefined, completion_tokens: 0 })).toMatchObject({
      completion_tokens: 0,
    })
    expect(resolveChatTokenUsage({ completion_tokens: 12, extra: 'ignored' })).toEqual({
      completion_tokens: 12,
      extra: 'ignored',
    })
  })

  it.each([
    null,
    {},
    { prompt_tokens: undefined, completion_tokens: undefined, total_tokens: undefined },
    [],
    { prompt_tokens: -1 },
    { total_tokens: 1.5 },
    { completion_tokens: Infinity },
    { total_tokens: '2' },
    { total_tokens: Number.MAX_SAFE_INTEGER + 1 },
  ])('rejects invalid usage %j', (value) => {
    expect(isChatTokenUsage(value)).toBe(false)
    expect(resolveChatTokenUsage(value)).toBeUndefined()
  })
})
