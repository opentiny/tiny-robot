<script setup lang="ts">
import { computed } from 'vue'
import TinyButton from '@opentiny/vue-button'
import TinyTooltip from '@opentiny/vue-tooltip'
import { IconClose } from '@opentiny/vue-icon'
import { ActionButtonsProps } from '../index.type'
import { IconSend, IconStop, IconAccessory, IconVoice, IconLoadingSpeech } from '@opentiny/tiny-robot-svgs'

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
  /**
   * 是否超出字数限制
   * @default false
   */
  isOverLimit: false,
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
 * 提交按钮禁用状态
 */
const isSubmitDisabled = computed(() => isDisabled.value || props.isOverLimit)

/**
 * 是否显示辅助按钮
 */
const hasUtilityButtons = computed(() => props.allowFiles || props.allowSpeech || props.showClear)

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
  if (!isSubmitDisabled.value) {
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
    <!-- 辅助按钮组：文件上传、语音、清除 -->
    <div v-if="hasUtilityButtons" class="action-buttons__utility">
      <!-- 文件上传按钮 -->
      <template v-if="allowFiles && !loading">
        <tiny-tooltip content="上传文件" placement="top">
          <tiny-button class="action-buttons__button action-buttons__file-button" type="text" :disabled="isDisabled">
            <IconAccessory class="action-buttons__icon" alt="上传文件" />
          </tiny-button>
        </tiny-tooltip>
      </template>

      <!-- 语音按钮：仅在启用语音功能时显示 -->
      <template v-if="speechEnabled && !loading">
        <tiny-button
          class="action-buttons__button action-buttons__speech-button"
          type="text"
          :disabled="isDisabled"
          @click="handleToggleSpeech"
          :class="{ 'is-recording': isSpeechRecording }"
        >
          <IconVoice v-if="!isSpeechRecording" class="action-buttons__icon" alt="录音" />
          <IconLoadingSpeech v-else class="action-buttons__icon action-buttons__icon--recording" alt="语音中" />
        </tiny-button>
      </template>

      <!-- 清除按钮 -->
      <template v-if="showClear">
        <tiny-tooltip content="清空内容" placement="top">
          <tiny-button
            class="action-buttons__button action-buttons__clear-button"
            type="text"
            :disabled="isDisabled || !hasContent"
            @click="handleClear"
          >
            <component :is="TinyIconCloseSquare" class="action-buttons__icon action-buttons__icon--close" />
          </tiny-button>
        </tiny-tooltip>
      </template>
    </div>

    <!-- 提交按钮：主操作按钮 -->
    <template v-if="hasContent || loading">
      <tiny-button
        type="text"
        class="action-buttons__button action-buttons__submit"
        :disabled="loading ? isDisabled : isSubmitDisabled"
        @click="loading ? handleCancel() : handleSubmit()"
      >
        <div class="action-buttons__submit-content">
          <!-- 发送图标 -->
          <IconSend class="action-buttons__icon action-buttons__icon--send" v-if="!loading" alt="发送" />

          <!-- 停止生成按钮 -->
          <tiny-tooltip v-else content="停止生成" placement="top">
            <div class="action-buttons__cancel">
              <IconStop class="action-buttons__icon action-buttons__icon--stop" alt="加载中" />
              <span class="action-buttons__cancel-text">停止回答</span>
            </div>
          </tiny-tooltip>
        </div>
      </tiny-button>
    </template>
  </div>
</template>
