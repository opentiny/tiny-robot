<template>
  <div class="demo-container">
    <div class="demo-section">
      <h4>文件列表</h4>
      <tr-attachments v-model:items="infoFiles" variant="card" />
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
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://tinyengine-assets.obs.cn-north-4.myhuaweicloud.com/files/images/icons-250711.rar',
  },
])

const pictureFiles = ref<Attachment[]>([
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.jpg',
  },
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
])
</script>
