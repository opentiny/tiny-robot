<script setup lang="ts">
import { ref } from 'vue'
import type { ExtensionManagerTab } from '../../../components/src/extension-manager/index.type'
import ExtensionManager from '../../../components/src/extension-manager/index.vue'

const tabs = ref<ExtensionManagerTab[]>([
  {
    id: 'a/b',
    label: 'Slash tab',
    items: [{ id: 'slash-installed', name: 'Slash installed', installed: true }],
  },
  {
    id: 'a-b',
    label: 'Dash tab',
    items: [{ id: 'dash-installed', name: 'Dash installed', installed: true }],
  },
])

const eventLog = ref<string[]>([])

const record = (event: string) => eventLog.value.push(event)

const handleActiveTabUpdate = (tabId: string | undefined) => {
  record('update:active-tab:' + (tabId ?? 'undefined'))
}

const handleTabChange = (event: { tabId: string }) => {
  record('tab-change:' + event.tabId)
}

const handleSectionToggle = (event: { tabId: string; sectionKey: string; expanded: boolean }) => {
  record('section-toggle:' + event.tabId + '/' + event.sectionKey + '/' + event.expanded)
}

const lengthenActiveLabel = () => {
  tabs.value[1]!.label = 'Dash tab with a dramatically longer label'
}

const identityTabs: ExtensionManagerTab[] = [
  {
    id: 'a/b',
    label: 'Slash identity tab',
    items: [{ id: 'identity-slash', name: 'Identity slash', installed: true }],
  },
  {
    id: 'a-b',
    label: 'Dash identity tab',
    items: [{ id: 'identity-dash', name: 'Identity dash', installed: true }],
  },
]
</script>

<template>
  <div data-testid="uncontrolled-manager">
    <ExtensionManager
      :tabs="tabs"
      default-active-tab="a-b"
      empty-text="No uncontrolled tabs"
      @update:active-tab="handleActiveTabUpdate"
      @tab-change="handleTabChange"
      @section-toggle="handleSectionToggle"
    >
      <template #tab="{ tab, active, select }">
        <span :data-testid="'uncontrolled-tab-slot-' + tab.id" @click="select">
          {{ tab.label }}<span v-if="active"> selected</span>
        </span>
      </template>
    </ExtensionManager>
  </div>

  <button type="button" data-testid="lengthen-active-label" @click="lengthenActiveLabel">Lengthen label</button>
  <output data-testid="uncontrolled-event-log">{{ eventLog.join('|') }}</output>

  <div data-testid="identity-manager">
    <ExtensionManager :tabs="identityTabs"> </ExtensionManager>
  </div>
</template>
