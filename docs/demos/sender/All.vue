<template>
  <tr-sender
    class="chat-input"
    v-model="inputMessage"
    mode="multiple"
    submitType="ctrlEnter"
    :maxLength="2000"
    :showWordLimit="true"
    :autoSize="true"
    :clearable="true"
    :allowSpeech="true"
    :loading="isSubmitting"
    placeholder="请输入您的消息..."
    @submit="handleSubmit"
    @speech-end="handleSpeechEnd"
  >
    <template #header>
      <div class="conversation-title">聊天对话</div>
    </template>

    <template #prefix>
      <icon-ai class="user-avatar" />
    </template>
  </tr-sender>
</template>

<script setup lang="ts">
// import { TrSender } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { ref } from 'vue'

const inputMessage = ref('')
const isSubmitting = ref(false)

const handleSubmit = async (message) => {
  isSubmitting.value = true
  try {
    inputMessage.value = '' // 清空输入
    console.log('发送成功:', message)
  } catch (error) {
    console.error('发送失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleSpeechEnd = (transcript) => {
  console.log('语音识别结果:', transcript)
}
</script>

<style>
.conversation-title {
  font-weight: bold;
  padding: 8px 0;
  text-align: center;
}

.user-avatar {
  font-size: 36px;
  object-fit: cover;
}

.custom-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-top: 1px solid #eee;
}
</style>
