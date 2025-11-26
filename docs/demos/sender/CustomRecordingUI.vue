<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <!-- 语音录制 UI -->
    <div>
      <h4>{{ isMobile ? '移动端' : 'PC 端' }} 语音录制</h4>
      <div
        class="sender-container"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="handleTouchEnd"
        @mousemove.prevent="handleTouchMove"
        @mouseup.prevent="handleTouchEnd"
      >
        <!-- 输入框：使用 content 插槽自定义按住说话入口 -->
        <tr-sender
          v-show="!showMobileVoiceUI"
          ref="senderRef"
          v-model="inputText"
          mode="single"
          class="sender"
          :allowSpeech="true"
          :speech="speechConfig"
        >
          <template v-if="isMobile" #content>
            <div
              class="press-to-talk-trigger"
              @touchstart.prevent="handleTouchStart"
              @mousedown.prevent="handleTouchStart"
            >
              按住说话
            </div>
          </template>
        </tr-sender>

        <!-- 录音浮层：显示录音动画和提示 -->
        <PressToTalkOverlay
          v-model:visible="showMobileVoiceUI"
          :isCanceling="isCanceling"
          :cancelThreshold="cancelThreshold"
        />
      </div>
    </div>
    <div>
      <span style="margin-right: 20px">是否是移动端</span>
      <tiny-switch v-model="isMobile"></tiny-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import { TrSender } from '@opentiny/tiny-robot'
import PressToTalkOverlay from './PressToTalkOverlay.vue'

const senderRef = ref<InstanceType<typeof TrSender>>()
const inputText = ref('')
const showMobileVoiceUI = ref(false)
const isMobile = ref(false)
const isCanceling = ref(false)
const startY = ref(0)
const cancelThreshold = 30

// 语音配置
const speechConfig = {
  onVoiceButtonClick: async (isRecording: boolean, preventDefault: () => void) => {
    // PC 端：使用默认的点击切换录音逻辑
    if (!isMobile.value) {
      return // 不调用 preventDefault，继续执行默认逻辑
    }

    // Mobile 端：使用自定义的按住说话逻辑
    preventDefault() // 阻止默认逻辑

    if (!isRecording) {
      // 点击语音按钮时，显示按住说话 UI
      showMobileVoiceUI.value = true
    } else {
      // 如果正在录音，停止录音
      senderRef.value?.stopSpeech()
      showMobileVoiceUI.value = false
    }
  },
}

// 按下开始录音
const handleTouchStart = (e: TouchEvent | MouseEvent) => {
  const clientY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  startY.value = clientY
  showMobileVoiceUI.value = true
  isCanceling.value = false
  senderRef.value?.startSpeech()
}

// 移动检测是否取消
const handleTouchMove = (e: TouchEvent | MouseEvent) => {
  if (!showMobileVoiceUI.value) return

  const currentY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY
  const slideDistance = startY.value - currentY
  isCanceling.value = slideDistance > cancelThreshold
}

// 松开结束录音
const handleTouchEnd = () => {
  if (!showMobileVoiceUI.value) return

  if (isCanceling.value) {
    // 取消录音（可以在这里清空输入框或其他处理）
    inputText.value = ''
  }

  senderRef.value?.stopSpeech()
  senderRef.value?.submit()
  showMobileVoiceUI.value = false
  isCanceling.value = false
}
</script>

<style scoped>
.sender-container {
  position: relative;
  min-height: 180px;
}

.sender {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}

.press-to-talk-trigger {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;
  font-size: 16px;
  color: #333;
}
</style>
