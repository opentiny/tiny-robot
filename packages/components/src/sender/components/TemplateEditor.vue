<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { TemplatePart, TemplateEditorProps, TemplateEditorEmits, TemplateEditorExpose } from '../index.type'

// 使用类型定义props
const props = defineProps<TemplateEditorProps>()

// 使用类型定义emits
const emit = defineEmits<TemplateEditorEmits>()

// 编辑器DOM引用
const editorRef = ref<HTMLElement | null>(null)

// 输入框引用集合
// eslint-disable-next-line
const inputRefs = ref<any>({})

// 当前激活的输入块索引
const activeFieldIndex = ref<number>(-1)

// 解析模板，将其分解为普通文本和可编辑字段
const templateParts = computed<TemplatePart[]>(() => {
  // TODO: 如果已有值，使用现有值填充模板
  if (props.value) {
    return parseValueIntoTemplate()
  }

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

    // 添加匹配的字段
    parts.push({
      content: '',
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

  return parts
})

// 解析现有值填充到模板中
const parseValueIntoTemplate = (): TemplatePart[] => {
  // 在实际应用中，这里应该根据模板和现有值进行匹配
  return templateParts.value
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
}

// 激活输入块
const activateField = (index: number): void => {
  activeFieldIndex.value = index

  // 确保DOM更新后再聚焦
  nextTick(() => {
    if (inputRefs.value[index]) {
      inputRefs.value[index]?.focus()
    }
  })
}

// 取消激活输入块
const deactivateField = (): void => {
  updateValue()
  activeFieldIndex.value = -1
}

// 处理输入框键盘事件
const handleInputKeyDown = (event: KeyboardEvent, index: number): void => {
  if (event.key === 'Tab') {
    event.preventDefault()

    // 找到下一个输入块
    const nextFieldIndex = findNextFieldIndex(index, event.shiftKey)
    if (nextFieldIndex !== -1) {
      // 先更新当前值
      updateValue()
      // 再激活下一个字段
      activateField(nextFieldIndex)
    }
  } else if (event.key === 'Enter') {
    event.preventDefault()
    deactivateField()
  }
}

// 寻找下一个输入块索引，支持通过 shift+tab 反向查找
const findNextFieldIndex = (currentIndex: number, isReverse = false): number => {
  if (isReverse) {
    // 向前查找（Shift+Tab）
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (templateParts.value[i].isField) {
        return i
      }
    }

    // 如果没有找到，则循环到最后一个字段
    for (let i = templateParts.value.length - 1; i > currentIndex; i--) {
      if (templateParts.value[i].isField) {
        return i
      }
    }
  } else {
    // 向后查找（Tab）
    for (let i = currentIndex + 1; i < templateParts.value.length; i++) {
      if (templateParts.value[i].isField) {
        return i
      }
    }

    // 循环回到第一个输入块
    for (let i = 0; i < currentIndex; i++) {
      if (templateParts.value[i].isField) {
        return i
      }
    }
  }

  return -1
}

// 监听值变化
watch(
  () => props.value,
  (newValue) => {
    // 如果外部值为空字符串，清空所有字段内容
    if (newValue === '') {
      resetFields()
    }
  },
)

// 重置所有字段内容
const resetFields = (): void => {
  // 清空所有输入块内容
  templateParts.value.forEach((part) => {
    if (part.isField) {
      part.content = ''
    }
  })
  // 更新值
  updateValue()
}

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
          <input
            v-if="activeFieldIndex === index"
            :ref="(el) => (inputRefs[index] = el)"
            v-model="part.content"
            class="template-input"
            @blur="deactivateField()"
            @keydown="handleInputKeyDown($event, index)"
            @click.stop
          />
          <span v-else class="template-placeholder">{{ part.content || part.placeholder }}</span>
        </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
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
}

.template-field:hover {
  background: rgba(0, 0, 0, 0.08);
}

.template-placeholder {
  color: #666;
  user-select: none;
}

.template-input {
  box-sizing: border-box;
  width: 100%;
  height: 26px;
  border: 1px solid rgb(194, 194, 194);
  border-radius: 4px;
  padding: 0 10px;
  outline: none;
  background: white;
}

.template-field-active {
  background: transparent;
  padding: 0;
}
</style>
