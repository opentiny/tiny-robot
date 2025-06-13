import { Ref } from 'vue'
import type { SenderProps, SenderEmits, SpeechState, SubmitTrigger } from '../index.type'
import { type CursorPosition } from './useTemplateHandler'
import { isOnlyZeroWidthSpace, cleanZeroWidthSpaces } from '../utils/zeroWidthUtils'
import { getSelectionFromTarget, isShadowDOM } from '../../shared/utils'

/**
 * 检查是否为指定的提交快捷键
 * @param event 键盘事件
 * @param submitType 提交类型
 * @returns 是否触发提交
 *
 * 提交行为说明：
 * - 当 submitType 为 enter 时：按 Enter 键提交
 * - 当 submitType 为 ctrlEnter 时：按 Ctrl+Enter 提交，单独按 Enter 换行
 * - 当 submitType 为 shiftEnter 时：按 Shift+Enter 提交，单独按 Enter 换行
 */
export const checkSubmitShortcut = (event: KeyboardEvent, submitType: SubmitTrigger): boolean => {
  const isEnter = event.key === 'Enter'
  if (!isEnter) return false

  switch (submitType) {
    case 'enter':
      return !event.shiftKey && !event.ctrlKey && !event.metaKey
    case 'ctrlEnter':
      return (event.ctrlKey || event.metaKey) && !event.shiftKey
    case 'shiftEnter':
      return event.shiftKey && !event.ctrlKey && !event.metaKey
    default:
      return false
  }
}

/**
 * 键盘处理Hook
 * 集中管理组件的键盘相关操作
 *
 * @param props - 组件属性
 * @param emit - 组件方法
 * @param inputValue - 输入值
 * @param isComposing - 是否处于输入法组合状态（即编辑态）
 * @param speechState - 语音识别状态
 * @param showSuggestions - 是否显示建议列表
 * @param activeSuggestion - 当前活动的建议项
 * @param acceptCurrentSuggestion - 接受当前建议的函数
 * @param closeSuggestionsPopup - 关闭建议弹窗的函数
 * @param navigateSuggestions - 导航建议列表的函数
 * @param toggleSpeech - 切换语音识别函数
 * @param isOverLimit - 是否超出字数限制
 * @param currentMode - 当前输入模式
 * @param setMultipleMode - 设置为多行模式的回调函数
 */
export function useKeyboardHandler(
  props: SenderProps,
  emit: SenderEmits,
  inputValue: Ref<string>,
  isComposing: Ref<boolean>,
  speechState: SpeechState,
  showSuggestions: Ref<boolean>,
  activeSuggestion: Ref<string | null>,
  acceptCurrentSuggestion: () => void,
  closeSuggestionsPopup: (keepFocus?: boolean) => void,
  navigateSuggestions: (direction: 'up' | 'down') => void,
  toggleSpeech: () => void,
  isOverLimit: Ref<boolean>,
  currentMode?: Ref<'single' | 'multiple'>,
  setMultipleMode?: () => void,
) {
  /**
   * 验证提交条件
   * @param value 输入值
   * @returns 是否可以提交
   */
  const validateSubmission = (value: string): boolean => {
    // 基础状态检查：禁用或加载中时不能提交
    if (props.disabled || props.loading) {
      return false
    }

    // 内容检查：空内容不能提交
    const trimmedValue = value.trim()
    if (trimmedValue.length === 0) {
      return false
    }

    // 字数限制检查：超出限制时不能提交
    if (isOverLimit.value) {
      return false
    }

    return true
  }

  /**
   * 触发提交
   */
  const triggerSubmit = () => {
    if (!validateSubmission(inputValue.value)) return
    emit('submit', inputValue.value.trim())
  }

  /**
   * 处理键盘按下事件
   */
  const handleKeyPress = (event: KeyboardEvent) => {
    if (isComposing.value) return // 阻止输入法状态下的提交

    // 处理 Shift+Enter - 单行模式切换到多行模式并添加换行
    if (event.key === 'Enter' && event.shiftKey && currentMode?.value === 'single' && setMultipleMode) {
      event.preventDefault()
      // 首先切换到多行模式
      setMultipleMode()
      // 然后在当前输入内容的光标位置添加换行符
      const target = event.target as HTMLTextAreaElement
      const cursorPosition = target.selectionStart
      const currentValue = inputValue.value

      // 在光标位置插入换行符
      inputValue.value = currentValue.substring(0, cursorPosition) + '\n' + currentValue.substring(cursorPosition)

      // 设置光标位置到换行符之后
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = cursorPosition + 1
      }, 0)

      return
    }

    // 处理Tab键 - 接受当前建议
    if (event.key === 'Tab' && showSuggestions.value && activeSuggestion.value) {
      event.preventDefault()
      acceptCurrentSuggestion()
      return
    }

    // 处理上下键 - 导航建议列表
    if (showSuggestions.value) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        navigateSuggestions('down')
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        navigateSuggestions('up')
        return
      }

      // 处理Enter键 - 当建议弹窗打开时，如果有建议项，则选择当前项
      if (event.key === 'Enter' && activeSuggestion.value) {
        event.preventDefault()
        acceptCurrentSuggestion()
        return
      }
    }

    // 处理Esc键 - 关闭建议列表或停止语音录制
    if (event.key === 'Escape') {
      if (showSuggestions.value) {
        closeSuggestionsPopup()
        event.preventDefault()
      } else if (speechState.isRecording) {
        toggleSpeech()
        event.preventDefault()
      }

      emit('escape-press')
      return
    }

    // 检查是否匹配当前的提交快捷键
    const shouldSubmit = checkSubmitShortcut(event, props.submitType as SubmitTrigger)

    // 只有当满足提交条件且输入框有内容时才提交
    if (shouldSubmit && validateSubmission(inputValue.value)) {
      event.preventDefault()
      triggerSubmit()
    }
  }

  return {
    handleKeyPress,
    triggerSubmit,
  }
}

/**
 * 模板键盘事件处理选项
 */
export interface TemplateKeyboardOptions {
  /** 编辑器DOM引用 */
  editor: { value: HTMLDivElement | null }
  /** 输入法组合状态 */
  isComposing: { value: boolean }
  /** 获取DOM值的方法 */
  getValueFromDOM: () => string
  /** 输入处理方法 */
  handleInput: () => void
  /** 提交事件回调 */
  onSubmit: () => void
  /** 提交触发方式 */
  submitType?: SubmitTrigger
}

/**
 * 模板键盘事件处理 Hook
 * 专门处理模板编辑器的键盘交互
 *
 * @param options - 模板键盘事件处理选项
 * @returns 模板键盘事件处理方法
 */
export function useTemplateKeyboardHandler(options: TemplateKeyboardOptions) {
  /**
   * 处理箭头键导航
   */
  const handleArrowKeyNavigation = (event: KeyboardEvent, range: Range, editor: HTMLDivElement): boolean => {
    const { startOffset, collapsed } = range
    let startContainer = range.startContainer
    if (startContainer.parentElement?.classList.contains('template-field')) {
      startContainer = startContainer.parentElement
    }
    if (!collapsed) return false // 如果有选择区域，使用默认行为

    // 判断是否在文本节点的边界
    const atTextStart = startContainer.nodeType === Node.TEXT_NODE && startOffset === 0 && event.key === 'ArrowLeft'
    const atTextEnd =
      startContainer.nodeType === Node.TEXT_NODE &&
      startOffset === (startContainer.textContent?.length || 0) &&
      event.key === 'ArrowRight'

    if (atTextStart || atTextEnd) {
      let targetNode: Node | null = null
      let targetPosition: CursorPosition = 'inside'

      if (atTextStart) {
        // 在文本节点开头按左键
        if (
          startContainer.parentNode &&
          (startContainer.parentNode as HTMLElement).classList.contains('template-field')
        ) {
          // 当前在字段内，需要移到字段外
          targetNode = startContainer.parentNode
          targetPosition = 'before'
        } else {
          // 查找前一个节点
          let prevNode = startContainer.previousSibling
          if (!prevNode && startContainer.parentNode && startContainer.parentNode !== editor) {
            prevNode = startContainer.parentNode.previousSibling
          }

          if (
            prevNode &&
            prevNode.nodeType === Node.ELEMENT_NODE &&
            (prevNode as HTMLElement).classList.contains('template-field')
          ) {
            // 前一个节点是字段，聚焦到字段内部
            targetNode = prevNode
            targetPosition = 'inside'
          }
        }
      } else if (atTextEnd) {
        // 在文本节点末尾按右键
        if (
          startContainer.parentNode &&
          (startContainer.parentNode as HTMLElement).classList.contains('template-field')
        ) {
          // 当前在字段内，需要移到字段外
          targetNode = startContainer.parentNode
          targetPosition = 'after'
        } else {
          // 查找下一个节点
          let nextNode = startContainer.nextSibling
          if (!nextNode && startContainer.parentNode && startContainer.parentNode !== editor) {
            nextNode = startContainer.parentNode.nextSibling
          }

          if (
            nextNode &&
            nextNode.nodeType === Node.ELEMENT_NODE &&
            (nextNode as HTMLElement).classList.contains('template-field')
          ) {
            // 下一个节点是字段，聚焦到字段内部
            targetNode = nextNode
            targetPosition = 'inside'
          }
        }
      }

      if (targetNode) {
        event.preventDefault()
        const newRange = document.createRange()
        const selection = getSelectionFromTarget(editor)
        if (!selection) return true

        if (targetPosition === 'before') {
          newRange.setStartBefore(targetNode)
        } else if (targetPosition === 'after') {
          newRange.setStartAfter(targetNode)
        } else {
          // inside
          newRange.selectNodeContents(targetNode)
          // 如果目标是向左移动，光标放在内容末尾；向右移动，光标放在内容开头
          newRange.collapse(event.key === 'ArrowLeft')
        }

        selection.removeAllRanges()
        selection.addRange(newRange)
        return true
      }
    }

    // 处理空字段的特殊情况
    if (
      startContainer.nodeType === Node.ELEMENT_NODE &&
      (startContainer as HTMLElement).classList.contains('template-field')
    ) {
      const element = startContainer as HTMLElement
      const textContent = element.textContent || ''
      const cleanContent = cleanZeroWidthSpaces(textContent)

      // 如果光标在空字段中（只包含零宽字符或完全为空），根据方向键移到字段前/后
      if (!cleanContent || cleanContent.trim() === '') {
        event.preventDefault()
        const newRange = document.createRange()
        const selection = getSelectionFromTarget(editor)
        if (!selection) return true

        if (event.key === 'ArrowLeft') {
          newRange.setStartBefore(startContainer)
        } else {
          // 右箭头键，移到字段后的零宽字符节点中
          const nextSibling = startContainer.nextSibling
          if (
            nextSibling &&
            nextSibling.nodeType === Node.TEXT_NODE &&
            isOnlyZeroWidthSpace(nextSibling.textContent || '')
          ) {
            newRange.setStart(nextSibling, 0)
            newRange.setEnd(nextSibling, 0)
          } else {
            newRange.setStartAfter(startContainer)
          }
        }

        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)
        return true
      }
    }

    // 处理在零宽字符文本节点中的导航
    if (startContainer.nodeType === Node.TEXT_NODE && isOnlyZeroWidthSpace(startContainer.textContent || '')) {
      const prevSibling = startContainer.previousSibling
      const nextSibling = startContainer.nextSibling

      event.preventDefault()
      const newRange = document.createRange()
      const selection = getSelectionFromTarget(editor)
      if (!selection) return true

      if (event.key === 'ArrowLeft') {
        // 左箭头键，移到前面的字段内
        if (
          prevSibling &&
          prevSibling.nodeType === Node.ELEMENT_NODE &&
          (prevSibling as HTMLElement).classList.contains('template-field')
        ) {
          newRange.selectNodeContents(prevSibling)
          newRange.collapse(false) // 光标到字段末尾
        } else {
          newRange.setStartBefore(startContainer)
        }
      } else {
        // 右箭头键，移到后面的节点
        if (nextSibling) {
          if (
            nextSibling.nodeType === Node.ELEMENT_NODE &&
            (nextSibling as HTMLElement).classList.contains('template-field')
          ) {
            newRange.selectNodeContents(nextSibling)
            newRange.collapse(true) // 光标到字段开头
          } else {
            if (isShadowDOM(editor)) {
              newRange.setStart(nextSibling, 1)
              newRange.collapse(true)
            } else {
              newRange.setStartAfter(startContainer)
            }
          }
        } else {
          newRange.setStartAfter(startContainer)
        }
      }

      selection.removeAllRanges()
      selection.addRange(newRange)
      return true
    }

    return false
  }

  /**
   * 处理Backspace键
   */
  const handleBackspaceKey = (event: KeyboardEvent, range: Range, editor: HTMLDivElement): boolean => {
    if (!range.collapsed) return false

    const { startContainer, startOffset } = range

    // 检查是否在零宽字符文本节点中
    if (startContainer.nodeType === Node.TEXT_NODE && isOnlyZeroWidthSpace(startContainer.textContent || '')) {
      // 在零宽字符文本节点中，查找前面的字段
      const prevSibling = startContainer.previousSibling
      if (
        prevSibling &&
        prevSibling.nodeType === Node.ELEMENT_NODE &&
        (prevSibling as HTMLElement).classList.contains('template-field')
      ) {
        const fieldElement = prevSibling as HTMLElement
        const textContent = fieldElement.textContent || ''
        const cleanContent = cleanZeroWidthSpaces(textContent)

        // 如果前面的字段为空，删除该字段和零宽字符节点
        if (!cleanContent || cleanContent.trim() === '') {
          event.preventDefault()

          // 记录删除前的位置信息，用于删除后的光标定位
          const prevPrevSibling = fieldElement.previousSibling
          const nextSibling = startContainer.nextSibling

          // 删除字段和零宽字符节点
          if (fieldElement.parentNode) {
            fieldElement.parentNode.removeChild(fieldElement)
          }
          if (startContainer.parentNode) {
            startContainer.parentNode.removeChild(startContainer)
          }

          // 重新定位光标到合适位置
          const selection = getSelectionFromTarget(editor)
          if (selection) {
            const newRange = document.createRange()

            if (prevPrevSibling) {
              // 如果前面还有节点，将光标设置到前面节点的后面
              if (
                prevPrevSibling.nodeType === Node.ELEMENT_NODE &&
                (prevPrevSibling as HTMLElement).classList.contains('template-field')
              ) {
                // 前面是字段，光标到字段内部末尾
                newRange.selectNodeContents(prevPrevSibling)
                newRange.collapse(false)
              } else if (
                prevPrevSibling.nodeType === Node.TEXT_NODE &&
                isOnlyZeroWidthSpace(prevPrevSibling.textContent || '')
              ) {
                // 前面是零宽字符，光标设置到该零宽字符中
                newRange.setStart(prevPrevSibling, 0)
                newRange.setEnd(prevPrevSibling, 0)
              } else {
                // 前面是普通文本节点，光标到其后面
                newRange.setStartAfter(prevPrevSibling)
              }
            } else if (nextSibling) {
              // 如果前面没有节点但后面有，光标到后面节点前面
              newRange.setStartBefore(nextSibling)
            } else {
              // 如果前后都没有节点，光标到编辑器开头
              newRange.setStart(editor, 0)
            }

            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
          }

          options.handleInput()
          return true
        } else {
          // 如果字段有内容，将光标移到字段末尾
          event.preventDefault()
          const selection = getSelectionFromTarget(editor)
          if (selection) {
            const newRange = document.createRange()
            newRange.selectNodeContents(fieldElement)
            newRange.collapse(false) // 光标到末尾
            selection.removeAllRanges()
            selection.addRange(newRange)
          }
          return true
        }
      }
    }

    // 判断当前是否在字段内部，且只剩一个字符即将被删除
    const isInField =
      startContainer.nodeType === Node.TEXT_NODE &&
      startContainer.parentNode &&
      (startContainer.parentNode as HTMLElement).classList.contains('template-field')

    if (isInField && startContainer.textContent) {
      const textContent = startContainer.textContent
      const cleanContent = cleanZeroWidthSpaces(textContent)

      // 检查是否是即将删除最后一个有效字符
      if (cleanContent.length === 1 && startOffset === textContent.length) {
        // 即将删除字段内最后一个有效字符，阻止默认行为
        event.preventDefault()

        // 清空字段内容
        startContainer.textContent = ''

        // 保持光标在字段内部，不要跳转到零宽字符
        const fieldElement = startContainer.parentNode as HTMLElement
        const selection = getSelectionFromTarget(editor)
        if (selection) {
          const newRange = document.createRange()
          newRange.selectNodeContents(fieldElement)
          newRange.collapse(true) // 光标到字段开头
          selection.removeAllRanges()
          selection.addRange(newRange)
        }

        // 触发输入事件以更新值
        options.handleInput()
        return true
      }
    }

    // 情况1: 光标在字段（可能为空）的开头位置
    if (startOffset === 0) {
      let fieldElement: HTMLElement | null = null

      if (
        startContainer.nodeType === Node.ELEMENT_NODE &&
        (startContainer as HTMLElement).classList.contains('template-field')
      ) {
        fieldElement = startContainer as HTMLElement
      } else if (
        startContainer.nodeType === Node.TEXT_NODE &&
        startContainer.parentNode &&
        (startContainer.parentNode as HTMLElement).classList.contains('template-field')
      ) {
        fieldElement = startContainer.parentNode as HTMLElement
      }

      if (fieldElement) {
        // 删除字段的操作应该在零宽字符位置进行
        event.preventDefault()

        // 将光标移到字段前面
        const selection = getSelectionFromTarget(editor)
        if (selection) {
          range.setStartBefore(fieldElement)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
        return true
      }
    }

    return false
  }

  /**
   * 处理Delete键
   */
  const handleDeleteKey = (event: KeyboardEvent, range: Range, editor: HTMLDivElement): boolean => {
    if (!range.collapsed) return false

    const { startContainer, startOffset } = range

    // 判断当前是否在字段内部，且在字段文本的末尾
    const isInField =
      startContainer.nodeType === Node.TEXT_NODE &&
      startContainer.parentNode &&
      (startContainer.parentNode as HTMLElement).classList.contains('template-field')

    if (isInField && startContainer.textContent) {
      const textContent = startContainer.textContent
      const cleanContent = cleanZeroWidthSpaces(textContent)

      // 检查是否在末尾且即将删除最后一个有效字符
      if (startOffset === textContent.length && cleanContent.length === 1) {
        // 即将从末尾删除字段内最后一个有效字符，阻止默认行为
        event.preventDefault()

        // 清空字段内容
        startContainer.textContent = ''

        // 保持光标在字段内部
        const fieldElement = startContainer.parentNode as HTMLElement
        const selection = getSelectionFromTarget(editor)
        if (selection) {
          const newRange = document.createRange()
          newRange.selectNodeContents(fieldElement)
          newRange.collapse(true) // 光标到字段开头
          selection.removeAllRanges()
          selection.addRange(newRange)
        }

        // 触发输入事件以更新值
        options.handleInput()
        return true
      }
    }

    return false
  }

  /**
   * 处理模板编辑器的键盘按键事件
   */
  const handleTemplateKeyDown = (event: KeyboardEvent) => {
    if (options.isComposing.value) return

    const editor = options.editor.value
    if (!editor) return

    const selection = getSelectionFromTarget(editor)
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)

    // 处理提交快捷键
    const submitType = options.submitType || 'enter'
    if (checkSubmitShortcut(event, submitType)) {
      const currentValue = options.getValueFromDOM()
      if (currentValue.trim().length > 0) {
        event.preventDefault()
        options.onSubmit()
        return
      }
    }

    // 处理左右箭头键导航
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !event.shiftKey) {
      if (handleArrowKeyNavigation(event, range, editor)) {
        return
      }
    }

    // 处理Backspace键
    if (event.key === 'Backspace') {
      if (handleBackspaceKey(event, range, editor)) {
        return
      }
    }

    // 处理Delete键
    if (event.key === 'Delete') {
      if (handleDeleteKey(event, range, editor)) {
        return
      }
    }
  }

  return {
    handleTemplateKeyDown,
  }
}
