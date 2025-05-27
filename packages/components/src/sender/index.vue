<script setup lang="ts">
import { computed, ref, watch, nextTick, useSlots } from 'vue'
import TinyInput from '@opentiny/vue-input'
import type { SenderProps, SenderEmits, InputHandler, KeyboardHandler } from './index.type'
import { useInputHandler } from './composables/useInputHandler'
import { useKeyboardHandler } from './composables/useKeyboardHandler'
import { useSpeechHandler } from './composables/useSpeechHandler'
import { useSuggestionHandler } from './composables/useSuggestionHandler'
import ActionButtons from './components/ActionButtons.vue'
import TemplateEditor from './components/TemplateEditor.vue'
import { IconAssociate } from '@opentiny/tiny-robot-svgs'
import './index.less'

const props = withDefaults(defineProps<SenderProps>(), {
  autofocus: false,
  autoSize: () => ({ minRows: 1, maxRows: 3 }),
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
  suggestions: () => [],
})

const emit = defineEmits<SenderEmits>()

// 输入区域元素引用
const inputRef = ref<HTMLElement | null>(null)
const senderRef = ref<HTMLElement | null>(null)
const templateEditorRef = ref<InstanceType<typeof TemplateEditor> | null>(null)
const inputWrapperRef = ref<HTMLElement | null>(null)
const buttonsContainerRef = ref<HTMLElement | null>(null)

// 是否显示模板编辑器
const showTemplateEditor = computed(() => !!props.template)

// 输入控制
const { inputValue, isComposing, clearInput: originalClearInput }: InputHandler = useInputHandler(props, emit)

// 建议处理
const {
  showSuggestionsPopup,
  highlightedIndex,
  completionPlaceholder,
  showTabHint,
  suggestionsListRef,
  filteredSuggestions,
  activeSuggestion,
  updateCompletionPlaceholder,
  selectSuggestion,
  acceptCurrentSuggestion,
  closeSuggestionsPopup,
  navigateSuggestions,
  handleSuggestionItemHover,
} = useSuggestionHandler(props, emit, inputValue, isComposing)

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
          // 确保textarea的white-space属性正确设置
          textareaElement.style.whiteSpace = 'pre-wrap'
          const pos = inputValue.value.length
          textareaElement.focus()
          textareaElement.setSelectionRange(pos, pos)
        }
      }, 50)
    })
  }
}

// 计算文本宽度的辅助函数
const calculateTextWidth = (text: string, fontStyle: string): number => {
  // 创建一个临时元素来测量文本宽度
  const testElem = document.createElement('span')
  testElem.style.visibility = 'hidden'
  testElem.style.position = 'absolute'
  testElem.style.whiteSpace = 'nowrap'
  testElem.style.font = fontStyle
  // 使用textContent而不是innerText，保留空格的原始形式
  testElem.textContent = text
  document.body.appendChild(testElem)

  const width = testElem.offsetWidth
  document.body.removeChild(testElem)

  return width
}

// 检测输入是否溢出的函数
const checkInputOverflow = () => {
  // 如果不是单行模式或正在自动切换中，则直接返回
  if (props.mode !== 'single' || !inputRef.value || isAutoSwitching.value) return

  // 指定父级元素 - 避免存在多个父级元素
  const parentElement = document.querySelector('.tiny-sender__content-area') as HTMLElement

  // 获取输入元素
  const inputElement = parentElement.querySelector('.tiny-input__inner') as HTMLElement

  // 获取按钮容器元素
  const buttonsElement =
    buttonsContainerRef.value || (document.querySelector('.tiny-sender__buttons-container') as HTMLElement)

  if (!inputElement) return

  // 获取输入框的字体样式
  const fontStyle = window.getComputedStyle(inputElement).font

  // 计算文本宽度
  const textWidth = calculateTextWidth(inputValue.value, fontStyle)

  // 计算可用宽度（输入框宽度减去按钮区域宽度再减去固定边距）
  const fixedMargin = 20
  const availableWidth = inputElement.offsetWidth - (buttonsElement?.offsetWidth || 0) - fixedMargin

  // 判断是否需要切换到多行模式
  if (textWidth > availableWidth && currentMode.value === 'single') {
    isAutoSwitching.value = true
    currentMode.value = 'multiple'

    // 在切换模式时保留原始文本格式
    nextTick(() => {
      if (inputRef.value) {
        setTimeout(() => {
          const textareaElement = document.querySelector('.tiny-textarea__inner') as HTMLInputElement
          if (textareaElement) {
            // 确保textarea的white-space属性正确设置
            textareaElement.style.whiteSpace = 'pre-wrap'
            const pos = inputValue.value.length
            textareaElement.focus()
            textareaElement.setSelectionRange(pos, pos)
          }
          isAutoSwitching.value = false
        }, 300)
      } else {
        isAutoSwitching.value = false
      }
    })
  }
}

// 清空功能增强：同时处理模板和普通输入，并退出模板编辑模式
const clearInput = () => {
  originalClearInput()

  // 如果当前是模板编辑模式，需要退出模板编辑模式
  if (props.template) {
    emit('reset-template')
  }

  // 确保DOM更新后再次检查
  nextTick(() => {
    if (inputValue.value === '') {
      currentMode.value = props.mode || 'single'
    }
  })
  closeSuggestionsPopup()
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
const speechOptions = computed(() => {
  const speechConfig = typeof props.speech === 'object' ? props.speech : {}
  return {
    ...speechConfig,
    onStart: () => emit('speech-start'),
    onEnd: (transcript?: string) => emit('speech-end', transcript),
    onInterim: (transcript: string) => emit('speech-interim', transcript),
    onFinal: (text: string) => {
      // 根据 autoReplace 选项决定是追加还是替换文本
      // 默认为追加模式（autoReplace = false）
      if (speechConfig.autoReplace) {
        // 替换模式：直接覆盖现有内容
        inputValue.value = text
      } else {
        // 追加模式：将识别结果追加到现有内容
        // 智能空格处理：如果当前内容末尾和识别结果开头都不是空格，自动添加空格
        const currentText = inputValue.value
        if (currentText && text && !currentText.endsWith(' ') && !text.startsWith(' ') && currentText.length > 0) {
          inputValue.value = currentText + ' ' + text
        } else {
          inputValue.value = currentText + text
        }
      }
      emit('speech-end', text)
    },
    onError: (err: Error) => {
      showError(err.message)
      emit('speech-error', err)
    },
  }
})

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
  showSuggestionsPopup,
  activeSuggestion,
  acceptCurrentSuggestion,
  closeSuggestionsPopup,
  navigateSuggestions,
  toggleSpeech,
  currentMode,
  setMultipleMode,
)

// 处理焦点事件
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
  if (inputValue.value && filteredSuggestions.value.length > 0 && !props.template) {
    showSuggestionsPopup.value = true
    showTabHint.value = true
    if (highlightedIndex.value === -1) highlightedIndex.value = 0
    updateCompletionPlaceholder(activeSuggestion.value || filteredSuggestions.value[0])
  }
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

type SlotsType = {
  decorativeContent?: () => boolean
  [key: string]: (() => any) | undefined // eslint-disable-line
}
const slots = useSlots() as SlotsType

// 检查是否有decorativeContent插槽
const hasDecorativeContent = computed(() => !!slots.decorativeContent)

// 状态计算
const isDisabled = computed((): boolean => props.disabled || hasDecorativeContent.value)
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
  setTimeout(() => {
    isComposing.value = false
    if (inputValue.value && props.suggestions && props.suggestions.length > 0 && !props.template) {
      showSuggestionsPopup.value = filteredSuggestions.value.length > 0
      if (showSuggestionsPopup.value) {
        highlightedIndex.value = 0
        updateCompletionPlaceholder()
        showTabHint.value = true
      }
    }
  }, 50)
}

// 计算字数是否超出限制
const isOverLimit = computed(() => {
  return props.maxLength !== Infinity && inputValue.value.length > props.maxLength
})

// 监听输入变化
watch(inputValue, () => {
  // 当输入内容变化时检查是否需要切换模式
  nextTick(checkInputOverflow)

  if (inputValue.value === '' && props.mode === 'single') {
    currentMode.value = 'single'
  }
})

watch(
  () => showTemplateEditor.value,
  (val) => {
    if (val) {
      currentMode.value = 'multiple'
    }
  },
)

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
  <div
    ref="senderRef"
    class="tiny-sender"
    :class="[senderClasses, `theme-${theme}`, `mode-${currentMode}`]"
    :data-theme="theme"
  >
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
            <div v-if="$slots.decorativeContent" class="tiny-sender__decorative-content">
              <slot name="decorativeContent"></slot>
            </div>

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
            <div v-else class="tiny-sender__input-field-wrapper">
              <tiny-input
                ref="inputRef"
                :autosize="autoSize"
                :type="currentType"
                :readonly="isLoading"
                resize="none"
                v-model="inputValue"
                :disabled="isDisabled"
                :placeholder="placeholder"
                :autofocus="autofocus"
                @keydown="handleKeyPress"
                @compositionstart="isComposing = true"
                @compositionend="handleCompositionEnd"
                @focus="handleFocus"
                @blur="handleBlur"
              />
              <!-- 补全提示词 -->
              <div v-if="completionPlaceholder" class="tiny-sender__completion-placeholder">
                <span class="user-input-mirror">{{ inputValue }}</span
                >{{ completionPlaceholder }}

                <!-- Tab Hint -->
                <div v-if="showTabHint" class="tiny-sender__tab-hint">TAB</div>
              </div>
            </div>
          </div>

          <!-- 操作区域/后置插槽 -->
          <div v-if="currentMode === 'single'" class="tiny-sender__actions-slot">
            <div class="tiny-sender__buttons-container" ref="buttonsContainerRef">
              <slot name="actions" />
              <action-buttons
                :allow-speech="allowSpeech"
                :allow-files="allowFiles"
                :loading="loading"
                :disabled="isDisabled"
                :show-clear="clearable"
                :has-content="hasContent"
                :speech-status="speechState"
                :submit-type="submitType"
                :is-over-limit="isOverLimit"
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
          <div
            v-if="currentMode === 'multiple'"
            :style="justifyContent"
            class="tiny-sender__footer-slot tiny-sender__bottom-row"
          >
            <!-- 底部左侧区域 -->
            <div class="tiny-sender__footer-left">
              <!-- 左侧自定义插槽 -->
              <slot name="footer-left"></slot>
            </div>

            <!-- 底部右侧区域 -->
            <div class="tiny-sender__footer-right">
              <!-- 右侧自定义插槽 -->
              <slot name="footer-right"></slot>

              <!-- 字数限制 -->
              <div
                v-if="showWordLimit && maxLength !== Infinity"
                class="tiny-sender__word-limit"
                :class="{ 'is-over-limit': isOverLimit }"
              >
                <span class="real-word-length">{{ inputValue.length }}</span
                >/{{ maxLength }}
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
                    :is-over-limit="isOverLimit"
                    @clear="clearInput"
                    @toggle-speech="toggleSpeech"
                    @submit="triggerSubmit"
                    @cancel="$emit('cancel')"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 完全自定义的底部插槽（向后兼容） -->
          <div v-else-if="$slots.footer" class="tiny-sender__footer-slot">
            <slot name="footer"></slot>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 输入建议 -->
    <Transition name="tiny-sender-slide-up">
      <div
        v-if="showSuggestionsPopup && filteredSuggestions.length"
        ref="suggestionsListRef"
        class="tiny-sender__suggestions"
      >
        <div
          v-for="(item, index) in filteredSuggestions"
          :key="index"
          class="suggestion-item"
          :class="{ highlighted: index === highlightedIndex }"
          @mouseenter="handleSuggestionItemHover(index)"
          @mousedown.prevent="selectSuggestion(item)"
        >
          <span class="suggestion-item__icon"><IconAssociate /></span>
          <span class="suggestion-item__text">{{ item }}</span>
        </div>
      </div>
    </Transition>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="tiny-sender__error">
      {{ errorMessage }}
    </div>
  </div>
</template>
