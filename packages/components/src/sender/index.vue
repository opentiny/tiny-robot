<template>
  <div class="tiny-sender" :class="[senderClasses, `theme-${theme}`, `mode-${mode}`]">
    <!-- 输入区域容器 -->
    <div class="tiny-sender__container">
      <div class="tiny-sender__input-wrapper">
        <!-- 头部插槽 -->
        <Transition name="tiny-sender-slide-down">
          <div v-if="$slots.header" class="tiny-sender__header-slot">
            <slot name="header"></slot>
          </div>
        </Transition>

        <!-- 输入行 - 横向布局 -->
        <div class="tiny-sender__input-row" :class="{ 'has-prefix': $slots.prefix, 'has-header': $slots.header }">
          <!-- 前缀插槽 -->
          <div v-if="$slots.prefix" class="tiny-sender__prefix-slot">
            <slot name="prefix" />
          </div>

          <!-- 内容区域 - 确保最小宽度，不被挤占 -->
          <div class="tiny-sender__content-area" :class="{}">
            <tiny-input
              ref="inputRef"
              :autosize="autoSize"
              :type="inputType"
              :readonly="isLoading"
              :resize="mode === 'multiple' ? 'none' : undefined"
              v-model="inputValue"
              :disabled="isDisabled"
              :placeholder="placeholder"
              :maxlength="maxLength"
              :autofocus="autofocus"
              @keydown="handleKeyPress"
              @compositionstart="isComposing = true"
              @compositionend="handleCompositionEnd"
              @focus="handleFocus"
              @blur="handleBlur"
            />
          </div>

          <!-- 操作区域/后置插槽 -->
          <div v-if="mode === 'single'" class="tiny-sender__actions-slot">
            <div class="tiny-sender__buttons-container">
              <slot name="actions" />
              <action-buttons
                class="inline-buttons"
                :allow-speech="allowSpeech"
                :allow-files="allowFiles"
                :loading="loading"
                :disabled="isDisabled"
                :show-clear="clearable"
                :has-content="!!inputValue"
                :speech-status="speechState"
                :submit-type="submitType"
                @clear="clearInput"
                @toggle-speech="toggleSpeech"
                @submit="triggerSubmit"
              />
            </div>
          </div>
        </div>

        <!-- 底部插槽 - 底部工具栏作为默认内容 -->
        <Transition name="tiny-sender-slide-up">
          <div v-if="$slots.footer" class="tiny-sender__footer-slot">
            <slot name="footer"></slot>
          </div>
          <div
            v-else-if="mode !== 'single' || (showWordLimit && maxLength !== Infinity)"
            :style="justifyContent"
            class="tiny-sender__footer-slot tiny-sender__bottom-row"
          >
            <!-- 字数限制 -->
            <div v-if="showWordLimit && maxLength !== Infinity" class="tiny-sender__word-limit">
              {{ inputValue.length }}/{{ maxLength }}
            </div>

            <!-- 多行模式下的操作按钮 -->
            <div v-if="mode === 'multiple'" class="tiny-sender__toolbar">
              <div class="tiny-sender__buttons-container">
                <action-buttons
                  :allow-speech="allowSpeech"
                  :allow-files="allowFiles"
                  :loading="loading"
                  :disabled="isDisabled"
                  :show-clear="clearable"
                  :has-content="!!inputValue"
                  :speech-status="speechState"
                  :submit-type="submitType"
                  @clear="clearInput"
                  @toggle-speech="toggleSpeech"
                  @submit="triggerSubmit"
                />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 输入建议 -->
    <Transition name="tiny-sender-slide-up">
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
    </Transition>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="tiny-sender__error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { TinyInput } from '@opentiny/vue'
import type { SenderProps, SenderEmits, InputHandler, KeyboardHandler } from './types'
import { useInputHandler } from './composables/useInputHandler'
import { useKeyboardHandler } from './composables/useKeyboardHandler'
import { useSpeechHandler } from './composables/useSpeechHandler'
import ActionButtons from './components/ActionButtons.vue'
import './styles/index.less'

const props = withDefaults(defineProps<SenderProps>(), {
  submitType: 'enter',
  autoSize: false,
  loading: false,
  debounceSubmit: 300,
  clearable: false,
  allowSpeech: true,
  placeholder: '请输入内容...',
  theme: 'light',
  maxLength: Infinity,
  autofocus: false,
  showWordLimit: false,
  allowFiles: false,
  mode: 'single',
})

const emit = defineEmits<SenderEmits>()

// 输入引用
const inputRef = ref<HTMLElement | null>(null)

// 输入控制
const { inputValue, isComposing, clearInput }: InputHandler = useInputHandler(props, emit)

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

// 语音控制
const toggleSpeech = () => {
  if (speechState.isRecording) {
    stopSpeech()
  } else {
    startSpeech()
  }
}

// 键盘处理
const { handleKeyPress, triggerSubmit }: KeyboardHandler = useKeyboardHandler(
  props,
  emit,
  inputValue,
  isComposing,
  speechState,
  showSuggestions,
  toggleSpeech,
)

// 处理焦点事件
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

// 输入框类型计算
const inputType = computed(() => (props.mode === 'multiple' ? 'textarea' : 'text'))

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
const isDisabled = computed(() => props.disabled)
const isLoading = computed(() => props.loading)

// 样式类
const senderClasses = computed(() => ({
  'is-disabled': isDisabled.value,
  'is-loading': isLoading.value,
  'has-error': !!errorMessage.value,
}))

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

// 监听输入变化
watch(inputValue, () => {
  showSuggestions.value = !!props.suggestions && !!inputValue.value
})

// 暴露方法
defineExpose({
  focus: () => {
    if (inputRef.value) {
      inputRef.value.focus()
    } else {
      const input = document.querySelector('.tiny-input__inner') as HTMLInputElement
      input?.focus()
    }
  },
  blur: () => {
    if (inputRef.value) {
      inputRef.value.blur()
    } else {
      const input = document.querySelector('.tiny-input__inner') as HTMLInputElement
      input?.blur()
    }
  },
  clear: clearInput,
  submit: triggerSubmit,
  startSpeech,
  stopSpeech,
})
</script>

<style lang="less">
.tiny-sender__buttons-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcut-hint {
  position: absolute;
  bottom: -16px;
  font-size: 10px;
  color: #909399;
  white-space: nowrap;
  user-select: none;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
