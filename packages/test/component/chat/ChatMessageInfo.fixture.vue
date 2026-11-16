<script setup lang="ts">
import { computed } from 'vue'
import ChatBubbleActions from '../../../chat/src/ui/messages/ChatBubbleActions.vue'
import type { ChatBubbleActionContext, ChatBubbleActionsOptions, ChatMessageItem } from '../../../chat/src/types'

const props = defineProps<{
  message: ChatMessageItem
  mode?: 'custom' | 'empty' | 'nulls' | 'throw'
  messageKey?: string
  editing?: boolean
}>()
const context = computed<ChatBubbleActionContext>(() => ({
  conversationId: 'info-conversation',
  messageKey: props.messageKey ?? 'info-message',
  message: props.message,
  messages: [props.message],
  isLatest: true,
  turnState: 'completed',
  capabilities: { canEdit: true, canRegenerate: false },
}))
const options = computed<ChatBubbleActionsOptions>(() => ({
  display: 'always',
  assistant: ['copy', 'info'],
  info: props.mode
    ? {
        title: '对话信息',
        items: (context) => {
          if (props.mode === 'empty') return []
          if (props.mode === 'nulls') return [{ id: 'missing', label: '缺失', value: null }]
          if (props.mode === 'throw') throw new Error('Info mapping failed')
          const data = context.message.metadata ?? {}
          return [
            {
              id: 'requestId',
              label: '请求编号',
              value: typeof data.requestId === 'string' ? data.requestId : undefined,
            },
            {
              id: 'duration',
              label: '总耗时',
              value: typeof data.durationMs === 'number' ? `${(data.durationMs / 1000).toFixed(2)}s` : undefined,
              highlight: true,
            },
            { id: 'zero', label: '缓存命中', value: 0 },
            { id: 'null', label: '空值', value: null },
            { id: 'undefined', label: '未定义', value: undefined },
            { id: 'placeholder', label: '占位', value: '—' },
            { id: 'conversation', label: '会话', value: context.conversationId },
            { id: 'groupSize', label: '分组数量', value: context.messages.length },
          ]
        },
      }
    : undefined,
}))
</script>

<template>
  <div data-tr-color-mode="light" style="padding: 32px">
    <ChatBubbleActions :context="context" :options="options" role="assistant" :editing="editing" />
  </div>
</template>
