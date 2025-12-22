<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, UploadButton, VoiceButton } from '@opentiny/tiny-robot'

const content = ref('')
const message = ref('')

const handleSubmit = (text: string) => {
  message.value = `已提交: ${text}`
  content.value = ''
  setTimeout(() => (message.value = ''), 3000)
}

const handleFiles = (files: File[]) => {
  message.value = `选择了 ${files.length} 个文件: ${files.map((f) => f.name).join(', ')}`
  setTimeout(() => (message.value = ''), 3000)
}

const handleVoiceFinal = (text: string) => {
  content.value += text + ' '
}
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
