<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { TrSender, UploadButton, VoiceButton } from '@opentiny/tiny-robot'

const content = ref('')
const message = ref('')
let messageTimer: ReturnType<typeof setTimeout> | undefined

const showMessage = (value: string) => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }

  message.value = value
  messageTimer = setTimeout(() => {
    message.value = ''
    messageTimer = undefined
  }, 3000)
}

const handleSubmit = (text: string) => {
  showMessage(`已提交: ${text}`)
  content.value = ''
}

const handleFiles = (files: File[]) => {
  showMessage(`已选择 ${files.length} 个文件`)
}

const handleVoiceFinal = (text: string) => {
  content.value += text + ' '
}

onBeforeUnmount(() => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }
})
</script>

<template>
  <div class="demo-container">
    <tr-sender
      v-model="content"
      placeholder="输入内容，或使用语音/上传文件..."
      mode="multiple"
      clearable
      @submit="handleSubmit"
    >
      <template #footer-right>
        <!-- 上传按钮 -->
        <UploadButton
          accept="image/*"
          :multiple="true"
          tooltip="上传图片"
          tooltip-placement="top"
          @select="handleFiles"
        />

        <!-- 语音按钮 -->
        <VoiceButton tooltip="语音输入" tooltip-placement="top" @speech-final="handleVoiceFinal" />
      </template>
    </tr-sender>

    <div v-if="message" class="message">{{ message }}</div>
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
</style>
