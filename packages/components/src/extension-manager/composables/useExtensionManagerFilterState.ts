import { reactive, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { ExtensionManagerTab } from '../index.type'
import type { FilterState } from '../filter.type'

type TabStateRecord = Record<string, FilterState>

const createSafeRecord = <T>() => Object.create(null) as T
const createFilterState = (): FilterState => reactive({ selectedTag: '', searchValue: '' })

export const useExtensionManagerFilterState = (tabs: MaybeRefOrGetter<readonly Pick<ExtensionManagerTab, 'id'>[]>) => {
  const states = reactive<TabStateRecord>(createSafeRecord())
  const noTabState = createFilterState()

  watch(
    () => toValue(tabs).map((tab) => tab.id),
    (tabIds) => {
      const allowed = new Set(tabIds)
      for (const tabId of Object.keys(states)) {
        if (!allowed.has(tabId)) delete states[tabId]
      }
    },
    { immediate: true },
  )

  const getFilterState = (tabId: string | undefined): FilterState => {
    if (tabId === undefined) return noTabState
    return states[tabId] ?? (states[tabId] = createFilterState())
  }

  return { getFilterState }
}
