<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <h3>1. 标准卡片图片预览和下载</h3>
    <p>默认卡片模式，点击图片卡片同样可以打开画廊预览。</p>
    <tr-attachments
      v-model:items="imageFiles"
      :drag="false"
      :disabled="false"
      status-type="operate"
      :custom-actions="imageActions"
      @action="handleFileAction"
      @file-download="handleFileDownload"
    />

    <h3>2. 上传失败重试功能</h3>
    <p>当图片上传失败时，可以点击"重试"按钮重新上传</p>
    <tr-attachments v-model:items="errorFiles" status-type="message" @file-retry="handleFileRetry" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments, type Attachment } from '@opentiny/tiny-robot'

// 示例1: 标准图片卡片
const imageFiles = ref([
  {
    id: '1',
    uid: '1',
    name: 'demo.png',
    fileType: 'image',
    status: 'done',
    size: 1024 * 1024 * 2.5, // 2.5MB
    // 使用真实的可访问图片URL进行测试
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    id: '2',
    uid: '2',
    name: 'demo.png',
    fileType: 'image',
    status: 'done',
    size: 1024 * 1024 * 1.8, // 1.8MB
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/scenery.jpg',
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/scenery.jpg',
  },
])

// 图片操作按钮
const imageActions = [
  {
    type: 'preview',
    label: '预览',
  },
  {
    type: 'download',
    label: '下载',
  },
]

// 示例2: 上传失败重试
const errorFiles = ref([
  {
    id: '3',
    uid: '3',
    name: '上传失败的图片.jpg',
    fileType: 'image',
    size: 1024 * 1024 * 3.2, // 3.2MB
    status: 'error',
    messageType: 'error',
    isUploading: false,
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.jpg',
  },
  {
    id: '4',
    uid: '4',
    name: '网络错误.png',
    fileType: 'image',
    size: 1024 * 1024 * 4.7, // 4.7MB
    status: 'error',
    messageType: 'error',
    isUploading: false,
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/aurora.png',
  },
])

// 处理自定义操作按钮点击
const handleFileAction = (payload) => {
  const { action, file } = payload
  console.log(`执行操作: ${action.type}，文件: ${file.name}`)

  // 根据不同的操作类型执行不同的逻辑
  if (action.type === 'preview') {
    console.log('打开预览')
  } else if (action.type === 'download') {
    console.log('下载文件')
  }
}

// 处理文件下载
const handleFileDownload = (file: Attachment) => {
  console.log(`下载文件: ${file.name}`)
  // 在这里可以实现自定义下载逻辑，例如通过后端API下载
}

// 处理文件重试上传
const handleFileRetry = (file) => {
  console.log(`重试上传文件: ${file.name}`)

  // 先设置上传中状态
  const index = errorFiles.value.findIndex((item) => item.uid === file.uid)
  if (index !== -1) {
    errorFiles.value[index].status = 'uploading'
    errorFiles.value[index].messageType = 'uploading'
    errorFiles.value[index].isUploading = true
  }

  // 模拟上传过程
  setTimeout(() => {
    const currentIndex = errorFiles.value.findIndex((item) => item.uid === file.uid)
    if (currentIndex !== -1) {
      // 随机模拟上传成功或失败
      const success = Math.random() > 0.5

      // 保持原有文件属性，只更新状态相关属性
      errorFiles.value[currentIndex] = {
        ...errorFiles.value[currentIndex], // 保持所有原有属性
        status: success ? 'done' : 'error',
        messageType: success ? 'success' : 'error',
        isUploading: false,
        // 如果上传成功，可以添加预览URL
        ...(success &&
          file.name.includes('图片') && {
            previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
          }),
      }

      console.log(`${file.name} 上传${success ? '成功' : '失败'}`)
    }
  }, 1500)
}
</script>
