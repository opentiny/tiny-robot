<script setup lang="ts">
import { computed } from 'vue'
import { useChatInputContext } from '../../context'

const { characterCount, maxLength, isOverLimit, showWordLimit } = useChatInputContext()

const show = computed(() => showWordLimit.value && maxLength.value !== undefined)
const text = computed(() => `${characterCount.value}/${maxLength.value}`)
</script>

<template>
  <span v-if="show" :class="['tr-chat-input-word-counter', { 'is-over-limit': isOverLimit }]">
    {{ text }}
  </span>
</template>

<style lang="less" scoped>
.tr-chat-input-word-counter {
  font-size: 12px;
  color: var(--tr-chat-input-word-limit-color, #808080);
  white-space: nowrap;

  &.is-over-limit {
    color: var(--tr-chat-input-word-limit-error-color, #f23030);
  }
}
</style>
