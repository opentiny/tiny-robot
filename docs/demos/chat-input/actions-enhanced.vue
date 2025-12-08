<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput, UploadButton, VoiceButton } from '@opentiny/tiny-robot'

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
    <div class="demo-info">
      <p>通过插槽添加增强按钮（Upload、Voice），每个按钮都有独立的配置</p>
    </div>

    <ChatInput
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
    </ChatInput>

    <div v-if="message" class="message">{{ message }}</div>
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
</style>
