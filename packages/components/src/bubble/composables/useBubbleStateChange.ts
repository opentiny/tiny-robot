import { provide } from 'vue'
import { BUBBLE_STATE_CHANGE_FN_KEY } from '../constants'
import { useBubbleEventFn } from './useBubbleEvent'

export function setupBubbleStateChangeFn(fn: (key: string, value: unknown) => void): void {
  provide(BUBBLE_STATE_CHANGE_FN_KEY, fn)
}

export function useBubbleStateChangeFn() {
  const handleBubbleEvent = useBubbleEventFn()

  return (key: string, value: unknown) => {
    handleBubbleEvent({
      name: 'state:update',
      payload: { key, value },
    })
  }
}
