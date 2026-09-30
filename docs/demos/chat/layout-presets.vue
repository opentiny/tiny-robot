<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrChatUI, type ChatUIData, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

type LayoutPreset = 'default' | 'compact' | 'focus'

const preset = shallowRef<LayoutPreset>('default')
const inputValue = shallowRef('')

const data: ChatUIData = {
  conversation: {
    items: [
      { id: 'review', title: '变更评审' },
      { id: 'release', title: '发布检查' },
    ],
    activeId: 'review',
    title: '变更评审',
  },
  bubble: {
    messages: [
      { id: 'question', role: 'user', content: '这个改动最需要关注什么？' },
      {
        id: 'answer',
        role: 'assistant',
        content: '先确认公开接口是否兼容，再检查错误恢复和窄屏布局。',
      },
    ],
  },
  sender: { submitDisabled: true },
}

const presets: Record<LayoutPreset, { label: string; description: string; ui: ChatUIOptions }> = {
  default: {
    label: '默认布局',
    description: '保留完整页面区域，内容最大宽度为 980px。',
    ui: {},
  },
  compact: {
    label: '紧凑内容',
    description: '收窄消息和输入区，并让会话列表默认展开。',
    ui: {
      layout: {
        contentMaxWidth: 640,
        panelPadding: 20,
        panelGap: 8,
        leftAside: { width: 240, collapsedWidth: 48, defaultOpen: true },
      },
    },
  },
  focus: {
    label: '专注模式',
    description: '隐藏页头与会话列表，只保留消息和输入区。',
    ui: {
      header: false,
      history: false,
      layout: {
        contentMaxWidth: 720,
        leftAside: false,
      },
    },
  },
}

const presetOptions: LayoutPreset[] = ['default', 'compact', 'focus']
const activePreset = computed(() => presets[preset.value])
</script>

<template>
  <section class="chat-layout-demo">
    <div class="chat-layout-demo__toolbar">
      <button
        v-for="id in presetOptions"
        :key="id"
        type="button"
        :class="{ 'is-active': preset === id }"
        :aria-pressed="preset === id"
        @click="preset = id"
      >
        {{ presets[id].label }}
      </button>
      <span>{{ activePreset.description }}</span>
    </div>

    <TrChatUI :data="data" :ui="activePreset.ui" :input-value="inputValue" @update:input-value="inputValue = $event" />
  </section>
</template>

<style scoped>
.chat-layout-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  height: min(660px, calc(100vh - 200px));
  min-height: 520px;
}

.chat-layout-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid var(--tr-color-border, #e5e6eb);
  background: var(--tr-container-bg-default-2, #f7f8fa);
}

.chat-layout-demo__toolbar button {
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

.chat-layout-demo__toolbar button:hover {
  border-color: var(--tr-color-primary, #1476ff);
  color: var(--tr-color-primary, #1476ff);
}

.chat-layout-demo__toolbar button.is-active {
  border-color: var(--tr-color-primary, #1476ff);
  color: #fff;
  background: var(--tr-color-primary, #1476ff);
}

.chat-layout-demo__toolbar span {
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.chat-layout-demo :deep(.tr-chat-ui) {
  flex: 1;
  min-height: 0;
}
</style>
