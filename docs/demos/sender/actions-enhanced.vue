<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, UploadButton, VoiceButton } from '@opentiny/tiny-robot'
import { Tag as TinyTag } from '@opentiny/vue'

const content = ref('')
const message = ref('')
const selectedFiles = ref<File[]>([])

const handleSubmit = (text: string) => {
  const fileNames = selectedFiles.value.map((file) => file.name).join(', ')
  message.value = fileNames ? `已提交: ${text || '(无文本)'}，附件: ${fileNames}` : `已提交: ${text}`
  content.value = ''
  selectedFiles.value = []
  setTimeout(() => (message.value = ''), 3000)
}

const handleFiles = (files: File[]) => {
  selectedFiles.value = [...selectedFiles.value, ...files]
}

const handleClear = () => {
  selectedFiles.value = []
}

const removeFile = (index: number) => {
  selectedFiles.value = selectedFiles.value.filter((_, fileIndex) => fileIndex !== index)
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
      :has-external-content="selectedFiles.length > 0"
      clearable
      @submit="handleSubmit"
      @clear="handleClear"
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

    <div v-if="selectedFiles.length" class="file-list">
      <tiny-tag
        v-for="(file, index) in selectedFiles"
        :key="`${file.name}-${file.lastModified}-${index}`"
        :max-width="240"
        closable
        @close="removeFile(index)"
      >
        {{ file.name }}
      </tiny-tag>
    </div>

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

.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
</style>
