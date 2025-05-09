<template>
  <div>
    <h3>sender 与 Attachments 上传示例</h3>
    <div style="max-width: 500px">
      <tiny-sender v-model="inputValue" :allow-files="true" placeholder="请输入内容..." @submit="handleSubmit">
        <!-- 在头部插槽中放置附件组件 -->
        <template #header v-if="showAttachments">
          <div class="attachments-container">
            <tiny-attachments
              v-model:items="attachmentItems"
              :drag="{ mode: 'container' }"
              @files-dropped="handleFilesDropped"
              @file-remove="handleFileRemove"
            />
          </div>
        </template>
      </tiny-sender>
    </div>

    <!-- 消息展示区域 -->
    <div class="messages-container" v-if="messages.length > 0">
      <div class="message" v-for="(message, index) in messages" :key="index">
        <div class="message-content">{{ message.text }}</div>
        <div class="message-attachments" v-if="message.attachments && message.attachments.length > 0">
          <div class="attachment-item" v-for="file in message.attachments" :key="file.uid">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size" v-if="file.rawFile">{{ formatFileSize(file.rawFile.size) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import {TinySender, TinyAttachments} from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

// 输入值
const inputValue = ref('')

// 附件相关状态
const showAttachments = ref(false)
const attachmentItems = ref<Attachment[]>([])

// 消息列表
const messages = ref<Array<{ text: string; attachments?: Attachment[] }>>([])

// 切换附件显示
// const toggleAttachments = () => {
//   showAttachments.value = !showAttachments.value
// }

// 处理文件拖放
const handleFilesDropped = (files: Attachment[]) => {
  console.log('文件已上传:', files)
}

// 处理文件移除
const handleFileRemove = (file: Attachment) => {
  console.log('文件已移除:', file)
}

// 处理消息发送
const handleSubmit = () => {
  if (inputValue.value.trim() || attachmentItems.value.length > 0) {
    messages.value.push({
      text: inputValue.value,
      attachments: [...attachmentItems.value],
    })

    // 清空输入和附件
    inputValue.value = ''
    attachmentItems.value = []
    showAttachments.value = false
  }
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}
</script>

<style scoped>
.messages-container {
  margin-top: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
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
