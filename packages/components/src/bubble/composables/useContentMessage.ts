import { inject, provide } from 'vue'
import { BUBBLE_CONTENT_MESSAGE_KEY } from '../constants'
import type { BubbleContent } from '../index.type'

// TODO delete
export function setupBubbleContentMessage(message: BubbleContent): void {
  provide(BUBBLE_CONTENT_MESSAGE_KEY, message)
}

export function useBubbleContentMessage() {
  return inject(BUBBLE_CONTENT_MESSAGE_KEY)
}
