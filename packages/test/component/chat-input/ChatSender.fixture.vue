<script setup lang="ts">
import { computed, ref } from 'vue'
import ChatInputRegion from '../../../chat/src/ui/composer/ChatInputRegion.vue'
import type { ChatLabels, ChatMcpView, ChatModelView, ChatSenderView } from '../../../chat/src/types'
import { createDefaultChatLabels } from '../../../chat/src/ui/defaults'

const inputValue = ref('')
const mcpOpenCount = ref(0)
const senderFooterCount = ref(0)
const labels: ChatLabels = createDefaultChatLabels()
const sender: Required<ChatSenderView> = {
  loading: false,
  disabled: false,
  submitDisabled: false,
}
const senderOptions = {
  mode: 'multiple' as const,
  clearable: true,
  maxLength: 1000,
  showWordLimit: true,
}
const model = computed<ChatModelView>(() => ({
  options: [{ id: 'model-a', label: 'Model A', capabilities: { thinking: true } }],
  selectedId: 'model-a',
  features: { thinking: false },
}))
const mcp = computed<ChatMcpView>(() => ({
  servers: [{ id: 'server-a', name: 'Server A', installed: true, enabled: true }],
}))
</script>

<template>
  <div>
    <output data-testid="mcp-open-count">{{ mcpOpenCount }}</output>
    <output data-testid="sender-footer-count">{{ senderFooterCount }}</output>
    <ChatInputRegion
      :sender="sender"
      :value="inputValue"
      :sender-options="senderOptions"
      :labels="labels"
      :model="model"
      :mcp="mcp"
      @update:value="inputValue = $event"
      @open-mcp-panel="mcpOpenCount++"
    >
      <template #sender-footer>
        <button type="button" data-testid="direct-sender-footer" @click="senderFooterCount++">Footer</button>
      </template>
    </ChatInputRegion>
  </div>
</template>
