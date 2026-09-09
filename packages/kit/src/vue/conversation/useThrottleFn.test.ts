import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { throttleFilter, useThrottleFn } from './useThrottleFn'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useThrottleFn', () => {
  it('runs immediately on the leading edge and resolves the trailing call with its result', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000)
    const calls: string[] = []
    const throttled = useThrottleFn(
      (value: string) => {
        calls.push(value)
        return value.toUpperCase()
      },
      100,
      true,
    )

    await expect(throttled('first')).resolves.toBe('FIRST')
    const trailing = throttled('second')
    expect(calls).toEqual(['first'])

    await vi.advanceTimersByTimeAsync(100)

    await expect(trailing).resolves.toBe('SECOND')
    expect(calls).toEqual(['first', 'second'])
  })

  it('uses a reactive delay and executes every call when delay is zero', async () => {
    const delay = ref(100)
    const calls: number[] = []
    const throttled = useThrottleFn((value: number) => {
      calls.push(value)
      return value * 2
    }, delay)

    delay.value = 0

    await expect(throttled(2)).resolves.toBe(4)
    await expect(throttled(3)).resolves.toBe(6)
    expect(calls).toEqual([2, 3])
  })

  it('preserves the caller context and arguments', async () => {
    const receiver = {
      prefix: 'robot',
      run: useThrottleFn(function (this: { prefix: string }, suffix: string) {
        return `${this.prefix}-${suffix}`
      }, 0),
    }

    await expect(receiver.run('kit')).resolves.toBe('robot-kit')
  })

  it('rejects a cancelled trailing call when rejectOnCancel is enabled', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000)
    const throttled = useThrottleFn((value: string) => value, 100, true, true, true)

    await throttled('leading')
    const cancelled = throttled('cancelled')
    const rejection = expect(cancelled).rejects.toBeUndefined()
    const latest = throttled('latest')

    await rejection
    await vi.advanceTimersByTimeAsync(100)
    await expect(latest).resolves.toBe('latest')
  })

  it('supports the options overload with a non-leading trailing invocation', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const calls: string[] = []
    const filter = throttleFilter({ delay: 100, leading: false, trailing: true })
    const invoke = (value: string) => filter(() => calls.push(value), { fn: () => value, args: [], thisArg: undefined })

    const cancelled = Promise.resolve(invoke('first'))
    vi.setSystemTime(50)
    const trailing = Promise.resolve(invoke('second'))

    await cancelled
    expect(calls).toEqual([])

    await vi.advanceTimersByTimeAsync(50)
    await trailing

    expect(calls).toEqual(['second'])
  })
})
