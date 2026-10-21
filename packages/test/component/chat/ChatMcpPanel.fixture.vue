<script setup lang="ts">
import { computed, ref } from 'vue'
import ChatMcpPanel from '../../../chat/src/ui/layout/ChatMcpPanel.vue'
import { createDefaultChatLabels } from '../../../chat/src/ui/defaults'
import type { ChatMcpView } from '../../../chat/src/types'
import type { ExtensionManagerTab } from '../../../components/src'

const props = withDefaults(defineProps<{ extensionLabel?: string; withMcp?: boolean; withSkills?: boolean }>(), {
  extensionLabel: '扩展',
  withMcp: true,
  withSkills: false,
})

const mcp: ChatMcpView = {
  servers: [
    { id: 'installed', name: 'Installed Server', installed: true, enabled: true },
    { id: 'available', name: 'Available Server', installed: false, enabled: false },
  ],
  tools: {
    installed: [{ id: 'search', name: 'Search Tool', enabled: true }],
  },
}
const event = ref('')
const labels = computed(() => ({ ...createDefaultChatLabels(), extensions: props.extensionLabel }))
const extensionTabs: ExtensionManagerTab[] = [{ id: 'skills', label: 'Skills', items: [] }]
</script>

<template>
  <div style="width: 320px; height: 700px">
    <ChatMcpPanel
      :mcp="props.withMcp ? mcp : undefined"
      :labels="labels"
      :extension-tabs="props.withSkills ? extensionTabs : undefined"
      @create-server="event = JSON.stringify({ kind: 'create', ...$event })"
      @update-tool-enabled="event = JSON.stringify({ kind: 'tool', ...$event })"
      @add-server="event = JSON.stringify({ kind: 'add', ...$event })"
      @remove-server="event = JSON.stringify({ kind: 'remove', ...$event })"
      @update-server-enabled="event = JSON.stringify({ kind: 'server', ...$event })"
    />
    <output data-testid="event">{{ event }}</output>
  </div>
</template>
