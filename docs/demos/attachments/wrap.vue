<template>
  <div>
    <div style="margin-bottom: 16px">
      <tiny-radio-group v-model="wrap">
        <tiny-radio :label="false">no-wrap</tiny-radio>
        <tiny-radio :label="true">wrap</tiny-radio>
      </tiny-radio-group>
    </div>

    <tr-attachments v-model:items="files" :wrap="wrap" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

const wrap = ref(false)

const files = ref<Attachment[]>([
  {
    id: '0',
    name: '示例文档.docx',
    status: 'success',
    size: 200,
    fileType: 'word',
    url: '/path/to/preview.docx',
  },
  {
    id: '1',
    name: '示例文档.pdf',
    status: 'success',
    size: 200,
    fileType: 'pdf',
    url: '/path/to/preview.pdf',
  },
  {
    id: '2',
    name: '示例文档.ppt',
    status: 'success',
    size: 200 * 1024,
    fileType: 'ppt',
    url: '/path/to/preview.ppt',
  },
  {
    id: '3',
    name: '示例文档.xlsx',
    status: 'success',
    size: 200,
    fileType: 'excel',
    url: '/path/to/preview.xlsx',
  },
  {
    id: '4',
    name: '示例文档',
    status: 'success',
    size: 200,
    fileType: 'folder',
    url: '/path/to/preview',
  },
])
</script>
