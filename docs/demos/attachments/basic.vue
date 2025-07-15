<template>
  <tr-attachments v-model:items="infoFiles" />
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
</script>
