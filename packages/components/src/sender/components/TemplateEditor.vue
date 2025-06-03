<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import type { TemplateEditorProps, TemplateEditorEmits, TemplateEditorExpose, SetTemplateParams } from '../index.type'
import { useTemplateHandler } from '../composables/useTemplateHandler'
import { useTemplateKeyboardHandler } from '../composables/useKeyboardHandler'

// 使用 defineModel 定义双向绑定的值
const inputValue = defineModel<string>('value', { default: '' })

const props = defineProps<TemplateEditorProps>()

const emit = defineEmits<TemplateEditorEmits>()

// DOM引用
const contentEditableRef = ref<HTMLDivElement | null>(null)

// 内部状态
const template = ref('')
const initialValues = ref<Record<string, string>>({})
const isInternalUpdate = ref(false) // 防止程序化更新时的事件循环
const isComposing = ref(false) // 输入法组合状态

// 使用模板处理 Hook
const templateHandler = useTemplateHandler(contentEditableRef, {
  template: template.value,
  value: inputValue.value,
  initialValues: initialValues.value,
  isInternalUpdate,
  isComposing,
  onValueChange: (newValue: string) => {
    // 强制更新 defineModel 的值，即使在内部更新期间也要同步
    if (inputValue.value !== newValue) {
      // 临时设置标志，防止循环更新
      const wasInternalUpdate = isInternalUpdate.value
      isInternalUpdate.value = true

      inputValue.value = newValue

      // 恢复标志
      nextTick(() => {
        isInternalUpdate.value = wasInternalUpdate
      })
    }
  },
  onInput: (newValue: string) => {
    emit('input', newValue)
  },
  onContentStatusChange: (hasContent: boolean) => emit('content-status', hasContent),
  onSubmit: (submitValue: string) => emit('submit', submitValue),
})

// 使用键盘事件处理 Hook
const keyboardHandler = useTemplateKeyboardHandler({
  editor: contentEditableRef,
  isComposing,
  getValueFromDOM: templateHandler.getValueFromDOM,
  handleInput: templateHandler.handleInput,
  onSubmit: (submitValue: string) => emit('submit', submitValue),
})

// 生成模板内容的辅助函数
const generateTemplateContent = (templateStr: string, initialVals: Record<string, string>): string => {
  let content = templateStr

  // 替换模板中的占位符
  Object.entries(initialVals).forEach(([key, value]) => {
    const placeholder = `[${key}]`
    content = content.replace(new RegExp(placeholder.replace(/[[\]]/g, '\\$&'), 'g'), value)
  })

  return content
}

// 设置模板方法
const setTemplate = (params: SetTemplateParams) => {
  // 设置内部更新标志，防止触发 watch 回调
  isInternalUpdate.value = true

  template.value = params.template
  initialValues.value = params.initialValues || {}

  // 生成基于新模板和初始值的内容
  const newContent = generateTemplateContent(template.value, initialValues.value)

  // 更新 templateHandler 的选项
  templateHandler.updateOptions({
    template: template.value,
    value: newContent, // 使用新生成的内容而不是旧的inputValue
    initialValues: initialValues.value,
  })

  // 更新 DOM
  templateHandler.updateEditorDOM()

  // 同步更新 inputValue
  inputValue.value = newContent

  // 重置内部更新标志
  nextTick(() => {
    isInternalUpdate.value = false
  })
}

// 处理输入法组合事件
const handleCompositionStart = () => {
  isComposing.value = true
}

const handleCompositionEnd = () => {
  isComposing.value = false
  templateHandler.handleInput()
}

// 处理点击事件
const handleEditorClick = (event: MouseEvent) => {
  if (!contentEditableRef.value) return

  const target = event.target as HTMLElement
  let fieldElement: HTMLElement | null = null

  if (target.classList.contains('template-field')) {
    fieldElement = target
  } else if (target.parentElement?.classList.contains('template-field')) {
    fieldElement = target.parentElement
  }

  if (fieldElement) {
    if (!fieldElement.textContent || fieldElement.textContent.trim() === '') {
      const selection = window.getSelection()
      const range = document.createRange()

      if (selection) {
        range.selectNodeContents(fieldElement)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
        fieldElement.focus()
        event.preventDefault()
        event.stopPropagation()
      }
    }
  }
}

// 处理粘贴事件
const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()

  // 获取粘贴的数据
  const clipboardData = event.clipboardData
  if (!clipboardData) return

  // 获取HTML和文本内容
  const htmlData = clipboardData.getData('text/html')
  const textData = clipboardData.getData('text/plain')

  if (htmlData) {
    // 创建临时容器解析HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlData

    // 检查并修复模板字段
    const spans = tempDiv.querySelectorAll('span')
    let hasTemplateFields = false

    spans.forEach((span) => {
      const element = span as HTMLElement
      const style = element.style

      // 检查是否具有模板字段的特征
      const hasTemplateFieldClass = element.classList.contains('template-field')
      const hasTemplateFieldAttr = element.hasAttribute('data-placeholder')

      // 检查背景颜色特征（支持多种格式）
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

      // 检查其他可能的模板字段特征
      const hasTemplateFieldStyles =
        style.borderRadius === '4px' ||
        style.padding === '3px 8px' ||
        style.margin === '0px 2px' ||
        style.whiteSpace === 'nowrap'

      if (hasTemplateFieldClass || hasTemplateFieldAttr || hasTemplateFieldBg || hasTemplateFieldStyles) {
        hasTemplateFields = true
        // 确保有正确的类名
        element.className = 'template-field'

        // 获取placeholder
        if (!element.getAttribute('data-placeholder')) {
          const placeholder = templateHandler.extractPlaceholderFromElement(element)

          if (placeholder) {
            element.setAttribute('data-placeholder', placeholder)
          }
        }

        // 清理内联样式，让CSS类接管
        element.removeAttribute('style')
      }
    })

    if (hasTemplateFields) {
      // 插入修复后的HTML
      insertHtmlContent(tempDiv)
      return
    }
  }

  // 如果没有检测到模板字段，则插入纯文本
  if (textData) {
    insertTextContent(textData)
  }
}

// 插入HTML内容的辅助函数
const insertHtmlContent = (container: HTMLElement) => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()

    // 将修复后的内容插入
    const fragment = document.createDocumentFragment()
    while (container.firstChild) {
      fragment.appendChild(container.firstChild)
    }
    range.insertNode(fragment)

    // 移动光标到插入内容的末尾
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)

    // 强制更新值 - 多重保障
    updateValueAfterPaste()
  }
}

// 插入文本内容的辅助函数
const insertTextContent = (text: string) => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(document.createTextNode(text))

    // 移动光标到插入内容的末尾
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)

    // 强制更新值 - 多重保障
    updateValueAfterPaste()
  }
}

// 粘贴后强制更新值的辅助函数
const updateValueAfterPaste = () => {
  // 确保不在输入法组合状态
  isComposing.value = false

  // 使用多种方式确保值被正确更新
  nextTick(() => {
    // 方法1: 直接调用handleInput
    templateHandler.handleInput()

    // 方法2: 手动获取DOM值并更新
    const newValue = templateHandler.getValueFromDOM()
    if (newValue !== inputValue.value) {
      // 临时设置标志，防止循环更新
      const wasInternalUpdate = isInternalUpdate.value
      isInternalUpdate.value = true

      inputValue.value = newValue
      emit('input', newValue)

      // 恢复标志
      nextTick(() => {
        isInternalUpdate.value = wasInternalUpdate
      })
    }

    // 方法3: 再次延迟确保DOM完全更新
    setTimeout(() => {
      const finalValue = templateHandler.getValueFromDOM()
      if (finalValue !== inputValue.value) {
        isInternalUpdate.value = true
        inputValue.value = finalValue
        emit('input', finalValue)

        nextTick(() => {
          isInternalUpdate.value = false
        })
      }
    }, 50)
  })
}

onMounted(() => {
  if (template.value) {
    templateHandler.updateEditorDOM()
  }
  if (props.autofocus && contentEditableRef.value) {
    templateHandler.setCursorToEnd()
  }
})

// 监听内部 template 变化
watch(
  () => template.value,
  () => {
    if (!isInternalUpdate.value) {
      templateHandler.updateOptions({
        template: template.value,
        value: inputValue.value,
        initialValues: initialValues.value,
      })
      templateHandler.updateEditorDOM()
    }
  },
)

// 监听 initialValues 变化
watch(
  () => initialValues.value,
  () => {
    if (!isInternalUpdate.value) {
      templateHandler.updateOptions({
        template: template.value,
        value: inputValue.value,
        initialValues: initialValues.value,
      })
      templateHandler.updateEditorDOM()
    }
  },
  { deep: true },
)

// 监听 defineModel 的值变化
watch(
  () => inputValue.value,
  (newValue) => {
    if (!isInternalUpdate.value) {
      // 先更新 templateHandler 的 options.value
      templateHandler.updateOptions({
        template: template.value,
        value: newValue,
        initialValues: initialValues.value,
      })
      templateHandler.updateEditorDOM()
    }

    // 检测模板内容是否为空，如果为空则通知父组件可以退出模板编辑模式
    if (!newValue || newValue.trim() === '') {
      emit('empty-content')
    }
  },
)

// 暴露方法
defineExpose<TemplateEditorExpose>({
  focus: () => {
    contentEditableRef.value?.focus()
    templateHandler.setCursorToEnd()
  },
  resetFields: templateHandler.resetFields,
  activateFirstField: templateHandler.activateFirstField,
  getValueFromDOM: templateHandler.getValueFromDOM,
  setTemplate,
})
</script>

<template>
  <div
    class="template-editor"
    ref="contentEditableRef"
    contenteditable="true"
    @input="templateHandler.handleInput"
    @keydown="keyboardHandler.handleTemplateKeyDown"
    @click="handleEditorClick"
    @compositionstart="handleCompositionStart"
    @compositionend="handleCompositionEnd"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
    @paste="handlePaste"
  ></div>
</template>
