<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { TrChatUI, type ChatUIData, type ChatUIOptions, type LayoutFloatingState } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const open = ref(false)
const inputValue = shallowRef('')
const floatingState = ref<LayoutFloatingState>({
  placement: 'top-right',
  offsetX: 24,
  offsetY: 72,
  width: 520,
  height: 520,
})

const data: ChatUIData = {
  conversation: { activeId: 'floating', title: '浮动助手' },
  bubble: {
    messages: [
      {
        id: 'intro',
        role: 'assistant',
        content: '拖动顶部把手或窗口边缘，外部状态会同步更新。',
      },
    ],
  },
  sender: { submitDisabled: true },
}

const ui: ChatUIOptions = {
  layout: {
    surface: {
      mode: 'floating',
      floatingOptions: {
        draggable: true,
        resizable: true,
        minWidth: 360,
        maxWidth: 760,
        minHeight: 420,
        maxHeight: 720,
      },
    },
    leftAside: false,
  },
}

const stateText = computed(() => {
  const state = floatingState.value
  return `${state.placement} · x ${state.offsetX}px · y ${state.offsetY}px · ${state.width} × ${state.height}px`
})

function updateFloatingState(value: LayoutFloatingState) {
  floatingState.value = value
}
</script>

<template>
  <section class="chat-floating-demo">
    <button type="button" class="chat-floating-demo__trigger" @click="open = !open">
      {{ open ? '关闭浮动聊天' : '打开浮动聊天' }}
    </button>
    <p class="chat-floating-demo__state" aria-live="polite">当前状态：{{ stateText }}</p>

    <TrChatUI
      v-if="open"
      class="chat-floating-window"
      :data="data"
      :ui="ui"
      :input-value="inputValue"
      :floating-state="floatingState"
      @update:input-value="inputValue = $event"
      @update:floating-state="updateFloatingState"
    >
      <template #layout-header="{ title }">
        <div class="chat-floating-demo__header">
          <strong>{{ title }}</strong>
          <button type="button" aria-label="关闭浮动聊天" @click="open = false">关闭</button>
        </div>
      </template>
    </TrChatUI>
  </section>
</template>

<style>
.chat-floating-window {
  --tr-layout-floating-radius: 12px;
}
</style>

<style scoped>
.chat-floating-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  min-height: 72px;
}

.chat-floating-demo__trigger,
.chat-floating-demo__header button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--tr-color-primary, #1476ff);
  border-radius: 6px;
  color: var(--tr-color-primary, #1476ff);
  background: var(--tr-container-bg-default, #fff);
  font: inherit;
  cursor: pointer;
}

.chat-floating-demo__state {
  margin: 0;
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.chat-floating-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}
</style>
