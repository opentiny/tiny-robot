<template>
  <div class="demo-container">
    <div class="demo-container-body">
      <h3>网络文件下载</h3>
      <p>网络文件需要开发者自定义下载逻辑，组件会触发 download 事件</p>
      <TrAttachments v-model:items="attachments" variant="card" @download="handleNetworkDownload" />

      <h3>本地文件下载</h3>
      <p>本地文件会由组件内部自动处理下载</p>
      <TrAttachments v-model:items="localAttachments" variant="card" @download="handleLocalDownload" />

      <h3>自定义下载逻辑</h3>
      <p>使用 @download.prevent 阻止默认行为，完全自定义下载逻辑</p>
      <TrAttachments v-model:items="customAttachments" variant="card" @download.prevent="handleCustomDownload" />

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
const attachments = ref<Attachment[]>([
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

// 自定义下载示例
const customAttachments = ref<Attachment[]>([
  {
    id: '3',
    name: 'custom-file.txt',
    size: 1024,
    url: 'https://example.com/file.txt',
    fileType: 'other',
    status: 'success',
  },
])

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const file = files[0]

    localAttachments.value.push({
      id: Date.now().toString(),
      rawFile: file,
      name: file.name,
      size: file.size,
      status: 'success',
    })

    target.value = ''
  }
}

// 处理网络文件下载
const handleNetworkDownload = (payload: { event: MouseEvent; file: Attachment }) => {
  const { file } = payload
  console.log('网络文件下载:', file)

  // 这里可以实现自定义的网络文件下载逻辑
  // 例如：使用 fetch 下载文件
  if (file.url) {
    // 简单示例：在新窗口打开
    window.open(file.url, '_blank')
  }
}

// 处理本地文件下载（记录日志）
const handleLocalDownload = (payload: { event: MouseEvent; file: Attachment }) => {
  const { file } = payload
  console.log('本地文件下载:', file.name, '- 组件会自动处理下载')
}

// 处理自定义下载逻辑
const handleCustomDownload = (payload: { event: MouseEvent; file: Attachment }) => {
  const { file } = payload
  console.log('自定义下载逻辑:', file)

  // 这里实现完全自定义的下载逻辑
  alert(`自定义下载文件: ${file.name}`)

  // 由于使用了 .prevent，组件的默认下载行为不会执行
}
</script>

<style scoped lang="scss"></style>
