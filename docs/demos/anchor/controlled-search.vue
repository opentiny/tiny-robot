<template>
  <section class="demo">
    <div class="controls">
      <div class="placement">
        <span>停靠位置</span>
        <label>
          <input v-model="placement" type="radio" value="left" />
          左侧
        </label>
        <label>
          <input v-model="placement" type="radio" value="right" />
          右侧
        </label>
      </div>

      <label>
        <input v-model="searchEnabled" type="checkbox" />
        显示搜索区
      </label>
    </div>

    <div class="stage">
      <tr-bubble-provider :box-attributes="boxAttributes">
        <tr-bubble-list ref="bubbleListRef" class="conversation-list" :messages="messages" :role-configs="roles" />
      </tr-bubble-provider>

      <tr-anchor
        :class="['nav', `is-${placement}`]"
        :items="anchorItems"
        :scroll-container="scrollContainerRef"
        :active-offset="20"
        :placement="placement"
        :search-options="searchOptions"
        v-model:active-id="activeId"
        v-model:search-query="searchQuery"
        target-feedback-class="user-bubble-active"
        :target-feedback-duration="1800"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import {
  TrBubbleList,
  TrBubbleProvider,
  TrAnchor,
  type BubbleBoxAttributesConfig,
  type BubbleMessage,
  type BubbleRoleConfig,
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { controlledSearchMessages } from './controlled-search.messages'

const messages = controlledSearchMessages

function isUserMessage(message: BubbleMessage): message is BubbleMessage & { id: string; role: 'user' } {
  return message.role === 'user' && typeof message.id === 'string'
}

const aiAvatar = h(IconAi, { style: { fontSize: '28px' } })
const userAvatar = h(IconUser, { style: { fontSize: '28px' } })

const roles = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
} satisfies Record<string, BubbleRoleConfig>

const userMessages = messages.filter(isUserMessage)
const messageById = new Map(messages.map((message) => [String(message.id), message]))

const bubbleListRef = ref<InstanceType<typeof TrBubbleList> | null>(null)
const scrollContainerRef = computed(() => bubbleListRef.value?.$el ?? null)
const placement = ref<'left' | 'right'>('right')
const activeId = ref(userMessages[0]?.id ?? '')
const searchQuery = ref('')
const searchEnabled = ref(false)

const searchOptions = computed(() => (searchEnabled.value ? { placeholder: '搜索用户问题或回复关键词' } : undefined))

watch(searchEnabled, (enabled) => {
  if (!enabled) {
    searchQuery.value = ''
  }
})

const anchorItems = userMessages.map((message) => {
  const assistantReply = messageById.get(`assistant-${message.id}`)
  const label = String(message.content)

  return {
    id: message.id,
    label,
    searchText: `${label} ${String(message.content)} ${String(assistantReply?.content ?? '')}`,
    tooltipText: label,
  }
})

const boxAttributes: BubbleBoxAttributesConfig = (groupedMessages) => {
  const firstMessage = groupedMessages[0]
  if (firstMessage?.role !== 'user' || typeof firstMessage.id !== 'string') {
    return undefined
  }

  return {
    class: 'user-bubble-target',
    'data-anchor-id': firstMessage.id,
  }
}
</script>

<style scoped src="./demo-shell.css"></style>

<style scoped>
.demo {
  --anchor-demo-gap: 16px;
  --anchor-demo-controls-gap: 12px 16px;
  --anchor-demo-stage-height: 480px;
}

.nav {
  top: 0;
}

.placement {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.conversation-list {
  --anchor-bubble-bg: var(--tr-color-primary-light);
  --anchor-bubble-active-bg: #b9d7ff;
  --tr-bubble-list-gap: 16px;
  --tr-bubble-list-padding: 24px 72px 40px;
  --tr-bubble-max-width: 560px;
  height: 100%;
}

:global([data-tr-color-mode='dark'] .conversation-list) {
  --anchor-bubble-bg: color-mix(in srgb, #317af7 30%, var(--tr-container-bg-default));
  --anchor-bubble-active-bg: color-mix(in srgb, #317af7 40%, var(--tr-container-bg-default));
}

.nav.is-right {
  right: 16px;
}

.nav.is-left {
  left: 16px;
}

:deep(.user-bubble-target) {
  --tr-bubble-box-bg: var(--anchor-bubble-bg);
  scroll-margin-top: 20px;
}

:deep(.user-bubble-active) {
  animation: user-bubble-active-flash 1.8s ease-out !important;
}

@keyframes user-bubble-active-flash {
  0%,
  25% {
    background-color: var(--anchor-bubble-active-bg);
  }
  45% {
    background-color: var(--anchor-bubble-bg);
  }
  65%,
  85% {
    background-color: var(--anchor-bubble-active-bg);
  }
  100% {
    background-color: var(--anchor-bubble-bg);
  }
}
</style>
