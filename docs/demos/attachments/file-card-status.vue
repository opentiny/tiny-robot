<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <h3>1. 信息状态 (默认)</h3>
    <tr-attachments v-model:items="infoFiles" :drag="false" :disabled="true" :overflow="wrapMode" status-type="info" />

    <h3>2. 进度状态</h3>
    <tr-attachments
      v-model:items="progressFiles"
      :drag="false"
      :disabled="true"
      :overflow="wrapMode"
      status-type="progress"
    />

    <h3>3. 状态消息</h3>
    <tr-attachments
      v-model:items="messageFiles"
      :drag="false"
      :disabled="true"
      :overflow="wrapMode"
      status-type="message"
    />

    <h3>4. 自定义操作按钮</h3>
    <tr-attachments
      v-model:items="customActionFiles"
      :drag="false"
      :disabled="true"
      :overflow="wrapMode"
      status-type="operate"
      :custom-actions="fileActions"
      @action="handleFileAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { TrAttachments } from '@opentiny/tiny-robot'

const wrapMode = ref('wrap')

// 示例1: 信息状态 - 显示文件类型和大小
const infoFiles = ref([
  {
    id: '1',
    name: '设计文档.docx',
    fileType: 'word',
    size: 1024 * 1024 * 1.2, // 1.2MB
  },
  {
    id: '2',
    name: 'logo设计图.png',
    fileType: 'image',
    size: 1024 * 1024 * 3.5, // 3.5MB
  },
  {
    id: '3',
    name: '项目文档.pdf',
    fileType: 'pdf',
    size: 1024 * 1024 * 2.8, // 2.8MB
  },
])

// 示例2: 进度状态 - 显示上传/下载进度
const progressFiles = ref([
  {
    id: '4',
    name: '正在上传文件.png',
    fileType: 'image',
    size: 1024 * 1024 * 5, // 5MB
    status: '上传中',
    progress: 30,
    isUploading: true,
  },
  {
    id: '5',
    name: '即将完成上传.pdf',
    fileType: 'pdf',
    size: 1024 * 1024 * 1.8, // 1.8MB
    status: '上传中',
    progress: 75,
    isUploading: true,
  },
])

// 示例3: 状态消息 - 显示不同类型的状态消息
const messageFiles = ref([
  {
    id: '6',
    name: '上传成功.doc',
    fileType: 'word',
    size: 1024 * 1024 * 1.5, // 1.5MB
    status: '上传成功',
    messageType: 'success',
  },
  {
    id: '7',
    name: '上传失败.xlsx',
    fileType: 'excel',
    size: 1024 * 1024 * 2.3, // 2.3MB
    status: 'error',
    messageType: 'error',
  },
  {
    id: '8',
    name: '处理中.pdf',
    fileType: 'pdf',
    size: 1024 * 1024 * 1.7, // 1.7MB
    status: '处理中...',
    messageType: 'info',
  },
])

// 示例4: 自定义操作按钮
const customActionFiles = ref([
  {
    id: '9',
    name: '共享文档.pdf',
    fileType: 'pdf',
    size: 1024 * 1024 * 1.2, // 1.2MB
    status: '已完成',
  },
  {
    id: '10',
    name: '产品图片.jpg',
    fileType: 'image',
    size: 1024 * 900, // 900KB
    status: '已完成',
  },
])

// 自定义操作按钮
const fileActions = [
  {
    type: 'preview',
    label: '预览',
  },
  {
    type: 'download',
    label: '下载',
  },
]

// 处理文件操作按钮点击事件
// eslint-disable-next-line
const handleFileAction = (payload: { action: any; file: any }) => {
  const { action, file } = payload
  console.log(`执行操作: ${action.type}，文件: ${file.name}`)
  // 这里可以根据不同的操作类型执行不同的操作
  // 例如：打开预览窗口、下载文件等
}
</script>
