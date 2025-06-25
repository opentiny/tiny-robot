<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
  config?: {
    zIndex?: number
    enterDelay?: number
    leaveDelay?: number
    className?: string
  }
}>()

const overlayStyle = computed(() => {
  return {
    zIndex: props.config?.zIndex ?? 1000,
    '--enter-delay': `${props.config?.enterDelay ?? 200}ms`,
    '--leave-delay': `${props.config?.leaveDelay ?? 200}ms`,
  }
})

const customClass = computed(() => props.config?.className ?? '')
</script>

<template>
  <Transition name="tr-fade">
    <div v-if="visible" class="tr-fullscreen-overlay" :class="[customClass]" :style="overlayStyle">
      <div class="tr-fullscreen-overlay__content">
        <div class="tr-fullscreen-overlay__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
            />
          </svg>
        </div>
        <div class="tr-fullscreen-overlay__text">
          <div class="tr-fullscreen-overlay__title"><slot name="header"> 将附件拖到此处完成上传 </slot></div>
          <div class="tr-fullscreen-overlay__description">
            <slot name="description">
              <span>总计最多上传50个附件（每个100MB以内）</span>
              <span>支持附件格式 PDF/Word/Excel/PPT/Markdown</span>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
@import '../vars.less';

.tr-fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: var(--tr-overlay-backdrop-filter);
  background: var(--tr-overlay-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;

  &__content {
    display: flex;
    min-width: var(--tr-overlay-content-min-width);
    min-height: var(--tr-overlay-content-min-height);
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: var(--tr-overlay-padding);
    border-radius: var(--tr-overlay-border-radius);
    text-align: center;
    border: var(--tr-overlay-border);
  }

  &__icon {
    color: var(--tr-overlay-icon-color);
    margin-bottom: var(--tr-overlay-icon-margin-bottom);
    font-size: var(--tr-overlay-icon-size);
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: var(--tr-overlay-text-gap);
    justify-content: center;
  }

  &__title {
    color: var(--tr-overlay-title-color);
    font-size: var(--tr-overlay-title-font-size);
    font-weight: var(--tr-overlay-title-font-weight);
    line-height: var(--tr-overlay-desc-line-height);
    letter-spacing: 0;
    text-align: center;
  }

  &__description {
    width: 100%;
    color: var(--tr-overlay-desc-color);
    font-size: var(--tr-overlay-desc-font-size);
    font-weight: 400;
    line-height: var(--tr-overlay-desc-line-height);
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
  &-enter-active {
    transition: opacity var(--enter-delay) ease;
  }
  &-leave-active {
    transition: opacity var(--leave-delay) ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
</style>
