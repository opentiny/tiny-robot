<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
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

// 标记是否是内部更新，避免循环更新
const isInternalUpdate = ref(false)

// 使用ref代替computed属性，作为组件的主要状态来源
const editableParts = ref<TemplatePart[]>([])

// 解析模板，将其分解为普通文本和可编辑字段
const parseTemplate = (template: string): TemplatePart[] => {
  const parts: TemplatePart[] = []
  let currentIndex = 0
  let fieldIndex = 0

  // 正则表达式匹配 [xxx] 格式
  const regex = /\[(.*?)\]/g
  let match

  while ((match = regex.exec(template)) !== null) {
    // 添加匹配前的普通文本
    if (match.index > currentIndex) {
      parts.push({
        content: template.substring(currentIndex, match.index),
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
  if (currentIndex < template.length) {
    parts.push({
      content: template.substring(currentIndex),
      isField: false,
    })
  }

  return parts
}

// 初始化editableParts
const initializeEditableParts = (): void => {
  editableParts.value = parseTemplate(props.template)
  if (props.value) {
    updatePartsFromValue(props.value)
  }
}

// 从value更新各个部分的内容
const updatePartsFromValue = (value: string): void => {
  if (!value || isInternalUpdate.value) return

  // 仅在值确实不同时才更新，避免不必要的处理
  const currentValue = generateValue()
  if (currentValue === value) return

  // 创建一个临时的解析结果用于比较
  const templateStructure = parseTemplate(props.template)

  // 计算模板的静态部分（非字段部分）
  const staticParts: string[] = []

  templateStructure.forEach((part) => {
    if (!part.isField) {
      staticParts.push(part.content)
    } else {
      // 用一个占位符标记字段位置
      staticParts.push(`__FIELD_${part.fieldIndex}__`)
    }
  })

  // 使用静态部分作为分隔符，尝试提取字段值
  let remainingValue = value
  let currentFieldIndex = 0

  // 遍历editableParts，找到字段并更新
  for (let i = 0; i < editableParts.value.length; i++) {
    const part = editableParts.value[i]

    if (!part.isField) continue

    // 尝试找到当前字段前的静态部分
    const prevStaticPart = staticParts[currentFieldIndex]
    currentFieldIndex++

    // 下一个静态部分（如果有）
    const nextStaticPart = staticParts[currentFieldIndex] || ''

    if (prevStaticPart && remainingValue.startsWith(prevStaticPart)) {
      // 移除前导静态部分
      remainingValue = remainingValue.substring(prevStaticPart.length)

      // 如果有下一个静态部分，提取中间的字段值
      if (nextStaticPart && remainingValue.includes(nextStaticPart)) {
        const fieldEndIndex = remainingValue.indexOf(nextStaticPart)
        const fieldValue = remainingValue.substring(0, fieldEndIndex)

        // 更新字段内容
        if (fieldValue) {
          editableParts.value[i].content = fieldValue

          // 如果当前字段是激活状态，更新DOM内容，但不改变光标位置
          if (activeFieldIndex.value === i && editableRefs.value[i]) {
            // 使用MutationObserver来禁用临时
            isUserEditing.value = true
            // 不要直接设置textContent，避免干扰用户输入
          }
        }

        // 移除已处理的部分
        remainingValue = remainingValue.substring(fieldEndIndex)
      } else if (!nextStaticPart && remainingValue) {
        // 如果是最后一个字段，则剩余的全部是它的值
        editableParts.value[i].content = remainingValue
        remainingValue = ''
      }
    }
  }

  // 更新内容状态
  checkHasContent(value)
}

// 生成完整的文本值
const generateValue = (): string => {
  return editableParts.value.map((part) => part.content).join('')
}

// 更新值并触发事件
const updateValue = (): void => {
  isInternalUpdate.value = true
  const newValue = generateValue()
  emit('update:value', newValue)
  emit('input', newValue)
  checkHasContent(newValue)

  // 延迟重置标志，防止循环更新
  setTimeout(() => {
    isInternalUpdate.value = false
  }, 0)
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

    // 设置初始内容 (只在初始时设置，后续由用户输入控制)
    if (!el.textContent) {
      el.textContent = editableParts.value[index].content
    }

    // 使用MutationObserver监听内容变化，但避免循环更新
    const observer = new MutationObserver(() => {
      if (activeFieldIndex.value === index && !isUserEditing.value) {
        isUserEditing.value = true

        // 延迟更新模型，避免与Vue渲染循环冲突
        setTimeout(() => {
          editableParts.value[index].content = el.textContent || (editableParts.value[index].placeholder as string)
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
  const content = target.textContent || (editableParts.value[index].placeholder as string)

  // 更新模型，但不触发DOM更新
  if (editableParts.value[index].content !== content) {
    editableParts.value[index].content = content
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
      editableParts.value[currentIndex].content =
        el.textContent || (editableParts.value[currentIndex].placeholder as string)
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

      // 确保元素有内容以便放置光标
      if (!el.textContent) {
        el.textContent = editableParts.value[index].content
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
      editableParts.value[currentIndex].content = content || (editableParts.value[currentIndex].placeholder as string)
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
    } else if (newValue && !isInternalUpdate.value) {
      // 如果新值不为空，并且不是内部更新触发的，更新各部分内容
      updatePartsFromValue(newValue)
    }
  },
)

// 监听模板变化
watch(
  () => props.template,
  () => {
    // 当模板变化时，重新初始化
    initializeEditableParts()
    // 检查内容状态
    nextTick(() => {
      checkHasContent()
    })
  },
  { immediate: true },
)

// 重置所有字段内容为默认值
const resetToDefaultValues = (): void => {
  editableParts.value.forEach((part) => {
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
    for (let i = 0; i < editableParts.value.length; i++) {
      if (editableParts.value[i].isField) {
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
      <template v-for="(part, index) in editableParts" :key="index">
        <!-- 普通文本部分 -->
        <span v-if="!part.isField">{{ part.content }}</span>

        <!-- 可编辑的输入块部分 -->
        <span
          v-else
          class="template-field"
          :class="{ 'template-field-active': activeFieldIndex === index }"
          @click="activateField(index)"
        >
          <!-- 编辑状态显示 -->
          <span
            v-if="activeFieldIndex === index"
            :ref="(el) => registerEditableRef(el as HTMLSpanElement, index)"
            class="template-editable"
            contenteditable="true"
            @input="handleContentInput($event, index)"
            @blur="deactivateField()"
            @keydown="handleInputKeyDown($event)"
            @click.stop
          ></span>
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
