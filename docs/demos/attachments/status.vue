<template>
  <div class="demo-container">
    <div class="demo-section">
      <h4 style="margin: 10px 0">状态展示</h4>

      <tr-attachments v-model:items="statusFiles" variant="card" wrap />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

const statusFiles = ref<Attachment[]>([
  {
    id: '1',
    name: '设计文档.docx',
    fileType: 'word',
    size: 1024 * 1024 * 1.5, // 1.5MB
    status: 'success',
  },
  {
    id: '2',
    name: '数据表格.xlsx',
    fileType: 'excel',
    size: 1024 * 1024 * 2.3, // 2.3MB
    status: 'uploading',
  },
  {
    id: '3',
    name: '演示文稿.pdf',
    fileType: 'pdf',
    size: 1024 * 1024 * 1.1, // 1.1MB
    status: 'error',
  },
])
</script>
