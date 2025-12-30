import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import { BubbleMessage, ChatMessageContent, ChatMessageContentItem } from '../index.type'

export const resolveMessageContent = (message: BubbleMessage) => {
  return (message.state?.content as ChatMessageContent | undefined) ?? message.content
}

export const useMessageContent = <T = string | ChatMessageContentItem | undefined>(
  message: MaybeRefOrGetter<BubbleMessage>,
  contentIndex?: number,
) => {
  return computed(() => {
    const content = resolveMessageContent(toValue(message))

    if (Array.isArray(content)) {
      return content.at(contentIndex ?? 0)
    }

    return content
  }) as ComputedRef<T>
}
