<script setup lang="ts">
import { computed } from 'vue'
import { useChatInputContext } from '../../context'
import { IconSend, IconStop } from '@opentiny/tiny-robot-svgs'

const { canSubmit, loading, submit, stopText } = useChatInputContext()

const isDisabled = computed(() => !canSubmit.value && !loading.value)

const handleClick = () => {
  if (loading.value) {
    // 触发 cancel 事件
    return
  }
  submit()
}
</script>

<template>
  <div
    :class="[
      'tr-chat-input-submit-button',
      {
        'is-disabled': isDisabled,
        'is-loading': loading,
      },
    ]"
    @click="handleClick"
  >
    <!-- 发送图标 -->
    <IconSend v-if="!loading" class="tr-chat-input-submit-button__icon" />

    <!-- 停止按钮 -->
    <div v-else class="tr-chat-input-submit-button__cancel" :class="{ 'icon-only': !stopText }">
      <IconStop class="tr-chat-input-submit-button__cancel-icon" />
      <span v-if="stopText" class="tr-chat-input-submit-button__cancel-text">{{ stopText }}</span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-input-submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;

  &__icon {
    font-size: var(--tr-chat-input-button-size-submit, 36px);
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
