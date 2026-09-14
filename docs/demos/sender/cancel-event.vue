<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const content = ref('')
const loading = ref(false)
const message = ref('')
let responseTimer: ReturnType<typeof setTimeout> | undefined
let messageTimer: ReturnType<typeof setTimeout> | undefined

const clearTimers = () => {
  if (responseTimer) clearTimeout(responseTimer)
  if (messageTimer) clearTimeout(messageTimer)
  responseTimer = undefined
  messageTimer = undefined
}

const handleSubmit = (text: string) => {
  clearTimers()
  loading.value = true
  message.value = '正在处理...'

  // 模拟 AI 响应
  responseTimer = setTimeout(() => {
    loading.value = false
    message.value = `AI 回复: 收到您的消息 "${text}"`
    content.value = ''
    responseTimer = undefined
  }, 3000)
}

const handleCancel = () => {
  clearTimers()
  loading.value = false
  message.value = '❌ 已取消响应'
  messageTimer = setTimeout(() => {
    message.value = ''
    messageTimer = undefined
  }, 2000)
}

onBeforeUnmount(clearTimers)
</script>

<template>
  <div class="demo-container">
    <tr-sender
      v-model="content"
      :loading="loading"
      placeholder="输入内容后提交，观察 loading 状态..."
      stop-text="停止响应"
      clearable
      @submit="handleSubmit"
      @cancel="handleCancel"
    />

    <div v-if="message" :class="['message', { error: message.includes('取消') }]">
      {{ message }}
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.message {
  margin-top: 15px;
  padding: 10px;
  background: #e7f3ff;
  border-radius: 6px;
  color: #1476ff;
}

.message.error {
  background: #fef0f0;
  color: #f56c6c;
}
</style>
