import { describe, expect, it } from 'vitest'
import { formatRequestError } from '../../src/ui/formatRequestError'

describe('formatRequestError', () => {
  it('uses JSON for serializable objects', () => {
    expect(formatRequestError({ code: 'E_REQUEST', message: 'failed' })).toBe('{"code":"E_REQUEST","message":"failed"}')
  })

  it('returns a safe fallback when serialization and string coercion fail', () => {
    const error = Object.create(null) as { toJSON: () => never }
    error.toJSON = () => {
      throw new Error('serialize failed')
    }
    Object.defineProperty(error, 'toString', {
      value: () => {
        throw new Error('coerce failed')
      },
    })

    expect(formatRequestError(error)).toBe('未知请求错误')
  })
})
