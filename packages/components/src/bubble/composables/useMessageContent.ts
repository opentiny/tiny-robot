import { computed } from 'vue'
import { BubbleContentRendererProps, ChatMessageContent, ChatMessageContentItem } from '../index.type'
import { useContentResolver } from './useContentResolver'

export const useMessageContent = <T extends ChatMessageContent = ChatMessageContent>(
  props: Readonly<BubbleContentRendererProps<T>>,
) => {
  const contentResolver = useContentResolver()

  const content = computed(() => {
    const resolvedContent = contentResolver(props.message)
    return Array.isArray(resolvedContent)
      ? (resolvedContent.at(props.contentIndex) as ChatMessageContentItem)
      : { type: 'text', text: resolvedContent || '' }
  })

  const contentText = computed(() => {
    return content.value.type === 'text' ? String(content.value.text) : ''
  })

  return {
    content,
    contentText,
  }
}
