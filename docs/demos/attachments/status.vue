<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div>
      <p>根据 <code>file.status</code> 的值显示不同消息，例如 <code>error</code> 状态会附带重试按钮。</p>
    </div>
    <tr-attachments v-model:items="messageFiles" status-mode="message" />

    <div>
      <p>设置 <code>status-mode="actions"</code> 可显示默认操作按钮。</p>
      <p>默认显示 <code>下载 | 预览</code> 按钮。除图片类型外，其余的类型需要开发者实现相应操作函数。</p>
    </div>
    <tr-attachments v-model:items="actionsFiles" variant="card" status-mode="actions" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

const messageFiles = ref<Attachment[]>([
  {
    id: '4',
    name: '设计文档.doc',
    fileType: 'word',
    size: 1024 * 1024 * 1.5, // 1.5MB
    status: 'success',
  },
  {
    id: '5',
    name: '设计文档.xlsx',
    fileType: 'excel',
    size: 1024 * 1024 * 2.3, // 2.3MB
    status: 'uploading',
  },
  {
    id: '6',
    name: '设计文档.pdf',
    fileType: 'pdf',
    size: 1024 * 1024 * 1.1, // 1.1MB
    status: 'error',
  },
])

const actionsFiles = ref<Attachment[]>([
  {
    id: '7',
    name: '测试图片.jpg',
    fileType: 'image',
    size: 1024 * 1024 * 1.5, // 1.5MB
    status: 'success',
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
])
</script>
