<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { TemplateEditorProps, TemplateEditorEmits, TemplateEditorExpose } from '../index.type'
import { useTemplateHandler } from '../composables/useTemplateHandler'
import { useTemplateKeyboardHandler } from '../composables/useKeyboardHandler'

// 定义props和emits
const props = defineProps<TemplateEditorProps>()
const emit = defineEmits<TemplateEditorEmits>()

// DOM引用
const contentEditableRef = ref<HTMLDivElement | null>(null)

// 内部状态
const isInternalUpdate = ref(false) // 防止程序化更新时的事件循环
const isComposing = ref(false) // 输入法组合状态

// 使用模板处理 Hook
const templateHandler = useTemplateHandler(contentEditableRef, {
  template: props.template,
  value: props.value,
  initialValues: props.initialValues,
  isInternalUpdate,
  isComposing,
  onValueChange: (value: string) => emit('update:value', value),
  onInput: (value: string) => emit('input', value),
  onContentStatusChange: (hasContent: boolean) => emit('content-status', hasContent),
  onSubmit: (value: string) => emit('submit', value),
})

// 使用键盘事件处理 Hook
const keyboardHandler = useTemplateKeyboardHandler({
  editor: contentEditableRef,
  isComposing,
  getValueFromDOM: templateHandler.getValueFromDOM,
  handleInput: templateHandler.handleInput,
  onSubmit: (value: string) => emit('submit', value),
})

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
  templateHandler.updateEditorDOM()
  if (props.autofocus && contentEditableRef.value) {
    templateHandler.setCursorToEnd()
  }
})

watch(
  () => props.template,
  () => {
    if (!isInternalUpdate.value) {
      templateHandler.updateOptions({
        template: props.template,
        value: props.value,
        initialValues: props.initialValues,
      })
      templateHandler.updateEditorDOM()
    }
  },
)

watch(
  () => props.value,
  (newValue) => {
    if (!isInternalUpdate.value && newValue !== templateHandler.getValueFromDOM()) {
      templateHandler.updateOptions({
        template: props.template,
        value: newValue,
        initialValues: props.initialValues,
      })
      templateHandler.updateEditorDOM()
    }
  },
  { deep: false },
)

// 暴露方法
defineExpose<TemplateEditorExpose>({
  focus: () => {
    contentEditableRef.value?.focus()
    templateHandler.setCursorToEnd()
  },
  resetFields: templateHandler.resetFields,
  activateFirstField: templateHandler.activateFirstField,
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
