<script setup lang="ts">
import { computed } from 'vue'
import { TrChatUI, type ChatUIOptions } from '../../../src'

const ui = computed<ChatUIOptions>(() => ({
  layout: {
    contentMaxWidth: 860,
    panelPadding: 16,
    panelGap: 10,
    leftAside: {
      width: 260,
      collapsedWidth: 52,
    },
    rightAside: {
      width: 280,
      defaultOpen: true,
    },
  },
  brand: {
    name: 'TinyRobot Lab',
  },
  labels: {
    newConversationTitle: '配置化新对话',
    createConversation: '新建实验',
    composerPlaceholder: '只传 ui 时也可以输入...',
    welcomeTitle: '配置化 ChatUI',
    welcomeDescription: '这个场景只覆盖 ui，不传 data，也不接入任何数据层。',
    rightAsideTitle: '配置说明',
  },
  history: false,
  prompts: false,
  bubble: {
    autoScroll: false,
  },
  sender: {
    clearOnSubmit: false,
    maxLength: 200,
    showWordLimit: true,
  },
}))
</script>

<template>
  <TrChatUI :ui="ui">
    <template #header-notice>
      <p class="configured-notice">UI-only configured case</p>
    </template>

    <template #welcome-footer>
      <p class="configured-hint">Welcome footer slot is supplied by the caller.</p>
    </template>

    <template #layout-right-aside>
      <aside class="configured-aside">
        <strong>Right Aside Slot</strong>
        <span>Enabled by slot + ui.layout.rightAside.</span>
      </aside>
    </template>
  </TrChatUI>
</template>

<style scoped>
.configured-notice,
.configured-hint,
.configured-aside {
  margin: 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
}

.configured-notice {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--tr-container-bg-hover);
}

.configured-aside {
  display: grid;
  gap: 8px;
  padding: 20px;
}
</style>
