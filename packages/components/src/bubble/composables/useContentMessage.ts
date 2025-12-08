import { inject, provide } from 'vue'
import { BUBBLE_CONTENT_MESSAGE_KEY } from '../constants'
import type { BubbleRendererMessage } from '../index.type'

/**
 * Setup bubble content message
 * Call this function to provide the current message to child components
 *
 * @param message - The message to provide
 */
export function setupBubbleContentMessage(message: BubbleRendererMessage): void {
  provide(BUBBLE_CONTENT_MESSAGE_KEY, message)
}

/**
 * Use bubble content message
 * Call this function in child components to access the current message
 *
 * @returns The current message, or undefined if not provided
 */
export function useBubbleContentMessage(): BubbleRendererMessage | undefined {
  return inject(BUBBLE_CONTENT_MESSAGE_KEY)
}
