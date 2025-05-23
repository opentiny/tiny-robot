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
