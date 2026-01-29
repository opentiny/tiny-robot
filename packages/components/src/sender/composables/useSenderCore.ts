/**
 * Sender 核心逻辑聚合
 *
 * 职责：
 * - 统一管理所有 Hook 的初始化顺序
 * - 解决循环依赖问题
 * - 自动组装 Context 和 Expose
 * - 作为逻辑层与视图层的桥梁
 */

import { EditorView } from '@tiptap/pm/view'
import { computed, provide, toRef, watch } from 'vue'
import type { SenderEmits, StructuredData } from '../index.type'
import type { SenderPropsWithDefaults } from '../index.vue'
import {
  MentionPluginKey,
  SuggestionPluginKey,
  TemplateSelectDropdownPluginKey,
  getTemplateStructuredData,
  getTextWithTemplates,
  getMentionStructuredData,
  getTextWithMentions,
} from '../extensions'
import { EXTENSION_NAMES } from '../extensions/constants'
import { SENDER_CONTEXT_KEY, type SenderContext } from '../types/context'
import { useEditor } from './useEditor'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { useModeSwitch } from './useModeSwitch'
import { useAutoSize } from './useAutoSize'

/**
 * useSenderCore 返回类型
 */
export interface UseSenderCoreReturn {
  /**
   * Context 对象（用于 provide）
   */
  context: SenderContext

  /**
   * 需要暴露给父组件的方法（用于 defineExpose）
   */
  expose: {
    submit: () => void
    clear: () => void
    cancel: () => void
    focus: () => void
    blur: () => void
    setContent: (content: string) => void
    getContent: () => string
    editor: SenderContext['editor']
  }
}

/**
 * Sender 核心逻辑 Hook
 *
 * 一键获取完整的 context 和 expose 对象
 */
export function useSenderCore(props: SenderPropsWithDefaults, emit: SenderEmits): UseSenderCoreReturn {
  // ========================================
  // 1. 初始化编辑器（必须最先初始化，因为其他逻辑依赖它）
  // ========================================

  const { editor, editorRef } = useEditor(props, emit)

  // ========================================
  // 2. 基础状态计算（依赖 editor）
  // ========================================

  const hasContent = computed(() => {
    if (!editor.value) return false
    const text = getTextWithTemplates(editor.value)
    return text.trim().length > 0
  })

  const characterCount = computed(() => {
    if (!editor.value) return 0
    const text = getTextWithTemplates(editor.value)
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
      !props.defaultActions?.submit?.disabled
    )
  })

  // ========================================
  // 3. 定义核心方法（submit 需要在键盘处理器之前定义）
  // ========================================

  const submit = () => {
    if (!canSubmit.value || !editor.value) return

    // 构建结构化数据（第二个参数，可选）
    // 注意：Template 和 Mention 是互斥的使用场景
    let structuredData: StructuredData | undefined
    let textContent = ''

    // Template（模板场景）
    if (editor.value.extensionManager.extensions.some((ext) => ext.name === EXTENSION_NAMES.TEMPLATE)) {
      const templateStructuredData = getTemplateStructuredData(editor.value)
      if (templateStructuredData.length > 0) {
        structuredData = templateStructuredData as StructuredData
      }
      textContent = getTextWithTemplates(editor.value)
    }
    // Mention（提及场景）
    else if (editor.value.extensionManager.extensions.some((ext) => ext.name === EXTENSION_NAMES.MENTION)) {
      const mentionStructuredData = getMentionStructuredData(editor.value)
      if (mentionStructuredData.length > 0) {
        structuredData = mentionStructuredData as StructuredData
      }
      textContent = getTextWithMentions(editor.value)
    }

    // 如果没有扩展，使用默认的纯文本
    if (!textContent) {
      textContent = editor.value.getText()
    }

    // 触发 submit 事件
    emit('submit', textContent, structuredData)
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
              // 0. 检查插件状态 - 如果建议面板激活或下拉菜单打开，不拦截键盘事件
              const mentionState = MentionPluginKey.getState(view.state)
              const suggestionState = SuggestionPluginKey.getState(view.state)
              const templateDropdownState = TemplateSelectDropdownPluginKey.getState(view.state)

              // 防御性检查：确保插件存在且状态激活
              if (
                (mentionState && mentionState.active) ||
                (suggestionState && suggestionState.active) ||
                (templateDropdownState && templateDropdownState.isOpen)
              ) {
                return false // 让插件/组件处理
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
  useAutoSize(currentMode, editorRef, props.autoSize)

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

  const focus = () => {
    editor.value?.commands.focus()
  }

  const clear = () => {
    editor.value?.commands.clearContent()
    editor.value?.commands.focus()
    emit('clear')
  }

  const cancel = () => {
    emit('cancel')
  }

  const blur = () => {
    editor.value?.commands.blur()
  }

  const setContent = (content: string) => {
    editor.value?.commands.setContent(content)
  }

  const getContent = () => {
    return editor.value?.getText() || ''
  }

  // ========================================
  // 9. 自动组装 Context
  // ========================================

  const context: SenderContext = {
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
    size: computed(() => props.size ?? 'normal'),
    showWordLimit: computed(() => props.showWordLimit ?? false),
    clearable: computed(() => props.clearable ?? false),
    defaultActions: toRef(props, 'defaultActions'),
    submitType: computed(() => props.submitType ?? 'enter'),
    stopText: toRef(props, 'stopText'),
    submit,
    clear,
    cancel,
    focus,
    blur,
    setContent,
    getContent,
  }

  // 提供 Context
  provide(SENDER_CONTEXT_KEY, context)

  // ========================================
  // 10. 返回 Context 和 Expose
  // ========================================

  return {
    context,
    expose: {
      submit,
      clear,
      cancel,
      focus,
      blur,
      setContent,
      getContent,
      editor,
    },
  }
}
