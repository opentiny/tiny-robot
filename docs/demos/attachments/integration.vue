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
          uploadTooltip="上传文件 (支持图片、PDF、Word文档)"
          placeholder="请输入内容，可以上传附件..."
          @submit="handleSingleSubmit"
          @upload-online="handleSingleOnlineUpload"
          @files-selected="handleSingleFilesSelected"
        >
          <!-- 在头部插槽中放置附件组件，只有当有附件时才显示 -->
          <template #header v-if="singleAttachmentItems.length > 0">
            <div class="attachments-container">
              <tr-attachments
                ref="singleAttachmentsRef"
                v-model:items="singleAttachmentItems"
                :drag="{ mode: 'container' }"
                status-type="message"
                @files-dropped="handleSingleFilesDropped"
                @file-remove="handleSingleFileRemove"
                @file-retry="handleSingleFileRetry"
              />
            </div>
          </template>
        </tr-sender>
      </div>

      <!-- 事件信息显示 -->
      <div v-if="uploadEvents.length > 0" class="event-log">
        <h4>触发的事件：</h4>
        <div v-for="(event, index) in uploadEvents" :key="index" class="event-item">
          <span class="event-time">{{ event.time }}</span>
          <span class="event-type" :class="event.type">{{ event.message }}</span>
        </div>
      </div>

      <!-- 单行模式消息展示区域 -->
      <div class="messages-container" v-if="singleMessages.length > 0">
        <h4>单行模式消息记录:</h4>
        <div class="message" v-for="(message, index) in singleMessages" :key="index">
          <div class="message-content">{{ message.text }}</div>
          <div class="message-attachments" v-if="message.attachments && message.attachments.length > 0">
            <div class="attachment-item" v-for="file in message.attachments" :key="file.uid">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size" v-if="file.size">{{ singleAttachmentsRef?.formatFileSize(file.size) }}</span>
              <span class="file-status" :class="`status-${file.messageType || file.status}`">
                {{
                  file.messageType === 'success'
                    ? '✓ 上传成功'
                    : file.messageType === 'error'
                      ? '✗ 上传失败'
                      : file.messageType === 'uploading'
                        ? '⏳ 上传中'
                        : file.status || '未知状态'
                }}
              </span>
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

// 事件日志
const uploadEvents = ref<Array<{ time: string; message: string; type: string }>>([])

// 添加事件记录的辅助函数
const addEvent = (message: string, type: string) => {
  const now = new Date().toLocaleTimeString()
  uploadEvents.value.unshift({
    time: now,
    message,
    type,
  })

  // 限制显示最近5条事件
  if (uploadEvents.value.length > 5) {
    uploadEvents.value = uploadEvents.value.slice(0, 5)
  }
}

// 处理在线上传事件
const handleSingleOnlineUpload = () => {
  addEvent('触发在线文件事件 (upload-online)', 'online')
  console.log('在线文件事件被触发，可以在这里处理在线文件选择逻辑')
}

// 处理文件选择事件
const handleSingleFilesSelected = (files: FileList | null) => {
  if (files && files.length > 0) {
    addEvent(`选择了 ${files.length} 个文件 (files-selected)`, 'files')

    // 将选中的文件转换为 Attachment 格式并添加到附件列表
    const newAttachments: Attachment[] = Array.from(files).map((file, index) => ({
      uid: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'ready',
      messageType: 'info',
      file: file,
    }))

    singleAttachmentItems.value.push(...newAttachments)
    console.log('选中的文件：', newAttachments)

    // 自动开始上传
    handleSingleFilesDropped(newAttachments)
  }
}

const handleSingleFilesDropped = (files: Attachment[]) => {
  console.log('单行模式文件开始上传:', files)

  // 为每个文件设置上传中状态
  files.forEach((file) => {
    // 在响应式数组中查找并设置初始上传状态
    const fileIndex = singleAttachmentItems.value.findIndex((item) => item.uid === file.uid)
    if (fileIndex !== -1) {
      singleAttachmentItems.value[fileIndex].status = 'uploading'
      singleAttachmentItems.value[fileIndex].isUploading = true
      singleAttachmentItems.value[fileIndex].messageType = 'uploading'
    }

    // 模拟上传过程
    setTimeout(
      () => {
        // 通过uid在响应式数组中查找并更新文件状态
        const currentFileIndex = singleAttachmentItems.value.findIndex((item) => item.uid === file.uid)
        if (currentFileIndex !== -1) {
          // 随机模拟上传成功或失败（这里设置为90%成功）
          const success = Math.random() > 0.1 // 90% 成功率

          if (success) {
            singleAttachmentItems.value[currentFileIndex].status = 'done'
            singleAttachmentItems.value[currentFileIndex].isUploading = false
            singleAttachmentItems.value[currentFileIndex].messageType = 'success'
            console.log(`${file.name} 上传成功`)
          } else {
            singleAttachmentItems.value[currentFileIndex].status = 'error'
            singleAttachmentItems.value[currentFileIndex].isUploading = false
            singleAttachmentItems.value[currentFileIndex].messageType = 'error'
            console.log(`${file.name} 上传失败`)
          }
        }
      },
      1000 + Math.random() * 2000,
    ) // 1-3秒的随机上传时间
  })
}

const handleSingleFileRemove = (file: Attachment) => {
  console.log('单行模式文件已移除:', file)
}

const handleSingleFileRetry = (file: Attachment) => {
  console.log('单行模式文件重试上传:', file)

  // 通过uid在响应式数组中查找并设置重试状态
  const fileIndex = singleAttachmentItems.value.findIndex((item) => item.uid === file.uid)
  if (fileIndex !== -1) {
    singleAttachmentItems.value[fileIndex].status = 'uploading'
    singleAttachmentItems.value[fileIndex].isUploading = true
    singleAttachmentItems.value[fileIndex].messageType = 'uploading'
  }

  // 模拟重试上传过程
  setTimeout(
    () => {
      const currentFileIndex = singleAttachmentItems.value.findIndex((item) => item.uid === file.uid)
      if (currentFileIndex !== -1) {
        const success = Math.random() > 0.3 // 70% 成功率

        if (success) {
          singleAttachmentItems.value[currentFileIndex].status = 'done'
          singleAttachmentItems.value[currentFileIndex].isUploading = false
          singleAttachmentItems.value[currentFileIndex].messageType = 'success'
          console.log(`${file.name} 重试上传成功`)
        } else {
          singleAttachmentItems.value[currentFileIndex].status = 'error'
          singleAttachmentItems.value[currentFileIndex].isUploading = false
          singleAttachmentItems.value[currentFileIndex].messageType = 'error'
          console.log(`${file.name} 重试上传失败`)
        }
      }
    },
    1000 + Math.random() * 1500,
  ) // 1-2.5秒的随机上传时间
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
  margin-bottom: 8px;
  color: #333;
  border-bottom: 2px solid #007acc;
  padding-bottom: 8px;
}

.demo-section p {
  margin-top: 5px;
  margin-bottom: 16px;
  font-size: 0.9em;
  color: #666;
}

.sender-container {
  margin-bottom: 20px;
}

.event-log {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
  background-color: #f9f9f9;
  margin-bottom: 20px;
}

.event-log h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
}

.event-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: white;
  border-left: 3px solid #ddd;
}

.event-time {
  font-size: 12px;
  color: #666;
  min-width: 80px;
}

.event-type {
  font-size: 13px;
  font-weight: 500;
}

.event-type.local {
  color: #1890ff;
}

.event-type.online {
  color: #52c41a;
}

.event-type.files {
  color: #722ed1;
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
  padding: 12px;
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

.file-status {
  margin-left: 6px;
  color: #666;
}

.status-success {
  color: #4caf50;
}

.status-error {
  color: #f44336;
}

.status-uploading {
  color: #2196f3;
}
</style>
