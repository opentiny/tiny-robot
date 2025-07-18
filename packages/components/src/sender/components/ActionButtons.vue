<script setup lang="ts">
import { computed } from 'vue'
import TinyTooltip from '@opentiny/vue-tooltip'
import { ActionButtonsProps } from '../index.type'
import { IconSend, IconStop, IconAccessory, IconVoice, IconLoadingSpeech, IconClose } from '@opentiny/tiny-robot-svgs'

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
  /**
   * 停止按钮文字，不传则只显示图标
   */
  stopText: undefined,
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
    <div
      v-if="hasUtilityButtons"
      class="action-buttons__utility"
      :style="{ 'padding-right': hasContent || loading ? '0' : '6px' }"
    >
      <!-- 文件上传按钮 -->
      <template v-if="allowFiles && !loading">
        <tiny-tooltip content="上传文件" placement="top">
          <div class="action-buttons__button">
            <IconAccessory class="action-buttons__icon" alt="上传文件" />
          </div>
        </tiny-tooltip>
      </template>

      <!-- 语音按钮：仅在启用语音功能时显示 -->
      <template v-if="speechEnabled && !loading">
        <div class="action-buttons__button" @click="handleToggleSpeech" :class="{ 'is-recording': isSpeechRecording }">
          <IconVoice v-if="!isSpeechRecording" class="action-buttons__icon" alt="录音" />
          <IconLoadingSpeech v-else class="action-buttons__icon action-buttons__icon--recording" alt="语音中" />
        </div>
      </template>

      <!-- 清除按钮 -->
      <template v-if="showClear">
        <tiny-tooltip content="清空内容" placement="top">
          <div class="action-buttons__button" @click="handleClear">
            <IconClose class="action-buttons__icon action-buttons__icon--clear" />
          </div>
        </tiny-tooltip>
      </template>
    </div>

    <!-- 提交按钮：主操作按钮 -->
    <template v-if="hasContent || loading">
      <div class="action-buttons__button action-buttons__submit" @click="loading ? handleCancel() : handleSubmit()">
        <div class="action-buttons__submit-content">
          <!-- 发送图标 -->
          <IconSend
            :class="['action-buttons__icon', 'action-buttons__icon--send', { 'is-disabled': isSubmitDisabled }]"
            v-if="!loading"
            alt="发送"
          />

          <!-- 停止生成按钮 -->
          <div v-else class="action-buttons__cancel" :class="{ 'action-buttons__cancel--icon-only': !stopText }">
            <IconStop class="action-buttons__icon action-buttons__icon--cancel" alt="停止" />
            <span v-if="stopText" class="action-buttons__cancel-text">{{ stopText }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="less">
:root {
  // 颜色
  --tr-sender-action-buttons-bg-color: #ffffff;
  --tr-sender-action-buttons-icon-color: #595959;
  --tr-sender-action-buttons-icon-hover-bg-color: #f5f5f5;
  --tr-sender-action-buttons-send-bg-color: #1476ff;
  --tr-sender-action-buttons-send-hover-bg-color: #126deb;
  --tr-sender-action-buttons-send-disabled-color: #c2c2c2;
  --tr-sender-action-buttons-cancel-bg: rgba(20, 118, 255, 0.06);
  --tr-sender-action-buttons-cancel-text-color: #1476ff;
  --tr-sender-action-buttons-cancel-icon-color: #1476ff;

  // 字号
  --tr-sender-action-buttons-cancel-font-size: 14px;

  // 其它
  --tr-sender-actions-gap: 12px;
  --tr-sender-action-utility-buttons-gap: 4px;
  --tr-sender-action-buttons-icon-size: 32px;
  --tr-sender-action-buttons-icon-size-send: 36px;
  --tr-sender-action-buttons-icon-size-cancel: 24px;
  --tr-sender-action-buttons-icon-size-clear: 24px;
  --tr-sender-action-buttons-border-radius: 8px;
  --tr-sender-action-buttons-cancel-height: 36px;
  --tr-sender-action-buttons-cancel-gap: 4px;
  --tr-sender-action-buttons-cancel-padding: 4px 12px 4px 6px;
  --tr-sender-action-buttons-cancel-border-radius: 99px;
  --tr-sender-action-buttons-submit-margin: 12px;
  --tr-sender-action-buttons-submit-content-gap: 6px;
  --tr-sender-action-buttons-submit-content-line-height: 32px;
  --tr-sender-action-buttons-cancel-text-height: 24px;
  --tr-sender-action-buttons-cancel-text-line-height: 24px;
  --tr-sender-action-buttons-send-border-radius: 18px;
}
</style>

<style lang="less" scoped>
.action-buttons {
  display: flex;
  gap: var(--tr-sender-actions-gap);
  background: var(--tr-sender-action-buttons-bg-color);
  border-radius: 26px;
  align-items: center;

  /* 公共按钮样式 */
  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 图标统一样式 */
  &__icon {
    font-size: var(--tr-sender-action-buttons-icon-size);
    color: var(--tr-sender-action-buttons-icon-color);
    cursor: pointer;

    &:not(&--send):hover {
      border-radius: var(--tr-sender-action-buttons-border-radius);
      background-color: var(--tr-sender-action-buttons-icon-hover-bg-color);
    }

    /* 关闭图标 */
    &--clear {
      width: 32px;
      height: 32px;
      padding: 4px;
      font-size: var(--tr-sender-action-buttons-icon-size-clear);
    }

    /* 发送图标 */
    &--send {
      font-size: var(--tr-sender-action-buttons-icon-size-send);
      color: var(--tr-sender-action-buttons-send-bg-color);
      border-radius: var(--tr-sender-action-buttons-send-border-radius);

      &:hover {
        color: var(--tr-sender-action-buttons-send-hover-bg-color);
      }
    }

    /* 停止图标 */
    &--cancel {
      color: var(--tr-sender-action-buttons-cancel-icon-color);
      font-size: var(--tr-sender-action-buttons-icon-size-cancel);
    }
  }

  /* 辅助按钮组 */
  &__utility {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--tr-sender-action-utility-buttons-gap);
    border-radius: var(--tr-sender-action-buttons-border-radius);
  }

  /* 提交按钮内容 */
  &__submit-content {
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: var(--tr-sender-action-buttons-submit-content-line-height);
    gap: var(--tr-sender-action-buttons-submit-content-gap);
  }

  /* 取消按钮 */
  &__cancel {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: var(--tr-sender-action-buttons-cancel-height);
    gap: var(--tr-sender-action-buttons-cancel-gap);
    font-size: var(--tr-sender-action-buttons-cancel-font-size);
    border-radius: var(--tr-sender-action-buttons-cancel-border-radius);
    padding: var(--tr-sender-action-buttons-cancel-padding);
    background-color: var(--tr-sender-action-buttons-cancel-bg);
    cursor: pointer;

    /* 仅图标模式样式 */
    &--icon-only {
      background-color: transparent;
      padding: 0;
      height: auto;
      gap: 0;
    }
  }

  /* 取消按钮文本 */
  &__cancel-text {
    color: var(--tr-sender-action-buttons-cancel-text-color);
    line-height: var(--tr-sender-action-buttons-cancel-text-line-height);
    height: var(--tr-sender-action-buttons-cancel-text-height);
    text-decoration: none;
  }

  /* 禁用状态样式 */
  .is-disabled {
    color: var(--tr-sender-action-buttons-send-disabled-color);
    cursor: not-allowed;
  }
}
</style>

<style lang="less">
.tr-sender-compact {
  --tr-sender-action-buttons-icon-size: 28px;
  --tr-sender-action-buttons-icon-size-send: 32px;
  --tr-sender-action-buttons-icon-size-clear: 22px;
  --tr-sender-action-buttons-cancel-height: 32px;
  --tr-sender-action-buttons-cancel-font-size: 12px;
  --tr-sender-action-buttons-cancel-padding: 4px 16px 4px 4px;
  --tr-sender-action-buttons-icon-hover-size: 28px;

  --tr-sender-actions-gap: 10px;
}
</style>
