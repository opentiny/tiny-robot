<template>
  <div class="tiny-sender" :class="[senderClasses, `theme-${theme}`, `mode-${mode}`]">
    <!-- 输入区域 -->
    <div class="tiny-sender__input-wrapper">
      <tiny-input
        ref="textarea"
        :autosize="autoSize"
        :type="inputType"
        :resize="mode === 'multiple' ? 'none' : undefined"
        v-model="inputValue"
        :disabled="isDisabled"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :style="textareaStyle"
        :autofocus="autofocus"
        @keydown="handleKeyPress"
        @compositionstart="isComposing = true"
        @compositionend="handleCompositionEnd"
        @drop.prevent="handleFileDrop"
        @paste="handleFilePaste"
      >
        <!-- 单行模式下的操作按钮 -->
        <template #suffix>
          <action-buttons
            v-if="mode === 'single'"
            class="inline-buttons"
            :loading="loading"
            :disabled="isDisabled"
            :show-clear="clearable"
            :has-content="!!inputValue"
            :speech-status="speechState"
            :allow-files="allowFiles"
            :accept-files="acceptFiles"
            @submit="triggerSubmit"
            @clear="clearInput"
            @toggle-speech="toggleSpeech"
            @file-upload="triggerFileUpload"
            @file-select="handleFileSelect"
          />
        </template>
      </tiny-input>

      <div :style="justifyContent">
        <!-- 字数限制 -->
        <div v-if="showWordLimit && maxLength !== Infinity" class="tiny-sender__word-limit">
          {{ inputValue.length }}/{{ maxLength }}
        </div>

        <!-- 多行模式下的操作按钮 -->
        <div v-if="mode === 'multiple'" class="tiny-sender__toolbar">
          <action-buttons
            :loading="loading"
            :disabled="isDisabled"
            :show-clear="clearable"
            :has-content="!!inputValue"
            :speech-status="speechState"
            :allow-files="allowFiles"
            :accept-files="acceptFiles"
            @submit="triggerSubmit"
            @clear="clearInput"
            @toggle-speech="toggleSpeech"
            @file-upload="triggerFileUpload"
            @file-select="handleFileSelect"
          />
        </div>
      </div>

      <!-- 输入建议 -->
      <div v-if="showSuggestions && filteredSuggestions.length" class="tiny-sender__suggestions">
        <div
          v-for="(item, index) in filteredSuggestions"
          :key="index"
          class="suggestion-item"
          @click="selectSuggestion(item)"
        >
          {{ item }}
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="tiny-sender__overlay">
        <icon-loading class="spin-icon" />
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="tiny-sender__error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { TinyInput } from '@opentiny/vue'
import type { SenderProps, SenderEmits, InputHandler, SubmitHandler, FileHandler } from './types'
import { useInputHandler } from './composables/useInputHandler'
import { useSubmitHandler } from './composables/useSubmitHandler'
import { useSpeechHandler } from './composables/useSpeechHandler'
import { useFileHandler } from './composables/useFileHandler'
import ActionButtons from './components/ActionButtons.vue'
import './styles/index.less'

const props = withDefaults(defineProps<SenderProps>(), {
  submitType: 'enter',
  autoSize: false,
  debounceSubmit: 300,
  clearable: true,
  placeholder: '请输入内容...',
  theme: 'light',
  maxLength: Infinity,
  minHeight: '100px',
  maxHeight: '300px',
  autofocus: false,
  showWordLimit: false,
  allowFiles: true,
  maxFileSize: 10,
  mode: 'single',
})

const emit = defineEmits<SenderEmits>()

// 文件处理
const { triggerFileUpload, handleFileSelect, handleFileDrop, handleFilePaste }: FileHandler = useFileHandler(
  props,
  emit,
)

// 输入控制
const { inputValue, isComposing, clearInput }: InputHandler = useInputHandler(props, emit)

// 提交处理
const { handleKeyPress, triggerSubmit }: SubmitHandler = useSubmitHandler(props, emit, inputValue, isComposing)

// 语音识别
const speechOptions = computed(() => ({
  ...(typeof props.speech === 'object' ? props.speech : {}),
  onStart: () => emit('speech-start'),
  onEnd: (transcript?: string) => emit('speech-end', transcript),
  onInterim: (transcript: string) => emit('speech-interim', transcript),
  onFinal: (text: string) => {
    inputValue.value = text
    emit('speech-end', text)
  },
  onError: (err: Error) => {
    showError(err.message)
    emit('speech-error', err)
  },
}))

const { speechState, start: startSpeech, stop: stopSpeech } = useSpeechHandler(speechOptions.value)

// 输入建议
const showSuggestions = ref(false)
const filteredSuggestions = computed(() => {
  if (!props.suggestions || !inputValue.value) return []
  return props.suggestions.filter((item) => item.toLowerCase().includes(inputValue.value.toLowerCase()))
})

const selectSuggestion = (value: string) => {
  inputValue.value = value
  showSuggestions.value = false
  emit('suggestion-select', value)
}

// 输入框类型计算
const inputType = computed(() => (props.mode === 'multiple' ? 'textarea' : 'text'))

// 文本域样式
const textareaStyle = computed(() => ({
  minHeight: props.mode === 'multiple' ? props.minHeight : undefined,
  maxHeight: props.mode === 'multiple' ? props.maxHeight : undefined,
}))

const justifyContent = computed(
  (): {
    display: string
    justifyContent: 'space-between' | 'flex-end'
    alignItems: string
  } => {
    const justifyContent = props.showWordLimit && props.maxLength !== Infinity ? 'space-between' : 'flex-end'

    return {
      display: 'flex',
      justifyContent,
      alignItems: 'center',
    }
  },
)

// 状态计算
const isDisabled = computed(() => props.disabled || props.loading)

// 错误处理
const errorMessage = ref<string>('')
const showError = (msg: string) => {
  errorMessage.value = msg
  setTimeout(() => (errorMessage.value = ''), 5000)
}

// 输入法结束处理
const handleCompositionEnd = () => {
  isComposing.value = false
  setTimeout(() => (isComposing.value = false), 50)
}

// 语音控制
const toggleSpeech = () => {
  if (speechState.isRecording) {
    stopSpeech()
  } else {
    startSpeech()
  }
}

// 样式类
const senderClasses = computed(() => ({
  'is-disabled': isDisabled.value,
  'is-loading': props.loading,
  'has-error': !!errorMessage.value,
}))

// 监听输入变化
watch(inputValue, () => {
  showSuggestions.value = !!props.suggestions && !!inputValue.value
})

// 暴露方法
defineExpose({
  focus: () => {
    const input = document.querySelector('.tiny-input__inner') as HTMLInputElement
    input?.focus()
  },
  blur: () => {
    const input = document.querySelector('.tiny-input__inner') as HTMLInputElement
    input?.blur()
  },
  clear: clearInput,
})
</script>
