<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrChatUI, type ChatUIData, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import { IconPin } from '@opentiny/tiny-robot-svgs'
import '@opentiny/tiny-robot-chat/dist/style.css'

const saved = shallowRef(false)
const feedback = shallowRef('点击收藏或查看来源，体验自定义操作。')
const data: ChatUIData = {
  conversation: { activeId: 'custom-actions-demo', title: '自定义消息操作' },
  bubble: {
    messages: [
      { role: 'user', content: '如何自定义气泡操作按钮？' },
      {
        role: 'assistant',
        content: '通过 custom 添加业务按钮，通过 slot 自定义按钮内容。',
        metadata: { source: '《TinyRobot 组件使用指南》' },
      },
    ],
  },
}

const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  sender: false,
  bubble: {
    actions: {
      display: 'always',
      user: ['copy'],
      assistant: (defaults) => [
        ...defaults,
        {
          type: 'custom',
          id: 'bookmark',
          label: saved.value ? '取消收藏' : '收藏',
          icon: IconPin,
          onClick: ({ message }) => {
            saved.value = !saved.value
            feedback.value = saved.value ? `已收藏：${message.content}` : '已取消收藏。'
          },
        },
        { type: 'slot', id: 'source' },
      ],
    },
  },
}
</script>

<template>
  <section>
    <div class="custom-actions-demo">
      <TrChatUI :data="data" :ui="ui">
        <template #bubble-action="{ item, context, disabled }">
          <button
            v-if="item.id === 'source'"
            type="button"
            class="custom-actions-demo__source"
            :disabled="disabled"
            @click="feedback = String(context.message.metadata?.source ?? '暂无来源')"
          >
            查看来源
          </button>
        </template>
      </TrChatUI>
    </div>
    <p class="custom-actions-demo__feedback" role="status">{{ feedback }}</p>
  </section>
</template>

<style scoped>
.custom-actions-demo {
  --tr-layout-height: 100%;
  height: 360px;
}

.custom-actions-demo :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.custom-actions-demo__source {
  border: 0;
  border-radius: 6px;
  padding: 6px 8px;
  background: transparent;
  color: var(--tr-color-primary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.custom-actions-demo__source:hover:not(:disabled) {
  background: var(--tr-color-primary-light);
}

.custom-actions-demo__source:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.custom-actions-demo__feedback {
  margin: 12px 0 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
  overflow-wrap: anywhere;
}
</style>
