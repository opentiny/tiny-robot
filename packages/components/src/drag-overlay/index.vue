<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { DragUploadWrapperProps } from './index.type'

const props = withDefaults(defineProps<DragUploadWrapperProps>(), {
  overlayTitle: '',
  overlayDescription: () => [],
})

const overlayStyle = computed((): CSSProperties => {
  if (!props.isDragging || !props.targetRect) {
    return { display: 'none' }
  }

  const { top, left, width, height } = props.targetRect
  return {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
  }
})

const overlayDescriptionLines = computed(() => {
  if (props.overlayDescription.length > 0) {
    return props.overlayDescription
  }
  return ['总计最多上传50个附件（每个100MB以内）', '支持附件格式 PDF/Word/Excel/PPT/Markdown']
})
</script>

<template>
  <Transition name="tr-fade">
    <div v-if="isDragging" class="tr-drag-overlay" :style="overlayStyle">
      <slot name="overlay" :is-dragging="isDragging">
        <div :class="['tr-drag-overlay__content', { 'tr-drag-overlay__content--fullscreen': fullscreen }]">
          <div class="tr-drag-overlay__icon">
            <img src="../assets/svgs/add-file.svg" alt="上传文件" />
          </div>
          <div class="tr-drag-overlay__text">
            <div class="tr-drag-overlay__title">
              {{ overlayTitle || '将附件拖到此处完成上传' }}
            </div>
            <div class="tr-drag-overlay__description">
              <span v-for="(line, index) in overlayDescriptionLines" :key="index">
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
    min-width: 320px;
    min-height: 200px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
    border-radius: 40px;
    text-align: center;

    &--fullscreen {
      min-width: 1080px;
      min-height: 896px;
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
