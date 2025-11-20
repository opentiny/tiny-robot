<template>
  <div class="demo-container">
    <h3>加载状态</h3>
    <ChatInput
      v-model="content"
      placeholder="输入内容后提交，模拟加载状态..."
      :loading="loading"
      stop-text="停止生成"
      clearable
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
    <p v-if="loading" class="loading-tip">正在生成回复...</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const content = ref('')
const loading = ref(false)

const handleSubmit = (value: string) => {
  console.log('提交内容:', value)
  loading.value = true

  // 模拟 3 秒后完成
  setTimeout(() => {
    loading.value = false
    content.value = ''
  }, 3000)
}

const handleCancel = () => {
  console.log('取消生成')
  loading.value = false
}
</script>

<style scoped>
.demo-container {
  padding: 20px;
}

.loading-tip {
  margin-top: 10px;
  color: #1476ff;
  font-size: 14px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
