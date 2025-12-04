<script setup lang="ts">
import { useChatInputContext } from '../../chat-input/context'
import ClearButton from '../clear-button/index.vue'
import SubmitButton from '../submit-button/index.vue'

const { hasContent, loading } = useChatInputContext()
</script>

<template>
  <div class="tr-default-action-buttons">
    <Transition name="tr-slide-right">
      <div v-if="hasContent || loading" class="tr-action-buttons-group">
        <Transition name="tr-slide-right">
          <ClearButton />
        </Transition>
        <div class="tr-submit-wrapper">
          <SubmitButton />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="less" scoped>
.tr-default-action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;

  .tr-action-buttons-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tr-submit-wrapper {
    display: flex;
    align-items: center;
  }
}

// 动画样式
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
