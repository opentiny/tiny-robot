<template>
  <div class="demo-container">
    <div class="demo-container-body">
      <h3>自定义下载逻辑</h3>
      <p>使用默认下载行为，请使用 @download</p>
      <p>如果需要完全自定义下载逻辑，使用 @download.prevent 阻止默认行为</p>

      <h5>网络文件自定义下载</h5>
      <TrAttachments v-model:items="networkAttachments" variant="card" @download.prevent="handleCustomDownload" />
      <h5>本地文件自定义下载, 上传本地文件后展示</h5>
      <TrAttachments v-model:items="localAttachments" variant="card" @download.prevent="handleCustomDownload" />

      <div class="demo-section">
        <h4>添加本地文件</h4>
        <input type="file" @change="handleFileChange" accept="*" style="margin-bottom: 16px" />
        <p>选择文件来测试本地文件下载</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type Attachment, TrAttachments } from '@opentiny/tiny-robot'

// 网络文件示例
const networkAttachments = ref<Attachment[]>([
  {
    id: '1',
    name: 'fruit-image-1.jpg',
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
    fileType: 'image',
    status: 'success',
  },
  {
    id: '2',
    name: 'fruit-image-2.jpg',
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
    fileType: 'image',
    status: 'success',
  },
])

// 本地文件示例
const localAttachments = ref<Attachment[]>([])

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const file = files[0]

    localAttachments.value.push({
      rawFile: file,
      url: URL.createObjectURL(file),
    })

    target.value = ''
  }
}

// 处理自定义下载逻辑
const handleCustomDownload = (event: MouseEvent, file: Attachment) => {
  console.log('自定义下载逻辑:', event, file)

  // 这里实现完全自定义的下载逻辑
  alert(`自定义下载文件: ${file.name}`)
}
</script>

<style scoped lang="scss"></style>
