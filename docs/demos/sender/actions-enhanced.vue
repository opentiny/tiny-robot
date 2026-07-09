<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, UploadButton, VoiceButton } from '@opentiny/tiny-robot'
import { IconFileRemove } from '@opentiny/tiny-robot-svgs'

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
  selectedFiles.value = files
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
      <div v-for="(file, index) in selectedFiles" :key="`${file.name}-${file.lastModified}-${index}`" class="file-item">
        <span class="file-name">{{ file.name }}</span>
        <button type="button" class="file-remove" aria-label="移除文件" title="移除文件" @click="removeFile(index)">
          <IconFileRemove class="file-remove-icon" />
        </button>
      </div>
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

.file-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 6px 10px;
  background: #f2f6fc;
  border: 1px solid #d9e4f5;
  border-radius: 6px;
  color: #303133;
}

.file-name {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  color: #909399;
  background: transparent;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  transition:
    color 0.2s,
    background-color 0.2s;
}

.file-remove:hover {
  color: #1476ff;
  background: rgba(20, 118, 255, 0.08);
}

.file-remove-icon {
  width: 14px;
  height: 14px;
}
</style>
