<script setup lang="ts">
import { computed } from 'vue'
import TinyButton from '@opentiny/vue-button'
import { IconClose } from '@opentiny/vue-icon'
import { ActionButtonsProps } from '../index.type'

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
  allowSpeech: false,
  speechStatus: () => ({
    isRecording: false,
    isSupported: false,
  }),
  /**
   * 是否允许附件功能
   */
  allowFiles: false,
  /**
   * 提交快捷方式
   * @default 'enter'
   */
  submitType: 'enter',
})

const emit = defineEmits<{
  /**
   * 清除内容事件
   */
  (e: 'clear'): void
  /**
   * 切换语音识别状态事件
   */
  (e: 'toggle-speech', state: boolean): void
  /**
   * 提交内容事件
   */
  (e: 'submit'): void
  /**
   * 取消发送事件，用于取消加载状态
   */
  (e: 'cancel'): void
}>()

/**
 * 是否启用语音功能
 */
const speechEnabled = computed(() => props.allowSpeech)

const isSpeechRecording = computed(() => props.speechStatus.isRecording)

/**
 * 整体禁用状态
 */
const isDisabled = computed(() => props.disabled)

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

/**
 * 处理提交操作
 */
const handleSubmit = () => {
  if (!isDisabled.value) {
    emit('submit')
  }
}

/**
 * 处理取消操作
 */
const handleCancel = () => {
  if (!isDisabled.value) {
    emit('cancel')
  }
}
</script>

<template>
  <div class="action-buttons">
    <!-- 文件上传按钮 -->
    <template v-if="allowFiles && !loading">
      <tiny-tooltip content="上传文件" placement="top">
        <tiny-button type="text" :disabled="isDisabled">
          <img src="../../assets/icons/accessory.svg" class="button-icon" alt="上传文件" />
        </tiny-button>
      </tiny-tooltip>
    </template>

    <!-- 语音按钮：仅在启用语音功能时显示 -->
    <template v-if="speechEnabled && !loading">
      <tiny-button
        type="text"
        :disabled="isDisabled"
        @click="handleToggleSpeech"
        class="speech-button"
        :class="{ 'is-recording': isSpeechRecording }"
      >
        <img v-if="!isSpeechRecording" src="../../assets/icons/voice.svg" class="button-icon" alt="录音" />
        <img v-else src="../../assets/icons/loading-speech.svg" class="button-icon recording-icon" alt="语音中" />
      </tiny-button>
    </template>

    <template v-if="showClear">
      <tiny-tooltip content="清空内容" placement="top">
        <tiny-button type="text" :disabled="isDisabled || !hasContent" @click="handleClear" style="margin-left: 0">
          <component :is="TinyIconCloseSquare" class="button-icon" />
        </tiny-button>
      </tiny-tooltip>
    </template>

    <!-- 提交按钮：主操作按钮 -->
    <template v-if="hasContent || loading">
      <tiny-button
        type="text"
        :class="loading ? 'cancel-button' : 'submit-button'"
        :disabled="isDisabled"
        @click="loading ? handleCancel() : handleSubmit()"
      >
        <div class="button-content">
          <img v-if="!loading" src="../../assets/icons/send.svg" alt="发送" />
          <tiny-tooltip v-else content="停止生成" placement="top">
            <img src="../../assets/icons/loading.svg" alt="加载中" class="loading" />
          </tiny-tooltip>
        </div>
      </tiny-button>
    </template>
  </div>
</template>
