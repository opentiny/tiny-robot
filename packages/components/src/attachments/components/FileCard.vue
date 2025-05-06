<template>
  <div
    class="tr-file-card"
    :class="[`tr-file-card--${file.fileType || 'other'}`, file.status, { 'tr-file-card--uploading': file.isUploading }]"
    :data-file-type="file.fileType || 'other'"
  >
    <!-- 关闭按钮 - 右上角固定位置，悬浮显示 -->
    <button v-if="!disabled" type="button" class="tr-file-card__close" @click="handleRemove" aria-label="移除文件">
      <span class="tr-file-card__close-icon">×</span>
    </button>

    <div class="tr-file-card__icon">
      <div class="tr-file-card__icon-wrapper" v-html="iconHtml"></div>
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

          <template v-else-if="statusType === 'operate'">
            <template v-if="customActions && customActions.length">
              <button
                v-for="(action, index) in customActions"
                :key="index"
                type="button"
                class="tr-file-card__action"
                :class="`tr-file-card__action--${action.type}`"
                @click="handleCustomAction(action)"
              >
                <span class="tr-file-card__action-icon">{{ action.label }}</span>
              </button>
            </template>
          </template>

          <!-- 类型2: 默认状态文本 -->
          <template v-else>
            {{ file.status }}
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIconType } from '../composables/useIconType'
import type { Attachment, FileType } from '../index.type'

// 自定义操作按钮类型
interface ActionButton {
  type: string
  label: string
  handler?: (file: Attachment) => void
}

const props = withDefaults(
  defineProps<{
    file: Attachment
    // eslint-disable-next-line
    fileIcons?: Record<FileType, any>
    iconSize?: number
    disabled?: boolean
    showPreview?: boolean
    showStatus?: boolean
    statusType?: 'info' | 'operate' | 'default'
    customActions?: ActionButton[]
  }>(),
  {
    iconSize: 24,
    disabled: false,
    showPreview: true,
    showStatus: true,
    statusType: 'info',
  },
)

const emit = defineEmits(['remove', 'preview', 'action'])

// 使用图标类型管理
const { getIconComponent } = useIconType(props.fileIcons, props.iconSize)

// 获取当前文件类型对应的图标HTML
const iconHtml = computed(() => {
  const icon = getIconComponent(props.file.fileType as FileType).value
  return typeof icon === 'string' ? icon : ''
})

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + 'KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(1) + 'MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(1) + 'GB'
  }
}

// 预览文件
// const handlePreview = () => {
//   emit('preview', props.file)
// }

// 移除文件
const handleRemove = () => {
  emit('remove', props.file)
}

// 处理自定义操作按钮点击事件
const handleCustomAction = (action: ActionButton) => {
  if (action.handler) {
    action.handler(props.file)
  }
  emit('action', { action, file: props.file })
}
</script>

<style lang="less">
.tr-file-card {
  position: relative;
  display: flex;
  align-items: center;
  width: 192px;
  height: 58px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.04);
  padding: 8px 12px 8px 8px;
  margin-right: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgb(255, 255, 255);
    box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);
  }

  &.error {
    background-color: #ffebee;
  }

  &--uploading {
    .tr-file-card__status {
      color: #2196f3;
    }
  }

  // 右上角关闭按钮
  &__close {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgb(194, 194, 194);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 10;

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

  &__icon {
    flex-shrink: 0;
    width: 42px;
    height: 42px;
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
  }

  &__name {
    width: 118px;
    height: 18px;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    white-space: nowrap;
    color: rgb(25, 25, 25);
    text-overflow: ellipsis;
    overflow: hidden;
    margin-bottom: 2px;
  }

  &__status {
    color: rgb(128, 128, 128);
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0px;
    text-align: left;
    display: flex;
    align-items: center;
  }

  &__file-type {
    color: rgb(128, 128, 128);
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0px;
    margin-right: 10px;
  }

  &__file-size {
    color: rgb(128, 128, 128);
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0px;
  }

  &__progress {
    width: 100%;

    &-text {
      font-size: 12px;
      margin-bottom: 2px;
    }

    &-bar {
      height: 3px;
      width: 100%;
      background-color: rgba(0, 0, 0, 0.08);
      border-radius: 2px;
      overflow: hidden;
    }

    &-inner {
      height: 100%;
      background-color: #2196f3;
      transition: width 0.3s ease;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    margin-left: 12px;
  }

  &__action {
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: #616161;
    cursor: pointer;
    border-radius: 4px;
    padding: 0 4px;
    margin-left: 4px;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    &__icon {
      font-size: 12px;
      line-height: 1;
    }

    &--preview {
      &:hover {
        color: #2196f3;
      }
    }

    &--download {
      &:hover {
        color: #4caf50;
      }
    }
  }
}
</style>
