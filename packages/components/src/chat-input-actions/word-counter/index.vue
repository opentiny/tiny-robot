<script setup lang="ts">
import { computed } from 'vue'
import { useChatInputContext } from '../../chat-input/context'

const { characterCount, maxLength, isOverLimit, showWordLimit } = useChatInputContext()

const show = computed(() => showWordLimit.value && maxLength.value !== undefined)
</script>

<template>
  <span v-if="show" class="tr-chat-input-word-counter">
    <span :class="{ 'is-over-limit': isOverLimit }">{{ characterCount }}</span>
    <span>/{{ maxLength }}</span>
  </span>
</template>

<style lang="less" scoped>
.tr-chat-input-word-counter {
  font-size: calc(var(--tr-chat-input-font-size, 16px) - 2px);
  font-weight: 400;
  line-height: var(--tr-chat-input-line-height, 26px);
  color: var(--tr-chat-input-word-limit-color, #808080);
  white-space: nowrap;

  .is-over-limit {
    color: var(--tr-chat-input-word-limit-error-color, #f23030);
  }
}
</style>
