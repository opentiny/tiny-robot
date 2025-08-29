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
    <div v-if="isDragging" :class="['tr-drag-overlay', { fullscreen: fullscreen }]" :style="overlayStyle">
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

<style lang="less">
.tr-drag-overlay-vars() {
  @prefix: tr-drag-overlay;

  // 基础变量组
  @vars: {
    /* 不影响布局的变量 */
    bg-color: rgba(255, 255, 255, 0.8);
    border-color: #808080;
    title-color: rgba(0, 0, 0, 1);
    title-font-weight: 600;
    description-color: #808080;
    description-font-weight: 400;

    /* 影响布局的变量 */
    content-padding: 40px;
    content-border-width: 0;
    content-border-radius: 40px;
    icon-font-size: 80px;
    icon-margin: 12px;
    text-gap: 12px;
    title-font-size: 16px;
    title-line-height: 24px;
    description-font-size: 14px;
    description-line-height: 24px;
  };

  // fullscreen 模式变量组
  @fullscreen-vars: {
    content-padding: 60px 420px;
    content-border-width: 1px;
  };

  :root {
    each(@vars, {
      --@{prefix}-@{key}: @{value};
    });

    each(@fullscreen-vars, {
    --@{prefix}-@{key}-fullscreen: @{value};
  });
  }
}

.tr-drag-overlay-vars();
</style>

<style lang="less" scoped>
// 第二层：组件映射层 (Component Mapping Layer)
.tr-drag-overlay {
  /* 不影响布局的变量 */
  --bg-color: var(--tr-drag-overlay-bg-color);
  --border-color: var(--tr-drag-overlay-border-color);
  --title-color: var(--tr-drag-overlay-title-color);
  --title-font-weight: var(--tr-drag-overlay-title-font-weight);
  --description-color: var(--tr-drag-overlay-description-color);
  --description-font-weight: var(--tr-drag-overlay-description-font-weight);

  /* 影响布局的变量 */
  --content-padding: var(--tr-drag-overlay-content-padding);
  --content-border-width: var(--tr-drag-overlay-content-border-width);
  --content-border-radius: var(--tr-drag-overlay-content-border-radius);
  --icon-font-size: var(--tr-drag-overlay-icon-font-size);
  --icon-margin: var(--tr-drag-overlay-icon-margin);
  --text-gap: var(--tr-drag-overlay-text-gap);
  --title-font-size: var(--tr-drag-overlay-title-font-size);
  --title-line-height: var(--tr-drag-overlay-title-line-height);
  --description-font-size: var(--tr-drag-overlay-description-font-size);
  --description-line-height: var(--tr-drag-overlay-description-line-height);

  /* 模式状态覆盖 */
  &.fullscreen {
    --content-padding: var(--tr-drag-overlay-content-padding-fullscreen, var(--tr-drag-overlay-content-padding));
    --content-border-width: var(
      --tr-drag-overlay-content-border-width-fullscreen,
      var(--tr-drag-overlay-content-border-width)
    );
  }
}

.tr-drag-overlay {
  background: var(--bg-color);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  border-radius: inherit;
  transition: opacity 0.2s ease;
  padding: var(--content-padding);
  z-index: 9999;

  &__content {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: var(--content-border-width) dashed var(--border-color);
    border-radius: var(--content-border-radius);
    text-align: center;
  }

  &__icon {
    margin-bottom: var(--icon-margin);
    font-size: var(--icon-font-size);
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: var(--text-gap);
    justify-content: center;
  }

  &__title {
    color: var(--title-color);
    font-size: var(--title-font-size);
    font-weight: var(--title-font-weight);
    line-height: var(--title-line-height);
    letter-spacing: 0;
    text-align: center;
  }

  &__description {
    width: 100%;
    color: var(--description-color);
    font-size: var(--description-font-size);
    font-weight: var(--description-font-weight);
    line-height: var(--description-line-height);
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
