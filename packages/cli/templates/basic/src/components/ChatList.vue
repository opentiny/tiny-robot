<template>
  <tr-bubble-provider :fallback-content-renderer="BubbleRenderers.Markdown">
    <tr-welcome
      v-if="visibleMessages.length === 0"
      title="TinyRobot AI 助手"
      description="您好，我是TinyRobot，您专属的 AI 智能专家"
      :icon="welcomeIcon"
      class="chat-list chat-welcome"
    />
    <tr-bubble-list
      v-else
      :messages="messages"
      :role-configs="roles"
      :auto-scroll="true"
      class="chat-list"
    ></tr-bubble-list>
  </tr-bubble-provider>
</template>

<script setup lang="ts">
import { BubbleRenderers, TrBubbleList, TrBubbleProvider, TrWelcome, type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { computed, h } from 'vue'
import { useChat } from '../composables/useChat'

const { messages } = useChat()

const aiAvatar = h(IconAi, { style: { fontSize: '28px' } })
const userAvatar = h(IconUser, { style: { fontSize: '28px' } })
const welcomeIcon = h(IconAi, { style: { fontSize: '40px' } })
const visibleMessages = computed(() => messages.value.filter((item) => item.role !== 'system'))

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
  system: {
    hidden: true,
  },
}
</script>

<style scoped>
.chat-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border-radius: 10px;
  padding: 8px;
}

.chat-welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10%;

  &.tr-welcome {
    --title-color: var(--tr-text-primary);
    --description-color: var(--tr-text-secondary);
  }
}

:deep() {
  [data-box-type='box'][data-role='user'] {
    --tr-bubble-box-bg: var(--tr-color-primary-light);
  }

  [data-box-type='box']:not([data-role='user']) {
    --tr-bubble-box-bg: transparent;
  }

  [data-type='markdown'] p {
    margin: 0;
  }
}
</style>
