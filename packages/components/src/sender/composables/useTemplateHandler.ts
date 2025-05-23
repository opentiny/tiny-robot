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
    editor.value.childNodes.forEach((node) => {
      // 只统计文本节点和字段span的值
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent || ''
      } else if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains('template-field')) {
        result += node.textContent || ''
      }
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

    return span
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

    // 设置光标位置
    nextTick(() => {
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
    if (options.isInternalUpdate || options.isComposing) return

    const currentValue = getValueFromDOM()
    if (currentValue !== options.value) {
      options.onValueChange(currentValue)
      options.onInput(currentValue)
    }
    checkHasContent(currentValue)
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

    // 方法
    resetFields,
    activateFirstField,

    // 选项更新
    updateOptions,
  }
}
