<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import type { TemplateEditorProps, TemplateEditorEmits, TemplateEditorExpose } from '../index.type'

// 定义props和emits
const props = defineProps<TemplateEditorProps>()
const emit = defineEmits<TemplateEditorEmits>()

// DOM引用
const contentEditableRef = ref<HTMLDivElement | null>(null)

// 内部状态
const isInternalUpdate = ref(false) // 防止程序化更新时的事件循环
const isComposing = ref(false) // 输入法组合状态

// 模板部分类型定义
interface ParsedTemplatePart {
  type: 'text' | 'field'
  content: string // 对于文本是内容，对于字段是占位符
}

// 核心逻辑函数

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
  if (!contentEditableRef.value) return ''
  let result = ''
  contentEditableRef.value.childNodes.forEach((node) => {
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
 * 设置光标到末尾
 */
const setCursorToEnd = () => {
  nextTick(() => {
    const editor = contentEditableRef.value
    if (editor) {
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(editor)
      range.collapse(false) // 光标移至最后
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
      editor.focus()
    }
  })
}

/**
 * 根据初始值对象获取字段的初始内容
 */
const getInitialContentForField = (placeholder: string): string => {
  if (props.initialValues && typeof props.initialValues[placeholder] === 'string') {
    return props.initialValues[placeholder]
  }
  return ''
}

/**
 * 更新编辑器DOM内容
 */
const updateEditorDOM = () => {
  if (!contentEditableRef.value) return
  isInternalUpdate.value = true

  const editor = contentEditableRef.value
  editor.innerHTML = ''

  const templateParts = parseTemplateToParts(props.template)
  const valueToRender = props.value

  // 跟踪第一个字段，用于后续聚焦
  let firstField: HTMLElement | null = null

  if (!valueToRender || valueToRender === props.template) {
    // 没有传入value或value等于template模板，使用initialValues初始化
    templateParts.forEach((part) => {
      if (part.type === 'field') {
        const span = document.createElement('span')
        span.className = 'template-field'
        span.setAttribute('data-placeholder', part.content)

        // 使用initialValues中的值（如果有）
        const initialContent = getInitialContentForField(part.content)
        if (initialContent) {
          span.textContent = initialContent
        }

        editor.appendChild(span)
        // 记录第一个字段
        if (!firstField) {
          firstField = span
        }
      } else {
        editor.appendChild(document.createTextNode(part.content))
      }
    })

    // 如果有初始值，需要更新生成的value
    if (props.initialValues && Object.keys(props.initialValues).length > 0) {
      // 将初始值融入到value中
      nextTick(() => {
        const newValue = getValueFromDOM()
        if (newValue !== props.value) {
          emit('update:value', newValue)
          emit('input', newValue)
        }
      })
    }
  } else {
    // 处理传入了value的情况，尝试保留结构并填充值
    let currentValIdx = 0
    let templatePartIdx = 0
    let reconstructionSuccess = true

    while (templatePartIdx < templateParts.length && currentValIdx <= valueToRender.length) {
      const part = templateParts[templatePartIdx]
      if (part.type === 'text') {
        if (valueToRender.substring(currentValIdx).startsWith(part.content)) {
          editor.appendChild(document.createTextNode(part.content))
          currentValIdx += part.content.length
          templatePartIdx++
        } else {
          reconstructionSuccess = false
          break
        }
      } else {
        // 字段部分
        const span = document.createElement('span')
        span.className = 'template-field'
        span.setAttribute('data-placeholder', part.content)

        let fieldContent = ''
        const nextTextPartDefinition = templateParts.find((p, i) => i > templatePartIdx && p.type === 'text')

        if (nextTextPartDefinition) {
          // 在剩余的valueToRender中查找下一个静态文本
          const valueRemainder = valueToRender.substring(currentValIdx)
          const nextStaticTextIdxInRemainder = valueRemainder.indexOf(nextTextPartDefinition.content)

          if (nextStaticTextIdxInRemainder !== -1) {
            fieldContent = valueRemainder.substring(0, nextStaticTextIdxInRemainder)
            currentValIdx += fieldContent.length
          } else {
            // 未找到下一个静态文本，表示模板结构与值不匹配
            reconstructionSuccess = false
            break
          }
        } else {
          fieldContent = valueToRender.substring(currentValIdx)
          currentValIdx = valueToRender.length
        }
        span.textContent = fieldContent
        editor.appendChild(span)

        // 记录第一个字段
        if (!firstField) {
          firstField = span
        }

        templatePartIdx++
      }
    }

    if (!reconstructionSuccess || (currentValIdx < valueToRender.length && templatePartIdx === templateParts.length)) {
      // 如果无法解析，直接作为纯文本显示
      editor.innerHTML = ''
      editor.appendChild(document.createTextNode(valueToRender))
      firstField = null // 没有字段元素
    } else if (templatePartIdx < templateParts.length && currentValIdx >= valueToRender.length) {
      // 值比模板短，追加剩余的模板结构
      for (let i = templatePartIdx; i < templateParts.length; i++) {
        const iterPart = templateParts[i]
        if (iterPart.type === 'field') {
          const span = document.createElement('span')
          span.className = 'template-field'
          span.setAttribute('data-placeholder', iterPart.content)

          // 使用initialValues中的值（如果有）填充未覆盖的部分
          if (!props.value || props.value === '') {
            const initialContent = getInitialContentForField(iterPart.content)
            if (initialContent) {
              span.textContent = initialContent
            }
          }

          editor.appendChild(span)

          // 如果还没有记录第一个字段，记录这个
          if (!firstField) {
            firstField = span
          }
        } else {
          editor.appendChild(document.createTextNode(iterPart.content))
        }
      }
    }
  }

  checkHasContent()

  // 优化：模板回填后，将光标定位到第一个输入块末尾（如果有）
  nextTick(() => {
    if (firstField && firstField.textContent) {
      // 如果第一个字段有内容，将光标定位到内容末尾
      const selection = window.getSelection()
      const range = document.createRange()
      if (selection) {
        range.selectNodeContents(firstField)
        range.collapse(false) // false = 末尾
        selection.removeAllRanges()
        selection.addRange(range)
        firstField.focus()
      }
    } else if (firstField) {
      // 如果第一个字段没有内容（显示占位符），也将光标定位到字段内
      const selection = window.getSelection()
      const range = document.createRange()
      if (selection) {
        range.selectNodeContents(firstField)
        range.collapse(true) // true = 开头
        selection.removeAllRanges()
        selection.addRange(range)
        firstField.focus()
      }
    } else {
      // 如果没有找到字段，聚焦到编辑器末尾
      setCursorToEnd()
    }

    isInternalUpdate.value = false
  })
}

/**
 * 处理输入事件
 */
const handleInput = () => {
  if (isInternalUpdate.value || isComposing.value) return
  const currentValue = getValueFromDOM()
  if (currentValue !== props.value) {
    emit('update:value', currentValue)
    emit('input', currentValue)
  }
  checkHasContent(currentValue)
}

/**
 * 处理键盘按键事件
 */
const handleKeyDown = (event: KeyboardEvent) => {
  if (isComposing.value) return
  const editor = contentEditableRef.value
  if (!editor) return

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)

  if (event.key === 'Enter') {
    event.preventDefault()
    emit('submit', getValueFromDOM())
    return
  }

  // 处理左右箭头键导航
  if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !event.shiftKey) {
    const { startContainer, startOffset, collapsed } = range
    if (!collapsed) return // 如果有选择区域，使用默认行为

    // 判断是否在文本节点的边界
    const atTextStart = startContainer.nodeType === Node.TEXT_NODE && startOffset === 0 && event.key === 'ArrowLeft'
    const atTextEnd =
      startContainer.nodeType === Node.TEXT_NODE &&
      startOffset === (startContainer.textContent?.length || 0) &&
      event.key === 'ArrowRight'

    if (atTextStart || atTextEnd) {
      let targetNode: Node | null = null
      let targetPosition: 'before' | 'after' | 'inside' = 'inside'

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
          // 如果没有前一个兄弟节点，但在父元素内，则找父元素的前一个兄弟
          if (!prevNode && startContainer.parentNode && startContainer.parentNode !== editor) {
            prevNode = startContainer.parentNode.previousSibling
          }

          if (prevNode) {
            if (
              prevNode.nodeType === Node.ELEMENT_NODE &&
              (prevNode as HTMLElement).classList.contains('template-field')
            ) {
              // 前一个节点是字段，聚焦到字段内部
              targetNode = prevNode
              targetPosition = 'inside'
            }
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
          // 如果没有下一个兄弟节点，但在父元素内，则找父元素的下一个兄弟
          if (!nextNode && startContainer.parentNode && startContainer.parentNode !== editor) {
            nextNode = startContainer.parentNode.nextSibling
          }

          if (nextNode) {
            if (
              nextNode.nodeType === Node.ELEMENT_NODE &&
              (nextNode as HTMLElement).classList.contains('template-field')
            ) {
              // 下一个节点是字段，聚焦到字段内部
              targetNode = nextNode
              targetPosition = 'inside'
            }
          }
        }
      }

      if (targetNode) {
        event.preventDefault()
        const newRange = document.createRange()

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
        return
      }
    }

    // 处理空字段的特殊情况
    if (
      startContainer.nodeType === Node.ELEMENT_NODE &&
      (startContainer as HTMLElement).classList.contains('template-field') &&
      !startContainer.textContent
    ) {
      // 如果光标在空字段中，根据方向键移到字段前/后
      event.preventDefault()
      const newRange = document.createRange()

      if (event.key === 'ArrowLeft') {
        newRange.setStartBefore(startContainer)
      } else {
        newRange.setStartAfter(startContainer)
      }

      newRange.collapse(true)
      selection.removeAllRanges()
      selection.addRange(newRange)
      return
    }
  }

  if (event.key === 'Tab') {
    const fields = Array.from(editor.querySelectorAll('.template-field')) as HTMLElement[]
    if (fields.length > 0) {
      event.preventDefault()
      let currentFocusIdx = -1
      const activeElement = document.activeElement
      fields.forEach((field, idx) => {
        if (field === activeElement || field.contains(activeElement)) {
          currentFocusIdx = idx
        }
      })

      let nextFocusIdx: number
      if (event.shiftKey) {
        nextFocusIdx = currentFocusIdx > 0 ? currentFocusIdx - 1 : fields.length - 1
      } else {
        nextFocusIdx = currentFocusIdx < fields.length - 1 && currentFocusIdx !== -1 ? currentFocusIdx + 1 : 0
      }

      const targetField = fields[nextFocusIdx]
      if (targetField) {
        targetField.focus()
        const newRange = document.createRange()
        newRange.selectNodeContents(targetField)
        newRange.collapse(false) // 光标放在字段末尾
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    }
    return
  }

  // 优化后的Backspace处理
  if (event.key === 'Backspace' && range.collapsed) {
    const { startContainer, startOffset } = range

    // 判断当前是否在字段内部，且只剩一个字符即将被删除
    const isInField =
      startContainer.nodeType === Node.TEXT_NODE &&
      startContainer.parentNode &&
      (startContainer.parentNode as HTMLElement).classList.contains('template-field')

    if (isInField && startContainer.textContent && startContainer.textContent.length === 1 && startOffset === 1) {
      // 即将删除字段内最后一个字符，阻止默认行为
      event.preventDefault()

      // 清空文本内容但保留字段元素
      startContainer.textContent = ''

      // 重新设置光标位置到字段内
      const fieldElement = startContainer.parentNode as HTMLElement
      const newRange = document.createRange()
      newRange.selectNodeContents(fieldElement)
      newRange.collapse(true) // 将光标设置到字段开始位置
      selection.removeAllRanges()
      selection.addRange(newRange)

      // 触发输入事件以更新值
      handleInput()
      return
    }

    // 情况1: 光标在字段（可能为空）的开头位置
    // 此时我们需要移动光标到字段前，但不删除字段
    if (startOffset === 0) {
      let fieldElement: HTMLElement | null = null

      // 检查当前容器是否是字段
      if (
        startContainer.nodeType === Node.ELEMENT_NODE &&
        (startContainer as HTMLElement).classList.contains('template-field')
      ) {
        fieldElement = startContainer as HTMLElement
      }
      // 检查当前容器是否是字段中的文本节点
      else if (
        startContainer.nodeType === Node.TEXT_NODE &&
        startContainer.parentNode &&
        (startContainer.parentNode as HTMLElement).classList.contains('template-field')
      ) {
        fieldElement = startContainer.parentNode as HTMLElement
      }

      if (fieldElement) {
        // 找到了一个字段，阻止默认行为
        event.preventDefault()

        // 将光标移到字段前面
        range.setStartBefore(fieldElement)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
        return
      }
    }

    // 情况2: 光标紧跟一个空字段之后，此时删除该字段
    // 这种情况可能是:
    // 1. 光标在编辑器中直接位于一个字段节点后
    // 2. 光标在一个文本节点的开头，且文本节点前是一个空字段
    let prevNode: Node | null = null

    if (startContainer === editor && startOffset > 0) {
      // 如果光标直接在编辑器中，取前一个子节点
      prevNode = editor.childNodes[startOffset - 1]
    } else if (startContainer.nodeType === Node.TEXT_NODE && startOffset === 0) {
      // 如果光标在文本节点开头，取前一个兄弟节点
      prevNode = startContainer.previousSibling
    }

    if (
      prevNode &&
      prevNode.nodeType === Node.ELEMENT_NODE &&
      (prevNode as HTMLElement).classList.contains('template-field') &&
      prevNode.textContent === ''
    ) {
      // 前一个节点是空字段，删除它
      event.preventDefault()
      if (prevNode.parentNode) {
        prevNode.parentNode.removeChild(prevNode)
      }
      handleInput()
      return
    }
  }

  // 优化后的Delete处理
  if (event.key === 'Delete' && range.collapsed) {
    const { startContainer, startOffset } = range

    // 判断当前是否在字段内部，且在字段文本的末尾
    const isInField =
      startContainer.nodeType === Node.TEXT_NODE &&
      startContainer.parentNode &&
      (startContainer.parentNode as HTMLElement).classList.contains('template-field')

    if (
      isInField &&
      startContainer.textContent &&
      startOffset === startContainer.textContent.length &&
      startContainer.textContent.length === 1
    ) {
      // 即将从末尾删除字段内最后一个字符，阻止默认行为
      event.preventDefault()

      // 清空文本内容但保留字段元素
      startContainer.textContent = ''

      // 重新设置光标位置到字段内
      const fieldElement = startContainer.parentNode as HTMLElement
      const newRange = document.createRange()
      newRange.selectNodeContents(fieldElement)
      newRange.collapse(true) // 将光标设置到字段开始位置
      selection.removeAllRanges()
      selection.addRange(newRange)

      // 触发输入事件以更新值
      handleInput()
      return
    }

    // 寻找下一个要处理的节点
    let nextNode: Node | null = null

    // 如果光标在编辑器中且不在最后
    if (startContainer === editor && startOffset < editor.childNodes.length) {
      nextNode = editor.childNodes[startOffset]
    }
    // 如果光标在文本节点末尾
    else if (startContainer.nodeType === Node.TEXT_NODE && startOffset === (startContainer.textContent?.length || 0)) {
      nextNode = startContainer.nextSibling
    }

    // 仅当下一个节点是空字段时才删除
    if (
      nextNode &&
      nextNode.nodeType === Node.ELEMENT_NODE &&
      (nextNode as HTMLElement).classList.contains('template-field') &&
      nextNode.textContent === ''
    ) {
      event.preventDefault()
      if (nextNode.parentNode) {
        nextNode.parentNode.removeChild(nextNode)
      }
      handleInput()
      return
    }
  }
}

const handleCompositionStart = () => {
  isComposing.value = true
}
const handleCompositionEnd = () => {
  isComposing.value = false
  handleInput()
}

const hasContent = ref(false)
const checkHasContent = (value?: string) => {
  const currentVal = value === undefined ? getValueFromDOM() : value
  const newHasContent = currentVal.trim().length > 0
  if (hasContent.value !== newHasContent) {
    hasContent.value = newHasContent
    emit('content-status', newHasContent)
  }
}

onMounted(() => {
  updateEditorDOM()
  if (props.autofocus && contentEditableRef.value) {
    setCursorToEnd()
  }
})

watch(
  () => props.template,
  () => {
    if (!isInternalUpdate.value) updateEditorDOM()
  },
)

watch(
  () => props.value,
  (newValue) => {
    if (!isInternalUpdate.value && newValue !== getValueFromDOM()) {
      updateEditorDOM()
    }
  },
  { deep: false },
)

// 添加事件委托，处理模板字段的点击
const handleEditorClick = (event: MouseEvent) => {
  // 如果编辑器不存在，直接返回
  if (!contentEditableRef.value) return

  // 获取事件目标元素
  const target = event.target as HTMLElement

  // 检查是否点击了模板字段或其子元素
  let fieldElement: HTMLElement | null = null

  if (target.classList.contains('template-field')) {
    fieldElement = target
  } else if (target.parentElement?.classList.contains('template-field')) {
    fieldElement = target.parentElement
  }

  // 如果点击了字段元素
  if (fieldElement) {
    // 检查字段是否为空
    if (!fieldElement.textContent || fieldElement.textContent.trim() === '') {
      // 当点击空字段时，设置光标到字段内部
      const selection = window.getSelection()
      const range = document.createRange()

      if (selection) {
        // 创建新的范围并聚焦到字段内部开头
        range.selectNodeContents(fieldElement)
        range.collapse(true) // true表示折叠到开头

        // 应用新的选择范围
        selection.removeAllRanges()
        selection.addRange(range)

        // 确保字段获得焦点
        fieldElement.focus()

        // 阻止默认行为和冒泡
        event.preventDefault()
        event.stopPropagation()
      }
    }
  }
}

defineExpose<TemplateEditorExpose>({
  focus: () => {
    contentEditableRef.value?.focus()
    setCursorToEnd()
  },
  resetFields: () => {
    if (contentEditableRef.value) {
      isInternalUpdate.value = true
      const editor = contentEditableRef.value
      editor.innerHTML = ''
      const parts = parseTemplateToParts(props.template)
      let newEmittedValue = ''

      parts.forEach((part) => {
        if (part.type === 'field') {
          const span = document.createElement('span')
          span.className = 'template-field'
          span.setAttribute('data-placeholder', part.content)

          // 使用initialValues中的值（如果有）
          const initialContent = getInitialContentForField(part.content)
          if (initialContent) {
            span.textContent = initialContent
            newEmittedValue += initialContent // 添加到最终值中
          }

          editor.appendChild(span)
        } else {
          editor.appendChild(document.createTextNode(part.content))
          newEmittedValue += part.content
        }
      })

      emit('update:value', newEmittedValue)

      setCursorToEnd()
      checkHasContent(newEmittedValue)
      nextTick(() => {
        isInternalUpdate.value = false
      })
    }
  },
  activateFirstField: () => {
    const firstField = contentEditableRef.value?.querySelector('.template-field') as HTMLElement | null
    if (firstField) {
      firstField.focus()
      const selection = window.getSelection()
      const range = document.createRange()
      if (selection) {
        range.selectNodeContents(firstField)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    } else {
      setCursorToEnd()
    }
  },
})
</script>

<template>
  <div
    class="template-editor"
    ref="contentEditableRef"
    contenteditable="true"
    @input="handleInput"
    @keydown="handleKeyDown"
    @click="handleEditorClick"
    @compositionstart="handleCompositionStart"
    @compositionend="handleCompositionEnd"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
  ></div>
</template>

<style lang="less" scoped>
.template-editor {
  width: 100%;
  min-height: 26px; /* Ensure focusability even when empty */
  line-height: 26px;
  border-radius: 4px;
  word-break: break-word;
  word-wrap: break-word; /* 旧版本浏览器的兼容性 */
  white-space: pre-wrap; /* Allow wrapping and preserve spaces/newlines */
  outline: none; /* Remove default focus outline */
  display: block; /* 使编辑器成为块级元素 */
  box-sizing: border-box; /* 包含内边距在宽度计算中 */
  overflow-wrap: break-word; /* 确保长单词可以折行 */
  text-align: left; /* 确保文本左对齐 */
  overflow: hidden; /* 防止内容溢出 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
}

:deep(.template-field) {
  display: inline; /* 确保字段显示为内联元素 */
  min-width: 2em; /* 设置最小宽度，确保空字段也有可点击区域 */
  max-width: none; /* 清除最大宽度限制，依赖于父容器控制 */
  background: rgba(0, 0, 0, 0.05);
  padding: 3px 8px; /* Horizontal padding for the field */
  margin: 0 2px; /* Space around the field */
  border-radius: 4px;
  cursor: text;
  transition: background-color 0.2s ease;
  white-space: normal !important; /* 强制允许文本在字段内折行 */
  word-break: break-all !important; /* 允许在任意字符处断行，更强力的折行方式 */
  word-wrap: break-word !important; /* 旧版本浏览器的兼容性 */
  box-sizing: border-box; /* 确保padding不会增加宽度 */
  overflow-wrap: break-word !important; /* 更现代的折行控制属性 */
  line-height: 16px; /* 提供更好的多行间距 */
  position: relative; /* 为伪元素提供相对定位上下文 */
  vertical-align: middle; /* 统一所有状态下的垂直对齐方式 */
  hyphens: auto; /* 启用连字符，帮助长英文词的折行 */

  /* 明确设置内容为空白时的行为 */
  &:empty {
    min-height: 24px; /* 确保空字段有足够高度 */
    min-width: 3em; /* 确保空字段有足够宽度 */
    display: inline-block; /* 空字段使用inline-block确保有区域 */
    vertical-align: middle; /* 与字段自身和周围文本保持一致的垂直对齐 */
    line-height: 16px;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }

  &:empty::before {
    content: attr(data-placeholder);
    color: #a8abb2;
    cursor: text;
    user-select: none;
    position: absolute; /* 使用绝对定位，不占用实际空间 */
    left: 8px; /* 与padding对齐 */
    top: 50%; /* 定位到中心点 */
    transform: translateY(-50%); /* 精确垂直居中 */
    pointer-events: none; /* 确保鼠标事件穿透到实际字段元素 */
  }
}
</style>
