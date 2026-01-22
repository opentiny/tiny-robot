<script setup lang="ts">
import { useSenderContext } from '../../context'
import { useSlotScope } from '../../composables/useSlotScope'
import { DefaultActionButtons, WordCounter } from '../../../sender-actions/index'

const { mode, showWordLimit, maxLength } = useSenderContext()
const slotScope = useSlotScope()
</script>

<template>
  <div v-if="mode === 'multiple'" class="tr-sender-footer">
    <div class="tr-sender-footer-left">
      <slot name="footer" v-bind="slotScope" />
    </div>
    <div class="tr-sender-footer-right">
      <WordCounter v-if="showWordLimit && maxLength" />
      <slot name="footer-right" v-bind="slotScope" />
      <DefaultActionButtons />
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-sender-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--tr-sender-footer-padding);
  gap: var(--tr-sender-footer-gap);

  &-left {
    display: flex;
    align-items: center;
    gap: var(--tr-sender-gap);
  }

  &-right {
    display: flex;
    align-items: center;
    gap: var(--tr-sender-gap);
    margin-left: auto;
  }
}
</style>
