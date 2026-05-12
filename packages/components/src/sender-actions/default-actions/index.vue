<script setup lang="ts">
import { computed, useSlots, type Slots } from 'vue'
import { useSenderContext } from '../../sender/context'
import { useClearButtonState } from '../clear-button/useClearButtonState'
import ClearButton from '../clear-button/index.vue'
import SubmitButton from '../submit-button/index.vue'

const slots: Slots = useSlots()

const { hasContent, loading } = useSenderContext()
const { show: showClearButton } = useClearButtonState()

const hasPrependActions = computed<boolean>(() => Boolean(slots.prepend))
const showSubmitButton = computed<boolean>(() => hasContent.value || loading.value)
const showActionGroup = computed<boolean>(() => hasPrependActions.value || showClearButton.value)
const showDefaultActions = computed<boolean>(() => hasPrependActions.value || showSubmitButton.value)
</script>

<template>
  <Transition name="tr-slide-right">
    <div v-if="showDefaultActions" class="tr-default-action-buttons">
      <div v-if="showActionGroup" class="tr-action-buttons-group">
        <slot name="prepend" />
        <Transition name="tr-slide-right">
          <ClearButton />
        </Transition>
      </div>
      <SubmitButton v-if="showSubmitButton" />
    </div>
  </Transition>
</template>

<style lang="less" scoped>
.tr-default-action-buttons {
  display: flex;
  align-items: center;
  gap: var(--tr-sender-action-submit-gap, 12px);
  min-height: var(--tr-sender-button-size-submit);

  .tr-action-buttons-group {
    display: flex;
    align-items: center;
    gap: var(--tr-sender-action-gap, 4px);
  }
}

.tr-slide-right-enter-active,
.tr-slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 0.69, 0.1, 1);
}

.tr-slide-right-enter-from,
.tr-slide-right-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
