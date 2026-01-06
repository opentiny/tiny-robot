import { computed } from 'vue'
import { BubbleContentRendererProps, ChatMessageContent, ChatMessageContentItem } from '../index.type'
import { useContentResolver } from './useContentResolver'

export const useMessageContent = <T extends ChatMessageContent = ChatMessageContent>(
  props: Readonly<BubbleContentRendererProps<T>>,
) => {
  const contentResolver = useContentResolver()

  const content = computed(() => contentResolver(props.message))

  const contentItem = computed(() => {
    const c = content.value
    return Array.isArray(c) ? (c.at(props.contentIndex ?? 0) as ChatMessageContentItem | undefined) : undefined
  })

  const contentText = computed(() => {
    const c = content.value
    return Array.isArray(c) ? String(c.at(props.contentIndex ?? 0)?.text || '') : c || ''
  })

  return {
    content,
    contentItem,
    contentText,
  }
}
