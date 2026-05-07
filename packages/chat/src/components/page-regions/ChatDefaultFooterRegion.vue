<script setup lang="ts">
import { inject } from 'vue'
import { CHAT_KIT_KEY, type ChatPageModelSelectorInput } from '@/shared/context'
import type { ModelOption } from '@/types'
import ChatAttachments from '@/components/attachments/ChatAttachments.vue'
import ChatFooter from '../ChatFooter.vue'
import ChatSender from '../ChatSender.vue'
import McpTrigger from '@/components/mcp/McpTrigger.vue'
import ModelSelector from '@/components/model-selector/ModelSelector.vue'

defineOptions({ name: 'TrChatDefaultFooterRegion' })

const props = defineProps<{
  showFooterTools: boolean
  showModelSelector: boolean
  showMcpTrigger: boolean
  modelSelectorInput?: ChatPageModelSelectorInput
}>()

const emit = defineEmits<{
  (e: 'change-model', model: ModelOption): void
}>()

const chatKit = inject(CHAT_KIT_KEY)!

function handleModelChange(model: ModelOption) {
  emit('change-model', model)
}
</script>

<template>
  <template v-if="$slots.sender">
    <slot
      name="sender"
      :send="chatKit.sendMessage"
      :abort="chatKit.abort"
      :status="chatKit.status"
      :last-error="chatKit.lastError"
      :retry="chatKit.retry"
    />
  </template>
  <ChatFooter v-else>
    <template v-if="$slots['footer-extra']" #extra>
      <slot name="footer-extra" />
    </template>
    <div class="tr-chat-footer-content">
      <ChatSender>
        <template #header>
          <ChatAttachments />
        </template>
        <template v-if="props.showFooterTools" #footer>
          <div class="tr-chat-footer-tools">
            <ModelSelector
              v-if="props.showModelSelector"
              :models="props.modelSelectorInput?.models"
              :model-value="props.modelSelectorInput?.defaultModel"
              @change="handleModelChange"
            />
            <McpTrigger v-if="props.showMcpTrigger" />
          </div>
        </template>
      </ChatSender>
    </div>
  </ChatFooter>
</template>

<style scoped>
.tr-chat-footer-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
</style>
