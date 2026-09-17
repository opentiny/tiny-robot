<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
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
      : { messages: [{ role: 'assistant', content: '这是由应用提供的消息。' }] },
  sender: {
    loading: viewState.value === 'processing',
    disabled: viewState.value === 'disabled',
  },
  request:
    viewState.value === 'processing'
      ? { state: 'processing', processingState: 'requesting' }
      : viewState.value === 'error'
        ? { state: 'error', error: new Error('模拟请求失败') }
        : { state: 'idle' },
}))
</script>

<template>
  <TrTheme>
    <section class="chat-state-demo">
      <div class="chat-state-demo__actions">
        <button
          type="button"
          v-for="item in ['empty', 'processing', 'error', 'disabled']"
          :key="item"
          @click="viewState = item as ViewState"
        >
          {{ item }}
        </button>
      </div>
      <TrChatUI :data="data" :input-value="inputValue" @update:input-value="inputValue = $event" />
    </section>
  </TrTheme>
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
  padding: 8px;
}

.chat-state-demo :deep(.tr-chat-ui) {
  flex: 1;
  min-height: 0;
}
</style>
