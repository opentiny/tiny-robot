<template>
  <div style="display: flex; flex-direction: column; gap: 10px">
    <div>
      <h4>状态展示</h4>
      <p>图片卡片会根据状态自动显示不同的视觉效果。</p>
    </div>
    <tr-attachments v-model:items="pictureStatusFiles" variant="picture" />

    <div>
      <h4>上传超时文本</h4>
      <p>设置 <code>message</code> 可显示上传超时文本。</p>
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
    status: 'success',
    size: 1024 * 1024 * 3.5,
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    status: 'uploading',
    size: 1024 * 1024 * 3.5,
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.jpg',
  },
  {
    status: 'error',
    size: 1024 * 1024 * 3.5,
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.png',
  },
])

const pictureTimeoutFiles = ref<Attachment[]>([
  {
    status: 'uploading',
    message: '努力中...',
    size: 1024 * 1024 * 3.5,
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
])
</script>
