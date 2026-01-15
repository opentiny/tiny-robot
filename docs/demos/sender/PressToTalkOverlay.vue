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

const recordStartUrl = `${import.meta.env.BASE_URL}record-start.svg`
const recordStopUrl = `${import.meta.env.BASE_URL}record-stop.svg`

const recordImgUrl = computed(() => {
  return props.isCanceling ? recordStopUrl : recordStartUrl
})
</script>

<template>
  <div v-if="visible" class="mobile-voice-overlay">
    <img :src="recordImgUrl" alt="Recording Wave" />

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

<style scoped>
.mobile-voice-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 1;
}

.voice-hint {
  margin-top: 8px;
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
</style>
