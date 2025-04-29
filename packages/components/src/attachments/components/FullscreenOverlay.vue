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
    zIndex: props.config?.zIndex || 1000,
    '--enter-delay': `${props.config?.enterDelay || 200}ms`,
    '--leave-delay': `${props.config?.leaveDelay || 200}ms`,
  }
})

const customClass = computed(() => props.config?.className || '')
</script>

<style lang="less" scoped>
.tr-fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
  border: 2px dashed #1976d2;
  border-radius: 8px;
  animation: pulse-border 1.5s infinite;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    border-radius: 8px;
    min-width: 300px;
    text-align: center;
  }

  &__icon {
    color: #1976d2;
    margin-bottom: 32.25px;
    font-size: 64px;
    animation: bounce 1.5s infinite ease-in-out;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: center;
  }

  &__title {
    color: rgb(25, 25, 25);
    font-size: 14px;
    font-weight: 500;
    line-height: 24px;
    letter-spacing: 0;
    text-align: center;
  }

  &__description {
    width: 253px;
    height: 40px;
    color: rgb(128, 128, 128);
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0;
    text-align: center;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-20px);
    }
    60% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse-border {
    0%,
    100% {
      border-color: rgba(25, 118, 210, 0.7);
      box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.3);
    }

    50% {
      border-color: rgba(25, 118, 210, 1);
      box-shadow: 0 0 0 5px rgba(25, 118, 210, 0);
    }
  }
}

// 过渡动画
.tr-fade-enter-active {
  transition: opacity var(--enter-delay) ease;
}

.tr-fade-leave-active {
  transition: opacity var(--leave-delay) ease;
}

.tr-fade-enter-from,
.tr-fade-leave-to {
  opacity: 0;
}
</style>
