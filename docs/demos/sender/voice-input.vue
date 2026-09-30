<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, VoiceButton } from '@opentiny/tiny-robot'
import { MockSpeechHandler } from './mockSpeechHandler'

const inputMode = ref<'auto' | 'manual'>('auto')
const recognizedText = ref('尚未识别')
const speechConfig = { customHandler: new MockSpeechHandler() }

const handleSpeechFinal = (transcript: string) => {
  recognizedText.value = transcript
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-weight: 500">模式：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="auto" v-model="inputMode" style="cursor: pointer" />
        <span>自动写入</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="manual" v-model="inputMode" style="cursor: pointer" />
        <span>仅接收事件</span>
      </label>
    </div>
    <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; font-size: 13px; color: #666">
      {{ inputMode === 'auto' ? '最终识别结果会插入编辑器' : '关闭 auto-insert 后，应用只通过事件接收结果' }}
    </div>
    <tr-sender mode="multiple" placeholder="点击麦克风，等待本地 Mock 返回识别结果...">
      <template #footer-right>
        <VoiceButton
          :speech-config="speechConfig"
          :auto-insert="inputMode === 'auto'"
          @speech-final="handleSpeechFinal"
        />
      </template>
    </tr-sender>
    <p style="margin: 0; color: #666" aria-live="polite">最近一次识别结果：{{ recognizedText }}</p>
  </div>
</template>
