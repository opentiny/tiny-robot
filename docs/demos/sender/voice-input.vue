<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, VoiceButton } from '@opentiny/tiny-robot'

const voiceMode = ref<'append' | 'replace'>('append')
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-weight: 500">模式：</span>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="append" v-model="voiceMode" style="cursor: pointer" />
        <span>追加模式</span>
      </label>
      <label style="display: flex; align-items: center; gap: 4px; cursor: pointer">
        <input type="radio" value="replace" v-model="voiceMode" style="cursor: pointer" />
        <span>替换模式</span>
      </label>
    </div>
    <div style="padding: 8px 12px; background: #f5f7fa; border-radius: 4px; font-size: 13px; color: #666">
      {{
        voiceMode === 'append'
          ? '追加模式：每次语音识别结果会追加到输入框末尾，适合混合输入'
          : '替换模式：在录音期间使用识别结果持续替换整个输入框内容'
      }}
    </div>
    <tr-sender
      :key="voiceMode"
      mode="multiple"
      :placeholder="
        voiceMode === 'append' ? '可以打字或点击麦克风说话，语音内容会追加...' : '点击麦克风说话，输入框内容持续替换...'
      "
    >
      <template #footer-right>
        <VoiceButton
          :speech-config="
            voiceMode === 'append'
              ? { autoReplace: false, continuous: true, interimResults: true }
              : { autoReplace: true, interimResults: true }
          "
        />
      </template>
    </tr-sender>
  </div>
</template>
