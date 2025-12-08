<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const content = ref('')
const loading = ref(false)
const message = ref('')

const handleSubmit = (text: string) => {
  loading.value = true
  message.value = '正在处理...'

  // 模拟 AI 响应
  setTimeout(() => {
    loading.value = false
    message.value = `AI 回复: 收到您的消息 "${text}"`
    content.value = ''
  }, 3000)
}

const handleCancel = () => {
  loading.value = false
  message.value = '❌ 已取消响应'
  setTimeout(() => (message.value = ''), 2000)
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-info">
      <p>在 loading 状态下，点击停止按钮会触发 cancel 事件</p>
      <p>当前状态: {{ loading ? '⏳ 处理中...' : '✅ 就绪' }}</p>
    </div>

    <ChatInput
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

.demo-info {
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.demo-info p {
  margin: 4px 0;
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
