<script setup lang="ts">
import { TrFeedback } from '@opentiny/tiny-robot'
import type { BubbleMessage, FeedbackProps } from '@opentiny/tiny-robot'
import { computed, h, inject } from 'vue'
import type { PropType } from 'vue'
import { useChatFeedback } from './useChatFeedback'
import ChatUsagePanel from './ChatUsagePanel.vue'
import { CHAT_KIT_KEY, CHAT_RUNTIME_KEY, MESSAGE_ACTION_KEY, MESSAGE_ACTIONS_KEY } from '@/shared/context'
import type { ChatMessageActionPayload, ChatRuntime, TrChatMessageListProps } from '@/types'
import type { UseChatKitReturn } from '@/types/core'
import { triStateBooleanProp } from '@/shared/utils'

defineOptions({ name: 'TrChatFeedback' })

const props = defineProps({
  messages: {
    type: Array as () => BubbleMessage[],
    required: true,
  },
  messageIndexes: {
    type: Array as () => number[],
    required: true,
  },
  role: String,
  enabled: triStateBooleanProp,
  messageActions: null as unknown as PropType<TrChatMessageListProps['messageActions']>,
  messageActionsMode: String as PropType<TrChatMessageListProps['messageActionsMode']>,
  onActionClick: Function as PropType<(payload: ChatMessageActionPayload) => void>,
})

const emit = defineEmits<{
  edit: [content: string]
  'action-click': [payload: ChatMessageActionPayload]
}>()

const chatKit = inject<UseChatKitReturn | null>(CHAT_KIT_KEY, null)
const chatRuntime = inject<ChatRuntime | null>(CHAT_RUNTIME_KEY, null)
const injectedActionHandler = inject(MESSAGE_ACTION_KEY, undefined)
const injectedActionConfig = inject(MESSAGE_ACTIONS_KEY, null)

const {
  shouldRender,
  feedbackActions,
  feedbackOperations,
  getActionDefinition,
  actionContext,
  messageIds,
  userContent,
  usageInfo,
} = useChatFeedback({
  messages: props.messages,
  messageIndexes: props.messageIndexes,
  role: props.role,
  enabled: props.enabled,
  runtime: chatRuntime,
  fallbackRuntime: chatKit,
  messageActions: props.messageActions ?? injectedActionConfig?.messageActions.value,
  messageActionsMode: props.messageActionsMode ?? injectedActionConfig?.messageActionsMode.value,
})

const resolvedFeedbackActions = computed<FeedbackProps['actions']>(() => {
  if (!usageInfo.value) return feedbackActions.value ?? []
  return [
    ...(feedbackActions.value ?? []),
    {
      name: '__usage__',
      label: '',
      icon: h(ChatUsagePanel, { usage: usageInfo.value }),
    },
  ]
})

function emitAction(action: string, placement: 'actions' | 'operations' = 'actions') {
  const ctx = actionContext.value
  const payload: ChatMessageActionPayload = {
    action,
    placement,
    role: props.role,
    messages: ctx.messages,
    messageIds: messageIds.value,
    messageIndexes: props.messageIndexes,
    message: ctx.message,
    messageIndex: ctx.messageIndex,
    messageId: ctx.messageId,
    conversationId: chatKit?.activeConversationId.value ?? undefined,
  }

  props.onActionClick?.(payload)
  injectedActionHandler?.(payload)
  emit('action-click', payload)
}

async function triggerAction(name: string, placement: 'actions' | 'operations' = 'actions') {
  const actionDefinition = getActionDefinition(name, placement) ?? getActionDefinition(name)
  if (actionDefinition?.onClick) {
    try {
      await actionDefinition.onClick(actionContext.value)
    } catch (error) {
      console.error(`[TrChatFeedback] message action "${name}" failed`, error)
    }
  }

  if (name === 'edit') {
    emit('edit', userContent.value)
  }

  emitAction(name, placement)
}
</script>

<template>
  <div
    v-if="shouldRender"
    class="tr-chat-feedback"
    :class="{
      'tr-chat-feedback--assistant': role === 'assistant',
      'tr-chat-feedback--user': role === 'user',
    }"
    data-testid="chat-feedback"
  >
    <TrFeedback
      :actions="resolvedFeedbackActions"
      :operations="feedbackOperations"
      @action="triggerAction"
      @operation="(name: string) => triggerAction(name, 'operations')"
    />
  </div>
</template>

<style>
.tr-chat-feedback {
  margin-top: 8px;
}

.tr-bubble[data-role='assistant'] .tr-chat-feedback {
  align-self: flex-start;
}

.tr-bubble[data-role='assistant'] .tr-chat-feedback .tr-feedback__operations {
  justify-content: flex-start;
  padding: 0 2px;
}

.tr-bubble[data-role='user'] .tr-chat-feedback {
  align-self: flex-end;
  opacity: 0;
  transform: translateY(-2px);
  pointer-events: none;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.tr-bubble[data-role='user']:hover .tr-chat-feedback,
.tr-bubble[data-role='user']:focus-within .tr-chat-feedback {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.tr-bubble[data-role='user'] .tr-chat-feedback .tr-feedback__operations {
  justify-content: flex-end;
  padding: 0 2px;
}
</style>
