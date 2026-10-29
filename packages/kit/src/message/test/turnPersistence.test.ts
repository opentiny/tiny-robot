import { describe, expect, it } from 'vitest'
import { serializeTurnData } from '../core/turnPersistence'

describe('turn persistence serialization', () => {
  it('rejects runtime-only values instead of silently dropping them', () => {
    expect(() => serializeTurnData({ skill: { readText: () => '# guide' } })).toThrow(
      '$.skill.readText: function is not supported',
    )
  })

  it('rejects circular values with the field path', () => {
    const value: { self?: unknown } = {}
    value.self = value

    expect(() => serializeTurnData(value)).toThrow('$.self: circular references are not supported')
  })
})
