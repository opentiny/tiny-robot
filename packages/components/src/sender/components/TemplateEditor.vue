<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { TemplatePart, TemplateEditorProps, TemplateEditorEmits, TemplateEditorExpose } from '../index.type'

// 使用类型定义props
const props = defineProps<TemplateEditorProps>()

// 使用类型定义emits
const emit = defineEmits<TemplateEditorEmits>()

// 编辑器DOM引用
const editorRef = ref<HTMLElement | null>(null)

// 可编辑元素引用集合
const editableRefs = ref<Record<number, HTMLElement>>({})

// 当前激活的输入块索引
const activeFieldIndex = ref<number>(-1)

// 是否有内容标志
const hasContent = ref(false)

// 标记是否是用户手动编辑
const isUserEditing = ref(false)

// 解析模板，将其分解为普通文本和可编辑字段
const templateParts = computed<TemplatePart[]>(() => {
  // 否则使用模板解析
  const parts: TemplatePart[] = []
  let currentIndex = 0
  let fieldIndex = 0

  // 正则表达式匹配 [xxx] 格式
  const regex = /\[(.*?)\]/g
  let match

  while ((match = regex.exec(props.template)) !== null) {
    // 添加匹配前的普通文本
    if (match.index > currentIndex) {
      parts.push({
        content: props.template.substring(currentIndex, match.index),
        isField: false,
      })
    }

    // 添加匹配的字段，将placeholder作为默认内容
    parts.push({
      content: match[1], // 使用占位符作为默认内容
      placeholder: match[1],
      isField: true,
      fieldIndex: fieldIndex++,
    })

    currentIndex = match.index + match[0].length
  }

  // 添加剩余的普通文本
  if (currentIndex < props.template.length) {
    parts.push({
      content: props.template.substring(currentIndex),
      isField: false,
    })
  }

  // 如果有value，用value覆盖默认值
  if (props.value) {
    return parseValueIntoTemplate(parts, props.value)
  }

  return parts
})

// 解析现有值填充到模板中
const parseValueIntoTemplate = (parts: TemplatePart[], value: string): TemplatePart[] => {
  if (!value) return parts
  const newParts = JSON.parse(JSON.stringify(parts))
  return newParts
}

// 生成完整的文本值
const generateValue = (): string => {
  return templateParts.value.map((part) => part.content).join('')
}

// 更新值并触发事件
const updateValue = (): void => {
  const newValue = generateValue()
  emit('update:value', newValue)
  emit('input', newValue)
  checkHasContent(newValue)
}

// 检查是否有内容
const checkHasContent = (value?: string): void => {
  const contentValue = value || generateValue()
  const newHasContent = contentValue.trim().length > 0

  if (hasContent.value !== newHasContent) {
    hasContent.value = newHasContent
    emit('content-status', newHasContent)
  }
}

// 注册可编辑元素引用
const registerEditableRef = (el: HTMLSpanElement | null, index: number): void => {
  if (el) {
    // 保存引用
    editableRefs.value[index] = el

    // 使用MutationObserver监听内容变化，但避免循环更新
    const observer = new MutationObserver(() => {
      if (activeFieldIndex.value === index && !isUserEditing.value) {
        isUserEditing.value = true

        // 延迟更新模型，避免与Vue渲染循环冲突
        setTimeout(() => {
          templateParts.value[index].content = el.textContent || (templateParts.value[index].placeholder as string)
          isUserEditing.value = false
        }, 0)
      }
    })

    observer.observe(el, {
      characterData: true,
      childList: true,
      subtree: true,
    })
  }
}

// 处理内容输入事件
const handleContentInput = (event: Event, index: number): void => {
  isUserEditing.value = true

  // 获取当前输入内容
  const target = event.target as HTMLElement
  const content = target.textContent || (templateParts.value[index].placeholder as string)

  // 更新模型
  if (templateParts.value[index].content !== content) {
    templateParts.value[index].content = content
    updateValue()
  }

  // 通过延时重置标志，防止与MutationObserver冲突
  setTimeout(() => {
    isUserEditing.value = false
  }, 10)
}

// 将光标放到元素内容末尾
const placeCaretAtEnd = (el: HTMLElement): void => {
  if (document.createRange) {
    const range = document.createRange()
    range.selectNodeContents(el)
    // false表示光标放到末尾
    range.collapse(false)

    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
}

// 激活输入块
const activateField = (index: number): void => {
  // 如果点击的就是当前激活的字段，不做任何处理
  if (activeFieldIndex.value === index) {
    return
  }

  // 如果当前已有激活的字段，先保存它的值
  if (activeFieldIndex.value !== -1) {
    const currentIndex = activeFieldIndex.value
    const el = editableRefs.value[currentIndex]
    if (el) {
      templateParts.value[currentIndex].content =
        el.textContent || (templateParts.value[currentIndex].placeholder as string)
      updateValue()
    }
  }

  // 设置激活状态
  activeFieldIndex.value = index
  emit('field-active', true, index)

  // 确保DOM更新后再聚焦
  nextTick(() => {
    const el = editableRefs.value[index]
    if (el) {
      // 先获取焦点
      el.focus()

      // 只有在内容为空时才设置内容
      if (!el.textContent || el.textContent.trim() === '') {
        el.textContent = templateParts.value[index].content
      }

      // 将光标放到末尾
      placeCaretAtEnd(el)
    }
  })
}

// 取消激活输入块
const deactivateField = (): void => {
  const currentIndex = activeFieldIndex.value
  if (currentIndex >= 0) {
    // 更新当前编辑的内容
    const el = editableRefs.value[currentIndex]
    if (el) {
      const content = el.textContent || ''
      templateParts.value[currentIndex].content = content || (templateParts.value[currentIndex].placeholder as string)
    }

    emit('field-active', false, currentIndex)
  }

  updateValue()
  activeFieldIndex.value = -1
}

// 处理输入框键盘事件
const handleInputKeyDown = (event: KeyboardEvent): void => {
  // 只处理Enter键
  if (event.key === 'Enter') {
    event.preventDefault()
    deactivateField()
  }
}

// 监听值变化
watch(
  () => props.value,
  (newValue) => {
    // 如果外部值为空字符串，重置为默认placeholder值
    if (newValue === '') {
      resetToDefaultValues()
    }
  },
)

// 监听模板变化
watch(
  () => props.template,
  () => {
    // 当模板变化时，检查内容状态
    nextTick(() => {
      checkHasContent()
    })
  },
)

// 重置所有字段内容为默认值
const resetToDefaultValues = (): void => {
  templateParts.value.forEach((part) => {
    if (part.isField) {
      part.content = part.placeholder || ''
    }
  })
  // 更新值
  updateValue()
}

// 重置所有字段内容
const resetFields = (): void => {
  resetToDefaultValues()
}

// 组件挂载时
onMounted(() => {
  // 初始化内容状态
  checkHasContent()
})

// 导出方法供父组件调用
defineExpose<TemplateEditorExpose>({
  activateFirstField: () => {
    for (let i = 0; i < templateParts.value.length; i++) {
      if (templateParts.value[i].isField) {
        activateField(i)
        break
      }
    }
  },
  resetFields,
})
</script>

<template>
  <div class="template-editor">
    <div class="template-content" ref="editorRef">
      <template v-for="(part, index) in templateParts" :key="index">
        <!-- 普通文本部分 -->
        <span v-if="!part.isField">{{ part.content }}</span>

        <!-- 可编辑的输入块部分 -->
        <span
          v-else
          class="template-field"
          :class="{ 'template-field-active': activeFieldIndex === index }"
          @click="activateField(index)"
        >
          <span
            v-if="activeFieldIndex === index"
            :ref="(el) => registerEditableRef(el as HTMLSpanElement, index)"
            class="template-editable"
            contenteditable="true"
            @input="handleContentInput($event, index)"
            @blur="deactivateField()"
            @keydown="handleInputKeyDown($event)"
            @click.stop
            >{{ part.content }}</span
          >
          <!-- 非编辑状态显示 -->
          <span v-else class="template-placeholder">{{ part.content }}</span>
        </span>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
.template-editor {
  width: 100%;
  min-height: 26px;
  line-height: 26px;
}

.template-content {
  display: inline;
  word-break: break-word;
}

.template-field {
  display: inline-block;
  height: 26px;
  min-width: fit-content;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
  padding: 0 10px;
  margin: 0 2px;
  vertical-align: middle;
  cursor: text;
  transition: all 0.2s ease;

  &-active {
    background-color: #ffffff;
    border: 1px solid rgba(194, 194, 194);
    border-radius: 4px;
  }

  .template-placeholder {
    color: #333;
    user-select: none;
  }
}

.template-editable {
  display: inline-block;
  min-width: 1px; // 防止编辑框过窄
  outline: none;
  white-space: nowrap;
  color: #333;

  &:focus {
    outline: none;
  }
}
</style>
