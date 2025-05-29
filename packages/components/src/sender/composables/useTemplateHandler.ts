import { ref, Ref, nextTick, reactive } from 'vue'

/**
 * 模板部分类型定义
 */
export interface ParsedTemplatePart {
  type: 'text' | 'field'
  content: string // 对于文本是内容，对于字段是占位符
}

/**
 * 光标位置类型
 */
export type CursorPosition = 'before' | 'after' | 'inside'

/**
 * 模板处理选项
 */
export interface TemplateHandlerOptions {
  /** 模板字符串 */
  template: string
  /** 当前值 */
  value?: string
  /** 字段初始值 */
  initialValues?: Record<string, string>
  /** 是否为内部更新标记 */
  isInternalUpdate: Ref<boolean>
  /** 输入法组合状态 */
  isComposing: Ref<boolean>
  /** 事件回调 */
  onValueChange: (value: string) => void
  onInput: (value: string) => void
  onContentStatusChange: (hasContent: boolean) => void
  onSubmit: (value: string) => void
}

/**
 * 模板处理 Hook
 */
export function useTemplateHandler(editor: { value: HTMLDivElement | null }, initialOptions: TemplateHandlerOptions) {
  const hasContent = ref(false)

  // 使用响应式对象来存储选项，便于动态更新
  const options = reactive({ ...initialOptions })

  /**
   * 更新选项
   */
  const updateOptions = (newOptions: Partial<TemplateHandlerOptions>) => {
    Object.assign(options, newOptions)
  }

  /**
   * 将模板字符串解析为部分数组
   */
  const parseTemplateToParts = (template: string): ParsedTemplatePart[] => {
    const parts: ParsedTemplatePart[] = []
    let currentIndex = 0
    const regex = /\[(.*?)\]/g
    let match

    while ((match = regex.exec(template)) !== null) {
      if (match.index > currentIndex) {
        parts.push({ type: 'text', content: template.substring(currentIndex, match.index) })
      }
      parts.push({ type: 'field', content: match[1] }) // match[1]是占位符
      currentIndex = match.index + match[0].length
    }

    if (currentIndex < template.length) {
      parts.push({ type: 'text', content: template.substring(currentIndex) })
    }
    return parts
  }

  /**
   * 从DOM获取当前值
   */
  const getValueFromDOM = (): string => {
    if (!editor.value) return ''
    let result = ''

    // 递归遍历所有节点，确保获取完整的文本内容
    const getTextFromNode = (node: Node): string => {
      let text = ''

      if (node.nodeType === Node.TEXT_NODE) {
        // 文本节点直接获取内容
        text += node.textContent || ''
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement

        // 检查是否是模板字段或其他需要处理的元素
        if (element.classList.contains('template-field')) {
          // 模板字段，获取其文本内容
          text += element.textContent || ''
        } else if (element.tagName.toLowerCase() === 'span') {
          // 普通span元素（可能是粘贴进来的），获取其文本内容
          text += element.textContent || ''
        } else if (element.tagName.toLowerCase() === 'br') {
          // br标签转换为换行符
          text += '\n'
        } else {
          // 其他元素类型，递归处理子节点
          for (const childNode of Array.from(element.childNodes)) {
            text += getTextFromNode(childNode)
          }
        }
      }

      return text
    }

    // 遍历所有直接子节点
    editor.value.childNodes.forEach((node) => {
      result += getTextFromNode(node)
    })

    return result
  }

  /**
   * 根据初始值对象获取字段的初始内容
   */
  const getInitialContentForField = (placeholder: string): string => {
    if (options.initialValues && typeof options.initialValues[placeholder] === 'string') {
      return options.initialValues[placeholder]
    }
    return ''
  }

  /**
   * 创建字段元素
   */
  const createFieldElement = (placeholder: string, content?: string): HTMLElement => {
    const span = document.createElement('span')
    span.className = 'template-field'
    span.setAttribute('data-placeholder', placeholder)

    if (content) {
      span.textContent = content
    }

    nextTick(() => {
      setFieldWidth(span, content || '')
    })

    return span
  }

  /**
   * 设置字段宽度以适应内容
   */
  const setFieldWidth = (fieldElement: HTMLElement, content: string) => {
    // 如果内容为空，根据 placeholder 文字计算宽度
    if (!content || content.trim() === '') {
      const placeholder = fieldElement.getAttribute('data-placeholder') || ''
      if (placeholder) {
        setFieldWidthByText(fieldElement, placeholder, true)
      } else {
        // 没有 placeholder，清除自定义宽度，使用默认最小宽度
        fieldElement.style.minWidth = ''
        fieldElement.style.width = ''
      }
      return
    }

    // 有内容时，根据内容计算宽度
    setFieldWidthByText(fieldElement, content, false)
  }

  /**
   * 根据文本内容设置字段宽度
   */
  const setFieldWidthByText = (fieldElement: HTMLElement, text: string, isPlaceholder: boolean) => {
    // 创建临时元素来测量文本宽度
    const tempSpan = document.createElement('span')
    tempSpan.className = 'template-field'
    tempSpan.style.visibility = 'hidden'
    tempSpan.style.position = 'absolute'
    tempSpan.style.top = '-9999px'
    tempSpan.style.left = '-9999px'
    tempSpan.style.whiteSpace = 'nowrap'
    tempSpan.style.padding = '3px 8px'
    tempSpan.style.margin = '0 2px'
    tempSpan.style.boxSizing = 'border-box'
    tempSpan.textContent = text

    // 添加到DOM中进行测量
    document.body.appendChild(tempSpan)

    // 获取实际的计算样式
    const computedStyle = getComputedStyle(tempSpan)
    const contentWidth = tempSpan.offsetWidth
    const fontSize = parseFloat(computedStyle.fontSize)

    // 清理临时元素
    document.body.removeChild(tempSpan)

    // 计算需要的最小宽度
    const defaultMinWidthEm = isPlaceholder ? 1.5 : 2
    const contentWidthEm = contentWidth / fontSize
    const minWidthEm = Math.max(defaultMinWidthEm, Math.ceil(contentWidthEm))

    // 使用 !important 确保样式优先级
    fieldElement.style.setProperty('min-width', `${minWidthEm}em`, 'important')

    // 设置一个最大宽度以避免单行过长
    const maxWidthEm = 20
    if (minWidthEm > maxWidthEm) {
      fieldElement.style.setProperty('max-width', `${maxWidthEm}em`, 'important')
      fieldElement.style.setProperty('white-space', 'normal', 'important')
      fieldElement.style.setProperty('word-break', 'break-word', 'important')
    } else {
      // 短文本保持单行显示
      fieldElement.style.removeProperty('max-width')
    }
  }

  /**
   * 检查内容状态并更新
   */
  const checkHasContent = (value?: string) => {
    const currentVal = value === undefined ? getValueFromDOM() : value
    const newHasContent = currentVal.trim().length > 0
    if (hasContent.value !== newHasContent) {
      hasContent.value = newHasContent
      options.onContentStatusChange(newHasContent)
    }
  }

  /**
   * 设置光标到指定位置
   */
  const setCursorTo = (element: HTMLElement, position: CursorPosition = 'inside', collapse = false) => {
    nextTick(() => {
      const selection = window.getSelection()
      if (!selection) return

      const range = document.createRange()

      switch (position) {
        case 'before':
          range.setStartBefore(element)
          break
        case 'after':
          range.setStartAfter(element)
          break
        case 'inside':
        default:
          range.selectNodeContents(element)
          range.collapse(collapse)
          break
      }

      selection.removeAllRanges()
      selection.addRange(range)

      if (element.focus) {
        element.focus()
      }
    })
  }

  /**
   * 设置光标到末尾
   */
  const setCursorToEnd = () => {
    nextTick(() => {
      const editorElement = editor.value
      if (editorElement) {
        const range = document.createRange()
        const selection = window.getSelection()
        range.selectNodeContents(editorElement)
        range.collapse(false) // 光标移至最后
        if (selection) {
          selection.removeAllRanges()
          selection.addRange(range)
        }
        editorElement.focus()
      }
    })
  }

  /**
   * 渲染模板结构到DOM
   */
  const renderTemplateToDOM = (templateParts: ParsedTemplatePart[], valueToRender?: string): HTMLElement | null => {
    const editorElement = editor.value
    if (!editorElement) return null

    editorElement.innerHTML = ''
    let firstField: HTMLElement | null = null

    if (!valueToRender || valueToRender === options.template) {
      // 没有传入value或value等于template模板，使用initialValues初始化
      templateParts.forEach((part) => {
        if (part.type === 'field') {
          const initialContent = getInitialContentForField(part.content)
          const span = createFieldElement(part.content, initialContent)

          editorElement.appendChild(span)

          // 记录第一个字段
          if (!firstField) {
            firstField = span
          }
        } else {
          editorElement.appendChild(document.createTextNode(part.content))
        }
      })

      // 如果有初始值，需要更新生成的value
      if (options.initialValues && Object.keys(options.initialValues).length > 0) {
        nextTick(() => {
          const newValue = getValueFromDOM()
          if (newValue !== options.value) {
            options.onValueChange(newValue)
            options.onInput(newValue)
          }
        })
      }
    } else {
      // 处理传入了value的情况，尝试解析并填充值
      const parseResult = parseValueWithTemplate(templateParts, valueToRender)

      if (parseResult.success) {
        parseResult.elements.forEach((element) => {
          editorElement.appendChild(element.node)
          if (element.isField && !firstField) {
            firstField = element.node as HTMLElement
          }
        })
      } else {
        // 如果无法解析，直接作为纯文本显示
        editorElement.appendChild(document.createTextNode(valueToRender))
        firstField = null
      }
    }

    return firstField
  }

  /**
   * 解析值与模板结构
   */
  const parseValueWithTemplate = (templateParts: ParsedTemplatePart[], value: string) => {
    const elements: Array<{ node: Node; isField: boolean }> = []
    let currentValIdx = 0
    let templatePartIdx = 0
    let success = true

    while (templatePartIdx < templateParts.length && currentValIdx <= value.length && success) {
      const part = templateParts[templatePartIdx]

      if (part.type === 'text') {
        if (value.substring(currentValIdx).startsWith(part.content)) {
          elements.push({
            node: document.createTextNode(part.content),
            isField: false,
          })
          currentValIdx += part.content.length
          templatePartIdx++
        } else {
          success = false
        }
      } else {
        // 字段部分
        let fieldContent = ''
        const nextTextPart = templateParts.find((p, i) => i > templatePartIdx && p.type === 'text')

        if (nextTextPart) {
          const valueRemainder = value.substring(currentValIdx)
          const nextStaticTextIdx = valueRemainder.indexOf(nextTextPart.content)

          if (nextStaticTextIdx !== -1) {
            fieldContent = valueRemainder.substring(0, nextStaticTextIdx)
            currentValIdx += fieldContent.length
          } else {
            success = false
          }
        } else {
          fieldContent = value.substring(currentValIdx)
          currentValIdx = value.length
        }

        if (success) {
          const span = createFieldElement(part.content, fieldContent)
          elements.push({ node: span, isField: true })
          templatePartIdx++
        }
      }
    }

    // 处理剩余的模板部分
    if (success && templatePartIdx < templateParts.length) {
      for (let i = templatePartIdx; i < templateParts.length; i++) {
        const part = templateParts[i]
        if (part.type === 'field') {
          const initialContent = !options.value || options.value === '' ? getInitialContentForField(part.content) : ''
          const span = createFieldElement(part.content, initialContent)
          elements.push({ node: span, isField: true })
        } else {
          elements.push({
            node: document.createTextNode(part.content),
            isField: false,
          })
        }
      }
    }

    return { success, elements }
  }

  /**
   * 更新编辑器DOM内容
   */
  const updateEditorDOM = () => {
    if (!editor.value) return

    options.isInternalUpdate = true

    const templateParts = parseTemplateToParts(options.template)
    const firstField = renderTemplateToDOM(templateParts, options.value)

    checkHasContent()

    // 设置光标位置并更新所有字段宽度
    nextTick(() => {
      // 确保所有字段的宽度都被正确设置
      updateAllFieldWidths()

      if (firstField && firstField.textContent) {
        setCursorTo(firstField, 'inside', false) // 光标到内容末尾
      } else if (firstField) {
        setCursorTo(firstField, 'inside', true) // 光标到开头
      } else {
        setCursorToEnd()
      }

      options.isInternalUpdate = false
    })
  }

  /**
   * 处理输入事件
   */
  const handleInput = () => {
    if (options.isComposing) return // 只在输入法组合时跳过，其他情况都要处理

    // 清理DOM中的空白文本节点
    cleanupEmptyTextNodes()

    // 检查并修复粘贴的模板字段
    fixPastedTemplateFields()

    // 更新所有字段的宽度
    updateAllFieldWidths()

    const currentValue = getValueFromDOM()

    if (currentValue !== options.value) {
      options.onValueChange(currentValue)
      options.onInput(currentValue)
    }
    checkHasContent(currentValue)

    // 如果当前值为空且只有空字段，确保DOM结构正确
    if (currentValue === '' && editor.value) {
      const hasOnlyEmptyFields = Array.from(editor.value.childNodes).every((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains('template-field')) {
          return !node.textContent || node.textContent.trim() === ''
        }
        return false
      })

      if (hasOnlyEmptyFields) {
        // 再次清理，确保没有多余的br标签或空白节点
        cleanupEmptyTextNodes()
      }
    }
  }

  /**
   * 清理DOM中的空白文本节点
   */
  const cleanupEmptyTextNodes = () => {
    if (!editor.value) return

    const nodesToRemove: Node[] = []
    editor.value.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent || ''
        // 如果是纯空白字符（包括换行符），标记为删除
        if (textContent.trim() === '') {
          nodesToRemove.push(node)
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        // 清理浏览器自动插入的br标签
        if (element.tagName.toLowerCase() === 'br') {
          nodesToRemove.push(node)
        }
      }
    })

    // 删除空白节点和br标签
    nodesToRemove.forEach((node) => {
      if (node.parentNode) {
        node.parentNode.removeChild(node)
      }
    })
  }

  /**
   * 检查并修复粘贴的模板字段
   * 主要用于修复复制粘贴时丢失的CSS类名和属性
   */
  const fixPastedTemplateFields = () => {
    if (!editor.value) return

    const spans = editor.value.querySelectorAll('span')
    spans.forEach((span) => {
      const element = span as HTMLElement
      const style = element.style

      // 检查是否已经是正确的模板字段
      const hasTemplateFieldClass = element.classList.contains('template-field')
      const hasTemplateFieldAttr = element.hasAttribute('data-placeholder')

      // 如果已经是正确的模板字段，跳过
      if (hasTemplateFieldClass && hasTemplateFieldAttr) {
        return
      }

      // 检查是否是未正确识别的模板字段
      // 1. 检查背景颜色特征（支持多种格式）
      const hasTemplateFieldBg =
        style.backgroundColor &&
        // 标准格式
        (style.backgroundColor === 'rgba(0, 0, 0, 0.05)' ||
          style.backgroundColor === 'rgba(0, 0, 0, 0.08)' ||
          // 可能的变体格式
          style.backgroundColor.includes('rgba(0, 0, 0, 0.05)') ||
          style.backgroundColor.includes('rgba(0, 0, 0, 0.08)') ||
          // 十六进制或其他可能的格式
          style.backgroundColor.toLowerCase().includes('0.05') ||
          style.backgroundColor.toLowerCase().includes('0.08'))

      // 2. 检查其他可能的模板字段特征样式
      const hasTemplateFieldStyles =
        style.borderRadius === '4px' ||
        style.padding === '3px 8px' ||
        style.margin === '0px 2px' ||
        (style.whiteSpace === 'nowrap' && style.padding && style.margin)

      if (hasTemplateFieldBg || hasTemplateFieldStyles || hasTemplateFieldAttr) {
        // 这是一个粘贴后丢失类名的模板字段，进行修复
        element.className = 'template-field'

        // 设置data-placeholder属性（如果没有的话）
        const content = element.textContent || ''
        if (content && !element.getAttribute('data-placeholder')) {
          element.setAttribute('data-placeholder', content)
        }

        // 清理内联样式，让CSS类接管
        element.removeAttribute('style')

        // 设置字段宽度
        setFieldWidth(element, content)
      }
    })
  }

  /**
   * 更新所有字段的宽度
   */
  const updateAllFieldWidths = () => {
    if (!editor.value) return

    const fields = editor.value.querySelectorAll('.template-field') as NodeListOf<HTMLElement>
    fields.forEach((field) => {
      const content = field.textContent || ''
      // 无论内容是否为空，都需要设置宽度
      setFieldWidth(field, content)
    })
  }

  /**
   * 重置字段
   */
  const resetFields = () => {
    if (!editor.value) return

    options.isInternalUpdate = true
    const editorElement = editor.value
    editorElement.innerHTML = ''

    const parts = parseTemplateToParts(options.template)
    let newEmittedValue = ''

    parts.forEach((part) => {
      if (part.type === 'field') {
        const initialContent = getInitialContentForField(part.content)
        const span = createFieldElement(part.content, initialContent)

        if (initialContent) {
          newEmittedValue += initialContent
        }

        editorElement.appendChild(span)
      } else {
        editorElement.appendChild(document.createTextNode(part.content))
        newEmittedValue += part.content
      }
    })

    options.onValueChange(newEmittedValue)
    setCursorToEnd()
    checkHasContent(newEmittedValue)

    nextTick(() => {
      options.isInternalUpdate = false
    })
  }

  /**
   * 激活第一个字段
   */
  const activateFirstField = () => {
    const firstField = editor.value?.querySelector('.template-field') as HTMLElement | null
    if (firstField) {
      setCursorTo(firstField, 'inside', false) // 光标到第一个可编辑块的末尾
    } else {
      setCursorToEnd()
    }
  }

  return {
    // 状态
    hasContent,

    // 解析和DOM操作
    parseTemplateToParts,
    getValueFromDOM,
    getInitialContentForField,
    createFieldElement,

    // 光标操作
    setCursorTo,
    setCursorToEnd,

    // DOM更新
    updateEditorDOM,
    renderTemplateToDOM,

    // 事件处理
    handleInput,
    checkHasContent,
    cleanupEmptyTextNodes,

    // 方法
    resetFields,
    activateFirstField,

    // 选项更新
    updateOptions,
  }
}
