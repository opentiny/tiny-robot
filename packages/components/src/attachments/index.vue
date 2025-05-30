<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDragDrop } from './composables/useDragDrop'
import { useFileType } from './composables/useFileType'
import FileCard from './components/FileCard.vue'
import FullScreenOverlay from './components/FullscreenOverlay.vue'
import type { AttachmentsProps, Attachment } from './index.type'
import './index.less'

const props = withDefaults(defineProps<AttachmentsProps>(), {
  overflow: 'wrap',
  disabled: false,
  iconSize: 42,
  statusType: 'info',
  triggerUpload: 0,
})

const emit = defineEmits([
  'update:items',
  'files-dropped',
  'file-remove',
  'file-preview',
  'file-download',
  'file-retry',
  'action',
])

// 文件列表管理
const fileList = ref<Attachment[]>(props.items || [])

// 使用文件类型工具
const { detectFileType, generateUID, formatFileSize, createPreviewUrl, createAttachments } = useFileType()

// 拖拽相关
const dropZoneRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 拖拽配置和状态
const isDragEnabled = computed(() => !!props.drag && !props.disabled)
const isDragFullscreen = computed(() => {
  return typeof props.drag === 'object' && props.drag.mode === 'fullscreen'
})

// 初始化拖拽功能
const { dragState, initDrag } = useDragDrop(
  {
    enabled: isDragEnabled.value,
    onDrop: handleDrop,
  },
  props,
)

// 处理文件拖放
function handleDrop(files: File[]) {
  if (props.disabled) return

  const newFiles = files.map(
    (file) =>
      ({
        uid: generateUID(),
        name: file.name,
        status: 'uploading',
        fileType: detectFileType(file),
        rawFile: file,
        size: file.size,
        previewUrl: createPreviewUrl(file),
      }) as Attachment,
  )

  fileList.value = [...fileList.value, ...newFiles]
  emit('files-dropped', newFiles)
  emit('update:items', fileList.value)
}

// 触发文件选择
function triggerFileSelect() {
  if (props.disabled) return
  fileInputRef.value?.click()
}

// 处理文件选择
function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const files = Array.from(input.files)
    handleDrop(files)
    // 重置文件输入，以便可以再次选择相同的文件
    input.value = ''
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
  emit('file-preview', file)
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
      console.log('Attachments 组件收到上传触发信号')
      triggerFileSelect()
    }
  },
)

// 在组件挂载后设置拖拽区域，只初始化一次
onMounted(() => {
  if (dropZoneRef.value && isDragEnabled.value) {
    // 使用一个短延时确保DOM已完全加载
    setTimeout(() => {
      initDrag()
    }, 0)
  }
})

// 暴露方法给外部调用
defineExpose({
  triggerUpload: triggerFileSelect,
  addFiles: handleDrop,
  clearFiles: () => {
    // 清理所有预览URL
    fileList.value.forEach((file) => {
      if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(file.previewUrl)
      }
    })
    fileList.value = []
    emit('update:items', fileList.value)
  },
  // 新增的便利方法
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
    <!-- 隐藏的文件输入 -->
    <input ref="fileInputRef" type="file" multiple class="tr-attachments__file-input" @change="handleFileSelect" />

    <div ref="dropZoneRef" class="tr-attachments__dropzone" @click="triggerFileSelect">
      <!-- 文件列表展示 -->
      <div
        v-if="fileList.length > 0"
        class="tr-attachments__file-list"
        :class="`tr-attachments__file-list--${overflow}`"
        @click.stop
      >
        <FileCard
          v-for="file in fileList"
          :key="file.uid"
          :file="file"
          :file-icons="fileIcons"
          :icon-size="iconSize"
          :disabled="disabled"
          :style="styles?.card"
          :status-type="statusType"
          :custom-actions="customActions"
          :show-status="true"
          @remove="handleRemove"
          @preview="handlePreview"
          @download="handleDownload"
          @retry="handleRetry"
          @action="handleAction"
        />

        <!-- 添加文件按钮 -->
        <div class="tr-attachments__add-button" @click.stop="triggerFileSelect" v-if="!disabled">
          <div class="tr-attachments__add-icon">+</div>
        </div>
      </div>

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
  </div>
</template>
