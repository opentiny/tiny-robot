<script setup lang="ts">
import { useChatInputContext } from '../../context'
import DefaultRight from './default-right.vue'

const { mode } = useChatInputContext()
</script>

<template>
  <div v-if="mode === 'multiple'" class="tr-chat-input-footer">
    <div class="tr-chat-input-footer-left">
      <slot name="footer" />
    </div>
    <div class="tr-chat-input-footer-right">
      <slot name="footer-right">
        <DefaultRight />
      </slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--tr-chat-input-footer-padding);
  gap: var(--tr-chat-input-footer-gap);

  &-left {
    display: flex;
    align-items: center;
    gap: var(--tr-chat-input-gap, 8px);
  }

  &-right {
    display: flex;
    align-items: center;
    gap: var(--tr-chat-input-gap, 8px);
    margin-left: auto;
  }
}
</style>
