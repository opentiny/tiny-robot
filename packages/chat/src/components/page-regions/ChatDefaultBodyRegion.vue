<script setup lang="ts">
import { computed, inject } from 'vue'
import type { PropType } from 'vue'
import { CHAT_KIT_KEY, CHAT_RUNTIME_KEY } from '@/shared/context'
import type { ChatPageMessageListInput, ChatPageWelcomeInput } from '@/shared/context'
import type { ChatListVariant, ChatRuntime } from '@/types'
import ChatFeedback from '@/components/feedback/ChatFeedback.vue'
import ChatMessageList from '../ChatMessageList.vue'
import ChatWelcome from '../ChatWelcome.vue'

defineOptions({ name: 'TrChatDefaultBodyRegion' })

const props = defineProps({
  showWelcome: {
    type: Boolean,
    required: true,
  },
  welcomeInput: Object as PropType<ChatPageWelcomeInput | undefined>,
  messageListInput: Object as PropType<ChatPageMessageListInput | undefined>,
  variant: {
    type: String as PropType<ChatListVariant>,
    required: true,
  },
  bubbleSlotNames: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
})

const chatKit = inject(CHAT_KIT_KEY)!
const chatRuntime = inject<ChatRuntime | null>(CHAT_RUNTIME_KEY, null)
const resolvedShowFeedback = computed(
  () => props.messageListInput?.showFeedback ?? chatRuntime?.message.config?.feedback?.enabled ?? false,
)
</script>

<template>
  <template v-if="$slots['message-list']">
    <slot name="message-list" :messages="chatKit.messages" />
  </template>
  <template v-else>
    <div v-if="props.showWelcome" class="tr-chat__welcome-area">
      <slot v-if="$slots.welcome" name="welcome" />
      <ChatWelcome
        v-else-if="props.welcomeInput"
        :title="props.welcomeInput.title"
        :description="props.welcomeInput.description"
        :icon="props.welcomeInput.icon"
        :prompts="props.welcomeInput.prompts"
        @prompt-click="chatKit.sendMessage($event)"
      />
      <slot v-else name="empty" />
    </div>

    <ChatMessageList
      v-else
      :auto-scroll="props.messageListInput?.autoScroll"
      :variant="props.variant"
      :message-actions="props.messageListInput?.messageActions"
      :message-actions-mode="props.messageListInput?.messageActionsMode"
      :on-action-click="props.messageListInput?.onActionClick"
      :group-strategy="props.messageListInput?.groupStrategy"
    >
      <template v-for="name in props.bubbleSlotNames" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
        <ChatFeedback v-if="name === 'after' && resolvedShowFeedback" v-bind="slotProps ?? {}" />
      </template>
      <template v-if="resolvedShowFeedback && !props.bubbleSlotNames.includes('after')" #after="slotProps">
        <ChatFeedback v-bind="slotProps" />
      </template>
    </ChatMessageList>
  </template>
</template>
