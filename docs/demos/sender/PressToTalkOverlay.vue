<template>
  <div v-if="visible" class="mobile-voice-overlay">
    <!-- 录音动画区域 -->
    <div class="recording-wave active">
      <slot name="recording-icon">
        <img src="../../../packages/components/src/assets/wave.webp" alt="Recording Wave" class="wave-image" />
      </slot>
    </div>

    <!-- 提示文本 -->
    <div class="voice-hint" :class="{ cancel: isCanceling }">
      {{ hintText }}
    </div>

    <!-- 按钮 -->
    <button class="voice-btn recording" :class="{ cancel: isCanceling }">
      <slot name="button-text">按住说话</slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible?: boolean
  isCanceling?: boolean
  cancelThreshold?: number
  recordingText?: string
  cancelText?: string
  normalText?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  isCanceling: false,
  cancelThreshold: 30,
  recordingText: '松开发送，上滑取消',
  cancelText: '松开取消',
  normalText: '按住说话',
})

const hintText = computed(() => {
  if (!props.visible) return props.normalText
  if (props.isCanceling) return props.cancelText
  return props.recordingText
})
</script>

<style scoped>
.mobile-voice-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
  z-index: 1;
}

.recording-wave {
  display: none;
  justify-content: center;
  align-items: center;
  width: 280px;
}

.recording-wave.active {
  display: flex;
}

.voice-hint {
  font-size: 15px;
  color: #666;
  height: 24px;
  text-align: center;
  transition: all 0.3s ease;
  font-weight: 400;
  white-space: nowrap;
}

.voice-hint.cancel {
  color: #ff4d4f;
  font-weight: 500;
}

.voice-btn {
  width: 100%;
  height: 52px;
  background-color: #1476ff;
  border-radius: 12px;
  border: none;
  color: white;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(20, 118, 255, 0.25);
  user-select: none;
  pointer-events: none;
}

.voice-btn.cancel {
  background-color: #f76360;
  box-shadow: 0 6px 20px rgba(247, 99, 96, 0.25);
}

.wave-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: pulse 1.5s ease-in-out infinite;
  filter: drop-shadow(0 2px 8px rgba(20, 118, 255, 0.3));
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}
</style>
