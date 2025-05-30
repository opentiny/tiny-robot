<template>
  <div class="demo-container">
    <!-- 单行模式示例 -->
    <div class="demo-section">
      <h3>单行模式 (mode="single")</h3>
      <div class="sender-container">
        <tr-sender
          v-model="singleInputValue"
          mode="single"
          :allow-files="true"
          placeholder="请输入内容（单行模式）..."
          @submit="handleSingleSubmit"
          @upload-local="handleSingleUploadLocal"
        >
          <!-- 在头部插槽中放置附件组件，只有当有附件时才显示 -->
          <template #header v-if="singleAttachmentItems.length > 0">
            <div class="attachments-container">
              <tr-attachments
                ref="singleAttachmentsRef"
                v-model:items="singleAttachmentItems"
                :drag="{ mode: 'container' }"
                @files-dropped="handleSingleFilesDropped"
                @file-remove="handleSingleFileRemove"
              />
            </div>
          </template>
        </tr-sender>
      </div>

      <tr-attachments
        v-show="false"
        ref="singleAttachmentsRef"
        v-model:items="singleAttachmentItems"
        :drag="{ mode: 'container' }"
        @files-dropped="handleMultipleFilesDropped"
        @file-remove="handleMultipleFileRemove"
      />

      <!-- 单行模式消息展示区域 -->
      <div class="messages-container" v-if="singleMessages.length > 0">
        <h4>单行模式消息记录:</h4>
        <div class="message" v-for="(message, index) in singleMessages" :key="index">
          <div class="message-content">{{ message.text }}</div>
          <div class="message-attachments" v-if="message.attachments && message.attachments.length > 0">
            <div class="attachment-item" v-for="file in message.attachments" :key="file.uid">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size" v-if="file.size">{{ singleAttachmentsRef?.formatFileSize(file.size) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 多行模式示例 -->
    <div class="demo-section">
      <h3>多行模式 (mode="multiple")</h3>
      <div class="sender-container">
        <tr-sender
          v-model="multipleInputValue"
          mode="multiple"
          :allow-files="true"
          placeholder="请输入内容（多行模式）..."
          @submit="handleMultipleSubmit"
          @upload-local="handleMultipleUploadLocal"
        >
          <!-- 在头部插槽中放置附件组件，只有当有附件时才显示 -->
          <template #header v-if="multipleAttachmentItems.length > 0">
            <div class="attachments-container">
              <tr-attachments
                ref="multipleAttachmentsRef"
                v-model:items="multipleAttachmentItems"
                :drag="{ mode: 'container' }"
                @files-dropped="handleMultipleFilesDropped"
                @file-remove="handleMultipleFileRemove"
              />
            </div>
          </template>
        </tr-sender>
      </div>

      <!-- 多行模式消息展示区域 -->
      <div class="messages-container" v-if="multipleMessages.length > 0">
        <h4>多行模式消息记录:</h4>
        <div class="message" v-for="(message, index) in multipleMessages" :key="index">
          <div class="message-content">{{ message.text }}</div>
          <div class="message-attachments" v-if="message.attachments && message.attachments.length > 0">
            <div class="attachment-item" v-for="file in message.attachments" :key="file.uid">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size" v-if="file.size">{{ multipleAttachmentsRef?.formatFileSize(file.size) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

// 单行模式相关状态
const singleInputValue = ref('')
const singleAttachmentItems = ref<Attachment[]>([])
const singleMessages = ref<Array<{ text: string; attachments?: Attachment[] }>>([])
const singleAttachmentsRef = ref<InstanceType<typeof TrAttachments> | null>(null)

// 多行模式相关状态
const multipleInputValue = ref('')
const multipleAttachmentItems = ref<Attachment[]>([])
const multipleMessages = ref<Array<{ text: string; attachments?: Attachment[] }>>([])
const multipleAttachmentsRef = ref<InstanceType<typeof TrAttachments> | null>(null)

// 单行模式处理函数
const handleSingleUploadLocal = () => {
  singleAttachmentsRef.value?.triggerUpload()
}

const handleSingleFilesDropped = (files: Attachment[]) => {
  console.log('单行模式文件已上传:', files)
}

const handleSingleFileRemove = (file: Attachment) => {
  console.log('单行模式文件已移除:', file)
}

const handleSingleSubmit = () => {
  if (singleInputValue.value.trim() || singleAttachmentsRef.value?.hasFiles()) {
    singleMessages.value.push({
      text: singleInputValue.value,
      attachments: [...singleAttachmentItems.value],
    })

    // 清空输入和附件
    singleInputValue.value = ''
    singleAttachmentsRef.value?.clearFiles()
  }
}

// 多行模式处理函数
const handleMultipleUploadLocal = () => {
  multipleAttachmentsRef.value?.triggerUpload()
}

const handleMultipleFilesDropped = (files: Attachment[]) => {
  console.log('多行模式文件已上传:', files)
}

const handleMultipleFileRemove = (file: Attachment) => {
  console.log('多行模式文件已移除:', file)
}

const handleMultipleSubmit = () => {
  if (multipleInputValue.value.trim() || multipleAttachmentsRef.value?.hasFiles()) {
    multipleMessages.value.push({
      text: multipleInputValue.value,
      attachments: [...multipleAttachmentItems.value],
    })

    // 清空输入和附件
    multipleInputValue.value = ''
    multipleAttachmentsRef.value?.clearFiles()
  }
}
</script>

<style scoped>
.demo-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.demo-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
  border-bottom: 2px solid #007acc;
  padding-bottom: 8px;
}

.sender-container {
  margin-bottom: 20px;
}

.attachments-container {
  /* margin-bottom: 8px; */
}

.messages-container {
  margin-top: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.messages-container h4 {
  margin: 0;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
  font-weight: 600;
}

.message {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.message:last-child {
  border-bottom: none;
}

.message-content {
  margin-bottom: 8px;
  line-height: 1.5;
}

.message-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.attachment-item {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.file-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  margin-left: 6px;
  color: #666;
}
</style>
