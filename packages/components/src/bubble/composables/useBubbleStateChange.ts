import { inject, provide } from 'vue'
import { BUBBLE_STATE_CHANGE_FN_KEY } from '../constants'

export function setupBubbleStateChangeFn(fn: (key: string, value: unknown) => void): void {
  provide(BUBBLE_STATE_CHANGE_FN_KEY, fn)
}

export function useBubbleStateChangeFn() {
  return inject(BUBBLE_STATE_CHANGE_FN_KEY, undefined)
}
