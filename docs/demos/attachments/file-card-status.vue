<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <h3>1. 信息状态 (默认)</h3>
    <tr-attachments v-model:items="infoFiles" :drag="false" :disabled="true" :overflow="wrapMode" status-type="info" />

    <h3>2. 状态消息</h3>
    <tr-attachments
      v-model:items="messageFiles"
      :drag="false"
      :disabled="true"
      :overflow="wrapMode"
      status-type="message"
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

// 示例2: 状态消息 - 显示不同类型的状态消息
const messageFiles = ref([
  {
    id: '4',
    name: '设计文档.doc',
    fileType: 'word',
    size: 1024 * 1024 * 1.5, // 1.5MB
    status: '上传成功',
    messageType: 'success',
  },
  {
    id: '5',
    name: '设计文档.xlsx',
    fileType: 'excel',
    size: 1024 * 1024 * 2.3, // 2.3MB
    status: 'uploading',
    messageType: 'uploading',
  },
  {
    id: '6',
    name: '设计文档.pdf',
    fileType: 'pdf',
    size: 1024 * 1024 * 1.1, // 1.1MB
    status: 'error',
    messageType: 'error',
  },
])
</script>
