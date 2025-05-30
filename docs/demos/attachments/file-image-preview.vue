<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <h3>1. 图片预览和下载</h3>
    <p>点击图片可预览图片，预览界面中可进行缩放和下载操作</p>
    <tr-attachments
      v-model:items="imageFiles"
      :drag="false"
      :disabled="false"
      :overflow="wrapMode"
      status-type="operate"
      :custom-actions="imageActions"
      @action="handleFileAction"
      @file-preview="handleFilePreview"
      @file-download="handleFileDownload"
    />

    <h3>2. 上传失败重试功能</h3>
    <p>当图片上传失败时，可以点击"重试"按钮重新上传</p>
    <tr-attachments
      v-model:items="errorFiles"
      :drag="false"
      :disabled="false"
      :overflow="wrapMode"
      status-type="message"
      @file-retry="handleFileRetry"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'

const wrapMode = ref('wrap')

// 示例1: 图片预览和下载
const imageFiles = ref([
  {
    id: '1',
    uid: '1',
    name: '产品照片.jpg',
    fileType: 'image',
    size: 1024 * 1024 * 2.5, // 2.5MB
    // 实际项目中应使用真实图片URL
    previewUrl: 'https://example.com/images/product1.jpg',
  },
  {
    id: '2',
    uid: '2',
    name: '设计草图.png',
    fileType: 'image',
    size: 1024 * 1024 * 1.8, // 1.8MB
    previewUrl: 'https://example.com/images/design1.png',
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
  },
  {
    id: '4',
    uid: '4',
    name: '网络错误.png',
    fileType: 'image',
    size: 1024 * 1024 * 4.7, // 4.7MB
    status: 'error',
    messageType: 'error',
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

// 处理文件预览
const handleFilePreview = (file) => {
  console.log(`预览文件: ${file.name}`)
  // 在这里可以实现自定义预览逻辑
}

// 处理文件下载
const handleFileDownload = (file) => {
  console.log(`下载文件: ${file.name}`)
  // 在这里可以实现自定义下载逻辑，例如通过后端API下载
}

// 处理文件重试上传
const handleFileRetry = (file) => {
  console.log(`重试上传文件: ${file.name}`)

  // 模拟上传过程
  setTimeout(() => {
    const index = errorFiles.value.findIndex((item) => item.uid === file.uid)
    if (index !== -1) {
      // 随机模拟上传成功或失败
      const success = Math.random() > 0.5

      errorFiles.value[index].status = success ? '上传成功' : 'error'
      errorFiles.value[index].messageType = success ? 'success' : 'error'
      errorFiles.value[index].isUploading = false

      console.log(`${file.name} 上传${success ? '成功' : '失败'}`)
    }
  }, 1500)
}
</script>
