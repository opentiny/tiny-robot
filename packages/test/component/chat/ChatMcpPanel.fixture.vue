<script setup lang="ts">
import { ref } from 'vue'
import ChatMcpPanel from '../../../chat/src/ui/layout/ChatMcpPanel.vue'
import { createDefaultChatLabels } from '../../../chat/src/ui/defaults'
import type { ChatMcpView } from '../../../chat/src/types'

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
</script>

<template>
  <div style="width: 320px; height: 700px">
    <ChatMcpPanel
      :mcp="mcp"
      :labels="createDefaultChatLabels()"
      @create-server="event = JSON.stringify({ kind: 'create', ...$event })"
      @update-tool-enabled="event = JSON.stringify({ kind: 'tool', ...$event })"
      @add-server="event = JSON.stringify({ kind: 'add', ...$event })"
      @remove-server="event = JSON.stringify({ kind: 'remove', ...$event })"
      @update-server-enabled="event = JSON.stringify({ kind: 'server', ...$event })"
    />
    <output data-testid="event">{{ event }}</output>
  </div>
</template>
