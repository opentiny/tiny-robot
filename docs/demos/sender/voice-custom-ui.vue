<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import { TrSender, VoiceButton } from '@opentiny/tiny-robot'
import PressToTalkOverlay from './PressToTalkOverlay.vue'
import { MockSpeechHandler } from './mockSpeechHandler'

const TrSenderRef = ref<InstanceType<typeof TrSender>>()
const voiceButtonRef = ref<InstanceType<typeof VoiceButton>>()
const inputText = ref('')
const showMobileVoiceUI = ref(false)
const isMobile = ref(false)
const isCanceling = ref(false)
const startY = ref(0)
const cancelThreshold = 30
const speechConfig = { customHandler: new MockSpeechHandler() }
const isBusy = ref(false)
const finalText = ref('')
const submittedText = ref('')

const beginRecording = () => {
  if (isBusy.value) return
  isBusy.value = true
  isCanceling.value = false
  finalText.value = ''
  voiceButtonRef.value?.start()
}

const handleSpeechEnd = async (transcript?: string) => {
  const text = transcript ?? finalText.value
  const canceled = isCanceling.value
  showMobileVoiceUI.value = false
  finalText.value = ''
  // 等待编辑器同步后再提交，取消状态保留到结束，丢弃停止后的 final。
  if (!canceled && text.trim()) {
    TrSenderRef.value?.editor?.commands.setContent({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    })
    await nextTick()
    TrSenderRef.value?.submit()
  }
  isBusy.value = false
  isCanceling.value = false
}

const handleSpeechError = () => {
  showMobileVoiceUI.value = false
  isBusy.value = false
  finalText.value = ''
  isCanceling.value = false
}

const handleButtonClick = (_isRecording: boolean, preventDefault: () => void) => {
  preventDefault()
  if (isBusy.value) voiceButtonRef.value?.stop()
  else beginRecording()
}

// 按下开始录音
const handleTouchStart = (e: TouchEvent | MouseEvent) => {
  if (isBusy.value) return
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  startY.value = clientY
  showMobileVoiceUI.value = true
  beginRecording()
}

// 移动检测是否取消
const handleTouchMove = (e: TouchEvent | MouseEvent) => {
  if (!showMobileVoiceUI.value) return

  const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY
  const slideDistance = startY.value - currentY
  isCanceling.value = slideDistance > cancelThreshold
}

// 松开结束录音
const handleTouchEnd = () => {
  if (!showMobileVoiceUI.value) return

  if (isCanceling.value) {
    // 取消录音（清空识别内容）
    finalText.value = ''
  } else {
    // 正常结束，如果有识别内容则提交
    // 请求停止后仍可能返回 final，统一在 speech-end 中写入并提交。
  }

  voiceButtonRef.value?.stop()
  showMobileVoiceUI.value = false
}

const handleTouchCancel = () => {
  if (!showMobileVoiceUI.value) return
  isCanceling.value = true
  finalText.value = ''
  showMobileVoiceUI.value = false
  voiceButtonRef.value?.stop()
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <!-- 语音录制 UI -->
    <div>
      <h4>{{ isMobile ? '移动端' : 'PC 端' }} 语音录制</h4>
      <div
        class="chat-input-container"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="handleTouchEnd"
        @touchcancel.prevent="handleTouchCancel"
        @mousemove.prevent="handleTouchMove"
        @mouseup.prevent="handleTouchEnd"
      >
        <tr-sender
          v-show="!showMobileVoiceUI"
          ref="TrSenderRef"
          v-model="inputText"
          mode="single"
          class="chat-input"
          @submit="submittedText = $event"
        >
          <!-- PC 端：使用 VoiceButton -->
          <template #actions-inline>
            <VoiceButton
              v-show="!isMobile"
              ref="voiceButtonRef"
              :auto-insert="false"
              :speech-config="speechConfig"
              :on-button-click="handleButtonClick"
              @speech-final="!isCanceling && (finalText += $event)"
              @speech-end="handleSpeechEnd"
              @speech-error="handleSpeechError"
            />
          </template>

          <!-- 移动端：使用自定义"按住说话"区域替换编辑器 -->
          <template v-if="isMobile" #content>
            <div
              class="press-to-talk-area"
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
      <tiny-switch v-model="isMobile" :disabled="isBusy"></tiny-switch>
    </div>
    <p aria-live="polite">已提交：{{ submittedText }}</p>
  </div>
</template>

<style scoped>
.chat-input-container {
  position: relative;
  min-height: 180px;
}

.chat-input {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 移动端"按住说话"区域 - 替换整个编辑器内容区域 */
.press-to-talk-area {
  width: 100%;
  min-height: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  transition: all 0.2s;
}
</style>
