<template>
  <div>
    <p class="hint">
      使用 <code>onCompletionChunk</code> 处理每个数据块（如统计、转换），再调用
      <code>runDefault()</code> 执行默认合并。
    </p>
    <p class="chunk-count">本回合已收到数据块数：{{ chunkCount }}</p>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '流式输出中...' : '发送一条消息'"
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
import { useMessageCustomChunk } from './CustomChunk'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest, chunkCount } = useMessageCustomChunk()

const inputMessage = ref('')

// 用户发送消息（新回合）时重置数据块计数
function handleSubmit(content: string) {
  if (!content?.trim() || isProcessing.value) return
  chunkCount.value = 0
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
.chunk-count {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--vp-c-brand-1);
}
</style>
