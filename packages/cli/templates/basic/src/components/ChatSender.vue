<template>
  <tr-sender
    v-model="inputMessage"
    mode="multiple"
    :placeholder="isProcessing ? '思考中...' : '请输入你的问题...'"
    :clearable="true"
    :loading="isProcessing"
    :show-word-limit="true"
    :max-length="1000"
    @submit="sendMessage"
    @cancel="abortActiveRequest"
  >
    <template #footer>
      <div class="model-actions">
        <button
          class="sender-action-btn sender-capability-btn"
          :class="{ 'sender-capability-btn--active': thinkingEnabled }"
          type="button"
          :disabled="!supportsThinking"
          @click="thinkingEnabled = !thinkingEnabled"
        >
          <IconDeepThink :size="16" class="sender-action-btn__icon" />
          深度思考
        </button>
        <button
          class="sender-action-btn sender-capability-btn"
          :class="{ 'sender-capability-btn--active': searchEnabled }"
          type="button"
          :disabled="!supportsSearch"
          @click="searchEnabled = !searchEnabled"
        >
          <IconWebSearch :size="16" class="sender-action-btn__icon" />
          联网搜索
        </button>
        <tr-dropdown-menu :items="modelMenuItems" trigger="click" @item-click="handleModelSelect">
          <template #trigger>
            <button class="sender-action-btn sender-model-btn" type="button">
              <component :is="selectedModel?.icon" :size="16" class="sender-action-btn__icon" />
              <span>{{ selectedModel?.name || '选择模型' }}</span>
            </button>
          </template>
        </tr-dropdown-menu>
      </div>
    </template>
  </tr-sender>
</template>

<script setup lang="ts">
import { TrDropdownMenu, TrSender } from '@opentiny/tiny-robot'
import { computed } from 'vue'
import { useChat } from '../composables/useChat'
import { useModel } from '../composables/useModel'
import { IconDeepThink, IconWebSearch } from './icons'

const { inputMessage, isProcessing, sendMessage, abortActiveRequest } = useChat()
const {
  modelOptions,
  selectedModel,
  selectedModelId,
  thinkingEnabled,
  searchEnabled,
  supportsThinking,
  supportsSearch,
} = useModel()

const modelMenuItems = computed(() =>
  modelOptions.map((item) => ({
    id: item.id,
    text: item.name,
  })),
)

function handleModelSelect(item: { id?: string }) {
  if (!item.id) {
    return
  }
  selectedModelId.value = item.id
}
</script>

<style scoped>
.model-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sender-action-btn {
  border: 1px solid var(--tr-border-color-disabled);
  border-radius: var(--tr-radius-full);
  background: var(--tr-container-bg-default);
  color: var(--tr-text-secondary);
  font-size: var(--tr-font-size-sm);
  height: 32px;
  padding: 0 10px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sender-action-btn__icon {
  flex-shrink: 0;
}

.sender-action-btn:hover:not(:disabled) {
  border-color: var(--tr-border-color-hover);
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-hover);
}

.sender-action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.sender-capability-btn--active {
  border-color: var(--tr-border-color-hover);
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default-2);
}
</style>
