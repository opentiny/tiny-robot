import { inject, provide } from 'vue'
import { BUBBLE_EVENT_FN_KEY } from '../constants'
import type { BubbleEvent } from '../index.type'

export function setupBubbleEventFn(fn: (event: BubbleEvent) => void): void {
  provide(BUBBLE_EVENT_FN_KEY, fn)
}

export function useBubbleEventFn() {
  return inject(BUBBLE_EVENT_FN_KEY, (event: BubbleEvent) => {
    console.warn(`[Bubble] Event function not found for event: ${event.name}`)
  })
}
