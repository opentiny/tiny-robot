<script setup lang="ts">
import { ref } from 'vue'
import ChatUI from '../../../chat/src/ChatUI.vue'
import type {
  ExtensionManagerActionEvent,
  ExtensionManagerNameClickEvent,
  ExtensionManagerTab,
  ExtensionManagerTabChangeEvent,
} from '../../../components/src'

const props = withDefaults(defineProps<{ withMcp?: boolean; withSkills?: boolean }>(), {
  withMcp: true,
  withSkills: true,
})

const tabs: ExtensionManagerTab[] = [
  {
    id: 'skills',
    label: 'Skills',
    items: [
      {
        id: 'concise-answer',
        name: 'Concise Answer',
        installed: true,
        actions: [{ id: 'toggle', type: 'switch', label: 'Enable Concise Answer', checked: true }],
      },
    ],
  },
]

const event = ref('')
const overlayOpen = ref(false)

function recordAction(payload: ExtensionManagerActionEvent) {
  event.value = JSON.stringify({ kind: 'action', ...payload, action: { ...payload.action } })
}

function recordNameClick(payload: ExtensionManagerNameClickEvent) {
  event.value = JSON.stringify({
    kind: 'name-click',
    tabId: payload.tabId,
    sectionKey: payload.sectionKey,
    itemId: payload.itemId,
  })
}

function recordTabChange(payload: ExtensionManagerTabChangeEvent) {
  event.value = JSON.stringify({ kind: 'tab-change', ...payload })
}
</script>

<template>
  <div style="width: 960px; height: 720px">
    <ChatUI
      :data="{
        mcp: props.withMcp
          ? {
              servers: [{ id: 'search', name: 'Search MCP', installed: true, enabled: true }],
              tools: {},
            }
          : undefined,
      }"
      :ui="{
        header: false,
        history: false,
        welcome: false,
        extensions: props.withSkills ? { tabs, overlayOpen } : undefined,
      }"
      @extension-action="recordAction"
      @extension-name-click="recordNameClick"
      @extension-tab-change="recordTabChange"
    >
      <template #extension-header-actions="{ activeTabId }">
        <button v-if="activeTabId === 'skills'" type="button" @click="overlayOpen = true">Import Skill</button>
      </template>
      <template #extension-overlay="{ activeTabId }">
        <span v-if="activeTabId === 'skills' && overlayOpen" data-testid="skill-overlay">Skill overlay</span>
      </template>
    </ChatUI>
    <output data-testid="event">{{ event }}</output>
  </div>
</template>
