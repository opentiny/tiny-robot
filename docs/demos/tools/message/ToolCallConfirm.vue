<template>
  <div>
    <p class="hint">
      使用 <code>confirmToolCall</code> 标记需要确认的工具调用，点击“允许 / 拒绝”后通过
      <code>submitToolResult</code> 继续流程。
    </p>
    <tr-bubble-list :messages="messages" :role-configs="roles" @state-change="handleStateChange"></tr-bubble-list>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '处理中...' : '发送任意消息触发确认'"
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
import { useMessageToolCallConfirm } from './ToolCallConfirm'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, submitToolResult, abortRequest } = useMessageToolCallConfirm()

const inputMessage = ref('')

function handleSubmit(content: string) {
  sendMessage(content)
  inputMessage.value = ''
}

function handleStateChange(payload: { key: string; value: unknown; messageIndex: number }) {
  if (payload.key === 'toolCallDecision') {
    const { toolCallId, decision } = payload.value as {
      toolCallId: string
      decision: { action: 'allow' | 'deny'; message?: string }
    }

    submitToolResult({
      role: 'tool',
      tool_call_id: toolCallId,
      content:
        decision.action === 'allow' ? '已搜索内部文档：Q3 roadmap' : decision.message || '用户拒绝了本次工具调用。',
      metadata: {
        toolCallStatus: decision.action === 'allow' ? 'success' : 'denied',
      },
    })
    return
  }

  messages.value[payload.messageIndex].state ??= {}
  messages.value[payload.messageIndex].state![payload.key] = payload.value
}

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
  tool: { placement: 'start', avatar: aiAvatar },
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
</style>
