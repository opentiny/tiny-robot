<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrChatUI, type ChatUIData } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

type ViewState = 'empty' | 'processing' | 'error' | 'disabled'

const viewState = shallowRef<ViewState>('empty')
const inputValue = shallowRef('')

const data = computed<ChatUIData>(() => ({
  conversation: { activeId: 'demo-conversation', title: '界面状态' },
  bubble:
    viewState.value === 'empty'
      ? { messages: [] }
      : {
          messages: [
            {
              role: 'assistant',
              content: '这是由应用提供的消息。',
              ...(viewState.value === 'error' ? { state: { error: { message: '模拟请求失败' } } } : {}),
            },
          ],
        },
  sender: {
    loading: viewState.value === 'processing',
    disabled: viewState.value === 'disabled',
  },
  request:
    viewState.value === 'processing'
      ? { state: 'processing', processingState: 'requesting' }
      : viewState.value === 'error'
        ? { state: 'error' }
        : { state: 'idle' },
}))
</script>

<template>
  <section class="chat-state-demo">
    <div class="chat-state-demo__actions">
      <button
        type="button"
        v-for="item in ['empty', 'processing', 'error', 'disabled']"
        :key="item"
        :class="{ 'is-active': viewState === item }"
        :aria-pressed="viewState === item"
        @click="viewState = item as ViewState"
      >
        {{ item }}
      </button>
    </div>
    <TrChatUI :data="data" :input-value="inputValue" @update:input-value="inputValue = $event" />
  </section>
</template>

<style scoped>
.chat-state-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  height: min(620px, calc(100vh - 240px));
  min-height: 480px;
}

.chat-state-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-state-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid var(--tr-color-border, #e5e6eb);
  background: var(--tr-container-bg-default-2, #f7f8fa);
}

.chat-state-demo__actions button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--tr-color-border, #dcdfe6);
  border-radius: 6px;
  color: var(--tr-text-primary, #252b3a);
  background: var(--tr-container-bg-default, #fff);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.chat-state-demo__actions button:hover {
  border-color: var(--tr-color-primary, #1476ff);
  color: var(--tr-color-primary, #1476ff);
}

.chat-state-demo__actions button.is-active {
  border-color: var(--tr-color-primary, #1476ff);
  color: #fff;
  background: var(--tr-color-primary, #1476ff);
}

.chat-state-demo :deep(.tr-chat-ui) {
  flex: 1;
  min-height: 0;
}
</style>
