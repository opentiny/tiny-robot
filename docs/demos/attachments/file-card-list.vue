<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center">
      <label style="margin-right: 8px">溢出控制</label>
      <tiny-radio-group v-model="wrapMode">
        <tiny-radio-button label="wrap">wrap</tiny-radio-button>
        <tiny-radio-button label="scrollX">scrollX</tiny-radio-button>
        <tiny-radio-button label="scrollY">scrollY</tiny-radio-button>
      </tiny-radio-group>
    </div>
    <div style="display: flex; align-items: center">
      <label style="margin-right: 8px">禁止上传</label>
      <tiny-radio-group v-model="disabled">
        <tiny-radio-button :label="true">是</tiny-radio-button>
        <tiny-radio-button :label="false">否</tiny-radio-button>
      </tiny-radio-group>
    </div>

    <tr-attachments ref="containerRef" v-model:items="files" :drag="false" :disabled="disabled" :overflow="wrapMode" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { TrAttachments } from '@opentiny/tiny-robot'

const wrapMode = ref('wrap')
const disabled = ref(false)

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
    name: '示例文档.text',
    status: 'done',
    size: 200,
    fileType: 'text',
    previewUrl: '/path/to/preview.text',
  },
  {
    uid: '6',
    name: '示例文档.zip',
    status: 'done',
    size: 200,
    fileType: 'zip',
    previewUrl: '/path/to/preview.zip',
  },
  {
    uid: '7',
    name: 'other',
    status: 'done',
    size: 200,
    fileType: 'other',
  },
  {
    uid: '8',
    name: '示例图片',
    status: 'done',
    size: 200,
    fileType: 'image',
    previewUrl: '/path/to/preview.jpg',
  },
  {
    uid: '9',
    name: '示例图片',
    status: 'done',
    size: 200,
    fileType: 'image',
    previewUrl: '/path/to/preview.jpg',
  },
])
</script>
