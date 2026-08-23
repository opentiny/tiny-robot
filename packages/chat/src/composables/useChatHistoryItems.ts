import { ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import type { ChatConversationInfo, ChatHistoryData, ChatHistoryGroup } from '../types'
import type { HistoryGroup } from '@opentiny/tiny-robot'

export type ChatHistoryItem = ChatConversationInfo & {
  raw: ChatConversationInfo
}

export interface UseChatHistoryItemsOptions {
  conversations: MaybeRefOrGetter<readonly ChatConversationInfo[] | undefined>
  defaultTitle: MaybeRefOrGetter<string>
}

export interface UseChatHistoryDataOptions extends UseChatHistoryItemsOptions {
  history?: MaybeRefOrGetter<ChatHistoryData | undefined>
}

export type ChatHistoryDisplayData = ChatHistoryItem[] | HistoryGroup<ChatHistoryItem>[]

function createHistoryNormalizer() {
  const historyItemCache = new Map<string, ChatHistoryItem>()

  function normalizeItem(item: ChatConversationInfo, defaultTitle: string) {
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

    return nextItem
  }

  function prune(activeIds: Set<string>) {
    for (const id of historyItemCache.keys()) {
      if (!activeIds.has(id)) {
        historyItemCache.delete(id)
      }
    }
  }

  return { normalizeItem, prune }
}

export function useChatHistoryItems(
  options: UseChatHistoryItemsOptions,
): Readonly<ShallowRef<readonly ChatHistoryItem[]>> {
  const historyItems = ref<readonly ChatHistoryItem[]>([])
  const normalizer = createHistoryNormalizer()

  watch(
    () => [toValue(options.conversations), toValue(options.defaultTitle)] as const,
    ([conversationItems, defaultTitle]) => {
      const activeIds = new Set<string>()
      const items: ChatHistoryItem[] = []

      for (const item of conversationItems ?? []) {
        activeIds.add(item.id)

        items.push(normalizer.normalizeItem(item, defaultTitle))
      }

      normalizer.prune(activeIds)

      historyItems.value = items
    },
    { immediate: true, deep: true },
  )

  return historyItems
}

export function useChatHistoryData(options: UseChatHistoryDataOptions): Readonly<ShallowRef<ChatHistoryDisplayData>> {
  const historyData = ref<ChatHistoryDisplayData>([])
  const normalizer = createHistoryNormalizer()

  watch(
    () => [toValue(options.conversations), toValue(options.defaultTitle), toValue(options.history)] as const,
    ([conversationItems, defaultTitle, providedHistory]) => {
      const source: ChatHistoryData = providedHistory ?? conversationItems ?? []
      const groups = isHistoryGroupData(source) ? source : undefined
      const activeIds = new Set<string>()

      const normalizeItems = (items: readonly ChatConversationInfo[]) =>
        items.map((item) => {
          activeIds.add(item.id)
          return normalizer.normalizeItem(item, defaultTitle)
        })

      historyData.value = groups
        ? groups.map((group) => ({ group: group.group, items: normalizeItems(group.items) }))
        : normalizeItems(source as readonly ChatConversationInfo[])

      normalizer.prune(activeIds)
    },
    { immediate: true, deep: true },
  )

  return historyData
}

function isHistoryGroupData(data: ChatHistoryData): data is readonly ChatHistoryGroup[] {
  return data.length > 0 && typeof (data[0] as ChatHistoryGroup).group !== 'undefined'
}
