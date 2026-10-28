<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrChatUI, type ChatInputActions, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const chat = shallowRef<ChatInputActions | null>(null)
const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  header: false,
  welcome: { title: '编辑提示词', description: '点击上方按钮回填、清空或聚焦，也可以直接编辑文本。' },
  sender: { toolbar: [] },
}
</script>

<template>
  <section class="input-controls-demo">
    <div class="input-controls-demo__actions">
      <button type="button" @click="chat?.setInputValue('请介绍聊天布局')">仅回填</button>
      <button type="button" @click="chat?.clearInput()">清空文本</button>
      <button type="button" @click="chat?.focusInput()">聚焦</button>
    </div>
    <TrChatUI
      ref="chat"
      default-input-value="请帮我整理一份项目周报。"
      :ui="ui"
      :data="{ sender: { submitDisabled: true } }"
    />
  </section>
</template>

<style scoped>
.input-controls-demo {
  --tr-layout-height: 420px;
}

.input-controls-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.input-controls-demo__actions button {
  padding: 4px 10px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 6px;
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default);
  cursor: pointer;
}
</style>
