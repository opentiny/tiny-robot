/* eslint-disable @typescript-eslint/no-explicit-any */

import { isRef, MaybeRefOrGetter, toValue } from 'vue'

// https://github.com/vueuse/vueuse/blob/0c346a9382e038b5ee35353fe3992a710e0fbb7f/packages/shared/useThrottleFn/index.ts
export type FunctionArgs<Args extends any[] = any[], Return = unknown> = (...args: Args) => Return

export interface FunctionWrapperOptions<Args extends any[] = any[], This = any> {
  fn: FunctionArgs<Args, This>
  args: Args
  thisArg: This
}

export type AnyFn = (...args: any[]) => any
export type Promisify<T> = Promise<Awaited<T>>
export type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never
export type PromisifyFn<T extends AnyFn> = (...args: ArgumentsType<T>) => Promisify<ReturnType<T>>

type EventFilter<Args extends any[] = any[], This = any, Invoke extends AnyFn = AnyFn> = (
  invoke: Invoke,
  options: FunctionWrapperOptions<Args, This>,
) => ReturnType<Invoke> | Promisify<ReturnType<Invoke>>

type TimerHandle = ReturnType<typeof setTimeout> | undefined

/**
 * Throttle execution of a function. Especially useful for rate limiting
 * execution of handlers on events like resize and scroll.
 *
 * @param   fn             A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
 *                                    to `callback` when the throttled-function is executed.
 * @param   ms             A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 *                                    (default value: 200)
 *
 * @param [trailing] if true, call fn again after the time is up (default value: false)
 *
 * @param [leading] if true, call fn on the leading edge of the ms timeout (default value: true)
 *
 * @param [rejectOnCancel] if true, reject the last call if it's been cancel (default value: false)
 *
 * @return  A new, throttled, function.
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useThrottleFn<T extends FunctionArgs>(
  fn: T,
  ms: MaybeRefOrGetter<number> = 200,
  trailing = false,
  leading = true,
  rejectOnCancel = false,
): PromisifyFn<T> {
  return createFilterWrapper(throttleFilter(ms, trailing, leading, rejectOnCancel), fn)
}

function createFilterWrapper<T extends AnyFn>(filter: EventFilter, fn: T) {
  function wrapper(this: any, ...args: ArgumentsType<T>) {
    return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
      // make sure it's a promise
      Promise.resolve(filter(() => fn.apply(this, args), { fn, thisArg: this, args }))
        .then(resolve)
        .catch(reject)
    })
  }

  return wrapper
}

export interface ThrottleFilterOptions {
  /**
   * The maximum time allowed to be delayed before it's invoked.
   */
  delay: MaybeRefOrGetter<number>
  /**
   * Whether to invoke on the trailing edge of the timeout.
   */
  trailing?: boolean
  /**
   * Whether to invoke on the leading edge of the timeout.
   */
  leading?: boolean
  /**
   * Whether to reject the last call if it's been cancel.
   */
  rejectOnCancel?: boolean
}

const noop = () => {}

export function throttleFilter(
  ms: MaybeRefOrGetter<number>,
  trailing?: boolean,
  leading?: boolean,
  rejectOnCancel?: boolean,
): EventFilter
export function throttleFilter(options: ThrottleFilterOptions): EventFilter
export function throttleFilter(...args: any[]) {
  let lastExec = 0
  let timer: TimerHandle
  let isLeading = true
  let lastRejector: AnyFn = noop
  let lastValue: any
  let ms: MaybeRefOrGetter<number>
  let trailing: boolean
  let leading: boolean
  let rejectOnCancel: boolean
  if (!isRef(args[0]) && typeof args[0] === 'object')
    ({ delay: ms, trailing = true, leading = true, rejectOnCancel = false } = args[0])
  else [ms, trailing = true, leading = true, rejectOnCancel = false] = args
  const clear = () => {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
      lastRejector()
      lastRejector = noop
    }
  }

  const filter: EventFilter = (_invoke) => {
    const duration = toValue(ms)
    const elapsed = Date.now() - lastExec
    const invoke = () => {
      return (lastValue = _invoke())
    }

    clear()

    if (duration <= 0) {
      lastExec = Date.now()
      return invoke()
    }
    if (elapsed > duration) {
      lastExec = Date.now()
      if (leading || !isLeading) invoke()
    } else if (trailing) {
      lastValue = new Promise((resolve, reject) => {
        lastRejector = rejectOnCancel ? reject : resolve
        timer = setTimeout(
          () => {
            lastExec = Date.now()
            isLeading = true
            resolve(invoke())
            clear()
          },
          Math.max(0, duration - elapsed),
        )
      })
    }

    if (!leading && !timer) timer = setTimeout(() => (isLeading = true), duration)

    isLeading = false
    return lastValue
  }

  return filter
}
