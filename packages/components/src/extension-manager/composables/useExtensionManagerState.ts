import { computed, ref, watch, type ComputedRef } from 'vue'
import type {
  ExtensionManagerEmits,
  ExtensionManagerProps,
  ExtensionManagerSectionKey,
  ExtensionManagerTab,
} from '../index.type'

type SectionExpansionState = Record<string, Partial<Record<ExtensionManagerSectionKey, boolean>>>

type ExtensionManagerState = {
  activeTabId: ComputedRef<string | undefined>
  activeTab: ComputedRef<ExtensionManagerTab | undefined>
  selectTab: (tabId: string) => void
  isSectionExpanded: (tabId: string, sectionKey: ExtensionManagerSectionKey) => boolean
  toggleSection: (tabId: string, sectionKey: ExtensionManagerSectionKey) => void
}

const hasOwn = (record: object, key: PropertyKey) => Object.prototype.hasOwnProperty.call(record, key)

const createSafeRecord = <T>() => Object.create(null) as T

const setRecordValue = <T extends object, K extends PropertyKey, V>(record: T, key: K, value: V) => {
  Object.defineProperty(record, key, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  })
}

const cloneSectionExpansionState = (record: SectionExpansionState): SectionExpansionState => {
  const clone = createSafeRecord<SectionExpansionState>()

  for (const [tabId, sectionRecord] of Object.entries(record)) {
    const sectionClone = createSafeRecord<Partial<Record<ExtensionManagerSectionKey, boolean>>>()

    for (const [sectionKey, expanded] of Object.entries(sectionRecord ?? {})) {
      if (sectionKey === 'installed' || sectionKey === 'available') {
        setRecordValue(sectionClone, sectionKey, expanded)
      }
    }

    setRecordValue(clone, tabId, sectionClone)
  }

  return clone
}

const getSectionOverride = (record: SectionExpansionState, tabId: string, sectionKey: ExtensionManagerSectionKey) => {
  if (!hasOwn(record, tabId)) return undefined

  const sectionRecord = record[tabId]
  if (sectionRecord === undefined || !hasOwn(sectionRecord, sectionKey)) return undefined

  return sectionRecord[sectionKey]
}

const setSectionOverride = (
  record: SectionExpansionState,
  tabId: string,
  sectionKey: ExtensionManagerSectionKey,
  expanded: boolean,
) => {
  const sectionRecord =
    hasOwn(record, tabId) && record[tabId] !== undefined
      ? record[tabId]!
      : createSafeRecord<Partial<Record<ExtensionManagerSectionKey, boolean>>>()

  if (!hasOwn(record, tabId)) setRecordValue(record, tabId, sectionRecord)
  setRecordValue(sectionRecord, sectionKey, expanded)
}

const getExpanded = (record: SectionExpansionState, tabId: string, sectionKey: ExtensionManagerSectionKey) =>
  getSectionOverride(record, tabId, sectionKey) ?? true

export const useExtensionManagerState = (
  props: Readonly<ExtensionManagerProps>,
  emit: ExtensionManagerEmits,
): ExtensionManagerState => {
  const uncontrolledActiveTabId = ref(props.defaultActiveTab)
  const sectionExpansionState = ref<SectionExpansionState>(createSafeRecord())

  const tabIds = computed(() => props.tabs.map((tab) => tab.id))
  const firstTabId = computed(() => tabIds.value[0])

  watch(
    tabIds,
    (tabIds) => {
      const allowedTabIds = new Set(tabIds)
      const next = createSafeRecord<SectionExpansionState>()

      for (const [tabId, sectionRecord] of Object.entries(sectionExpansionState.value)) {
        if (allowedTabIds.has(tabId)) setRecordValue(next, tabId, sectionRecord)
      }

      sectionExpansionState.value = next
    },
    { immediate: true },
  )

  const normalizedUncontrolledActiveTab = (nextTabIds: string[]) => {
    if (nextTabIds.includes(uncontrolledActiveTabId.value ?? '')) return

    uncontrolledActiveTabId.value = nextTabIds[0]
  }

  watch(
    [tabIds, () => props.activeTab],
    ([nextTabIds, activeTab]) => {
      if (activeTab !== undefined) return

      normalizedUncontrolledActiveTab(nextTabIds)
    },
    { immediate: true },
  )

  const activeTabId = computed<string | undefined>(() => {
    const requestedTabId = props.activeTab ?? uncontrolledActiveTabId.value
    const requestedTab = props.tabs.find((tab) => tab.id === requestedTabId)

    return requestedTab?.id ?? firstTabId.value
  })

  const activeTab = computed<ExtensionManagerTab | undefined>(() =>
    activeTabId.value === undefined ? undefined : props.tabs.find((tab) => tab.id === activeTabId.value),
  )

  let lastEmittedActiveTabId = props.activeTab
  watch(
    activeTabId,
    (nextActiveTabId) => {
      if (props.activeTab !== undefined && nextActiveTabId === props.activeTab) {
        lastEmittedActiveTabId = nextActiveTabId
        return
      }

      if (nextActiveTabId === lastEmittedActiveTabId) return

      lastEmittedActiveTabId = nextActiveTabId
      emit('update:active-tab', nextActiveTabId)
    },
    { immediate: true },
  )

  const isSectionExpanded = (tabId: string, sectionKey: ExtensionManagerSectionKey) => {
    return getExpanded(sectionExpansionState.value, tabId, sectionKey)
  }

  const selectTab = (tabId: string) => {
    const tab = props.tabs.find((candidate) => candidate.id === tabId)
    if (!tab || activeTabId.value === tab.id) return

    if (props.activeTab === undefined) uncontrolledActiveTabId.value = tab.id
    else emit('update:active-tab', tab.id)

    emit('tab-change', { tabId: tab.id })
  }

  const toggleSection = (tabId: string, sectionKey: ExtensionManagerSectionKey) => {
    if (!props.tabs.some((tab) => tab.id === tabId)) return

    const expanded = !isSectionExpanded(tabId, sectionKey)

    const nextSectionExpansionState = cloneSectionExpansionState(sectionExpansionState.value)
    setSectionOverride(nextSectionExpansionState, tabId, sectionKey, expanded)
    sectionExpansionState.value = nextSectionExpansionState

    emit('section-toggle', { tabId, sectionKey, expanded })
  }

  return {
    activeTabId,
    activeTab,
    selectTab,
    isSectionExpanded,
    toggleSection,
  }
}
