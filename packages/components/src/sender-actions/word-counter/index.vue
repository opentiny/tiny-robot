<script setup lang="ts">
import { computed } from 'vue'
import { useSenderContext } from '../../sender/context'

const { characterCount, maxLength, isOverLimit, showWordLimit } = useSenderContext()

const show = computed(() => showWordLimit.value && maxLength.value !== undefined)
</script>

<template>
  <span v-if="show" class="tr-sender-word-counter">
    <span :class="{ 'is-over-limit': isOverLimit }">{{ characterCount }}</span>
    <span>/{{ maxLength }}</span>
  </span>
</template>

<style lang="less" scoped>
.tr-sender-word-counter {
  font-size: calc(var(--tr-sender-font-size, 16px) - 2px);
  font-weight: 400;
  line-height: var(--tr-sender-line-height, 26px);
  color: var(--tr-sender-word-limit-color, #808080);
  white-space: nowrap;

  .is-over-limit {
    color: var(--tr-sender-word-limit-error-color, #f23030);
  }
}
</style>
