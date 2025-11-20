<script setup lang="ts">
import { computed, provide, ref, toRef } from 'vue'
import { ChatInputProps, ChatInputEmits, InputMode } from './index.type'
import { CHAT_INPUT_CONTEXT_KEY } from './constants'
import { ChatInputContext } from './context/types'
import { useEditor } from './composables/useEditor'
import EditorContent from './components/editor-content/index.vue'
import SubmitButton from './components/submit-button/index.vue'
import ClearButton from './components/clear-button/index.vue'
import Footer from './components/footer/index.vue'

const props = withDefaults(defineProps<ChatInputProps>(), {
  placeholder: '请输入内容...',
  disabled: false,
  loading: false,
  autofocus: false,
  mode: 'single',
  showWordLimit: false,
  clearable: false,
  allowSpeech: false,
  allowFiles: false,
  submitType: 'enter',
  theme: 'light',
})

const emit = defineEmits<ChatInputEmits>()

// 初始化编辑器
const { editor, editorRef } = useEditor(props, emit)

// 状态计算
const mode = ref<InputMode>(props.mode)
const hasContent = computed(() => {
  if (!editor.value) return false
  return !editor.value.isEmpty
})

const characterCount = computed(() => {
  if (!editor.value) return 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storage = editor.value.storage as any
  return storage.characterCount?.characters?.() || 0
})

const isOverLimit = computed(() => {
  if (!props.maxLength) return false
  return characterCount.value > props.maxLength
})

const canSubmit = computed(() => {
  return (
    !props.disabled && !props.loading && hasContent.value && !isOverLimit.value && !props.buttonGroup?.submit?.disabled
  )
})

// 语音状态（简化版）
const speechState = ref({
  isRecording: false,
  isSupported: false,
})

// 方法实现
const submit = () => {
  if (!canSubmit.value) return
  const content = editor.value?.getHTML() || ''
  emit('submit', content)
}

const clear = () => {
  editor.value?.commands.clearContent()
  emit('clear')
}

const focus = () => {
  editor.value?.commands.focus()
}

const blur = () => {
  editor.value?.commands.blur()
}

const setContent = (content: string) => {
  editor.value?.commands.setContent(content)
}

const getContent = () => {
  return editor.value?.getHTML() || ''
}

const startSpeech = () => {
  // TODO: 实现语音识别
  console.log('startSpeech')
}

const stopSpeech = () => {
  // TODO: 实现语音识别
  console.log('stopSpeech')
}

const openFileDialog = () => {
  // TODO: 实现文件上传
  console.log('openFileDialog')
}

const insertTemplate = () => {
  // TODO: 实现模板插入
  console.log('insertTemplate')
}

const exitTemplateMode = () => {
  // TODO: 实现退出模板模式
  console.log('exitTemplateMode')
}

const setMode = (newMode: InputMode) => {
  mode.value = newMode
}

// 提供 Context
const context: ChatInputContext = {
  editor,
  editorRef,
  mode,
  loading: toRef(props, 'loading'),
  disabled: toRef(props, 'disabled'),
  hasContent,
  canSubmit,
  isOverLimit,
  characterCount,
  maxLength: toRef(props, 'maxLength'),
  speechState,
  showWordLimit: toRef(props, 'showWordLimit'),
  clearable: toRef(props, 'clearable'),
  allowSpeech: toRef(props, 'allowSpeech'),
  allowFiles: toRef(props, 'allowFiles'),
  buttonGroup: toRef(props, 'buttonGroup'),
  submitType: toRef(props, 'submitType'),
  stopText: toRef(props, 'stopText'),
  submit,
  clear,
  focus,
  blur,
  setContent,
  getContent,
  startSpeech,
  stopSpeech,
  openFileDialog,
  insertTemplate,
  exitTemplateMode,
  setMode,
}

provide(CHAT_INPUT_CONTEXT_KEY, context)

// 暴露方法给外部
defineExpose({
  submit,
  clear,
  focus,
  blur,
  setContent,
  getContent,
  editor,
})
</script>

<template>
  <div :class="['tr-chat-input', `tr-chat-input--${mode}`, `tr-chat-input--${theme}`]">
    <!-- Header 插槽 -->
    <div v-if="$slots.header" class="tr-chat-input-header">
      <slot name="header" />
    </div>

    <!-- 输入行 -->
    <div class="tr-chat-input-main">
      <!-- Prefix 插槽 -->
      <div v-if="$slots.prefix" class="tr-chat-input-prefix">
        <slot name="prefix" />
      </div>

      <!-- 编辑器内容 -->
      <div class="tr-chat-input-content">
        <slot name="content" :editor="editor">
          <EditorContent />
        </slot>
      </div>

      <!-- 单行模式操作按钮 -->
      <div v-if="mode === 'single'" class="tr-chat-input-actions-inline">
        <slot name="actions-inline">
          <ClearButton />
          <SubmitButton />
        </slot>
      </div>
    </div>

    <!-- 底部区域（多行模式） -->
    <Footer>
      <template #footer>
        <slot name="footer" />
      </template>
      <template #footer-right>
        <slot name="footer-right" />
      </template>
    </Footer>
  </div>
</template>

<style lang="less">
:root {
  // 基础颜色
  --tr-chat-input-bg-color: var(--tr-container-bg-default, #ffffff);
  --tr-chat-input-text-color: var(--tr-text-primary, #000000);
  --tr-chat-input-placeholder-color: var(--tr-text-tertiary, #999999);
  --tr-chat-input-border-color: var(--tr-border-default, #e0e0e0);

  // 尺寸
  --tr-chat-input-font-size: 16px;
  --tr-chat-input-line-height: 26px;
  --tr-chat-input-min-height: 42px;
  --tr-chat-input-border-radius: 26px;

  // 间距
  --tr-chat-input-padding: 15px 20px;
  --tr-chat-input-gap: 8px;
  --tr-chat-input-footer-gap: 12px;

  // 按钮
  --tr-chat-input-button-size: 32px;
  --tr-chat-input-button-hover-bg: rgba(0, 0, 0, 0.08);
  --tr-chat-input-button-active-bg: rgba(0, 0, 0, 0.12);

  // 字数限制
  --tr-chat-input-word-limit-color: #808080;
  --tr-chat-input-word-limit-error-color: #f23030;

  // 动画
  --tr-chat-input-transition-duration: 0.2s;
}
</style>

<style lang="less" scoped>
.tr-chat-input {
  display: flex;
  flex-direction: column;
  background-color: var(--tr-chat-input-bg-color);
  border: 1px solid var(--tr-chat-input-border-color);
  border-radius: var(--tr-chat-input-border-radius);
  padding: var(--tr-chat-input-padding);
  transition: border-color var(--tr-chat-input-transition-duration);

  &:focus-within {
    border-color: var(--tr-primary-color, #1476ff);
  }

  &-header {
    margin-bottom: 12px;
  }

  &-main {
    display: flex;
    align-items: center;
    gap: var(--tr-chat-input-gap);
  }

  &-prefix {
    flex-shrink: 0;
  }

  &-content {
    flex: 1;
    min-width: 0;
  }

  &-actions-inline {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  // 单行模式
  &--single {
    .tr-chat-input-main {
      min-height: var(--tr-chat-input-min-height);
    }
  }

  // 多行模式
  &--multiple {
    border-radius: 12px;
  }
}
</style>
