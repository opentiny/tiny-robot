<template>
  <div class="demo-container">
    <div class="demo-container-body">
      <!-- 网络文件 -->
      <TrAttachments v-model:items="attachments" variant="card" @download="handleDownload" />

      <!-- 本地文件 -->
      <TrAttachments v-model:items="localAttachments" variant="card" />

      <div class="demo-section">
        <h4>添加自定义文件类型</h4>
        <input type="file" @change="handleFileChange" accept="*" style="margin-bottom: 16px" />
        <p>选择图片文件来测试自定义匹配器</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type Attachment, TrAttachments } from '@opentiny/tiny-robot'

const attachments = ref<Attachment[]>([
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
  {
    size: 1024 * 1024 * 3.5, // 3.5MB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/fruit.jpg',
  },
])

const localAttachments = ref<Attachment[]>([])

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const file = files[0]

    localAttachments.value.push({ rawFile: file })

    target.value = ''
  }
}

const handleDownload = (payload: { event: MouseEvent; file: Attachment }) => {
  const { file } = payload
  console.log(file)
}
</script>

<style scoped lang="scss"></style>
