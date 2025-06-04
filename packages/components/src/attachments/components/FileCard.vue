<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFileType } from '../composables/useFileType'
import { useIconType } from '../composables/useIconType'
import type { Attachment, FileType, ActionButton } from '../index.type'
import { IconUploadFailed, IconUploadLoading } from '@opentiny/tiny-robot-svgs'
import ImagePreview from './ImagePreview.vue'

const props = withDefaults(
  defineProps<{
    file: Attachment
    // eslint-disable-next-line
    fileIcons?: Record<FileType, any>
    disabled?: boolean
    showPreview?: boolean
    showStatus?: boolean
    statusType?: 'info' | 'progress' | 'operate' | 'message' | 'default'
    customActions?: ActionButton[]
  }>(),
  {
    disabled: false,
    showPreview: true,
    showStatus: true,
    statusType: 'info',
  },
)

const emit = defineEmits(['remove', 'preview', 'action', 'retry', 'download'])
const { formatFileSize } = useFileType()

// 图片预览相关状态
const isPreviewVisible = ref(false)
const previewUrl = ref('')

// 使用图标类型管理
const { getIconComponent } = useIconType(props.fileIcons)

// 获取当前文件类型对应的图标组件
const fileTypeIcon = computed(() => {
  return getIconComponent(props.file.fileType as FileType).value
})

// 判断是否为图片类型
const isImage = computed(() => {
  return props.file.fileType === 'image'
})

// 判断文件状态
const isUploading = computed(() => props.file.status === 'uploading' || props.file.isUploading)
const isUploadFailed = computed(() => props.file.status === 'error')

// 预览文件
const handlePreview = () => {
  if (isImage.value && props.file.previewUrl) {
    previewUrl.value = props.file.previewUrl
    isPreviewVisible.value = true
  } else if (isImage.value && props.file.rawFile) {
    // 如果是原生 File 对象，创建临时 URL
    previewUrl.value = URL.createObjectURL(props.file.rawFile)
    isPreviewVisible.value = true
  } else {
    // 非图片类型，触发外部预览事件
    emit('preview', props.file)
  }
}

// 关闭预览
const closePreview = () => {
  isPreviewVisible.value = false
  // 清理临时 URL
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
}

// 下载文件
const downloadFile = () => {
  if (props.file.previewUrl) {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = props.file.previewUrl
    link.download = props.file.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else if (props.file.rawFile) {
    // 使用 File 对象创建下载
    const url = URL.createObjectURL(props.file.rawFile)
    const link = document.createElement('a')
    link.href = url
    link.download = props.file.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  emit('download', props.file)
}

// 移除文件
const handleRemove = () => {
  emit('remove', props.file)
}

// 处理自定义操作按钮点击事件
const handleCustomAction = (action: ActionButton) => {
  if (action.handler) {
    action.handler(props.file)
  }

  // 对预览和下载操作进行特殊处理
  if (action.type === 'preview' && isImage.value) {
    handlePreview()
  } else if (action.type === 'download' && isImage.value) {
    downloadFile()
  } else {
    emit('action', { action, file: props.file })
  }
}

// 重试上传
const handleRetry = () => {
  emit('retry', props.file)
}
</script>

<template>
  <div
    class="tr-file-card"
    :class="[
      `tr-file-card--${file.fileType || 'other'}`,
      file.status,
      {
        'tr-file-card--uploading': isUploading,
        'tr-file-card--error': isUploadFailed,
      },
    ]"
    :data-file-type="file.fileType || 'other'"
  >
    <!-- 关闭按钮 - 右上角固定位置，悬浮显示 -->
    <button v-if="!disabled" type="button" class="tr-file-card__close" @click="handleRemove" aria-label="移除文件">
      <span class="tr-file-card__close-icon">×</span>
    </button>

    <div
      class="tr-file-card__icon"
      @click="isImage && showPreview ? handlePreview() : null"
      :class="{ 'tr-file-card__icon--preview': isImage && showPreview }"
    >
      <div class="tr-file-card__icon-wrapper">
        <!-- 渲染图标组件 -->
        <component :is="fileTypeIcon" />

        <!-- 上传状态蒙版 -->
        <div v-if="isUploading || isUploadFailed" class="tr-file-card__overlay">
          <div v-if="isUploading" class="tr-file-card__loading-icon">
            <IconUploadLoading :width="24" :height="24" />
          </div>
          <IconUploadFailed v-if="isUploadFailed" :width="24" :height="24" />
        </div>
      </div>
    </div>

    <div class="tr-file-card__content">
      <div class="tr-file-card__info">
        <span class="tr-file-card__name" :title="file.name">{{ file.name }}</span>

        <!-- 状态区域 - 根据状态类型显示不同内容 -->
        <div v-if="showStatus" class="tr-file-card__status">
          <!-- 类型1: 文件类型和大小 -->
          <template v-if="statusType === 'info'">
            <span class="tr-file-card__file-type">{{ file.fileType?.toUpperCase() || 'FILE' }}</span>
            <span class="tr-file-card__file-size" v-if="file.size">{{ formatFileSize(file.size) }}</span>
          </template>

          <!-- 类型2: 进度状态 -->
          <template v-else-if="statusType === 'progress' && file.progress !== undefined">
            <div class="tr-file-card__progress">
              <div class="tr-file-card__progress-text">{{ file.status || '处理中...' }} {{ file.progress }}%</div>
              <div class="tr-file-card__progress-bar">
                <div class="tr-file-card__progress-inner" :style="{ width: `${file.progress}%` }"></div>
              </div>
            </div>
          </template>

          <!-- 类型3: 自定义操作按钮 -->
          <template v-else-if="statusType === 'operate'">
            <div class="tr-file-card__actions">
              <span
                v-for="(action, index) in customActions"
                :key="index"
                class="tr-file-card__action"
                :class="`tr-file-card__action--${action.type}`"
                @click="handleCustomAction(action)"
              >
                <span class="tr-file-card__action-icon">{{ action.label }}</span>
              </span>
            </div>
          </template>

          <!-- 类型4: 状态消息 -->
          <template v-else-if="statusType === 'message'">
            <!-- 重试操作：显示上传失败文本和重试按钮 -->
            <div v-if="file.messageType === 'error' && file.status === 'error'" class="tr-file-card__retry">
              <span class="tr-file-card__error-text">上传失败</span>
              <button class="tr-file-card__retry-btn" @click="handleRetry">重试</button>
            </div>
            <!-- 普通消息类型 -->
            <div v-else class="tr-file-card__message" :class="`tr-file-card__message--${file.messageType || 'info'}`">
              <span v-if="file.messageType === 'error'">上传失败</span>
              <span v-if="file.messageType === 'warning'">上传警告</span>
              <span v-if="file.messageType === 'success'">上传成功</span>
              <span v-if="file.messageType === 'info'">处理中...</span>
              <span v-if="file.messageType === 'uploading'">上传中...</span>
              <span v-if="!file.messageType">{{ file.status || '状态信息' }}</span>
            </div>
          </template>

          <!-- 类型5: 默认状态文本 -->
          <template v-else>
            {{ file.status }}
          </template>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <ImagePreview
      v-if="isImage"
      :visible="isPreviewVisible"
      :image-url="previewUrl"
      @close="closePreview"
      @download="downloadFile"
    />
  </div>
</template>
