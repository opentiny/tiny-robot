<template>
  <div class="demo-container">
    <h3>文件上传功能演示</h3>
    <p>点击文件上传按钮时会触发对应的事件，本地上传会自动打开文件选择对话框。</p>

    <tr-sender
      v-model="inputText"
      :allow-files="true"
      uploadTooltip="上传文件 (支持图片、PDF、Word文档)"
      placeholder="输入消息，可以上传附件..."
      @upload-online="handleOnlineUpload"
      @files-selected="handleFilesSelected"
    />

    <!-- 选中的文件展示 -->
    <div v-if="selectedFiles.length > 0" class="selected-files">
      <h4>已选择的文件：</h4>
      <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
        <span class="file-name">{{ file.name }}</span>
        <span class="file-size">{{ formatFileSize(file.size) }}</span>
        <span class="file-type">{{ file.type || '未知类型' }}</span>
      </div>
    </div>

    <!-- 事件信息显示 -->
    <div v-if="uploadEvents.length > 0" class="event-log">
      <h4>触发的事件：</h4>
      <div v-for="(event, index) in uploadEvents" :key="index" class="event-item">
        <span class="event-time">{{ event.time }}</span>
        <span class="event-type" :class="event.type">{{ event.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const inputText = ref('')

// 选中的文件列表
const selectedFiles = ref<File[]>([])

// 事件日志
const uploadEvents = ref<Array<{ time: string; message: string; type: string }>>([])

// 处理文件选择事件
const handleFilesSelected = (files: FileList | null) => {
  if (files && files.length > 0) {
    // 转换 FileList 为数组
    selectedFiles.value = Array.from(files)

    const now = new Date().toLocaleTimeString()
    uploadEvents.value.unshift({
      time: now,
      message: `选择了 ${files.length} 个文件 (files-selected)`,
      type: 'files',
    })

    // 限制显示最近5条事件
    if (uploadEvents.value.length > 5) {
      uploadEvents.value = uploadEvents.value.slice(0, 5)
    }

    console.log('选中的文件：', Array.from(files))
  }
}

// 处理在线上传事件
const handleOnlineUpload = () => {
  const now = new Date().toLocaleTimeString()
  uploadEvents.value.unshift({
    time: now,
    message: '触发在线文件事件 (upload-online)',
    type: 'online',
  })

  // 限制显示最近5条事件
  if (uploadEvents.value.length > 5) {
    uploadEvents.value = uploadEvents.value.slice(0, 5)
  }

  console.log('在线文件事件被触发，可以在这里处理在线文件选择逻辑')
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.demo-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h3 {
  margin-bottom: 5px;
  color: #333;
}

p {
  margin-top: 5px;
  margin-bottom: 10px;
  font-size: 0.9em;
  color: #666;
}

.selected-files {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
  background-color: #f0f9ff;
}

.selected-files h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
}

.file-item {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: white;
  border-left: 3px solid #1890ff;
}

.file-name {
  font-weight: 500;
  color: #333;
  flex: 1;
}

.file-size {
  font-size: 12px;
  color: #666;
  min-width: 60px;
}

.file-type {
  font-size: 12px;
  color: #999;
  min-width: 80px;
}

.event-log {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
  background-color: #f9f9f9;
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
</style>
