<script setup lang="ts">
import { computed } from 'vue'
import { useExtensionManagerState } from './composables/useExtensionManagerState'
import { useExtensionManagerFilterState } from './composables/useExtensionManagerFilterState'
import { useStableId } from '../shared/composables'
import { useFilter } from './composables/useFilter'
import ExtensionManagerSection from './components/ExtensionManagerSection.vue'
import ExtensionManagerTabs from './components/ExtensionManagerTabs.vue'
import ExtensionFilterControls from './components/ExtensionFilterControls.vue'
import type {
  ExtensionCardGridActionEvent,
  ExtensionCardGridNameClickEvent,
  ExtensionCardGridItem,
  ExtensionManagerEmits,
  ExtensionManagerItem,
  ExtensionManagerProps,
  ExtensionManagerSectionKey,
  ExtensionManagerSlots,
} from './index.type'
import type { ExtensionManagerSectionState } from './components/ExtensionManagerSection.types'

defineOptions({ name: 'ExtensionManager' })

const props = withDefaults(defineProps<ExtensionManagerProps>(), {
  emptyText: '暂无内容',
})

const emit = defineEmits<ExtensionManagerEmits>()
const slots = defineSlots<ExtensionManagerSlots>()

const SECTION_DEFINITIONS: readonly {
  key: ExtensionManagerSectionKey
  title: string
}[] = [
  { key: 'installed', title: '已安装' },
  { key: 'available', title: '可安装' },
]

const encodeSectionPart = (value: string) => value.length + ':' + value

const getSectionStateKey = (tabId: string, sectionKey: ExtensionManagerSectionKey) =>
  'extension-manager/section/' + encodeSectionPart(tabId) + '/' + encodeSectionPart(sectionKey)

const managerId = useStableId()
const managerIdPrefix = 'extension-manager-' + managerId
const getTabDomId = (tabId: string) => managerIdPrefix + '-tab-' + encodeSectionPart(tabId)
const getTabPanelDomId = (tabId: string) => managerIdPrefix + '-tabpanel-' + encodeSectionPart(tabId)

const stateEmit = ((event: string, payload?: unknown) => {
  switch (event) {
    case 'update:active-tab':
      emit('update:active-tab', payload as string | undefined)
      break
    case 'tab-change':
      emit('tab-change', payload as { tabId: string })
      break
    case 'section-toggle':
      emit('section-toggle', payload as { tabId: string; sectionKey: ExtensionManagerSectionKey; expanded: boolean })
      break
  }
}) as unknown as ExtensionManagerEmits

const { activeTab, activeTabId, selectTab, isSectionExpanded, toggleSection } = useExtensionManagerState(
  props,
  stateEmit,
)

const { getFilterState } = useExtensionManagerFilterState(() => props.tabs)
const deriveTags = (items: readonly ExtensionManagerItem[]) => {
  const values = new Set(items.flatMap((item) => item.tags ?? []))
  return [...values].map((value) => ({ value, label: value }))
}
const filter = useFilter<ExtensionManagerItem>({
  items: () => activeTab.value?.items ?? [],
  tags: () => deriveTags(activeTab.value?.items ?? []),
  state: () => getFilterState(activeTabId.value),
})

const hasActiveTab = computed(() => activeTab.value !== undefined)
const hasHeader = computed(() => Boolean(props.title || slots['header-actions']))

const toCardGridItem = (item: ExtensionManagerItem): ExtensionCardGridItem => {
  const { installed, tags, ...cardItem } = item

  void installed
  void tags
  return cardItem
}

const activeSections = computed<ExtensionManagerSectionState[]>(() => {
  const items = filter.filteredItems.value

  return SECTION_DEFINITIONS.map(({ key, title }) => ({
    key,
    title,
    items: items.filter((item) => (item.installed === true ? 'installed' : 'available') === key).map(toCardGridItem),
  }))
})

const getSectionExpanded = (tabId: string, sectionKey: ExtensionManagerSectionKey) =>
  isSectionExpanded(tabId, sectionKey)

const handleSectionToggle = (tabId: string, sectionKey: ExtensionManagerSectionKey) => {
  if (activeTab.value?.id !== tabId) return

  toggleSection(tabId, sectionKey)
}

const handleAction = (tabId: string, sectionKey: ExtensionManagerSectionKey, event: ExtensionCardGridActionEvent) => {
  emit('action', {
    tabId,
    sectionKey,
    itemId: event.itemId,
    action: event.action,
  })
}

const handleNameClick = (
  tabId: string,
  sectionKey: ExtensionManagerSectionKey,
  event: ExtensionCardGridNameClickEvent,
) => {
  emit('name-click', {
    tabId,
    sectionKey,
    itemId: event.itemId,
    event: event.event,
  })
}
</script>

<template>
  <div class="extension-manager">
    <div v-if="hasHeader" class="extension-manager__header">
      <div v-if="props.title" class="extension-manager__title">{{ props.title }}</div>
      <div v-if="slots['header-actions']" class="extension-manager__header-actions">
        <slot name="header-actions" />
      </div>
    </div>

    <ExtensionManagerTabs
      :tabs="props.tabs"
      :active-tab-id="activeTabId"
      :id-prefix="managerIdPrefix"
      @select="selectTab"
    >
      <template v-if="slots.tab" #tab="{ tab, active, select }">
        <slot name="tab" :tab="tab" :active="active" :select="select" />
      </template>
    </ExtensionManagerTabs>

    <ExtensionFilterControls v-bind="filter.controls.value" />

    <div
      v-if="hasActiveTab"
      class="extension-manager__sections"
      role="tabpanel"
      :id="getTabPanelDomId(activeTabId!)"
      :aria-labelledby="getTabDomId(activeTabId!)"
    >
      <ExtensionManagerSection
        v-for="section in activeSections"
        :key="getSectionStateKey(activeTabId!, section.key)"
        :tab-id="activeTabId!"
        :section="section"
        :expanded="getSectionExpanded(activeTabId!, section.key)"
        @section-toggle="handleSectionToggle(activeTabId!, section.key)"
        @action="handleAction(activeTabId!, section.key, $event)"
        @name-click="handleNameClick(activeTabId!, section.key, $event)"
      >
        <template v-if="slots.item" #item="{ item, index }">
          <slot name="item" :tab="activeTab!" :section-key="section.key" :item="item" :index="index" />
        </template>

        <template v-if="slots.empty" #empty>
          <slot name="empty" :tab="activeTab!" :section-key="section.key" :title="section.title" />
        </template>
      </ExtensionManagerSection>
    </div>

    <div v-else class="extension-manager__empty">{{ props.emptyText }}</div>
  </div>
</template>

<style lang="less" scoped>
.extension-manager {
  width: 100%;
  color: var(--tr-text-primary);
}

.extension-manager__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.extension-manager__title {
  font-size: 16px;
  font-weight: 600;
}

.extension-manager__header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.extension-manager__sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.extension-manager__empty {
  padding: 32px 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
  text-align: center;
}
</style>
