<template>
  <div class="demo-container">
    <div class="demo-section">
      <h4>文件列表</h4>
      <tr-attachments v-model:items="infoFiles" @download="handleDownload" />
    </div>
    <div class="demo-section">
      <h4>图片列表</h4>
      <tr-attachments v-model:items="pictureFiles" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

// 基本示例 - 显示文件类型和大小
const infoFiles = ref<Attachment[]>([
  {
    id: '1',
    name: '设计文档.docx',
    fileType: 'word',
    size: 1024 * 1024 * 1.2, // 1.2MB
    status: 'success',
  },
  {
    id: '2',
    name: 'logo设计图.png',
    fileType: 'image',
    size: 1024 * 1024 * 3.5, // 3.5MB
    status: 'success',
  },
  {
    id: '3',
    name: '项目文档.pdf',
    fileType: 'pdf',
    size: 1024 * 1024 * 2.8, // 2.8MB
    status: 'success',
  },
])

const pictureFiles = ref<Attachment[]>([
  {
    id: 'pic1',
    name: 'nature-1.jpg',
    fileType: 'image',
    status: 'success',
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    id: 'pic2',
    name: 'nature-2.jpg',
    fileType: 'image',
    status: 'success',
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.jpg',
  },
  {
    id: 'pic3',
    name: 'nature-3.jpg',
    fileType: 'image',
    status: 'success',
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
])

const handleDownload = (payload: { event: MouseEvent; file: Attachment }) => {
  console.log('download', payload)
}
</script>
