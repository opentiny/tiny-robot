<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import TinyInput from '@opentiny/vue-input'
import type { SenderProps, SenderEmits, InputHandler, KeyboardHandler } from './index.type'
import { useInputHandler } from './composables/useInputHandler'
import { useKeyboardHandler } from './composables/useKeyboardHandler'
import { useSpeechHandler } from './composables/useSpeechHandler'
import ActionButtons from './components/ActionButtons.vue'
import TemplateEditor from './components/TemplateEditor.vue'
import './index.less'

const props = withDefaults(defineProps<SenderProps>(), {
  autofocus: false,
  autoSize: () => ({ minRows: 2, maxRows: 5 }),
  allowSpeech: true,
  allowFiles: false,
  clearable: false,
  disabled: false,
  loading: false,
  modelValue: '',
  mode: 'single',
  maxLength: Infinity,
  placeholder: '请输入内容...',
  showWordLimit: false,
  submitType: 'enter',
  theme: 'light',
  template: '',
  hasContent: undefined,
})

const emit = defineEmits<SenderEmits>()

// 输入引用
const inputRef = ref<HTMLElement | null>(null)
const templateEditorRef = ref<InstanceType<typeof TemplateEditor> | null>(null)
const inputWrapperRef = ref<HTMLElement | null>(null)

// 是否显示模板编辑器
const showTemplateEditor = computed(() => !!props.template)

// 输入控制
const { inputValue, isComposing, clearInput: originalClearInput }: InputHandler = useInputHandler(props, emit)

// 自动模式切换
const currentMode = ref(props.mode)
const isAutoSwitching = ref(false)

// 设置多行模式
const setMultipleMode = () => {
  if (currentMode.value === 'single') {
    currentMode.value = 'multiple'

    // 保持焦点并设置光标位置
    nextTick(() => {
      setTimeout(() => {
        const textareaElement = document.querySelector('.tiny-textarea__inner') as HTMLTextAreaElement
        if (textareaElement) {
          const pos = inputValue.value.length
          textareaElement.focus()
          textareaElement.setSelectionRange(pos, pos)
        }
      }, 50) // 较短的延迟以减少感知延迟
    })
  }
}

// 监测输入宽度并自动切换模式
const checkInputOverflow = () => {
  if (props.mode !== 'single' || !inputRef.value || isAutoSwitching.value) return

  const inputElement = document.querySelector('.tiny-input__inner') as HTMLInputElement
  const wrapperElement = inputWrapperRef.value

  if (!inputElement || !wrapperElement) return

  // 创建一个临时元素来测量文本宽度
  const testElem = document.createElement('span')
  testElem.style.visibility = 'hidden'
  testElem.style.position = 'absolute'
  testElem.style.whiteSpace = 'nowrap'
  testElem.style.font = window.getComputedStyle(inputElement).font
  testElem.innerText = inputValue.value || props.placeholder
  document.body.appendChild(testElem)

  // 计算文本宽度与输入框可用宽度的比例
  const textWidth = testElem.offsetWidth
  const availableWidth = inputElement.offsetWidth

  document.body.removeChild(testElem)

  if (textWidth > availableWidth * 0.8 && currentMode.value === 'single') {
    isAutoSwitching.value = true
    currentMode.value = 'multiple'

    // 在过渡结束后重新聚焦并设置光标位置
    nextTick(() => {
      setTimeout(() => {
        if (inputRef.value) {
          const input = document.querySelector('.tiny-textarea__inner') as HTMLInputElement
          if (input) {
            const pos = inputValue.value.length
            input.focus()
            input.setSelectionRange(pos, pos)
          }
        }
        isAutoSwitching.value = false
      }, 300) // 与CSS过渡时间匹配
    })
  }
}

// 清空功能增强：同时处理模板和普通输入，并退出模板编辑模式
const clearInput = () => {
  // 调用原始清空方法
  originalClearInput()

  // 如果是自动切换的模式，清空时恢复单行模式
  if (currentMode.value !== props.mode) {
    currentMode.value = props.mode
  }

  // 如果当前是模板编辑模式，需要退出模板编辑模式
  if (props.template) {
    // 发出一个模板重置事件，通知父组件清除模板
    emit('reset-template')
  }
}

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

// 模板相关处理
const handleTemplateInput = (value: string) => {
  inputValue.value = value
  emit('update:modelValue', value)
}

// 激活第一个模板字段
const activateTemplateFirstField = () => {
  if (templateEditorRef.value) {
    templateEditorRef.value.activateFirstField()
  }
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
  currentMode,
  setMultipleMode,
)

// 处理焦点事件
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const currentType = computed(() => (currentMode.value === 'multiple' ? 'textarea' : 'text'))

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
const hasContent = computed(() => (props.hasContent !== undefined ? props.hasContent : !!inputValue.value))

// 样式类
const senderClasses = computed(() => ({
  'is-disabled': isDisabled.value,
  'is-loading': isLoading.value,
  'has-error': !!errorMessage.value,
  'is-auto-switching': isAutoSwitching.value,
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
  // 当输入内容变化时检查是否需要切换模式
  nextTick(checkInputOverflow)
  if (inputValue.value === '') {
    currentMode.value = 'single'
  }
})

// 暴露方法
defineExpose({
  focus: () => {
    if (showTemplateEditor.value && templateEditorRef.value) {
      activateTemplateFirstField()
    } else if (inputRef.value) {
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
  activateTemplateFirstField,
})
</script>

<template>
  <div class="tiny-sender" :class="[senderClasses, `theme-${theme}`, `mode-${currentMode}`]" :data-theme="theme">
    <!-- 输入区域容器 -->
    <div class="tiny-sender__container">
      <div class="tiny-sender__input-wrapper" ref="inputWrapperRef">
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
          <div class="tiny-sender__content-area">
            <!-- 模板编辑器 -->
            <template v-if="showTemplateEditor">
              <TemplateEditor
                ref="templateEditorRef"
                :template="template"
                :value="inputValue"
                @update:value="handleTemplateInput"
                @input="handleTemplateInput"
              />
            </template>
            <!-- 普通输入框 -->
            <tiny-input
              v-else
              ref="inputRef"
              :autosize="autoSize"
              :type="currentType"
              :readonly="isLoading"
              resize="none"
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
              @input="nextTick(checkInputOverflow)"
            />
          </div>

          <!-- 操作区域/后置插槽 -->
          <div v-if="currentMode === 'single'" class="tiny-sender__actions-slot">
            <div class="tiny-sender__buttons-container">
              <slot name="actions" />
              <action-buttons
                class="inline-buttons"
                :allow-speech="allowSpeech"
                :allow-files="allowFiles"
                :loading="loading"
                :disabled="isDisabled"
                :show-clear="clearable"
                :has-content="hasContent"
                :speech-status="speechState"
                :submit-type="submitType"
                @clear="clearInput"
                @toggle-speech="toggleSpeech"
                @submit="triggerSubmit"
                @cancel="$emit('cancel')"
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
            v-else-if="currentMode !== 'single' || (showWordLimit && maxLength !== Infinity)"
            :style="justifyContent"
            class="tiny-sender__footer-slot tiny-sender__bottom-row"
          >
            <!-- 字数限制 -->
            <div v-if="showWordLimit && maxLength !== Infinity" class="tiny-sender__word-limit">
              {{ inputValue.length }}/{{ maxLength }}
            </div>

            <!-- 多行模式下的操作按钮 -->
            <div v-if="currentMode === 'multiple'" class="tiny-sender__toolbar">
              <div class="tiny-sender__buttons-container">
                <action-buttons
                  :allow-speech="allowSpeech"
                  :allow-files="allowFiles"
                  :loading="loading"
                  :disabled="isDisabled"
                  :show-clear="clearable"
                  :has-content="hasContent"
                  :speech-status="speechState"
                  :submit-type="submitType"
                  @clear="clearInput"
                  @toggle-speech="toggleSpeech"
                  @submit="triggerSubmit"
                  @cancel="$emit('cancel')"
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
