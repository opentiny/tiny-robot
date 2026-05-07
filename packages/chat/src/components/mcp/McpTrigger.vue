<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { IconPlugin } from '@opentiny/tiny-robot-svgs'
import { MCP_MANAGER_KEY } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'
import ChatMcpPanel from './ChatMcpPanel.vue'

defineOptions({ name: 'TrMcpTrigger' })

const props = withDefaults(
  defineProps<{
    label?: string
    showCount?: boolean
  }>(),
  {
    showCount: true,
  },
)

const visibleModel = defineModel<boolean>('visible')
const internalVisible = ref(false)
const mcpManager = inject(MCP_MANAGER_KEY, null)
const chatMessages = useResolvedChatMessages()

if (!mcpManager) {
  throw new Error('mcpManager not provided')
}

const isVisible = computed({
  get: () => visibleModel.value ?? internalVisible.value,
  set: (value: boolean) => {
    internalVisible.value = value
    visibleModel.value = value
  },
})

const activeCount = computed(() => mcpManager.activeCount.value)
const isActive = computed(() => activeCount.value > 0)
const resolvedLabel = computed(() => props.label ?? chatMessages.value.mcp.triggerLabel)
const triggerTitle = computed(() =>
  isActive.value
    ? chatMessages.value.mcp.triggerActiveTitle.replace('{count}', String(activeCount.value))
    : chatMessages.value.mcp.triggerInactiveTitle,
)

function openPanel() {
  isVisible.value = true
}
</script>

<template>
  <div class="tr-mcp-trigger__wrapper" data-testid="chat-mcp-trigger">
    <button
      type="button"
      class="tr-mcp-trigger__button"
      :class="{ 'is-active': isActive }"
      :aria-expanded="isVisible"
      :aria-label="triggerTitle"
      :title="triggerTitle"
      data-testid="chat-mcp-trigger-button"
      @click="openPanel"
    >
      <IconPlugin class="tr-mcp-trigger__icon" />
      <span class="tr-mcp-trigger__label" data-testid="chat-mcp-trigger-label">{{ resolvedLabel }}</span>
      <span
        v-if="showCount && activeCount"
        class="tr-mcp-trigger__count"
        data-testid="chat-mcp-trigger-count"
        aria-hidden="true"
      >
        {{ activeCount }}
      </span>
    </button>

    <ChatMcpPanel v-model:visible="isVisible" />
  </div>
</template>
