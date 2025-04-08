<template>
  <div class="action-buttons">
    <!-- 文件上传按钮 -->
    <template v-if="allowFiles">
      <tiny-tooltip content="上传文件" placement="top">
        <tiny-button type="text" :disabled="isDisabled" @click="handleFileUpload">
          <component :is="TinyIconUpload" class="button-icon" />
        </tiny-button>
      </tiny-tooltip>
      <input ref="fileInput" type="file" :accept="acceptFiles" multiple class="file-input" @change="handleFileSelect" />
    </template>

    <!-- 语音按钮：仅在启用语音功能时显示 -->
    <template v-if="speechEnabled">
      <tiny-tooltip :content="speechButtonText" placement="top">
        <tiny-button type="text" :disabled="isDisabled" @click="handleToggleSpeech">
          <component :is="speechStatus.isRecording ? TinyIconStop : TinyIconMic" class="button-icon" />
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
    <tiny-tooltip :content="submitButtonText" placement="top">
      <tiny-button
        v-if="hasContent"
        type="text"
        :disabled="isSubmitDisabled"
        @click="handleSubmit"
        class="submit-button"
      >
        <div class="button-content">
          <component
            :is="loading ? TinyIconLoading : TinyIconSent"
            :class="['button-icon', { 'spin-icon': loading }]"
          />
        </div>
      </tiny-button>
    </tiny-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TinyButton, TinyTooltip } from '@opentiny/vue'
import { IconMic, IconStop, IconSent, IconLoading, IconFileupload, IconClose } from '@opentiny/vue-icon'

const TinyIconSent = IconSent()
const TinyIconMic = IconMic()
const TinyIconStop = IconStop()
const TinyIconUpload = IconFileupload()
const TinyIconLoading = IconLoading()
const TinyIconCloseSquare = IconClose()

const props = defineProps({
  /**
   * 是否显示加载状态
   * @default false
   */
  loading: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否禁用所有操作
   * @default false
   */
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否显示清除按钮
   * @default true
   */
  showClear: {
    type: Boolean,
    default: true,
  },
  /**
   * 输入框是否有内容
   * @default false
   */
  hasContent: {
    type: Boolean,
    default: false,
  },
  /**
   * 语音识别状态对象
   * @default { isRecording: false, isSupported: false }
   */
  speechStatus: {
    type: Object,
    default: () => ({
      isRecording: false,
      isSupported: false,
    }),
  },
  allowFiles: {
    type: Boolean,
    default: false,
  },
  acceptFiles: {
    type: String,
    default: '',
  },
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
const speechEnabled = computed(() => props.speechStatus.isSupported)

/**
 * 语音按钮提示文本
 */
const speechButtonText = computed(() => (props.speechStatus.isRecording ? '停止录音' : '开始语音输入'))

/**
 * 提交按钮提示文本
 */
const submitButtonText = computed(() => (props.loading ? '发送中...' : '发送消息'))

/**
 * 整体禁用状态
 */
const isDisabled = computed(() => props.disabled || props.loading)

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
  const files = Array.from((e.target as HTMLInputElement).files || [])
  emit('file-select', files)
  // 重置 input 以支持选择相同文件
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<style scoped lang="less">
.action-buttons {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--ti-common-color-line-normal);
  background: var(--ti-common-color-bg-white);

  /* 按钮图标统一样式 */
  .button-icon {
    font-size: 22px;
    transition: transform 0.2s;
    fill: blueviolet;

    &:hover {
      transform: scale(1.1);
    }
  }

  /* 加载动画样式 */
  .spin-icon {
    animation: spin 1s linear infinite;
    font-size: 18px;
    color: var(--ti-common-color-text-white);
  }

  .submit-button {
    margin-left: 0;
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

  /* 禁用状态样式 */
  .is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.button-content {
  display: inline-flex;
  align-items: center;
  gap: 6px; // 控制图标与文本间距

  // 当只有图标时保持居中
  &:empty {
    display: block;
  }
}
</style>
