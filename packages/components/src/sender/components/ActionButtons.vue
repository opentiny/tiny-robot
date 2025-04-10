<template>
  <div class="action-buttons">
    <!-- 文件上传按钮 -->
    <template v-if="allowFiles && !loading">
      <tiny-tooltip content="上传文件" placement="top">
        <tiny-button type="text" :disabled="isDisabled" @click="handleFileUpload">
          <img src="../../assets/icons/accessory.svg" class="button-icon" alt="上传文件" />
        </tiny-button>
      </tiny-tooltip>
      <input ref="fileInput" type="file" :accept="acceptFiles" multiple class="file-input" @change="handleFileSelect" />
    </template>

    <!-- 语音按钮：仅在启用语音功能时显示 -->
    <template v-if="speechEnabled && !loading">
      <tiny-tooltip :content="speechButtonTooltip" placement="top">
        <tiny-button type="text" :disabled="isDisabled" @click="handleToggleSpeech">
          <img src="../../assets/icons/voice.svg" class="button-icon" alt="语音" />
        </tiny-button>
      </tiny-tooltip>
    </template>

    <template v-if="showClear">
      <tiny-tooltip content="清空内容" placement="top">
        <tiny-button type="text" :disabled="isDisabled || !hasContent" @click="handleClear" style="margin-left: 0">
          <component :is="TinyIconCloseSquare" class="button-icon" />
        </tiny-button>
      </tiny-tooltip>
    </template>

    <!-- 提交按钮：主操作按钮 -->
    <tiny-tooltip :content="submitTooltip" placement="top">
      <tiny-button v-if="hasContent || loading" type="text" @click="handleSubmit" class="submit-button">
        <div class="button-content">
          <img v-if="!loading" src="../../assets/icons/send.svg" alt="发送" />
          <img v-else src="../../assets/icons/loading.svg" alt="加载中" />
          <span v-if="showShortcuts && !loading" class="shortcut-hint">{{ submitShortcut }}</span>
        </div>
      </tiny-button>
    </tiny-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TinyButton, TinyTooltip } from '@opentiny/vue'
import { IconClose } from '@opentiny/vue-icon'
import { ActionButtonsProps } from '../types'

const TinyIconCloseSquare = IconClose()

const props = withDefaults(defineProps<ActionButtonsProps>(), {
  /**
   * 是否显示加载状态
   * @default false
   */
  loading: false,
  /**
   * 是否禁用所有操作
   * @default false
   */
  disabled: false,
  /**
   * 是否显示清除按钮
   * @default true
   */
  showClear: true,
  /**
   * 输入框是否有内容
   * @default false
   */
  hasContent: false,
  /**
   * 是否允许语音功能
   */
  allowedSpeech: false,
  speechStatus: () => ({
    isRecording: false,
    isSupported: false,
  }),
  allowFiles: false,
  acceptFiles: '',
  /**
   * 提交快捷方式
   * @default 'enter'
   */
  submitType: 'enter',
  /**
   * 是否显示快捷键提示
   * @default true
   */
  showShortcuts: true,
})

const emit = defineEmits({
  /**
   * 提交事件
   */
  submit: () => true,
  /**
   * 清除内容事件
   */
  clear: () => true,
  /**
   * 切换语音识别状态事件
   * @param {boolean} state - 新的语音识别状态
   */
  'toggle-speech': (state: boolean) => Boolean(state),
  'file-upload': () => true,
  'file-select': (files: any) => Array.isArray(files),
})

/**
 * 是否启用语音功能
 */
const speechEnabled = computed(() => props.allowedSpeech)

/**
 * 语音图标路径
 */
// const speechIconSrc = computed(() =>
//   props.speechStatus.isRecording ? '../../assets/icons/stop.svg' : '../../assets/icons/voice.svg',
// )

/**
 * 语音按钮提示文本
 */
const speechButtonText = computed(() => (props.speechStatus.isRecording ? '停止录音' : '开始语音输入'))

/**
 * 语音按钮tooltip
 */
const speechButtonTooltip = computed(() => {
  const text = speechButtonText.value
  return props.showShortcuts ? `${text} (双击空格键)` : text
})

/**
 * 提交快捷键文本
 */
const submitShortcut = computed(() => {
  switch (props.submitType) {
    case 'enter':
      return 'Enter'
    case 'ctrlEnter':
      return 'Ctrl+Enter'
    case 'shiftEnter':
      return 'Shift+Enter'
    default:
      return 'Enter'
  }
})

/**
 * 提交按钮tooltip
 */
const submitTooltip = computed(() => {
  if (props.loading) return '发送中...'
  return props.showShortcuts ? `发送消息 (${submitShortcut.value})` : '发送消息'
})

/**
 * 整体禁用状态
 */
const isDisabled = computed(() => props.disabled)

/**
 * 提交按钮禁用状态
 */
const isSubmitDisabled = computed(() => isDisabled.value || !props.hasContent)

/**
 * 处理提交操作
 */
const handleSubmit = () => {
  if (!isSubmitDisabled.value) {
    emit('submit')
  }
}

/**
 * 处理清除操作
 */
const handleClear = () => {
  if (!isDisabled.value) {
    emit('clear')
  }
}

/**
 * 切换语音识别状态
 */
const handleToggleSpeech = () => {
  if (!isDisabled.value) {
    const newState = !props.speechStatus.isRecording
    emit('toggle-speech', newState)
  }
}

const handleFileUpload = () => {
  emit('file-upload')
}

const handleFileSelect = (e: Event) => {
  if (e.target instanceof HTMLInputElement && e.target.files) {
    const files = Array.from(e.target.files)
    emit('file-select', files)
    // 重置 input 以支持选择相同文件
    e.target.value = ''
  }
}
</script>

<style lang="less" scoped>
:deep(.tiny-button > img) {
  margin-right: 0;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcut-hint {
  position: absolute;
  bottom: -16px;
  font-size: 10px;
  color: #909399;
  white-space: nowrap;
  user-select: none;
}

.submit-button {
  margin-left: 4px;
}

.button-icon {
  width: 28px;
  height: 28px;
}

.file-input {
  display: none;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading {
  animation: spin 1s infinite linear;
}
</style>
