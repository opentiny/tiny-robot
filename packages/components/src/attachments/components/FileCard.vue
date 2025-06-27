<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import TinyTooltip from '@opentiny/vue-tooltip'
import { useFileType } from '../composables/useFileType'
import { useIconType } from '../composables/useIconType'
import type { FileType, ActionButton, FileCardProps } from '../index.type'
import {
  IconUploadFailed,
  IconUploadLoading,
  IconClose,
  IconImageLoading,
  IconImageWarning,
} from '@opentiny/tiny-robot-svgs'

const props = withDefaults(defineProps<FileCardProps>(), {
  variant: 'card',
  disabled: false,
  showPreview: true,
  showStatus: true,
  statusType: 'info',
})

const emit = defineEmits(['remove', 'preview', 'action', 'retry', 'download'])
const { formatFileSize } = useFileType()

const createdBlobUrls = ref<string[]>([])

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
  if (isImage.value && !props.file.previewUrl && props.file.rawFile) {
    // 如果是原生 File 对象且没有预览图，创建临时 URL 给父组件使用
    const blobUrl = URL.createObjectURL(props.file.rawFile)
    createdBlobUrls.value.push(blobUrl)
    emit('preview', { ...props.file, previewUrl: blobUrl })
  } else {
    // 触发外部预览事件
    emit('preview', props.file)
  }
}

/**
 * 触发下载
 * @param url 文件URL
 * @param fileName 文件名
 */
const triggerDownload = (url: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 下载文件
const downloadFile = () => {
  if (props.file.previewUrl) {
    triggerDownload(props.file.previewUrl, props.file.name)
  } else if (props.file.rawFile) {
    // 使用 File 对象创建下载
    const url = URL.createObjectURL(props.file.rawFile)
    triggerDownload(url, props.file.name)
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

onUnmounted(() => {
  createdBlobUrls.value.forEach((url) => {
    URL.revokeObjectURL(url)
  })
})
</script>

<template>
  <!-- Picture Card Variant -->
  <div
    v-if="variant === 'picture'"
    class="tr-file-card--picture"
    :class="{
      'tr-file-card--uploading': isUploading,
      'tr-file-card--error': isUploadFailed,
    }"
    @click="handlePreview"
  >
    <img :src="file.previewUrl" :alt="file.name" class="tr-file-card__picture-img" />
    <div class="tr-file-card__picture-overlay">
      <span>预览</span>
    </div>

    <!-- 状态蒙版 -->
    <div v-if="isUploading || isUploadFailed" class="tr-file-card__overlay">
      <div v-if="isUploading" class="tr-file-card__loading-icon">
        <IconImageLoading :width="24" :height="24" />
      </div>
      <TinyTooltip v-if="isUploadFailed" content="解析失败" :placement="'top'" :effect="'light'">
        <IconImageWarning :width="24" :height="24" />
      </TinyTooltip>
    </div>

    <!-- 关闭按钮 -->
    <button v-if="!disabled" type="button" class="tr-file-card__close" @click.stop="handleRemove" aria-label="移除文件">
      <span class="tr-file-card__close-icon"><IconClose /></span>
    </button>
  </div>

  <!-- Default Card Variant -->
  <div
    v-else
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
      <span class="tr-file-card__close-icon"><IconClose /></span>
    </button>

    <div
      class="tr-file-card__icon"
      @click.stop="isImage && showPreview ? handlePreview() : null"
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
  </div>
</template>

<style lang="less" scoped>
@import '../vars.less';

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-ellipsis {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

// Picture Card Variant
.tr-file-card--picture {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-right: var(--tr-attachments-margin-medium);
  margin-bottom: var(--tr-attachments-margin-medium);
  overflow: visible;
  cursor: pointer;
  background-color: var(--tr-attachments-background-light);

  .tr-file-card__picture-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    border-radius: inherit;
  }

  .tr-file-card__picture-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-color: rgba(0, 0, 0, 0.4);
    color: white;
    .flex-center;
    flex-direction: column;
    font-size: var(--tr-attachments-font-size-small);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    .tr-file-card__picture-overlay {
      opacity: 1;
    }
  }

  // Status overlay for uploading/error
  .tr-file-card__overlay {
    z-index: 2;
  }

  // Close button for picture card
  .tr-file-card__close {
    transform: none;
    top: -7px;
    right: -7px;
    background-color: #c2c2c2;
    z-index: 3;
  }

  // Show close button on hover
  &:hover .tr-file-card__close {
    opacity: 1;
  }

  // Special handling for uploading/error states
  &.tr-file-card--uploading,
  &.tr-file-card--error {
    .tr-file-card__picture-overlay {
      // Hide preview overlay when showing status overlay
      opacity: 0;
    }
  }
}

// Default Card Variant
.tr-file-card {
  position: relative;
  display: flex;
  align-items: center;
  width: var(--tr-attachments-card-width);
  height: var(--tr-attachments-card-height);
  border-radius: var(--tr-attachments-border-radius);
  background: var(--tr-attachments-background-light);
  padding: var(--tr-attachments-card-padding);
  margin-right: var(--tr-attachments-margin-medium);
  margin-bottom: var(--tr-attachments-margin-medium);
  transition: var(--tr-attachments-transition-normal);
  box-sizing: border-box;

  &:hover {
    background: var(--tr-attachments-background-white);
    box-shadow: var(--tr-attachments-box-shadow-light);
  }

  &--uploading {
    .tr-file-card__status {
      color: var(--tr-attachments-status-uploading-color);
    }
  }

  // 关闭按钮
  &__close {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(var(--tr-attachments-card-close-offset), calc(-1 * var(--tr-attachments-card-close-offset)));
    width: var(--tr-attachments-close-button-size);
    height: var(--tr-attachments-close-button-size);
    border-radius: 50%;
    background: rgb(194, 194, 194);
    color: white;
    .flex-center;
    border: none;
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--tr-attachments-transition-fast);
    z-index: var(--tr-attachments-z-index-close);

    &-icon {
      font-size: 6px;
      width: 6px;
      height: 6px;
      line-height: 1;
    }
  }

  &:hover &__close {
    opacity: 1;
  }

  // 文件图标区域
  &__icon {
    flex-shrink: 0;
    width: var(--tr-attachments-icon-size);
    height: var(--tr-attachments-icon-size);
    margin-right: var(--tr-attachments-card-icon-margin);
    .flex-center;

    &-wrapper {
      width: 100%;
      height: 100%;
      .flex-center;
      position: relative;
      font-size: var(--tr-attachments-icon-size);
    }

    &--preview {
      cursor: pointer;
      transition: transform var(--tr-attachments-transition-fast);

      &:hover {
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  // 上传状态遮罩
  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: var(--tr-attachments-border-radius);
    z-index: var(--tr-attachments-z-index-overlay);
  }

  // 内容区域
  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  // 文件名
  &__name {
    text-align: left;
    width: var(--tr-attachments-card-name-width);
    height: var(--tr-attachments-card-name-height);
    font-size: var(--tr-attachments-font-size-small);
    font-weight: var(--tr-attachments-font-weight-normal);
    line-height: var(--tr-attachments-line-height);
    color: var(--tr-attachments-text-color);
    margin-bottom: 2px;
    .text-ellipsis;
  }

  // 状态信息通用样式
  &__status,
  &__file-type,
  &__file-size {
    font-size: var(--tr-attachments-font-size-small);
    font-weight: var(--tr-attachments-font-weight-normal);
    line-height: var(--tr-attachments-line-height);
    color: var(--tr-attachments-text-secondary);
  }

  &__status {
    display: flex;
    align-items: center;
    width: 100%;
  }

  &__file-type {
    margin-right: 10px;
  }

  // 进度条
  &__progress {
    width: 100%;

    &-text {
      font-size: var(--tr-attachments-font-size-small);
      margin-bottom: 2px;
      display: flex;
      justify-content: space-between;
    }

    &-bar {
      height: var(--tr-attachments-progress-height);
      width: 100%;
      background-color: var(--tr-attachments-progress-bg);
      border-radius: calc(var(--tr-attachments-progress-height) / 2);
      overflow: hidden;
    }

    &-inner {
      height: 100%;
      background-color: var(--tr-attachments-progress-color);
      transition: width var(--tr-attachments-transition-duration) var(--tr-attachments-transition-timing);
    }
  }

  // 操作按钮
  &__actions {
    display: flex;
    align-items: center;
  }

  &__action {
    height: var(--tr-attachments-action-height);
    .flex-center;
    border: none;
    background: transparent;
    color: var(--tr-attachments-action-color);
    cursor: pointer;
    border-radius: var(--tr-attachments-padding-small);
    transition: var(--tr-attachments-transition-fast-all);
    white-space: nowrap;

    &-icon {
      font-size: var(--tr-attachments-font-size-small);
      line-height: 1;
    }

    &--preview,
    &--download {
      color: var(--tr-attachments-action-preview-color);

      &:hover {
        color: var(--tr-attachments-action-hover-color);
      }
    }

    &--download {
      margin-left: var(--tr-attachments-action-spacing);
    }
  }

  // 状态消息
  &__message {
    width: 100%;
    font-size: var(--tr-attachments-font-size-small);
    line-height: var(--tr-attachments-line-height);

    &--error {
      color: var(--tr-attachments-status-error-color);
    }

    &--warning {
      color: var(--tr-attachments-status-warning-color);
    }

    &--success {
      color: var(--tr-attachments-status-success-color);
    }

    &--info {
      color: var(--tr-attachments-status-info-color);
    }
  }

  // 重试按钮
  &__retry {
    display: flex;
    gap: var(--tr-attachments-gap);
    align-items: center;
    width: 100%;
  }

  &__error-text {
    color: var(--tr-attachments-status-error-color);
    font-size: var(--tr-attachments-font-size-small);
  }

  &__retry-btn {
    background: transparent;
    border: none;
    color: var(--tr-attachments-primary-color);
    cursor: pointer;
    font-size: var(--tr-attachments-font-size-small);
    border-radius: var(--tr-attachments-padding-small);
    transition: var(--tr-attachments-transition-fast-all);

    &:hover {
      background-color: var(--tr-attachments-primary-light);
    }
  }
}
</style>
