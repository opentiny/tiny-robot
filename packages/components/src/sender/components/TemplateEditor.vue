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
  ></div>
</template>
