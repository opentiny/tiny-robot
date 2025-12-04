<script setup lang="ts">
import { useChatInputContext } from '../../context'
import { useSlotScope } from '../../composables/useSlotScope'
import { DefaultActionButtons, WordCounter } from '../../../chat-input-actions/index'

const { mode, showWordLimit, maxLength } = useChatInputContext()
const slotScope = useSlotScope()
</script>

<template>
  <div v-if="mode === 'multiple'" class="tr-chat-input-footer">
    <div class="tr-chat-input-footer-left">
      <slot name="footer" v-bind="slotScope" />
    </div>
    <div class="tr-chat-input-footer-right">
      <WordCounter v-if="showWordLimit && maxLength" />
      <slot name="footer-right" v-bind="slotScope" />
      <DefaultActionButtons />
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
    gap: var(--tr-chat-input-gap);
  }

  &-right {
    display: flex;
    align-items: center;
    gap: var(--tr-chat-input-gap);
    margin-left: auto;
  }
}
</style>
