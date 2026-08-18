<script setup lang="ts">
import { ref } from 'vue'
import type {
  ExtensionCardAction,
  ExtensionManagerActionEvent,
  ExtensionManagerNameClickEvent,
  ExtensionManagerSectionToggleEvent,
  ExtensionManagerTab,
} from '../../../components/src/extension-manager/index.type'
import ExtensionManager from '../../../components/src/extension-manager/index.vue'

const alphaActions: ExtensionCardAction[] = [
  { id: 'toggle-alpha', type: 'switch', label: 'Enable Alpha', checked: true },
  { id: 'inspect-alpha', type: 'button', label: 'Inspect Alpha' },
]

const createTabs = (): ExtensionManagerTab[] => [
  {
    id: 'library',
    label: 'Library tab',
    items: [
      {
        id: 'alpha',
        name: 'Alpha extension',
        description: 'Alpha description',
        tags: ['recommended'],
        installed: true,
        actions: alphaActions,
        primaryActionsLimit: 2,
      },
      {
        id: 'beta',
        name: 'Beta extension',
        description: 'Beta description',
        tags: ['writing'],
        installed: false,
        actions: [
          { id: 'install-beta', type: 'button', label: 'Install Beta' },
          { id: 'inspect-beta', type: 'button', label: 'Inspect Beta' },
        ],
      },
      {
        id: 'gamma',
        name: 'Gamma extension',
        description: 'Gamma description',
        tags: ['recommended'],
        actions: [
          { id: 'install-gamma', type: 'button', label: 'Install Gamma' },
          { id: 'inspect-gamma', type: 'button', label: 'Inspect Gamma' },
        ],
      },
    ],
  },
  {
    id: 'market',
    label: 'Market tab',
    items: [{ id: 'delta', name: 'Delta extension', installed: true, tags: ['featured'] }],
  },
]

const tabs = ref<ExtensionManagerTab[]>(createTabs())
const activeTab = ref<string | undefined>('library')
const eventLog = ref<string[]>([])
const showItemSlotManager = ref(false)

const record = (event: string) => eventLog.value.push(event)

const handleActiveTabUpdate = (tabId: string | undefined) => {
  record('update:active-tab:' + (tabId ?? 'undefined'))
}

const handleTabChange = ({ tabId }: { tabId: string }) => {
  record('tab-change:' + tabId)
}

const handleSectionToggle = ({ tabId, sectionKey, expanded }: ExtensionManagerSectionToggleEvent) => {
  record('section-toggle:' + tabId + '/' + sectionKey + '/' + expanded)
}

const handleAction = ({ tabId, sectionKey, itemId, action }: ExtensionManagerActionEvent) => {
  const actionRecord = {
    id: action.id,
    type: action.type,
    ...(action.checked === undefined ? {} : { checked: action.checked }),
    ...(action.payload === undefined ? {} : { payload: action.payload }),
  }

  record('action:' + JSON.stringify({ tabId, sectionKey, itemId, action: actionRecord }))
}

const handleNameClick = ({ tabId, sectionKey, itemId, event }: ExtensionManagerNameClickEvent) => {
  record('name-click:' + JSON.stringify({ tabId, sectionKey, itemId, event: { type: event.type } }))
}

const installBeta = () => {
  tabs.value = tabs.value.map((tab) => ({
    ...tab,
    items: tab.items.map((item) => (item.id === 'beta' ? { ...item, installed: true } : item)),
  }))
}

const setExternalActiveTab = (tabId: string) => {
  activeTab.value = tabId
}

const removeLibraryTag = (tagValue: string) => {
  tabs.value = tabs.value.map((tab) =>
    tab.id === activeTab.value
      ? {
          ...tab,
          items: tab.items.map((item) => ({
            ...item,
            tags: (item.tags ?? []).filter((tag) => tag !== tagValue),
          })),
        }
      : tab,
  )
}

const emptyLibrary = () => {
  tabs.value = tabs.value.map((tab) => (tab.id === 'library' ? { ...tab, items: [] } : tab))
}

const removeMarketTab = () => {
  tabs.value = tabs.value.filter((tab) => tab.id !== 'market')
}
</script>

<template>
  <div data-testid="manager-host">
    <ExtensionManager
      :tabs="tabs"
      v-model:active-tab="activeTab"
      title="Extension manager"
      @update:active-tab="handleActiveTabUpdate"
      @tab-change="handleTabChange"
      @section-toggle="handleSectionToggle"
      @action="handleAction"
      @name-click="handleNameClick"
    >
      <template #empty="{ tab, sectionKey, title }">
        <span :data-testid="'empty-slot-' + tab.id + '-' + sectionKey">Empty {{ sectionKey }}</span>
        <span :data-testid="'empty-slot-context-' + tab.id + '-' + sectionKey">
          {{ tab.id }}/{{ sectionKey }}/{{ title }}
        </span>
      </template>
    </ExtensionManager>
  </div>

  <button type="button" data-testid="set-active-market" @click="setExternalActiveTab('market')">
    Set active market
  </button>
  <button type="button" data-testid="set-active-library" @click="setExternalActiveTab('library')">
    Set active library
  </button>
  <button type="button" data-testid="install-beta" @click="installBeta">Install beta</button>
  <button type="button" data-testid="remove-recommended-tag" @click="removeLibraryTag('recommended')">
    Remove recommended tag
  </button>
  <button type="button" data-testid="remove-writing-tag" @click="removeLibraryTag('writing')">
    Remove writing tag
  </button>
  <button type="button" data-testid="empty-library" @click="emptyLibrary">Empty library</button>
  <button type="button" data-testid="remove-market-tab" @click="removeMarketTab">Remove market tab</button>
  <button type="button" data-testid="show-item-slot-manager" @click="showItemSlotManager = true">
    Show item slot manager
  </button>

  <div v-if="showItemSlotManager" data-testid="item-slot-manager">
    <ExtensionManager :tabs="tabs">
      <template #item="{ item }">
        <span data-testid="item-slot-keys">{{ JSON.stringify(Object.keys(item)) }}</span>
      </template>
    </ExtensionManager>
  </div>

  <output data-testid="event-log">{{ eventLog.join('|') }}</output>
</template>
