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
    statusType?: 'info' | 'progress' | 'operate' | 'message' | 'default'
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

// 获取当前文件类型对应的图标
const fileTypeIcon = computed(() => {
  return getIconComponent(props.file.fileType as FileType).value
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
      <div class="tr-file-card__icon-wrapper">
        <fileTypeIcon />
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
            <div class="tr-file-card__message" :class="`tr-file-card__message--${file.messageType || 'info'}`">
              {{ file.status }}
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
