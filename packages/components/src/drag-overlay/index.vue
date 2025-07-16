<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { useElementBounding } from '@vueuse/core'
import type { DragOverlayProps } from './index.type'

const props = defineProps<DragOverlayProps>()

const { top, left, width, height } = useElementBounding(() => props.dragTarget)

const overlayStyle = computed((): CSSProperties => {
  if (!props.isDragging || !props.dragTarget) {
    return { display: 'none' }
  }

  return {
    position: 'fixed',
    top: `${top.value}px`,
    left: `${left.value}px`,
    width: `${width.value}px`,
    height: `${height.value}px`,
  }
})
</script>

<template>
  <Transition name="tr-fade">
    <div
      v-if="isDragging"
      :class="['tr-drag-overlay', { 'tr-drag-overlay--fullscreen': fullscreen }]"
      :style="overlayStyle"
    >
      <slot name="overlay" :is-dragging="isDragging">
        <div class="tr-drag-overlay__content">
          <div class="tr-drag-overlay__icon">
            <img src="../assets/svgs/add-file.svg" alt="上传文件" />
          </div>
          <div class="tr-drag-overlay__text">
            <div class="tr-drag-overlay__title">
              {{ overlayTitle }}
            </div>
            <div class="tr-drag-overlay__description">
              <span v-for="(line, index) in overlayDescription" :key="index">
                {{ line }}
              </span>
            </div>
          </div>
        </div>
      </slot>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
.tr-drag-overlay {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  border-radius: inherit;
  transition: opacity 0.2s ease;
  z-index: 9999;

  &__content {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
    border-radius: 40px;
    text-align: center;
  }

  &--fullscreen {
    padding: 60px 420px;

    .tr-drag-overlay__content {
      border: 1px dashed #808080;
    }
  }

  &__icon {
    margin-bottom: 12px;
    font-size: 80px;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: center;
  }

  &__title {
    color: rgba(0, 0, 0, 1);
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    letter-spacing: 0;
    text-align: center;
  }

  &__description {
    width: 100%;
    color: #808080;
    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
    letter-spacing: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

// 过渡动画
.tr-fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.2s ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
</style>
