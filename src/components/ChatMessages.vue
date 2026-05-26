<script setup lang="ts">
import {
  BubbleRendererMatchPriority,
  TrBubbleList,
  TrBubbleProvider,
  type BubbleContentRendererMatch,
  type BubbleMessage,
  type BubbleRoleConfig,
} from '@opentiny/tiny-robot'
import { IconAi, IconCopy, IconRefresh, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, markRaw } from 'vue'
import CustomerToolRenderer from './renderers/CustomerToolRenderer.vue'

const props = defineProps<{
  messages: BubbleMessage[]
  isProcessing: boolean
}>()

const emit = defineEmits<{
  regenerate: [userMessageIndex: number]
  followUp: [content: string]
}>()

const roles: Record<string, BubbleRoleConfig> = {
  user: {
    placement: 'end',
    avatar: h(IconUser, { style: { width: '32px', height: '32px' } }),
  },
  assistant: {
    placement: 'start',
    avatar: h(IconAi, { style: { width: '32px', height: '32px' } }),
  },
}

const contentRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (message) => Array.isArray(message.tool_calls) && message.tool_calls.length > 0,
    renderer: markRaw(CustomerToolRenderer),
    priority: BubbleRendererMatchPriority.NORMAL,
  },
]

const copyMessage = async (messages: BubbleMessage[]) => {
  const content = messages
    .map((message) => message.content)
    .filter((content): content is string => typeof content === 'string' && content.length > 0)
    .join('\n')

  if (!content) {
    return
  }

  await navigator.clipboard.writeText(content)
}

const hasContent = (messages: BubbleMessage[]) =>
  messages.some((message) => typeof message.content === 'string' && message.content.length > 0)

const hasError = (messages: BubbleMessage[]) => messages.some((message) => message.state?.error)

const messageIsGenerating = (messageIndexes: number[]) => {
  return props.isProcessing && messageIndexes.includes(props.messages.length - 1)
}

const regenerate = (messageIndexes: number[]) => {
  const firstMessageIndex = messageIndexes[0]
  const userMessageIndex = props.messages
    .slice(0, firstMessageIndex)
    .findLastIndex((message) => message.role === 'user')

  if (userMessageIndex !== -1) {
    emit('regenerate', userMessageIndex)
  }
}

const getFollowUpQuestions = (messages: BubbleMessage[], role: string | undefined, messageIndexes: number[]) => {
  if (role !== 'assistant' || props.isProcessing || messageIsGenerating(messageIndexes) || hasError(messages)) {
    return []
  }

  const hasPreviousUserMessage = props.messages.slice(0, messageIndexes[0]).some((message) => message.role === 'user')

  if (!hasPreviousUserMessage || !messageIndexes.includes(props.messages.length - 1)) {
    return []
  }

  const content = messages.map((message) => message.content).join('')

  if (content.includes('订单') || content.includes('发货')) {
    return ['预计什么时候发货？', '可以修改收货地址吗？', '是否可以取消订单？']
  }

  if (content.includes('退款') || content.includes('到账')) {
    return ['为什么退款还没到账？', '可以加急处理吗？', '退款会退到哪里？']
  }

  if (content.includes('物流') || content.includes('包裹')) {
    return ['预计什么时候送达？', '可以修改配送地址吗？', '物流长时间不更新怎么办？']
  }

  return ['需要转人工客服吗？', '还需要补充哪些信息？', '下一步应该怎么处理？']
}
</script>

<template>
  <TrBubbleProvider :content-renderer-matches="contentRendererMatches">
    <TrBubbleList :messages="messages" :role-configs="roles" auto-scroll class="chat-messages">
      <template #after="{ messages: slotMessages, role, messageIndexes }">
        <div class="message-after">
          <div v-if="hasContent(slotMessages)" class="message-actions">
            <button v-if="role === 'user'" type="button" title="复制" @click="copyMessage(slotMessages)">
              <IconCopy />
            </button>
            <template v-if="role === 'assistant' && !messageIsGenerating(messageIndexes)">
              <button type="button" title="复制" @click="copyMessage(slotMessages)">
                <IconCopy />
              </button>
              <button
                v-if="!isProcessing"
                type="button"
                :title="hasError(slotMessages) ? '重试' : '重新生成'"
                @click="regenerate(messageIndexes)"
              >
                <IconRefresh />
              </button>
            </template>
          </div>

          <div v-if="getFollowUpQuestions(slotMessages, role, messageIndexes).length" class="follow-up-list">
            <button
              v-for="question in getFollowUpQuestions(slotMessages, role, messageIndexes)"
              :key="question"
              type="button"
              @click="emit('followUp', question)"
            >
              {{ question }}
            </button>
          </div>
        </div>
      </template>
    </TrBubbleList>
  </TrBubbleProvider>
</template>

<style scoped>
.chat-messages {
  height: 100%;
  max-height: 100%;
  overflow: auto;

  &.tr-bubble-list {
    padding-block: 24px;
    padding-inline: max(16px, calc((100% - 800px) / 2));
  }
}

.chat-messages :deep(.tr-bubble[data-role='assistant']) {
  --tr-bubble-box-bg: var(--tr-container-bg-default-2);
  --tr-bubble-text-color: var(--tr-text-primary);
}

.chat-messages :deep(.tr-bubble[data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary);
  --tr-bubble-text-color: #fff;
}

.message-after {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.message-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  padding: 6px;
  background: transparent;
  color: var(--tr-icon-color-default);
  cursor: pointer;
}

.message-actions button:hover {
  background: var(--tr-container-bg-hover);
}

.message-actions svg {
  width: 16px;
  height: 16px;
}

.follow-up-list {
  display: flex;
  width: min(360px, 100%);
  flex-direction: column;
  gap: 8px;
}

.follow-up-list button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: var(--tr-radius-md);
  padding: 9px 12px;
  background: var(--tr-container-bg-default);
  color: var(--tr-text-secondary);
  cursor: pointer;
  font-size: var(--tr-font-size-sm);
  line-height: 1.4;
  text-align: left;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.follow-up-list button::after {
  content: '›';
  flex-shrink: 0;
  color: var(--tr-text-tertiary);
  font-size: var(--tr-font-size-md);
}

.follow-up-list button:hover {
  border-color: var(--tr-color-primary);
  background: var(--tr-color-primary-light);
  color: var(--tr-color-primary);
}

.follow-up-list button:hover::after {
  color: var(--tr-color-primary);
}

@media (max-width: 480px) {
  .chat-messages :deep(.tr-bubble__avatar) {
    display: none;
  }
}
</style>
