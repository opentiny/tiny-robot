<script setup lang="ts">
import { computed } from 'vue'
import { useChatInputContext } from '../../chat-input/context'
import { IconClear } from '@opentiny/tiny-robot-svgs'

const { hasContent, clearable, clear, loading } = useChatInputContext()

// 在 loading 时不显示清空按钮
const show = computed(() => clearable.value && hasContent.value && !loading.value)
</script>

<template>
  <div v-if="show" class="tr-chat-input-clear-button" @click="clear" title="清空">
    <IconClear class="tr-chat-input-clear-button__icon" />
  </div>
</template>

<style lang="less" scoped>
.tr-chat-input-clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &__icon {
    font-size: var(--tr-chat-input-button-size);
    color: var(--tr-text-secondary);
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  &:hover &__icon {
    background-color: var(--tr-chat-input-button-hover-bg);
  }
}
</style>
