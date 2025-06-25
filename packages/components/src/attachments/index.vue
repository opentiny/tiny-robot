<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import TinyFileUpload from '@opentiny/vue-file-upload'
import { useFileDialog } from '@vueuse/core'
import { useDragDrop } from './composables/useDragDrop'
import { useFileType } from './composables/useFileType'
import { useUploadIntegration } from './composables/useUploadIntegration'
import { useImagePreview } from './composables/useImagePreview'
import AttachmentList from './components/AttachmentList.vue'
import FullScreenOverlay from './components/FullscreenOverlay.vue'
import ImagePreview from './components/ImagePreview.vue'
import { AttachmentsEmits, AttachmentsProps, Attachment } from './index.type'
import './index.less'

const props = withDefaults(defineProps<AttachmentsProps>(), {
  overflow: 'wrap',
  disabled: false,
  statusType: 'info',
  triggerUpload: 0,
  variant: 'card',
})

const emit = defineEmits<AttachmentsEmits>()

// 文件列表管理
const fileList = ref<Attachment[]>(props.items || [])

// 使用文件类型工具
const { formatFileSize, createAttachments } = useFileType()

const { uploadRef, uploadConfig, isUploadMode, handleUploadChange, triggerUpload, processFiles } = useUploadIntegration(
  props,
  emit,
)

// 图片预览逻辑
const { isPreviewVisible, previewImages, previewCurrentIndex, showImagePreview, closeImagePreview } = useImagePreview(
  fileList,
  emit,
)

// 图片拖拽逻辑
const { dropZoneRef, dragState, isDragEnabled, isDragFullscreen, initDrag } = useDragDrop(
  {
    onDrop: handleDrop,
  },
  props,
)

const {
  open: openFileDialog,
  reset: resetFileDialog,
  onChange,
} = useFileDialog({
  multiple: true,
  accept: '*',
  reset: true,
})

// 监听文件选择变化
onChange((selectedFiles) => {
  if (selectedFiles && selectedFiles.length > 0) {
    const filesArray = Array.from(selectedFiles)
    handleDrop(filesArray)
  }
})

// 处理文件拖放 - 统一使用 processFiles
async function handleDrop(files: File[]) {
  if (props.disabled) return

  // 使用统一的文件处理逻辑，无论是否配置了上传
  await processFiles(files)
}

// 触发文件选择
function triggerFileSelect() {
  if (props.disabled) return

  if (isUploadMode.value) {
    // 使用 TinyUpload 组件上传
    triggerUpload()
  } else {
    // 使用文件选择器上传
    openFileDialog()
  }
}

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

// 预览文件
function handlePreview(file: Attachment) {
  showImagePreview(file)
}

// 下载文件
function handleDownload(file: Attachment) {
  emit('file-download', file)
}

// 重试上传
function handleRetry(file: Attachment) {
  // 将文件状态重置为上传中
  const index = fileList.value.findIndex((item) => item.uid === file.uid)
  if (index !== -1) {
    fileList.value[index].status = 'uploading'
    fileList.value[index].messageType = undefined
    fileList.value[index].isUploading = true

    // 触发重试事件
    emit('file-retry', file)
    emit('update:items', fileList.value)
  }
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

// 监听外部上传触发
watch(
  () => props.triggerUpload,
  (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) {
      triggerFileSelect()
    }
  },
)

const clearAllAttachments = () => {
  fileList.value.forEach((file) => {
    if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(file.previewUrl)
    }
  })

  fileList.value = []
  resetFileDialog()
  emit('update:items', fileList.value)
}

let initDragTimeout: ReturnType<typeof setTimeout> | null = null

const clearInitDragTimeout = () => {
  if (initDragTimeout) {
    clearTimeout(initDragTimeout)
    initDragTimeout = null
  }
}

// 在组件挂载后设置拖拽区域，只初始化一次
onMounted(() => {
  if (dropZoneRef.value && isDragEnabled.value) {
    // 使用一个短延时确保DOM已完全加载
    initDragTimeout = setTimeout(() => {
      initDrag()
      clearInitDragTimeout()
    }, 0)
  }
})

onUnmounted(() => {
  clearInitDragTimeout()
})

// 暴露方法给外部调用
defineExpose({
  triggerUpload: triggerFileSelect,
  addFiles: handleDrop,
  clearFiles: clearAllAttachments,
  getFiles: () => fileList.value,
  getFileCount: () => fileList.value.length,
  hasFiles: () => fileList.value.length > 0,
  formatFileSize,
  createAttachments,
})
</script>

<template>
  <div
    class="tr-attachments"
    :class="[rootClass, { 'tr-attachments--dragging': dragState.active && !isDragFullscreen }]"
    :style="styles?.root"
  >
    <!-- Upload 模式 -->
    <TinyFileUpload
      v-if="isUploadMode"
      ref="uploadRef"
      v-bind="uploadConfig"
      :show-file-list="false"
      :drag="!!drag"
      class="tr-attachments__upload"
      @change="handleUploadChange"
    >
      <div ref="dropZoneRef" class="tr-attachments__dropzone">
        <AttachmentList
          v-if="fileList.length > 0"
          :files="fileList"
          :variant="variant"
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
          @add="triggerFileSelect"
        />

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
    </TinyFileUpload>

    <!-- 非 Upload 模式 -->
    <div v-else ref="dropZoneRef" class="tr-attachments__dropzone" @click="triggerFileSelect">
      <AttachmentList
        v-if="fileList.length > 0"
        :files="fileList"
        :variant="variant"
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
        @add="triggerFileSelect"
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
    <ImagePreview
      :visible="isPreviewVisible"
      :images="previewImages"
      v-model:currentIndex="previewCurrentIndex"
      @close="closeImagePreview"
      @download="handleDownload"
    />
  </div>
</template>
