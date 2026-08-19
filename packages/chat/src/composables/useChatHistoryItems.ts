import { ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import type { ChatConversationInfo } from '../types'

export type ChatHistoryItem = ChatConversationInfo & {
  raw: ChatConversationInfo
}

export interface UseChatHistoryItemsOptions {
  conversations: MaybeRefOrGetter<readonly ChatConversationInfo[] | undefined>
  defaultTitle: MaybeRefOrGetter<string>
}

export function useChatHistoryItems(
  options: UseChatHistoryItemsOptions,
): Readonly<ShallowRef<readonly ChatHistoryItem[]>> {
  const historyItems = ref<readonly ChatHistoryItem[]>([])
  const historyItemCache = new Map<string, ChatHistoryItem>()

  watch(
    () => [toValue(options.conversations), toValue(options.defaultTitle)] as const,
    ([conversationItems, defaultTitle]) => {
      const activeIds = new Set<string>()
      const items: ChatHistoryItem[] = []

      for (const item of conversationItems ?? []) {
        activeIds.add(item.id)

        const cached = historyItemCache.get(item.id)
        const nextItem = cached ?? ({ id: item.id, title: item.title || defaultTitle, raw: item } as ChatHistoryItem)

        for (const key of Object.keys(nextItem)) {
          if (key !== 'raw' && !(key in item)) {
            delete nextItem[key]
          }
        }

        Object.assign(nextItem, item, {
          id: item.id,
          title: item.title || defaultTitle,
          raw: item,
        })
        historyItemCache.set(item.id, nextItem)
        items.push(nextItem)
      }

      for (const id of historyItemCache.keys()) {
        if (!activeIds.has(id)) {
          historyItemCache.delete(id)
        }
      }

      historyItems.value = items
    },
    { immediate: true, deep: true },
  )

  return historyItems
}
