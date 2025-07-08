<script setup lang="ts">
import { computed } from 'vue'
import TinyTooltip from '@opentiny/vue-tooltip'
import { useFileType, useFileCard } from '../composables'
import type { FileType, FileCardProps } from '../index.type'
import { IconFileRemove, IconImageLoading, IconImageWarning } from '@opentiny/tiny-robot-svgs'

const props = withDefaults(defineProps<FileCardProps>(), {
  variant: 'card',
  preview: true,
  status: true,
  statusMode: 'info',
})

const emit = defineEmits(['remove', 'preview', 'action', 'retry', 'download'])

// 文件相关工具 & 图标
const { formatFileSize, getIconComponent } = useFileType(props.fileIcons)

// 卡片交互相关
const { isImage, handlePreview, handleRemove, handleCustomAction, handleRetry } = useFileCard(props, emit)

// 获取当前文件类型对应的图标组件
const fileTypeIcon = computed(() => {
  return getIconComponent(props.file.fileType as FileType).value
})

// 判断文件状态
const isUploading = computed(() => props.file.status === 'uploading')
const isUploadFailed = computed(() => props.file.status === 'error')
const isUploadSuccess = computed(() => props.file.status === 'success')

// 卡片样式类
const cardClasses = computed(() => {
  const baseClass = props.variant === 'picture' ? 'tr-file-card--picture' : 'tr-file-card'
  return [
    baseClass,
    `tr-file-card--${props.file.fileType || 'other'}`,
    {
      'tr-file-card--uploading': isUploading.value,
      'tr-file-card--error': isUploadFailed.value,
      'tr-file-card--success': isUploadSuccess.value,
    },
  ]
})

// 渲染状态消息的文本
const getStatusMessageText = computed(() => {
  switch (props.file.status) {
    case 'error':
      return '上传失败'
    case 'warning':
      return '上传警告'
    case 'success':
      return '上传成功'
    case 'info':
      return '处理中...'
    case 'uploading':
      return '上传中...'
    default:
      return props.file.status || '状态信息'
  }
})
</script>

<template>
  <div
    :class="cardClasses"
    :data-file-type="file.fileType || 'other'"
    @click="variant === 'picture' ? handlePreview() : undefined"
  >
    <!-- 关闭按钮 - 通用组件 -->
    <button v-if="!disabled" class="tr-file-card__close-btn" @click.stop="handleRemove" aria-label="移除文件">
      <IconFileRemove />
    </button>

    <!-- 图片卡片模式 -->
    <template v-if="variant === 'picture'">
      <div class="tr-file-card__picture-container">
        <!-- 图片预览 -->
        <img :src="file.previewUrl" :alt="file.name" class="tr-file-card__picture-img" />

        <!-- 预览遮罩 - 只有上传成功状态才显示 -->
        <div v-if="isUploadSuccess" class="tr-file-card__picture-overlay">
          <span class="tr-file-card__picture-overlay-text">预览</span>
        </div>

        <!-- 状态遮罩 -->
        <div
          v-if="isUploading || isUploadFailed"
          class="tr-file-card__status-overlay tr-file-card__status-overlay--picture"
        >
          <!-- 上传中状态 添加超时文本状态 -->
          <div v-if="isUploading" class="tr-file-card__status-icon tr-file-card__status-icon--loading">
            <IconImageLoading />
            <span v-if="file.uploadTimeoutText" class="tr-file-card__status-icon--loading-text">
              {{ file.uploadTimeoutText }}
            </span>
          </div>

          <!-- 上传失败状态 -->
          <TinyTooltip v-else-if="isUploadFailed" content="解析失败" placement="top" effect="light">
            <IconImageWarning class="tr-file-card__status-icon tr-file-card__status-icon--error" />
          </TinyTooltip>
        </div>
      </div>
    </template>

    <!-- 默认卡片模式 -->
    <template v-else>
      <div class="tr-file-card__default-container">
        <!-- 文件图标区域 -->
        <div
          class="tr-file-card__icon"
          :class="{ 'tr-file-card__icon--clickable': isImage && preview }"
          @click.stop="isImage && preview ? handlePreview() : null"
        >
          <div class="tr-file-card__icon-wrapper">
            <!-- 文件类型图标 -->
            <component :is="fileTypeIcon" class="tr-file-card__file-icon" />

            <!-- 状态遮罩 -->
            <div
              v-if="isUploading || isUploadFailed"
              class="tr-file-card__status-overlay tr-file-card__status-overlay--icon"
            >
              <!-- 上传中状态 -->
              <div v-if="isUploading" class="tr-file-card__status-icon tr-file-card__status-icon--loading">
                <IconImageLoading />
              </div>

              <!-- 上传失败状态 -->
              <IconImageWarning
                v-else-if="isUploadFailed"
                class="tr-file-card__status-icon tr-file-card__status-icon--error"
              />
            </div>
          </div>
        </div>

        <!-- 文件信息区域 -->
        <div class="tr-file-card__content">
          <div class="tr-file-card__info">
            <!-- 文件名 -->
            <div class="tr-file-card__name" :title="file.name">
              {{ file.name }}
            </div>

            <!-- 状态区域 -->
            <div v-if="status" class="tr-file-card__status">
              <!-- 文件信息类型 -->
              <div v-if="statusMode === 'info'" class="tr-file-card__status-info">
                <span class="tr-file-card__file-type">
                  {{ file.fileType?.toUpperCase() || 'FILE' }}
                </span>
                <span v-if="file.size" class="tr-file-card__file-size">
                  {{ formatFileSize(file.size) }}
                </span>
              </div>

              <!-- 操作按钮类型 -->
              <div v-else-if="statusMode === 'actions'" class="tr-file-card__status-actions">
                <button
                  v-for="(action, index) in actions"
                  :key="index"
                  class="tr-file-card__action-btn"
                  :class="`tr-file-card__action-btn--${action.type}`"
                  @click="handleCustomAction(action)"
                >
                  {{ action.label }}
                </button>
              </div>

              <!-- 消息类型 -->
              <div v-else-if="statusMode === 'message'" class="tr-file-card__status-message">
                <!-- 错误重试 -->
                <div v-if="file.status === 'error'" class="tr-file-card__error-retry">
                  <span class="tr-file-card__error-text">上传失败</span>
                  <button class="tr-file-card__retry-btn" @click="handleRetry">重试</button>
                </div>

                <!-- 普通消息 -->
                <div v-else class="tr-file-card__message" :class="`tr-file-card__message--${file.status || 'info'}`">
                  {{ getStatusMessageText }}
                </div>
              </div>

              <!-- 默认状态 -->
              <span v-else class="tr-file-card__status-default">
                {{ file.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="less" scoped>
.tr-file-card {
  // 基础样式
  &,
  &--picture {
    position: relative;
    border-radius: 8px;
    margin-right: 8px;
    margin-bottom: 8px;
    transition: all 0.3s ease;
    box-sizing: border-box;
    background: rgb(255, 255, 255);
    border: 1px solid rgb(240, 240, 240);
  }

  // 默认卡片样式
  & {
    display: flex;
    align-items: center;
    width: 192px;
    height: 56px;
    padding: 8px 12px 8px 8px;

    &:hover {
      background: rgb(255, 255, 255);
      box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);
    }
  }

  // 图片卡片样式
  &--picture {
    width: 60px;
    height: 60px;
    overflow: visible;
    cursor: pointer;
  }

  &--uploading {
    .tr-file-card__status {
      color: #808080;
    }
  }

  &__close-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    z-index: 20;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 50%;
    transition: opacity 0.2s;
    opacity: 0;

    // 悬浮时显示
    .tr-file-card:hover &,
    .tr-file-card--picture:hover & {
      opacity: 1;
    }

    // 成功状态始终显示
    .tr-file-card--success & {
      opacity: 1;
    }
  }

  &__picture-container {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: inherit;
  }

  &__picture-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
    transition: transform 0.3s ease;
  }

  &__picture-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-color: rgba(0, 0, 0, 0.4);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;

    &-text {
      font-weight: 500;
    }

    // 只有成功状态且hover时才显示预览遮罩
    .tr-file-card--picture.tr-file-card--success:hover & {
      opacity: 1;
    }
  }

  &__default-container {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  &__icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    &-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    &--clickable {
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  &__file-icon {
    font-size: 40px;
    color: currentColor;
  }

  &__status-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    z-index: 10;

    // 卡片模式
    &--icon {
      background-color: rgba(0, 0, 0, 0.4);
    }

    // 图片模式
    &--picture {
      background-color: rgba(0, 0, 0, 0.4);
      z-index: 2;
    }
  }

  &__status-icon {
    font-size: 16px;

    &--loading {
      display: flex;
      flex-direction: column;
      align-items: center;

      &-text {
        width: 60px;
        height: 17px;
        font-size: 12px;
        color: #fff;
      }
    }

    &--error {
      color: #ff4d4f;
    }
  }

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
    gap: 2px;
  }

  &__name {
    text-align: left;
    width: 118px;
    height: 18px;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    color: rgb(25, 25, 25);

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &__status {
    display: flex;
    align-items: center;
    width: 100%;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    color: rgb(128, 128, 128);

    &-default {
      color: rgb(128, 128, 128);
    }

    // 文件信息状态
    &-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    // 操作按钮状态
    &-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    // 消息状态
    &-message {
      width: 100%;
    }
  }

  &__file-type {
    color: rgb(128, 128, 128);
  }

  &__file-size {
    color: rgb(128, 128, 128);
  }

  &__action-btn {
    height: 18px;
    border: none;
    background: transparent;
    color: #616161;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
    white-space: nowrap;
    font-size: 12px;

    &--preview,
    &--download {
      color: rgb(20, 118, 255);

      &:hover {
        color: #1476ff;
        background-color: rgba(0, 0, 0, 0.04);
      }
    }
  }

  &__message {
    width: 100%;

    &--error {
      color: #f23030;
    }

    &--warning {
      color: #ff9800;
    }

    &--success {
      color: #4caf50;
    }

    &--info {
      color: #808080;
    }
  }

  // 错误重试
  &__error-retry {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
  }

  &__error-text {
    color: #f23030;
    font-size: 12px;
  }

  &__retry-btn {
    background: transparent;
    border: none;
    color: #1476ff;
    cursor: pointer;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(20, 118, 255, 0.05);
    }
  }
}
</style>
