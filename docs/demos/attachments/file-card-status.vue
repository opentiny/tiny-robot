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

    <h3>3. 纯图片卡片预览</h3>
    <p>设置 <code>listType="picture"</code> 可开启纯图片展示模式。点击图片可打开画廊式预览</p>
    <tr-attachments v-model:items="pictureFiles" listType="picture" :drag="true" :disabled="false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments, Attachment } from '@opentiny/tiny-robot'

const wrapMode = ref('wrap')

// 示例1: 信息状态 - 显示文件类型和大小
const infoFiles = ref([
  {
    uid: '1',
    name: '设计文档.docx',
    fileType: 'word',
    size: 1024 * 1024 * 1.2, // 1.2MB
  },
  {
    uid: '2',
    name: 'logo设计图.png',
    fileType: 'image',
    size: 1024 * 1024 * 3.5, // 3.5MB
  },
  {
    uid: '3',
    name: '项目文档.pdf',
    fileType: 'pdf',
    size: 1024 * 1024 * 2.8, // 2.8MB
  },
])

// 示例2: 状态消息 - 显示不同类型的状态消息
const messageFiles = ref([
  {
    uid: '4',
    name: '设计文档.doc',
    fileType: 'word',
    size: 1024 * 1024 * 1.5, // 1.5MB
    status: '上传成功',
    messageType: 'success',
  },
  {
    uid: '5',
    name: '设计文档.xlsx',
    fileType: 'excel',
    size: 1024 * 1024 * 2.3, // 2.3MB
    status: 'uploading',
    messageType: 'uploading',
  },
  {
    uid: '6',
    name: '设计文档.pdf',
    fileType: 'pdf',
    size: 1024 * 1024 * 1.1, // 1.1MB
    status: 'error',
    messageType: 'error',
  },
])

// 示例1: 纯图片卡片
const pictureFiles = ref<Attachment[]>([
  {
    uid: 'pic1',
    name: 'nature-1.jpg',
    fileType: 'image',
    status: 'done',
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    uid: 'pic2',
    name: 'nature-2.jpg',
    fileType: 'image',
    status: 'uploading',
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.jpg',
  },
  {
    uid: 'pic3',
    name: 'nature-3.jpg',
    fileType: 'image',
    status: 'error',
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.png',
  },
])
</script>
