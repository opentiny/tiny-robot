<template>
  <div style="display: flex; flex-direction: column; gap: 10px">
    <div>
      <h4>纯图片展示模式</h4>
      <p>当上传的文件类型为图片时，会自动开启纯图片展示模式。点击图片可打开画廊式预览</p>
    </div>
    <tr-attachments v-model:items="pictureFiles" variant="picture" />

    <div>
      <h4>状态展示</h4>
      <p>设置 <code>status-mode="message"</code> 可显示基于状态的预设消息文本。</p>
    </div>
    <tr-attachments v-model:items="pictureStatusFiles" variant="picture" status-mode="message" />

    <div>
      <h4>上传超时文本</h4>
      <p>设置 <code>uploadTimeoutText</code> 可显示上传超时文本。</p>
    </div>
    <tr-attachments v-model:items="pictureTimeoutFiles" variant="picture" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

const pictureStatusFiles = ref<Attachment[]>([
  {
    id: 'pic1',
    name: 'nature-1.jpg',
    fileType: 'image',
    status: 'success',
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    id: 'pic2',
    name: 'nature-2.jpg',
    fileType: 'image',
    status: 'uploading',
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.jpg',
  },
  {
    id: 'pic3',
    name: 'nature-3.jpg',
    fileType: 'image',
    status: 'error',
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.png',
  },
])

const pictureFiles = ref<Attachment[]>([
  {
    id: 'pic1',
    name: 'nature-1.jpg',
    fileType: 'image',
    status: 'success',
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    id: 'pic2',
    name: 'nature-2.jpg',
    fileType: 'image',
    status: 'success',
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.jpg',
  },
  {
    id: 'pic3',
    name: 'nature-3.jpg',
    fileType: 'image',
    status: 'success',
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
])

const pictureTimeoutFiles = ref<Attachment[]>([
  {
    id: 'pic1',
    name: 'nature-1.jpg',
    fileType: 'image',
    status: 'uploading',
    uploadTimeoutText: '努力中...',
    previewUrl: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
])
</script>
