<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  TrChatUI,
  type ChatAsideOpenChangePayload,
  type ChatUIData,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

type PreviewMode = 'dock' | 'drawer'

const mode = shallowRef<PreviewMode>('dock')
const inputValue = shallowRef('')
const lastAsideEvent = shallowRef('尚未触发侧栏事件')
const modeOptions: PreviewMode[] = ['dock', 'drawer']

const data: ChatUIData = {
  conversation: {
    items: [
      { id: 'mobile', title: '移动端适配' },
      { id: 'desktop', title: '桌面端布局' },
    ],
    activeId: 'mobile',
    title: '响应式布局',
  },
  bubble: {
    messages: [
      { id: 'question', role: 'user', content: '窄视口下会话列表如何展示？' },
      {
        id: 'answer',
        role: 'assistant',
        content: '侧栏应使用抽屉覆盖内容，并通过页头按钮打开或关闭。',
      },
    ],
  },
  sender: { submitDisabled: true },
}

const ui = computed<ChatUIOptions>(() => ({
  layout: {
    contentMaxWidth: mode.value === 'drawer' ? 360 : 720,
    leftAside: {
      mode: mode.value,
      defaultOpen: mode.value === 'dock',
    },
    rightAside: false,
  },
}))

function handleLeftAsideChange(payload: ChatAsideOpenChangePayload) {
  lastAsideEvent.value = `open: ${payload.open}，source: ${payload.source}`
}
</script>

<template>
  <section class="chat-responsive-demo">
    <div class="chat-responsive-demo__toolbar">
      <button
        v-for="item in modeOptions"
        :key="item"
        type="button"
        :class="{ 'is-active': mode === item }"
        :aria-pressed="mode === item"
        @click="mode = item"
      >
        {{ item === 'dock' ? '桌面 Dock' : '移动端 Drawer' }}
      </button>
      <span aria-live="polite">最近事件：{{ lastAsideEvent }}</span>
    </div>

    <div class="chat-responsive-demo__stage" :class="`is-${mode}`">
      <TrChatUI
        :key="mode"
        :data="data"
        :ui="ui"
        :input-value="inputValue"
        @update:input-value="inputValue = $event"
        @left-aside-open-change="handleLeftAsideChange"
      />
    </div>
  </section>
</template>

<style scoped>
.chat-responsive-demo {
  --tr-layout-height: 100%;
  display: grid;
  gap: 12px;
}

.chat-responsive-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.chat-responsive-demo__toolbar button {
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

.chat-responsive-demo__toolbar button:hover {
  border-color: var(--tr-color-primary, #1476ff);
  color: var(--tr-color-primary, #1476ff);
}

.chat-responsive-demo__toolbar button.is-active {
  border-color: var(--tr-color-primary, #1476ff);
  color: #fff;
  background: var(--tr-color-primary, #1476ff);
}

.chat-responsive-demo__toolbar span {
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.chat-responsive-demo__stage {
  box-sizing: border-box;
  height: 600px;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--tr-color-border, #dcdfe6);
  border-radius: 10px;
  transition: max-width 0.2s ease;
}

.chat-responsive-demo__stage.is-dock {
  max-width: 760px;
}

.chat-responsive-demo__stage.is-drawer {
  max-width: 390px;
}

.chat-responsive-demo__stage :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
