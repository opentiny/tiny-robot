/**
 * Chat-Input 核心逻辑聚合
 *
 * 职责：
 * - 统一管理所有 Hook 的初始化顺序
 * - 解决循环依赖问题
 * - 自动组装 Context 和 Expose
 * - 作为逻辑层与视图层的桥梁
 */

import { EditorView } from '@tiptap/pm/view'
import { computed, provide, ref, toRef, watch } from 'vue'
import type { ChatInputProps, ChatInputEmits, InputMode, TemplateItem, ContentNode } from '../index.type'
import { MentionPluginKey, SuggestionPluginKey } from '../extensions'
import { CHAT_INPUT_CONTEXT_KEY } from '../constants'
import type { ChatInputContext } from '../types/context'
import { useEditor } from './useEditor'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { useModeSwitch } from './useModeSwitch'
import { useAutoSize } from './useAutoSize'
import { useTemplateData } from './useTemplateData'

/**
 * useChatInputCore 返回类型
 */
export interface UseChatInputCoreReturn {
  /**
   * Context 对象（用于 provide）
   */
  context: ChatInputContext

  /**
   * 需要暴露给父组件的方法（用于 defineExpose）
   */
  expose: {
    submit: () => void
    clear: () => void
    focus: () => void
    blur: () => void
    setContent: (content: string) => void
    getContent: () => string
    editor: ChatInputContext['editor']
    setTemplateData: (items: TemplateItem[]) => void
    clearTemplateData: () => void
    focusFirstTemplateBlock: () => void
    getTemplateData: () => TemplateItem[]
  }
}

/**
 * Chat-Input 核心逻辑 Hook
 *
 * 一键获取完整的 context 和 expose 对象
 */
export function useChatInputCore(props: ChatInputProps, emit: ChatInputEmits): UseChatInputCoreReturn {
  // ========================================
  // 1. 初始化编辑器（必须最先初始化，因为其他逻辑依赖它）
  // ========================================

  const { editor, editorRef } = useEditor(props, emit)

  // ========================================
  // 2. 基础状态计算（依赖 editor）
  // ========================================

  const hasContent = computed(() => {
    if (!editor.value) return false
    const text = editor.value.getText()
    return text.trim().length > 0
  })

  const characterCount = computed(() => {
    if (!editor.value) return 0
    const text = editor.value.getText()
    return text.length
  })

  const isOverLimit = computed(() => {
    if (!props.maxLength) return false
    return characterCount.value > props.maxLength
  })

  const canSubmit = computed(() => {
    return (
      !props.disabled &&
      !props.loading &&
      hasContent.value &&
      !isOverLimit.value &&
      !props.buttonGroup?.submit?.disabled
    )
  })

  // 语音状态（简化版）
  const speechState = ref({
    isRecording: false,
    isSupported: false,
  })

  // ========================================
  // 3. 定义核心方法（submit 需要在键盘处理器之前定义）
  // ========================================

  const submit = () => {
    if (!canSubmit.value) return

    // 获取编辑器的纯文本内容（第一个参数）
    const textContent = editor.value?.getText() || ''

    // 获取 JSON 格式内容以提取结构化数据
    const json = editor.value?.getJSON()

    // 构建结构化内容
    const structureContent: ContentNode[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractNodes = (node: any) => {
      if (node.type === 'mention') {
        structureContent.push({
          type: 'mention',
          content: node.attrs?.label || '',
          preset: node.attrs?.preset || '',
        })
      } else if (node.type === 'text') {
        structureContent.push({
          type: 'text',
          content: node.text || '',
        })
      } else if (node.type === 'hardBreak') {
        structureContent.push({
          type: 'hardBreak',
          content: '\n',
        })
      }

      // 递归处理子节点
      if (node.content) {
        node.content.forEach(extractNodes)
      }
    }

    json?.content?.forEach(extractNodes)

    emit('submit', textContent, structureContent)
  }

  // ========================================
  // 4. 初始化模式切换
  // ========================================

  const { currentMode, isAutoSwitching, setMode, checkOverflow } = useModeSwitch(props, editor, editorRef)

  // ========================================
  // 5. 初始化键盘快捷键处理器
  // ========================================

  const keyboardHandlers = useKeyboardShortcuts({
    submitType: computed(() => props.submitType ?? 'enter'),
    canSubmit,
    mode: currentMode,
    submit,
    setMode,
  })

  // ========================================
  // 6. 动态注入键盘处理器（避免二次初始化）
  // ========================================

  watch(
    editor,
    (editorInstance) => {
      if (editorInstance) {
        // 使用 Tiptap 的 setOptions 动态注入键盘处理器
        editorInstance.setOptions({
          editorProps: {
            ...editorInstance.options.editorProps,
            handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
              // 0. 检查插件状态 - 如果建议面板激活，不拦截键盘事件
              const mentionState = MentionPluginKey.getState(view.state)
              const suggestionState = SuggestionPluginKey.getState(view.state)

              if (mentionState?.active || suggestionState?.active) {
                return false // 让插件处理
              }

              // 1. 检查是否为提交快捷键（优先检查，避免误触发换行）
              if (keyboardHandlers.checkSubmitShortcut(event)) {
                event.preventDefault()
                submit()
                return true
              }

              // 2. 处理换行键
              if (keyboardHandlers.checkNewlineShortcut(event)) {
                event.preventDefault()
                // 如果在单行模式，先切换到多行
                if (currentMode.value === 'single') {
                  setMode('multiple')
                  // 延迟执行换行，确保模式切换完成
                  setTimeout(() => {
                    editorInstance.commands.splitBlock()
                    editorInstance.commands.focus()
                  }, 0)
                } else {
                  editorInstance.commands.splitBlock()
                }
                return true
              }

              return false
            },
          },
        })
      }
    },
    { immediate: true },
  )

  // ========================================
  // 7. 初始化其他功能模块
  // ========================================

  // 自动高度调整
  useAutoSize(props, editor, editorRef)

  // 模板数据管理
  const { setTemplateData, clearTemplateData, focusFirstTemplateBlock, getTemplateData } = useTemplateData({
    templateData: toRef(props, 'templateData'),
    editor,
    emit,
  })

  // 监听编辑器内容变化，检查是否需要切换模式
  watch(
    () => editor.value?.state.doc.content,
    () => {
      setTimeout(() => {
        checkOverflow()
      }, 0)
    },
    { deep: true },
  )

  // ========================================
  // 8. 定义其他方法
  // ========================================

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

  // ========================================
  // 9. 自动组装 Context
  // ========================================

  const context: ChatInputContext = {
    editor,
    editorRef,
    mode: currentMode,
    isAutoSwitching,
    loading: computed(() => props.loading ?? false),
    disabled: computed(() => props.disabled ?? false),
    hasContent,
    canSubmit,
    isOverLimit,
    characterCount,
    maxLength: toRef(props, 'maxLength'),
    speechState,
    showWordLimit: computed(() => props.showWordLimit ?? false),
    clearable: computed(() => props.clearable ?? false),
    allowSpeech: computed(() => props.allowSpeech ?? false),
    allowFiles: computed(() => props.allowFiles ?? false),
    buttonGroup: toRef(props, 'buttonGroup'),
    submitType: computed(() => props.submitType ?? 'enter'),
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
    setMode: (mode: InputMode) => setMode(mode),
    setTemplateData,
    clearTemplateData,
    focusFirstTemplateBlock,
    getTemplateData,
  }

  // 提供 Context
  provide(CHAT_INPUT_CONTEXT_KEY, context)

  // ========================================
  // 10. 返回 Context 和 Expose
  // ========================================

  return {
    context,
    expose: {
      submit,
      clear,
      focus,
      blur,
      setContent,
      getContent,
      editor,
      setTemplateData,
      clearTemplateData,
      focusFirstTemplateBlock,
      getTemplateData,
    },
  }
}
