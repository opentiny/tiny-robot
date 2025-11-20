<template>
  <div class="demo-container">
    <h3>自定义底部按钮</h3>
    <ChatInput
      v-model="content"
      placeholder="输入内容，可以使用深度思考..."
      mode="multiple"
      clearable
      @submit="handleSubmit"
    >
      <template #footer>
        <button class="deep-think-btn" @click="handleDeepThink">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            />
          </svg>
          深度思考
        </button>
        <button class="emoji-btn" @click="handleEmoji">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path
              d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
            />
          </svg>
          表情
        </button>
      </template>
    </ChatInput>
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const content = ref('')
const message = ref('')

const handleSubmit = (value: string) => {
  message.value = `已提交: ${value}`
  setTimeout(() => (message.value = ''), 3000)
}

const handleDeepThink = () => {
  message.value = '启动深度思考模式...'
  setTimeout(() => (message.value = ''), 3000)
}

const handleEmoji = () => {
  message.value = '打开表情选择器...'
  setTimeout(() => (message.value = ''), 3000)
}
</script>

<style scoped>
.demo-container {
  padding: 20px;
}

.deep-think-btn,
.emoji-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.deep-think-btn:hover,
.emoji-btn:hover {
  background: #f5f5f5;
  border-color: #1476ff;
  color: #1476ff;
}

.message {
  margin-top: 15px;
  padding: 10px;
  background: #e7f3ff;
  border-radius: 6px;
  color: #1476ff;
}
</style>
