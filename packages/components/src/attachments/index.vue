<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFileDialog } from '@vueuse/core'
import { AttachmentList, FullScreenOverlay } from './components'
import { useDragDrop, useFileType, useImagePreview, useUpload } from './composables'
import { AttachmentsEmits, AttachmentsProps, Attachment } from './index.type'
import './index.less'

const props = withDefaults(defineProps<AttachmentsProps>(), {
  autoUpload: true,
  multiple: true,
})

const emit = defineEmits<AttachmentsEmits>()

// 文件列表管理
const fileList = ref<Attachment[]>(props.items || [])

// 使用文件类型工具
const { createAttachments } = useFileType()

// 使用上传工具
const { uploadFile, retryUpload } = useUpload(fileList, {
  action: props.action,
  headers: props.headers,
  data: props.data,
  withCredentials: props.withCredentials,
  beforeUpload: props.beforeUpload,
  customRequest: props.customRequest,
})

// 处理文件上传
const handleFilesDropped = (droppedFiles: File[]) => {
  if (props.disabled) return

  const newFiles = createAttachments(droppedFiles)
  fileList.value = [...fileList.value, ...newFiles]

  // 触发事件
  emit('files-dropped', newFiles)
  emit('update:items', fileList.value)

  // 如果设置了自动上传，则上传新文件
  if (props.autoUpload !== false) {
    newFiles.forEach((file) => uploadFile(file))
  }
}

// 图片拖拽逻辑
const { dropZoneRef, dragState, isDragFullscreen } = useDragDrop(
  {
    onDrop: handleFilesDropped,
  },
  props,
)

// 图片预览逻辑
const { handlePreview, renderPreview } = useImagePreview(fileList, emit, { enableDownload: true })

const { open: handleTriggerSelect, onChange } = useFileDialog({
  multiple: props.multiple,
  accept: props.accept,
})

// 监听文件选择变化
onChange((selectedFiles) => {
  if (selectedFiles && selectedFiles.length > 0) {
    const filesArray = Array.from(selectedFiles)
    handleFilesDropped(filesArray)
  }
})

// 移除文件
function handleRemove(file: Attachment) {
  if (props.disabled) return

  const index = fileList.value.findIndex((item) => item.uid === file.uid)
  if (index !== -1) {
    // 清理预览URL
    if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(file.previewUrl)
    }

    fileList.value.splice(index, 1)
    emit('file-remove', file)
    emit('update:items', fileList.value)
  }
}

// 下载文件
function handleDownload(file: Attachment) {
  emit('file-download', file)
}

// 重试上传
function handleRetry(file: Attachment) {
  retryUpload(file)
  emit('file-retry', file)
}

// 处理自定义操作按钮事件
// eslint-disable-next-line
function handleAction(payload: any) {
  emit('action', payload)
}

// 监听props.items变化
watch(
  () => props.items,
  (newItems) => {
    if (newItems) {
      fileList.value = newItems
    }
  },
  { deep: true },
)

const clearAllAttachments = () => {
  fileList.value.forEach((file) => {
    if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(file.previewUrl)
    }
  })

  fileList.value = []
  emit('update:items', fileList.value)
}

// 暴露方法给外部调用
defineExpose({
  clearFiles: clearAllAttachments,
  getFiles: () => fileList.value,
  getFileCount: () => fileList.value.length,
  hasFiles: () => fileList.value.length > 0,
  addFiles: handleFilesDropped,
})
</script>

<template>
  <div
    class="tr-attachments"
    :class="[rootClass, { 'tr-attachments--dragging': dragState.active && !isDragFullscreen }]"
    :style="styles?.root"
  >
    <div ref="dropZoneRef" class="tr-attachments__dropzone" @click="handleTriggerSelect()">
      <AttachmentList
        v-if="fileList.length > 0"
        :files="fileList"
        :list-type="listType"
        :file-icons="fileIcons"
        :disabled="disabled"
        :styles="styles"
        :status-type="statusType"
        :custom-actions="customActions"
        :overflow="overflow"
        @remove="handleRemove"
        @preview="handlePreview"
        @download="handleDownload"
        @retry="handleRetry"
        @action="handleAction"
      />

      <!-- 空状态 -->
      <div v-else class="tr-attachments__empty">
        <div class="tr-attachments__empty-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#bdbdbd">
            <path
              d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
            />
          </svg>
        </div>
        <div class="tr-attachments__empty-text">暂无文件</div>
        <div class="tr-attachments__empty-hint">将文件拖拽到此处，或点击上传</div>
      </div>
    </div>

    <!-- 全屏拖拽遮罩 -->
    <FullScreenOverlay
      v-if="isDragFullscreen"
      :visible="dragState.active"
      :config="typeof drag === 'object' ? drag.overlay : undefined"
      :style="styles?.overlay"
    />

    <!-- 图片预览组件 -->
    <Component :is="renderPreview()" />
  </div>
</template>
