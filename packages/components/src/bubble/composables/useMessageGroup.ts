import { inject, MaybeRefOrGetter, provide } from 'vue'
import { BUBBLE_MESSAGE_GROUP_KEY } from '../constants'
import type { BubbleMessageGroup } from '../index.type'

export function setupBubbleMessageGroup(messageGroup: MaybeRefOrGetter<BubbleMessageGroup | undefined>): void {
  provide(BUBBLE_MESSAGE_GROUP_KEY, messageGroup)
}

export function useBubbleMessageGroup(): MaybeRefOrGetter<BubbleMessageGroup | undefined> {
  return inject(BUBBLE_MESSAGE_GROUP_KEY, undefined)
}
