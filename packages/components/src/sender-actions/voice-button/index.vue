<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useSenderContext } from '../../sender/context'
import { useSpeechHandler } from './useSpeechHandler'
import ActionButton from '../action-button/index.vue'
import { IconVoice, IconRecordingWave } from '@opentiny/tiny-robot-svgs'
import type { VoiceButtonProps, VoiceButtonEmits } from './index.type'

const props = withDefaults(defineProps<VoiceButtonProps>(), {
  tooltipPlacement: 'top',
  autoInsert: true,
})

const emit = defineEmits<VoiceButtonEmits>()

// 从 Context 获取最小依赖：只需要 editor 和 disabled
const { editor, disabled: contextDisabled } = useSenderContext()
const isDisabled = computed(() => props.disabled || contextDisabled.value)
const isAutoReplace = computed(() => props.speechConfig?.autoReplace ?? false)
const committedTranscript = shallowRef('')

const resetSpeechSession = () => {
  committedTranscript.value = ''
}

const focusEditor = () => {
  if (!editor.value) return
  editor.value.commands.focus('end')
}

const appendTranscript = (transcript: string) => {
  if (!props.autoInsert || !editor.value || !transcript) return

  editor.value.commands.insertContent(transcript + ' ')
  focusEditor()
}

const replaceTranscript = (transcript: string) => {
  if (!props.autoInsert || !editor.value || !transcript) return

  editor.value.commands.setContent(transcript)
  focusEditor()
}

const mergeCommittedTranscript = (transcript: string) => {
  if (!transcript) {
    return committedTranscript.value
  }

  if (!committedTranscript.value || transcript.startsWith(committedTranscript.value)) {
    committedTranscript.value = transcript
    return committedTranscript.value
  }

  if (committedTranscript.value !== transcript && !committedTranscript.value.endsWith(transcript)) {
    committedTranscript.value += transcript
  }

  return committedTranscript.value
}

// 语音配置 - 使用普通对象而不是 computed，避免每次都创建新对象
const speechOptions = {
  ...props.speechConfig,
  onStart: () => {
    resetSpeechSession()
    emit('speech-start')
  },
  onInterim: (transcript: string) => {
    if (isAutoReplace.value) {
      replaceTranscript(transcript)
    }
    emit('speech-interim', transcript)
  },
  onFinal: (transcript: string) => {
    if (isAutoReplace.value) {
      replaceTranscript(mergeCommittedTranscript(transcript))
    } else {
      appendTranscript(transcript)
    }
    emit('speech-final', transcript)
  },
  onEnd: (transcript?: string) => {
    if (editor.value) {
      focusEditor()
    }
    resetSpeechSession()
    emit('speech-end', transcript)
  },
  onError: (error: Error) => {
    resetSpeechSession()
    emit('speech-error', error)
  },
}

// 使用语音 Hook
const { speechState, start, stop } = useSpeechHandler(speechOptions)

// 处理点击
const handleClick = async () => {
  if (isDisabled.value) return
  // 拦截器支持
  if (props.onButtonClick) {
    let prevented = false
    await props.onButtonClick(speechState.isRecording, () => {
      prevented = true
    })
    if (prevented) return
  }
  if (speechState.isRecording) {
    stop()
  } else {
    start()
  }
}

// 图标组件
const VoiceIcon = computed(() => props.icon ?? IconVoice)

// 录音中的图标
const RecordingIcon = computed(() => props.recordingIcon ?? IconRecordingWave)

// 暴露方法
defineExpose({
  start,
  stop,
  speechState,
})
</script>

<template>
  <!-- 仅在浏览器支持时显示 -->
  <ActionButton
    v-if="speechState.isSupported"
    :icon="VoiceIcon"
    :disabled="isDisabled"
    :size="size"
    :tooltip="tooltip"
    :tooltip-placement="tooltipPlacement"
    :class="{ 'is-recording': speechState.isRecording }"
    @click="handleClick"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" :is-recording="speechState.isRecording" />
    </template>
    <template v-else-if="speechState.isRecording" #icon>
      <component :is="RecordingIcon" />
    </template>
  </ActionButton>
  <!-- 自定义录音 UI (插槽) -->
  <slot name="recording-overlay" :is-recording="speechState.isRecording" :stop="stop" />
</template>

<style lang="less" scoped>
:deep(.tr-voice-button-wave) {
  display: block;
  width: 140px;
  height: 18px;
}

:deep(.is-recording) {
  opacity: 0.8;
}
</style>
