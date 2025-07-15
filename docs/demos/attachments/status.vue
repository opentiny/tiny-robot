<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div>
      <p>文件卡片根据 <code>file.status</code> 的值自动切换显示内容：</p>
      <p>• <code>success</code> 状态：显示文件类型和大小信息</p>
      <p>• <code>uploading</code> 状态：显示"上传中..."文本</p>
      <p>• <code>error</code> 状态：显示"上传失败"和"重试"按钮</p>
    </div>
    <tr-attachments v-model:items="statusFiles" />

    <div>
      <p>悬浮操作按钮测试：</p>
      <p>• 图片文件：已经默认实现</p>
      <p>• 非图片文件：需要自行实现</p>
    </div>
    <tr-attachments v-model:items="actionsFiles" variant="card" wrap />
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

const actionsFiles = ref<Attachment[]>([
  {
    id: '4',
    name: '测试图片.jpg',
    fileType: 'image',
    size: 1024 * 1024 * 1.5, // 1.5MB
    status: 'success',
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    id: '5',
    name: '项目文档.docx',
    fileType: 'word',
    size: 1024 * 1024 * 0.8, // 0.8MB
    status: 'success',
  },
  {
    id: '6',
    name: '另一张图片.png',
    fileType: 'image',
    size: 1024 * 1024 * 2.1, // 2.1MB
    status: 'success',
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.jpg',
  },
  {
    id: '7',
    name: '数据分析.xlsx',
    fileType: 'excel',
    size: 1024 * 1024 * 1.2, // 1.2MB
    status: 'success',
  },
])
</script>
