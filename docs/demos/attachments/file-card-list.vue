<template>
  <div>
    <div style="margin-bottom: 16px">
      <tiny-radio-group v-model="layoutMode">
        <tiny-radio label="wrap">wrap</tiny-radio>
        <tiny-radio label="no-wrap">no-wrap</tiny-radio>
      </tiny-radio-group>
    </div>

    <tr-attachments v-model:items="files" :layout="layoutMode" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'

const layoutMode = ref('wrap')

const files = ref([
  {
    uid: '0',
    name: '示例文档.docx',
    status: 'done',
    size: 200,
    fileType: 'word',
    previewUrl: '/path/to/preview.docx',
  },
  {
    uid: '1',
    name: '示例文档.pdf',
    status: 'done',
    size: 200,
    fileType: 'pdf',
    previewUrl: '/path/to/preview.pdf',
  },
  {
    uid: '2',
    name: '示例文档.ppt',
    status: 'done',
    size: 200 * 1024,
    fileType: 'ppt',
    previewUrl: '/path/to/preview.ppt',
  },
  {
    uid: '3',
    name: '示例文档.xlsx',
    status: 'done',
    size: 200,
    fileType: 'excel',
    previewUrl: '/path/to/preview.xlsx',
  },
  {
    uid: '4',
    name: '示例文档',
    status: 'done',
    size: 200,
    fileType: 'folder',
    previewUrl: '/path/to/preview',
  },
  {
    uid: '5',
    name: 'other',
    status: 'done',
    size: 200,
    fileType: 'other',
  },
])
</script>
