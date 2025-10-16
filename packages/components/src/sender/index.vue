<script setup lang="ts">
import { computed, ref, watch, nextTick, useSlots } from 'vue'
import { TinyInput } from '@opentiny/vue'
import { useFileDialog } from '@vueuse/core'
import type { SenderProps, SenderEmits, InputHandler, KeyboardHandler, UserItem } from './index.type'
import { useInputHandler } from './composables/useInputHandler'
import { useKeyboardHandler } from './composables/useKeyboardHandler'
import { useSpeechHandler } from './composables/useSpeechHandler'
import { useSuggestionHandler } from './composables/useSuggestionHandler'
import ActionButtons from './components/ActionButtons.vue'
import TemplateEditor from './components/TemplateEditor.vue'
import SuggestionList from './components/SuggestionList.vue'
import { toCssUnit } from '../shared/utils'

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
  templateData: () => [],
  suggestions: () => [],
  suggestionPopupWidth: 400,
  stopText: '',
})

const emit = defineEmits<SenderEmits>()

// 输入区域元素引用
const inputRef = ref<HTMLElement | null>(null)
const senderRef = ref<HTMLElement | null>(null)
const templateEditorRef = ref<InstanceType<typeof TemplateEditor> | null>(null)
const inputWrapperRef = ref<HTMLElement | null>(null)
const buttonsContainerRef = ref<HTMLElement | null>(null)

// 是否显示模板编辑器
const showTemplateEditor = computed(() => props.templateData && props.templateData.length > 0)

// 输入控制
const { inputValue, isComposing, clearInput: originalClearInput }: InputHandler = useInputHandler(props, emit)

const hasContent = computed(() => !!inputValue.value.trim())

// 统一的提交条件验证
const canSubmit = computed(() => {
  // 基础状态检查：禁用或加载中时不能提交
  if (props.disabled || props.loading) {
    return false
  }

  // 内容检查：空内容不能提交
  if (!hasContent.value) {
    return false
  }

  // 字数限制检查：超出限制时不能提交
  if (isOverLimit.value) {
    return false
  }

  // 提交按钮禁用检查：禁用时不能提交
  if (props.buttonGroup?.submit?.disabled) {
    return false
  }

  return true
})

// 建议处理
const {
  isPopupVisible,
  activeSuggestion,
  activeKeyboardIndex,
  activeMouseIndex,
  autoCompleteText,
  showTabIndicator,
  syncAutoComplete,
  closePopup,
  applySuggestion,
  confirmSelection,
  navigateWithKeyboard,
  handleMouseEnter,
  handleMouseLeave,
} = useSuggestionHandler(
  computed(() => props.suggestions),
  inputValue,
  isComposing,
  showTemplateEditor,
  (value) => emit('update:modelValue', value),
  (value) => emit('suggestion-select', value),
)

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

  // 使用组件内部的ref来精确定位元素，避免全局选择器问题
  if (!senderRef.value || !inputWrapperRef.value) return

  // 从当前组件实例的DOM树中查找目标元素
  const parentElement = senderRef.value.querySelector('.tiny-sender__content-area') as HTMLElement
  if (!parentElement) return

  // 获取输入元素
  const inputElement =
    inputRef.value?.querySelector?.('.tiny-input__inner') ||
    (parentElement.querySelector('.tiny-input__inner') as HTMLElement)

  // 获取按钮容器元素
  const buttonsElement =
    buttonsContainerRef.value || (senderRef.value.querySelector('.tiny-sender__buttons-container') as HTMLElement)

  if (!inputElement) {
    console.warn('Cannot find input element for overflow check')
    return
  }

  // 确保元素已完全渲染并获取准确的宽度
  // 使用getBoundingClientRect获取更准确的尺寸信息
  const inputRect = inputElement.getBoundingClientRect()
  const buttonsRect = buttonsElement?.getBoundingClientRect()

  // 如果元素宽度为0，说明还未完全渲染，延迟检查
  if (inputRect.width === 0) {
    setTimeout(() => checkInputOverflow(), 50)
    return
  }

  // 获取输入框的字体样式
  const fontStyle = window.getComputedStyle(inputElement).font

  // 计算文本宽度
  const textWidth = calculateTextWidth(inputValue.value, fontStyle)

  // 根据是否有紧凑类动态调整固定边距
  const hasCompactClass = senderRef.value?.classList.contains('tr-sender-compact')
  const dynamicMargin = hasCompactClass ? 12 : 20

  // 使用getBoundingClientRect获取更精确的宽度
  const inputWidth = inputRect.width
  const buttonsWidth = buttonsRect?.width || 0

  // 计算可用宽度（输入框宽度减去按钮区域宽度再减去动态边距）
  const availableWidth = inputWidth - buttonsWidth - dynamicMargin

  // 添加最小阈值检查，避免在极小宽度下误触发
  const minThreshold = hasCompactClass ? 50 : 80

  // 判断是否需要切换到多行模式
  if (textWidth > availableWidth && availableWidth > minThreshold && currentMode.value === 'single') {
    isAutoSwitching.value = true
    currentMode.value = 'multiple'

    // 在切换模式时保留原始文本格式
    nextTick(() => {
      if (inputRef.value) {
        setTimeout(() => {
          // 使用组件作用域查找textarea
          const textareaElement = senderRef.value?.querySelector('.tiny-textarea__inner') as HTMLInputElement
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

// 通用聚焦函数
const focusInput = () => {
  if (showTemplateEditor.value && templateEditorRef.value) {
    activateTemplateFirstField()
  } else if (inputRef.value) {
    inputRef.value.focus()
  } else {
    // 如果ref还没有准备好，直接通过DOM查找
    const input = document.querySelector('.tiny-input__inner') as HTMLInputElement
    input?.focus()
  }
}

const blurInput = () => {
  if (inputRef.value) {
    inputRef.value.blur()
  } else {
    const input = document.querySelector('.tiny-input__inner') as HTMLInputElement
    input?.blur()
  }
}

const exitTemplateMode = () => {
  emit('update:templateData', [])
  templateEditorRef.value?.clearHistory()
  nextTick(() => {
    if (inputValue.value === '') {
      currentMode.value = props.mode || 'single'
    }
    // 确保在DOM完全更新后聚焦到普通输入框
    // 使用setTimeout确保Vue组件完全重新渲染和ref更新
    setTimeout(() => {
      focusInput()
    }, 50)
  })
}

// 清空功能增强：同时处理模板和普通输入，并退出模板编辑模式
const clearInput = () => {
  originalClearInput()

  // 如果当前是模板编辑模式，退出模板编辑模式（已包含聚焦逻辑）
  if (showTemplateEditor.value) {
    exitTemplateMode()
  } else {
    // 普通模式下直接聚焦
    senderRef.value?.focus()
  }

  // 确保DOM更新后再次检查
  nextTick(() => {
    if (inputValue.value === '') {
      currentMode.value = props.mode || 'single'
    }
  })
}

const handleTemplateUpdate = (data: UserItem[]) => {
  const isEmptyTextNode = (node: UserItem) => node.type === 'text' && node.content === '\u200B'
  const isTemplateEmpty = data.length === 0 || data.every(isEmptyTextNode)

  // 如果模板数据为空，则退出模板编辑模式
  if (isTemplateEmpty) {
    exitTemplateMode()
    return
  }

  emit('update:templateData', data)
}

watch(
  () => props.templateData,
  () => {
    inputValue.value = props.templateData.map((item) => item.content).join('')
  },
  { deep: true },
)

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

// 处理语音按钮点击事件
const handleVoiceButtonClick = async () => {
  const speechConfig = typeof props.speech === 'object' ? props.speech : {}
  const isRecording = speechState.isRecording

  // 如果配置了拦截器，先调用拦截器
  if (speechConfig.onVoiceButtonClick) {
    let defaultPrevented = false

    try {
      await speechConfig.onVoiceButtonClick(isRecording, () => {
        defaultPrevented = true
      })
    } catch (error) {
      console.error('语音按钮点击拦截器执行失败:', error)
    }

    // 如果调用了 preventDefault，不执行默认逻辑
    if (defaultPrevented) {
      return
    }
  }

  // 执行默认的切换逻辑
  toggleSpeech()
}

// 计算字数是否超出限制
const isOverLimit = computed(() => {
  return props.maxLength !== Infinity && inputValue.value.length > props.maxLength
})

// 键盘处理
const { handleKeyPress, triggerSubmit }: KeyboardHandler = useKeyboardHandler(
  props,
  emit,
  inputValue,
  isComposing,
  speechState,
  isPopupVisible,
  activeSuggestion,
  confirmSelection,
  closePopup,
  navigateWithKeyboard,
  toggleSpeech,
  canSubmit,
  currentMode,
  setMultipleMode,
  showTemplateEditor,
  exitTemplateMode,
)

// 处理焦点事件
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
  // 当有输入内容且有匹配的联想项时，显示联想弹窗但不自动选中任何项
  if (inputValue.value && !showTemplateEditor.value) {
    isPopupVisible.value = true
  }
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
  // 失焦时关闭联想弹窗
  closePopup()
}

const currentType = computed(() => (currentMode.value === 'multiple' ? 'textarea' : 'text'))

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

// 样式类
const senderClasses = computed(() => ({
  'is-disabled': isDisabled.value,
  'is-loading': isLoading.value,
  'is-auto-switching': isAutoSwitching.value,
}))

// 联想建议弹窗宽度样式
const suggestionPopupWidthStyle = computed(() => {
  const width = toCssUnit(props.suggestionPopupWidth)
  return {
    width: width,
    maxWidth: '100%', // 确保不超出父容器宽度
  }
})

// 输入法结束处理
const handleCompositionEnd = () => {
  isComposing.value = false
}

// 监听输入变化
watch(inputValue, () => {
  // 当输入内容变化时检查是否需要切换模式
  nextTick(checkInputOverflow)

  if (inputValue.value === '' && props.mode === 'single') {
    currentMode.value = 'single'
  }

  syncAutoComplete()
})

// 监听模板编辑器显示状态
watch(
  () => showTemplateEditor.value,
  (val) => {
    if (val) {
      currentMode.value = 'multiple'
    }
  },
)

// 激活第一个模板字段
const activateTemplateFirstField = () => {
  if (templateEditorRef.value) {
    templateEditorRef.value.activateFirstField()
  }
}

const { accept = '*', multiple = true, reset = true } = props.buttonGroup?.file || {}

const { open: openFileDialog, files } = useFileDialog({ accept, multiple, reset })

watch(files, (selectedFiles) => {
  if (selectedFiles && selectedFiles.length > 0) {
    emit('files-selected', Array.from(selectedFiles))
  }
})

// 暴露方法
defineExpose({
  focus: focusInput,
  blur: blurInput,
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
            <slot name="content">
              <div v-if="$slots.decorativeContent" class="tiny-sender__decorative-content">
                <slot name="decorativeContent"></slot>
              </div>

              <!-- 模板编辑器 -->
              <template v-if="showTemplateEditor">
                <TemplateEditor
                  ref="templateEditorRef"
                  :model-value="props.templateData"
                  @update:model-value="handleTemplateUpdate"
                  @submit="triggerSubmit"
                />
              </template>
              <!-- 普通输入框 -->
              <div v-else class="tiny-sender__input-field-wrapper">
                <tiny-input
                  ref="inputRef"
                  :autosize="autoSize"
                  :type="currentType"
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
                <div v-if="autoCompleteText && !isComposing" class="tiny-sender__completion-placeholder">
                  <span class="user-input-mirror">{{ inputValue }}</span>
                  {{ autoCompleteText }}
                  <!-- Tab Hint -->
                  <div v-if="showTabIndicator" class="tiny-sender__tab-hint">TAB</div>
                </div>
              </div>
            </slot>
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
                :button-group="buttonGroup"
                :submit-type="submitType"
                :is-over-limit="isOverLimit"
                :stop-text="stopText"
                @clear="clearInput"
                @voice-button-click="handleVoiceButtonClick"
                @submit="triggerSubmit"
                @cancel="$emit('cancel')"
                @trigger-select="openFileDialog"
              />
            </div>
          </div>
        </div>

        <!-- 底部插槽 - 底部工具栏作为默认内容 -->
        <Transition name="tiny-sender-slide-up">
          <div v-if="currentMode === 'multiple'" class="tiny-sender__footer-slot tiny-sender__bottom-row">
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
                    :button-group="buttonGroup"
                    :submit-type="submitType"
                    :is-over-limit="isOverLimit"
                    :stop-text="stopText"
                    @clear="clearInput"
                    @voice-button-click="handleVoiceButtonClick"
                    @submit="triggerSubmit"
                    @cancel="$emit('cancel')"
                    @trigger-select="openFileDialog"
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
    <suggestion-list
      :show="isPopupVisible"
      :suggestions="suggestions"
      :popup-style="suggestionPopupWidthStyle"
      :active-keyboard-index="activeKeyboardIndex"
      :active-mouse-index="activeMouseIndex"
      :input-value="inputValue"
      @select="applySuggestion"
      @mouse-enter="handleMouseEnter"
      @mouse-leave="handleMouseLeave"
    />
  </div>
</template>

<style lang="less">
// 主题变量
:root {
  // 基础颜色
  --tr-sender-bg-color: var(--tr-container-bg-default);
  --tr-sender-text-color: var(--tr-text-primary);
  --tr-sender-placeholder-color: var(--tr-text-tertiary);

  // 基础字号、行高、高度
  --tr-sender-input-font-size: 16px;
  --tr-sender-input-line-height: 26px;
  --tr-sender-input-height: 26px;

  // 最小高度配置
  --tr-sender-container-min-height: 42px;
  --tr-sender-textarea-min-height: 26px;
  --tr-sender-textarea-line-height: 26px;

  // 基本圆角、图标大小
  --tr-sender-input-radius: 26px;
  --tr-sender-border-radius: 26px;
  --tr-sender-send-icon-size: 36px;
  --tr-action-buttons-cancel-height: 36px;

  // 动画
  --tr-sender-transition-duration: 0.2s;

  // 阴影
  --tr-sender-box-shadow: 0 4px 16px 0px rgba(0, 0, 0, 0.08);

  // 插槽变量
  // 头部插槽 (Header)
  --tr-sender-header-min-height: 40px;
  --tr-sender-header-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --tr-sender-header-bg-color: var(--tr-container-bg-default);

  // 前缀插槽 (Prefix)
  --tr-sender-prefix-min-width: 28px;
  --tr-sender-prefix-hover-bg: #f5f5f5;

  // 内容区域 (Content)
  --tr-sender-content-min-width: 180px;
  --tr-sender-content-flex-grow: 1;

  // 操作区域 (Actions)
  --tr-sender-actions-min-width: 32px;
  --tr-sender-actions-icon-size: 20px;

  // 底部插槽 (Footer)
  --tr-sender-footer-min-height: 36px;
  --tr-sender-footer-bg: var(--tr-container-bg-default);
  --tr-sender-footer-hover: #f9f9f9;

  // 字数限制
  --tr-sender-word-limit-error-color: #f23030;
  --tr-sender-word-limit-color: #808080;
  --tr-sender-word-limit-font-size: 14px;

  // 消息装饰提示内容
  --tr-sender-decorative-content-bg-color: #ffffff;
  --tr-sender-decorative-content-color: #808080;
  --tr-sender-decorative-content-link-color: #1476ff;
  --tr-sender-decorative-content-line-height: 26px;

  // 自动完成占位符
  --tr-sender-completion-placeholder-color: #999;
  --tr-sender-completion-placeholder-font-size: 16px;
  --tr-sender-completion-placeholder-line-height: 16px;

  // Tab提示
  --tr-sender-tab-hint-font-size: 14px;
  --tr-sender-tab-hint-color: #666;
  --tr-sender-tab-hint-border-color: #999;

  // 快捷提示
  --tr-sender-shortcut-hint-color: #909399;
  --tr-sender-shortcut-hint-font-size: 10px;

  // gap
  --tr-sender-gap: 8px;

  // padding
  --tr-sender-padding: 15px 10px 10px 24px;
  --tr-sender-prefix-padding: 12px 8px 0 16px;
  --tr-sender-content-padding-with-prefix: 12px 16px 0 0;
  --tr-sender-content-padding-single: 15px 10px 15px 20px;
  --tr-sender-content-padding-multiple: 16px 20px 0 20px;
  --tr-sender-actions-padding: 0 10px;
  --tr-sender-actions-padding-right: 10px;
  --tr-sender-bottom-row-padding: 12px 10px 10px 10px;
}
</style>

<style lang="less">
.tr-sender-compact {
  // 覆盖字体和行高
  --tr-sender-input-font-size: 14px;
  --tr-sender-input-line-height: 24px;
  --tr-sender-input-height: 24px;
  --tr-sender-textarea-min-height: 24px;

  // 覆盖圆角和图标尺寸
  --tr-sender-input-radius: 24px;
  --tr-sender-border-radius: 24px;

  // 覆盖内边距
  --tr-sender-content-padding-single: 12px 8px 12px 20px;
  --tr-sender-content-padding-multiple: 14px 20px 0 20px;
  --tr-sender-prefix-padding: 8px 4px 12px 8px;
  --tr-sender-actions-padding-right: 8px;
  --tr-sender-bottom-row-padding: 10px 8px 10px 8px;

  // 覆盖Footer高度
  --tr-sender-footer-min-height: 32px;

  // 覆盖Decorative Content行高
  --tr-sender-decorative-content-line-height: 24px;

  // 调整其他元素尺寸
  --tr-sender-gap: 4px;
  --tr-sender-container-min-height: 32px;
}
</style>

<style lang="less" scoped>
@import url('./index.less');
</style>
