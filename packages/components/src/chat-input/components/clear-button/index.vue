<script setup lang="ts">
import { computed } from 'vue'
import { useChatInputContext } from '../../context'
import { IconClear } from '@opentiny/tiny-robot-svgs'

const { hasContent, clearable, clear } = useChatInputContext()

const show = computed(() => clearable.value && hasContent.value)
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
    font-size: 32px;
    color: var(--tr-text-secondary, #606266);
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  &:hover &__icon {
    background-color: var(--tr-container-bg-hover, rgba(0, 0, 0, 0.08));
  }
}
</style>
