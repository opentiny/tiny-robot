<script setup lang="ts">
import { computed, h, shallowRef } from 'vue'
import { TrChat, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { useChatCaseRuntime } from './shared/createChatRuntime'

const customAppearance = shallowRef(true)
const userAvatar = h('span', { class: 'bubble-options-demo__avatar bubble-options-demo__avatar--user' }, '我')
const assistantAvatar = h('span', { class: 'bubble-options-demo__avatar bubble-options-demo__avatar--assistant' }, 'AI')
const runtime = useChatCaseRuntime({
  storageKey: 'tiny-robot-demo-bubble-options-v1',
  initialConversations: [
    {
      title: '消息外观配置',
      messages: [
        { role: 'user', content: '如何定制聊天消息的外观？' },
        {
          role: 'assistant',
          content:
            '**可以按角色分别配置：**\n\n- 用户消息显示在右侧，使用圆角气泡。\n- AI 回答显示在左侧，不使用气泡框。\n\n切换上方选项，可比较默认外观。',
        },
      ],
    },
  ],
})

const ui = computed<ChatUIOptions>(() => ({
  layout: { leftAside: false },
  bubble: customAppearance.value
    ? {
        bubbleList: {
          roleConfigs: {
            user: { placement: 'end', avatar: userAvatar, shape: 'rounded' },
            assistant: { placement: 'start', avatar: assistantAvatar, shape: 'none' },
          },
        },
      }
    : {},
}))
</script>

<template>
  <section class="bubble-options-demo">
    <div class="bubble-options-demo__controls">
      <label><input v-model="customAppearance" type="radio" :value="false" /> 默认外观</label>
      <label><input v-model="customAppearance" type="radio" :value="true" /> 自定义外观</label>
    </div>
    <p class="bubble-options-demo__tip">比较头像和气泡外观；继续发送消息，新消息会沿用当前配置。</p>
    <div class="bubble-options-demo__chat" :class="{ 'bubble-options-demo__chat--custom': customAppearance }">
      <TrChat :runtime="runtime" :ui="ui" />
    </div>
  </section>
</template>

<style scoped>
.bubble-options-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.bubble-options-demo__tip {
  margin: 12px 0;
  color: var(--tr-text-secondary);
  font-size: 13px;
}

.bubble-options-demo__chat {
  --tr-layout-height: 100%;
  height: 600px;
}

.bubble-options-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.bubble-options-demo__chat :deep(.bubble-options-demo__avatar) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.bubble-options-demo__chat :deep(.bubble-options-demo__avatar--user) {
  color: #3964fe;
  background: #e4edfd;
}

.bubble-options-demo__chat :deep(.bubble-options-demo__avatar--assistant) {
  color: #087f5b;
  background: #d3f9d8;
}

.bubble-options-demo__chat--custom :deep([data-box-type='box'][data-role='assistant']) {
  --tr-bubble-box-bg: transparent;
}
</style>
