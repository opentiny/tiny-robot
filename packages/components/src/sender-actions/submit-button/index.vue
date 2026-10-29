<script setup lang="ts">
import { computed } from 'vue'
import { TinyTooltip } from '@opentiny/vue'
import { useSenderContext } from '../../sender/context'
import { IconSend, IconStop } from '@opentiny/tiny-robot-svgs'
import { normalizeTooltipContent } from '../utils/tooltip'

const { canSubmit, loading, defaultActions, submit, cancel, stopText } = useSenderContext()

const isDisabled = computed(() => {
  if (defaultActions.value?.submit?.disabled) {
    return true
  }

  return !canSubmit.value && !loading.value
})

const tooltipRenderFn = computed(() => normalizeTooltipContent(defaultActions.value?.submit?.tooltip))

const tooltipPlacement = computed(() => defaultActions.value?.submit?.tooltipPlacement ?? 'top')

/**
 * 点击处理
 * - disabled 时：不执行任何操作
 * - loading 时：触发 cancel 事件（停止响应）
 * - 非 loading 时：触发 submit 事件（提交内容）
 */
const handleClick = () => {
  // 禁用状态下不响应点击
  if (isDisabled.value) {
    return
  }

  if (loading.value) {
    cancel()
  } else {
    submit()
  }
}
</script>

<template>
  <tiny-tooltip
    v-if="tooltipRenderFn && !loading"
    :render-content="tooltipRenderFn"
    :placement="tooltipPlacement"
    effect="light"
    :visible-arrow="false"
    popper-class="tr-submit-button-tooltip-popper"
  >
    <div
      :class="[
        'tr-sender-submit-button',
        {
          'is-disabled': isDisabled,
          'is-loading': loading,
        },
      ]"
      @click="handleClick"
    >
      <!-- 发送图标 -->
      <IconSend class="tr-sender-submit-button__icon" />
    </div>
  </tiny-tooltip>

  <!-- 无 tooltip 或 loading 时直接渲染 -->
  <div
    v-else
    :class="[
      'tr-sender-submit-button',
      {
        'is-disabled': isDisabled,
        'is-loading': loading,
      },
    ]"
    @click="handleClick"
  >
    <!-- 发送图标 -->
    <IconSend v-if="!loading" class="tr-sender-submit-button__icon" />

    <!-- 停止按钮 -->
    <div v-else class="tr-sender-submit-button__cancel" :class="{ 'icon-only': !stopText }">
      <IconStop class="tr-sender-submit-button__cancel-icon" />
      <span v-if="stopText" class="tr-sender-submit-button__cancel-text">{{ stopText }}</span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-sender-submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;

  &__icon {
    font-size: var(--tr-sender-button-size-submit, 36px);
    color: var(--tr-color-primary, #1476ff);
    border-radius: 50%;
    transition: color 0.2s;
  }

  &:not(.is-disabled):not(.is-loading):hover &__icon {
    color: #126deb;
  }

  &.is-disabled &__icon {
    color: var(--tr-text-disabled, #c0c4cc);
    cursor: not-allowed;
  }

  &__cancel {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 36px;
    padding: 4px 12px 4px 6px;
    background-color: rgba(20, 118, 255, 0.06);
    border-radius: 99px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(20, 118, 255, 0.1);
    }

    &.icon-only {
      background-color: transparent;
      padding: 0;
      height: auto;
    }
  }

  &__cancel-icon {
    font-size: 24px;
    color: var(--tr-color-primary, #1476ff);
  }

  &__cancel-text {
    font-size: 14px;
    color: var(--tr-color-primary, #1476ff);
    line-height: 24px;
    height: 24px;
  }
}
</style>

<style lang="less">
@import '../styles/tooltip.less';

/* 全局样式：自定义 TinyTooltip 样式 */
.tiny-tooltip.tiny-tooltip__popper.tr-submit-button-tooltip-popper {
  .tr-sender-tooltip-light-popper-mixin();
}
</style>
