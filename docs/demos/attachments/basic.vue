<template>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
    <div style="display: flex; align-items: center; gap: 8px">
      <label style="margin-right: 8px">拖拽模式</label>

      <tiny-switch v-model="dragMode" true-value="fullscreen" false-value="container"></tiny-switch>
      <label style="font-weight: bold">{{ currentDragModeDesc }}</label>
    </div>

    <tr-attachments
      id="containerRef"
      v-model:items="files"
      :drag="{
        mode: dragMode,
        target: dragMode === 'container' ? containerRef : undefined,
      }"
      overflow="wrap"
      @files-dropped="handleFilesDropped"
      @file-remove="handleFileRemove"
      @file-preview="handleFilePreview"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'

const dragMode = ref('container')

const containerRef = ref<HTMLElement | null>(null)

const files = ref([
  {
    uid: '1',
    name: '示例文档.pdf',
    status: 'done',
    size: 200,
    fileType: 'pdf',
    previewUrl: '/path/to/preview.pdf',
  },
])

const currentDragModeDesc = computed(() => {
  return dragMode.value === 'fullscreen' ? '全屏拖拽' : '容器拖拽'
})

// 文件被拖拽上传时触发
const handleFilesDropped = (newFiles) => {
  console.log('新上传的文件:', newFiles)
  // 这里可以添加文件上传逻辑
}

// 文件被移除时触发
const handleFileRemove = (file) => {
  console.log('移除的文件:', file)
}

// 文件被预览时触发
const handleFilePreview = (file) => {
  console.log('预览文件:', file)
  // 这里可以实现自定义预览逻辑
  if (file.previewUrl) {
    window.open(file.previewUrl)
  }
}

onMounted(() => {
  containerRef.value = document.getElementById('containerRef')
})
</script>
