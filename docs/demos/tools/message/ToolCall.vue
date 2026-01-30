<template>
  <div>
    <p class="hint">
      使用 <code>toolPlugin</code> 做工具调用：<code>getTools</code> + <code>callTool</code>。本示例使用模拟 API 返回
      tool_calls。
    </p>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '处理中...' : '询问天气（如：北京）'"
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
import { useMessageToolCall } from './ToolCall'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest } = useMessageToolCall()

const inputMessage = ref('')

function handleSubmit(content: string) {
  sendMessage(content)
  inputMessage.value = ''
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
