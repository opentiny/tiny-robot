<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrSender, VoiceButton } from '@opentiny/tiny-robot'
import { MockSpeechHandler } from './mockSpeechHandler'

const inputMode = ref<'append' | 'replace' | 'manual'>('append')
const recognizedText = ref('')
const isRecording = ref(false)
const handler = new MockSpeechHandler()
const speechConfig = computed(() => ({ customHandler: handler, autoReplace: inputMode.value === 'replace' }))

const handleSpeechStart = () => {
  isRecording.value = true
  recognizedText.value = ''
}

const handleSpeechFinal = (transcript: string) => {
  recognizedText.value += transcript
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-weight: 500">模式：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="append" v-model="inputMode" :disabled="isRecording" style="cursor: pointer" />
        <span>追加</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="replace" v-model="inputMode" :disabled="isRecording" style="cursor: pointer" />
        <span>替换</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="manual" v-model="inputMode" :disabled="isRecording" style="cursor: pointer" />
        <span>仅接收事件</span>
      </label>
    </div>
    <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; font-size: 13px; color: #666">
      {{
        inputMode === 'append'
          ? '每次确定结果追加到原输入后，保留原输入。'
          : inputMode === 'replace'
            ? '完整预览覆盖已有输入，结束后仅保留确定文本。'
            : '只发送识别事件，不修改编辑器。'
      }}
    </div>
    <tr-sender mode="multiple" placeholder="点击麦克风，等待本地 Mock 返回识别结果...">
      <template #footer-right>
        <VoiceButton
          :speech-config="speechConfig"
          :auto-insert="inputMode !== 'manual'"
          @speech-start="handleSpeechStart"
          @speech-final="handleSpeechFinal"
          @speech-end="isRecording = false"
          @speech-error="isRecording = false"
        />
      </template>
    </tr-sender>
    <p style="margin: 0; color: #666" aria-live="polite">本轮累计确定文本：{{ recognizedText || '尚未识别' }}</p>
  </div>
</template>
