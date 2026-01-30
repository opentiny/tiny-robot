<template>
  <div>
    <p class="hint">
      用 <code>requestState</code> 和 <code>processingState</code> 驱动 UI。<code>processingState</code> 是
      <code>requestState</code> 为 processing 时的子状态。
    </p>
    <div class="state-bar">
      <span class="label">requestState:</span>
      <span :class="['badge', requestState]">{{ requestState }}</span>
      <span class="label">processingState:</span>
      <span class="badge">{{ processingState ?? '—' }}</span>
    </div>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '处理中...' : '发送一条消息'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortRequest"
    ></tr-sender>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'
import { useMessageRequestState } from './RequestState'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest, requestState, processingState } = useMessageRequestState()

const inputMessage = ref('')

function handleSubmit(content: string) {
  if (!content?.trim() || isProcessing.value) return
  sendMessage(content.trim())
  inputMessage.value = ''
}

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}
</script>

<style scoped>
.hint {
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.hint code {
  padding: 2px 6px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  font-size: 13px;
}
.state-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  font-size: 13px;
}
.state-bar .label {
  color: var(--vp-c-text-2);
}
.badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.badge.idle {
  background: var(--vp-c-gray-soft);
  color: var(--vp-c-text-1);
}
.badge.processing {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.badge.completed {
  background: var(--vp-c-green-soft);
  color: var(--vp-c-green-1);
}
.badge.aborted {
  background: var(--vp-c-orange-soft);
  color: var(--vp-c-orange-1);
}
.badge.error {
  background: var(--vp-c-red-soft);
  color: var(--vp-c-red-1);
}
</style>
