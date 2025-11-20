<script setup lang="ts">
import { computed, provide, ref, toRef, watch } from 'vue'
import { ChatInputProps, ChatInputEmits, InputMode } from './index.type'
import { CHAT_INPUT_CONTEXT_KEY } from './constants'
import { ChatInputContext } from './context/types'
import { useEditor } from './composables/useEditor'
import { useModeSwitch } from './composables/useModeSwitch'
import { useAutoSize } from './composables/useAutoSize'
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

// 模式切换
const { currentMode, isAutoSwitching, setMode, checkOverflow } = useModeSwitch(props, editor, editorRef)

// 自动高度调整
useAutoSize(props, editor, editorRef)
const hasContent = computed(() => {
  if (!editor.value) return false
  return !editor.value.isEmpty
})

const characterCount = computed(() => {
  if (!editor.value) return 0
  // 使用 getText 方法获取纯文本长度
  const text = editor.value.getText()
  return text.length
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

// 监听编辑器内容变化，检查是否需要切换模式
watch(
  () => editor.value?.state.doc.content,
  () => {
    // 使用 setTimeout 确保 DOM 已更新
    setTimeout(() => {
      checkOverflow()
    }, 0)
  },
  { deep: true },
)

// 提供 Context
const context: ChatInputContext = {
  editor,
  editorRef,
  mode: currentMode,
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
  setMode: (mode: InputMode) => setMode(mode),
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
  <div
    :class="[
      'tr-chat-input',
      `tr-chat-input--${currentMode}`,
      `tr-chat-input--${theme}`,
      { 'is-auto-switching': isAutoSwitching, 'is-over-limit': isOverLimit },
    ]"
  >
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
      <div
        v-if="currentMode === 'single'"
        :class="['tr-chat-input-actions-inline', { 'has-content': hasContent || loading }]"
      >
        <slot name="actions-inline">
          <div v-if="hasContent || loading" class="tr-chat-input-actions-group">
            <div v-if="clearable && hasContent && !loading" class="tr-chat-input-utility-buttons">
              <ClearButton />
            </div>
            <div class="tr-chat-input-submit-wrapper">
              <SubmitButton />
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- 底部区域（多行模式） -->
    <Footer v-if="currentMode === 'multiple'">
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

  // 阴影
  --tr-chat-input-box-shadow: 0 4px 16px 0px rgba(0, 0, 0, 0.08);

  // 动画
  --tr-chat-input-transition-duration: 0.2s;
}
</style>

<style lang="less" scoped>
.tr-chat-input {
  display: flex;
  flex-direction: column;
  background-color: var(--tr-chat-input-bg-color);
  border-radius: var(--tr-chat-input-border-radius);
  box-shadow: var(--tr-chat-input-box-shadow);
  transition: box-shadow var(--tr-chat-input-transition-duration);

  &:focus-within {
    box-shadow: 0 4px 16px 0px rgba(20, 118, 255, 0.15);
  }

  // 自动切换模式时的过渡动画
  &.is-auto-switching {
    :deep(.ProseMirror) {
      transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    }

    .tr-chat-input-footer,
    .tr-chat-input-actions-inline {
      transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    }
  }

  &-header {
    margin-bottom: 12px;
    padding: 15px 20px 0;
  }

  &-main {
    display: flex;
    align-items: flex-start;
  }

  &-prefix {
    flex-shrink: 0;
    padding-left: 20px;
  }

  &-content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    padding-left: 20px;
  }

  &-actions-inline {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding-right: 16px;

    &.has-content {
      padding-right: 10px;
    }
  }

  &-actions-group {
    display: flex;
    align-items: center;
    gap: 12px; // 普通按钮组和发送按钮之间的间距
    padding-left: 12px; // 与编辑框之间的间距
  }

  &-utility-buttons {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &-submit-wrapper {
    display: flex;
    align-items: center;
  }

  // 单行模式
  &--single {
    .tr-chat-input-main {
      min-height: var(--tr-chat-input-min-height);
      align-items: center;
    }

    .tr-chat-input-content {
      padding: 15px 0 15px 20px;
    }

    .tr-chat-input-prefix {
      padding: 15px 0 15px 20px;
    }

    .tr-chat-input-actions-group {
      padding-top: 10px;
      padding-bottom: 10px;
    }

    :deep(.ProseMirror) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    // 单行模式下隐藏底部
    .tr-chat-input-footer {
      display: none;
    }
  }

  // 多行模式
  &--multiple {
    border-radius: var(--tr-chat-input-border-radius);
    padding: 0;

    .tr-chat-input-main {
      padding: 16px 20px 12px;
    }

    .tr-chat-input-content {
      padding-left: 0;
    }

    .tr-chat-input-prefix {
      padding-left: 0;
    }

    :deep(.ProseMirror) {
      white-space: pre-wrap;
      overflow-y: auto;
      min-height: var(--tr-chat-input-line-height, 26px);
    }

    // 多行模式下隐藏右侧按钮
    .tr-chat-input-actions-inline {
      display: none;
    }

    // 显示底部
    .tr-chat-input-footer {
      display: flex;
    }
  }
}

// 编辑器内容区域样式优化
:deep(.tr-chat-input-editor-content) {
  .ProseMirror {
    transition: height 0.2s ease;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;

      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }
}
</style>
