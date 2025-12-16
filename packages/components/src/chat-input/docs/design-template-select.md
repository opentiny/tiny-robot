# TemplateSelect 扩展设计文档

## 概述

TemplateSelect 是 Template 扩展的一个子类型，用于在输入框中渲染可交互的下拉选择器。与 TemplateBlock（可编辑块）不同，TemplateSelect 是只读的，用户通过下拉菜单选择预设选项。

## 核心特性

- **只读节点**：不可直接编辑，只能通过下拉菜单选择
- **原子节点**：光标不能进入内部，作为整体处理
- **可重新选择**：选择后保留节点，可以重新打开下拉菜单修改选择
- **单例下拉**：同时只能打开一个下拉菜单
- **键盘导航**：支持方向键导航、Enter 选中、Esc 关闭
- **零宽字符管理**：在节点前后插入零宽字符，确保光标定位

## 使用场景

1. **模板快速填充**：提供预设选项，快速填充常用内容
2. **受限输入**：限制用户只能从预设选项中选择
3. **混合模板**：与 TemplateBlock 和普通文本混合使用

## 架构设计

### Template 扩展结构

```
Template 扩展（统一入口）
├── TemplateBlock（可编辑块）
│   ├── extension.ts
│   ├── template-block-view.vue
│   ├── plugins.ts（块专用插件）
│   └── index.less
│
└── TemplateSelect（选择器）
    ├── extension.ts
    ├── template-select-view.vue
    ├── plugins.ts（选择器专用插件）
    └── index.less
```

### 节点类型区分

Template 扩展通过数据结构的 `type` 字段区分不同类型：

```typescript
type TemplateItem = 
  | { type: 'text'; content: string }
  | { type: 'block'; content: string }  // TemplateBlock
  | { type: 'select'; placeholder: string; options: SelectOption[]; value?: string }  // TemplateSelect
```

## 数据结构

### SelectOption

```typescript
interface SelectOption {
  /**
   * 显示文本
   */
  label: string

  /**
   * 选择后的值
   */
  value: string

  /**
   * 自定义数据（可选）
   */
  data?: string
}
```

### TemplateSelectAttrs

```typescript
interface TemplateSelectAttrs {
  /**
   * 唯一标识
   */
  id: string

  /**
   * 占位文字（未选择时显示）
   */
  placeholder: string

  /**
   * 选项列表
   */
  options: SelectOption[]

  /**
   * 当前选中的值（可选）
   */
  value?: string
}
```

### TemplateItem 扩展

```typescript
// 在现有 TemplateItem 基础上扩展
type TemplateItem = 
  | { type: 'text'; content: string }
  | { type: 'block'; content: string }
  | { 
      type: 'select'
      placeholder: string
      options: SelectOption[]
      value?: string
    }
```



## 使用示例

### 基础用法

```typescript
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const templateData = ref<TemplateItem[]>([
  { type: 'text', content: 'Write an essay about ' },
  { 
    type: 'select',
    placeholder: 'Please enter a topic',
    options: [
      { label: 'Campus', value: 'campus life' },
      { label: 'Travel', value: 'travel experience' },
      { label: 'Reading', value: 'reading habits' }
    ]
  },
  { type: 'text', content: '. The requirement is ' },
  { type: 'block', content: '800' },
  { type: 'text', content: ' words.' }
])

const extensions = [ChatInput.template(templateData)]
```

### 混合使用

```typescript
const templateData = ref<TemplateItem[]>([
  { type: 'text', content: '请帮我' },
  { 
    type: 'select',
    placeholder: '选择操作',
    options: [
      { label: '分析', value: '分析' },
      { label: '总结', value: '总结' },
      { label: '翻译', value: '翻译' }
    ]
  },
  { type: 'text', content: '以下内容：' },
  { type: 'block', content: '' }  // 可编辑块
])
```

### 带默认值

```typescript
const templateData = ref<TemplateItem[]>([
  { type: 'text', content: 'Topic: ' },
  { 
    type: 'select',
    placeholder: 'Select a topic',
    options: [
      { label: 'Campus', value: 'campus' },
      { label: 'Travel', value: 'travel' }
    ],
    value: 'campus'  // 默认选中
  }
])
```

## 交互设计

### 视觉状态

#### 未选择状态
- 显示占位文字 + 下拉图标（▼）
- 浅蓝色背景，圆角矩形
- 鼠标悬浮时背景加深
- 光标样式为 pointer

#### 已选择状态
- 显示选中的 label + 下拉图标（▼）
- 浅蓝色背景，圆角矩形
- 鼠标悬浮时背景加深
- 可以重新点击打开下拉菜单

#### 下拉菜单打开状态
- 选择器保持高亮状态
- 下拉菜单显示在选择器下方
- 白色背景，阴影效果
- 选项悬浮时高亮

### 交互流程

#### 1. 打开下拉菜单

**触发方式**：
- 点击选择器节点

**行为**：
1. 关闭其他已打开的下拉菜单（单例模式）
2. 在选择器下方显示下拉菜单
3. 使用 Floating UI 计算菜单位置
4. 如果有选中值，高亮对应选项

#### 2. 选择选项

**触发方式**：
- 点击选项
- 键盘导航后按 Enter

**行为**：
1. 更新选择器节点的 `value` 属性
2. 关闭下拉菜单
3. 触发 `onSelect` 回调（如果配置）
4. 光标定位到选择器后面

#### 3. 关闭下拉菜单

**触发方式**：
- 按 Esc 键
- 点击选择器外部区域
- 选择选项后自动关闭

**行为**：
1. 隐藏下拉菜单
2. 恢复选择器的普通状态



## 键盘交互

### 下拉菜单关闭时

| 按键      | 行为                     | 说明                           |
| --------- | ------------------------ | ------------------------------ |
| Backspace | 删除选择器节点           | 光标在选择器后紧邻位置时       |
| 方向键    | 跳过选择器               | 光标会跳过选择器，不能进入内部 |

### 下拉菜单打开时

| 按键   | 行为               | 说明                       |
| ------ | ------------------ | -------------------------- |
| ↑      | 向上导航选项       | 循环导航，到顶部后跳到底部 |
| ↓      | 向下导航选项       | 循环导航，到底部后跳到顶部 |
| Enter  | 选中当前高亮的选项 | 选中后关闭菜单             |
| Esc    | 关闭下拉菜单       | 不选择，直接关闭           |

**注意**：
- 选择器是原子节点（`atom: true`），光标不能进入内部
- 选择器固定在插入位置，不能移动
- 删除选择器时会同时清理前后的零宽字符

## 节点定义

### 节点属性

```typescript
{
  name: 'templateSelect',
  group: 'inline',
  inline: true,
  atom: true,           // 原子节点，光标不能进入
  selectable: false,    // 不可选中
  draggable: false,     // 不可拖拽
}
```

### 节点属性定义

```typescript
addAttributes() {
  return {
    id: {
      default: null,
      parseHTML: (element) => element.getAttribute('data-id'),
      renderHTML: (attributes) => {
        if (!attributes.id) return {}
        return { 'data-id': attributes.id }
      }
    },
    placeholder: {
      default: 'Please select',
      parseHTML: (element) => element.getAttribute('data-placeholder'),
      renderHTML: (attributes) => {
        return { 'data-placeholder': attributes.placeholder }
      }
    },
    options: {
      default: [],
      parseHTML: (element) => {
        const optionsStr = element.getAttribute('data-options')
        return optionsStr ? JSON.parse(optionsStr) : []
      },
      renderHTML: (attributes) => {
        return { 'data-options': JSON.stringify(attributes.options) }
      }
    },
    value: {
      default: null,
      parseHTML: (element) => element.getAttribute('data-value'),
      renderHTML: (attributes) => {
        if (!attributes.value) return {}
        return { 'data-value': attributes.value }
      }
    }
  }
}
```

### HTML 渲染

```typescript
parseHTML() {
  return [
    {
      tag: 'span[data-template-select]'
    }
  ]
}

renderHTML({ node, HTMLAttributes }) {
  const selectedOption = node.attrs.options.find(
    opt => opt.value === node.attrs.value
  )
  const displayText = selectedOption?.label || node.attrs.placeholder
  
  return [
    'span',
    mergeAttributes(HTMLAttributes, {
      'data-template-select': '',
      'data-id': node.attrs.id,
      'data-placeholder': node.attrs.placeholder,
      'data-options': JSON.stringify(node.attrs.options),
      'data-value': node.attrs.value || ''
    }),
    displayText
  ]
}
```



## 零宽字符管理

### 实现方案

TemplateSelect 采用**组件内置零宽字符**的方案，在 Vue 组件中直接渲染零宽字符，而不是通过插件动态插入。

**优势：**
- 零宽字符作为 DOM 结构的一部分，总是存在
- 逻辑更简单，不需要复杂的插入判断
- 与 TemplateBlock 保持一致的实现方式

### Vue 组件实现

```vue
<template>
  <NodeViewWrapper as="span" class="template-select">
    <!-- 前置零宽字符 -->
    <span contenteditable="false" class="template-select__prefix">&#8203;</span>
    
    <!-- 选择器触发器 -->
    <span class="template-select__trigger">
      <span class="template-select__text">{{ displayText }}</span>
      <span class="template-select__icon">▼</span>
    </span>
    
    <!-- 后置零宽字符 -->
    <span contenteditable="false" class="template-select__suffix">&#8203;</span>
  </NodeViewWrapper>
</template>

<style scoped>
.template-select {
  display: inline;  /* 使用 inline，避免光标高度异常 */
  
  &__prefix,
  &__suffix {
    user-select: none;  /* 不可选中 */
  }
}
</style>
```

### 关键点

1. **零宽字符**：使用 HTML 实体 `&#8203;`（Unicode U+200B）
2. **contenteditable="false"**：防止零宽字符被编辑
3. **display: inline**：避免 `inline-block` 导致光标高度异常
4. **无需 font-size: 0px**：零宽字符本身不占空间

### 与 TemplateBlock 的差异

| 特性 | TemplateBlock | TemplateSelect |
|------|---------------|----------------|
| **内部零宽字符** | 需要（可编辑） | 不需要（原子节点） |
| **前后零宽字符** | 需要 | 需要 |
| **零宽字符位置** | 前、后、内部 | 仅前、后 |
| **实现方式** | 组件内置 | 组件内置 |

### 零宽字符清理插件

插件只负责清理孤立的零宽字符（段落中只有一个零宽字符的情况）：

```typescript
export function selectZeroWidthPlugin() {
  return new Plugin({
    key: new PluginKey('templateSelectZeroWidth'),
    
    appendTransaction(transactions, _oldState, newState) {
      const docChanged = transactions.some(tr => tr.docChanged)
      if (!docChanged) return null
      
      const todoPositions: Array<['remove', number]> = []
      let { tr } = newState
      
      newState.doc.descendants((node, pos) => {
        if (node.type.name === 'paragraph' && node.childCount > 0) {
          const { lastChild, firstChild } = node
          // 如果段落只有一个零宽字符，删除它
          if (lastChild === firstChild && lastChild?.isText && lastChild.text === ZERO_WIDTH_CHAR) {
            todoPositions.push(['remove', pos + 1])
          }
        }
      })
      
      if (todoPositions.length > 0) {
        todoPositions.forEach(([, pos]) => {
          tr = tr.delete(pos, pos + 1)
        })
        return tr
      }
      
      return null
    }
  })
}
```

## 下拉菜单实现

### Floating UI 集成

使用 Floating UI 计算下拉菜单的位置，确保菜单不会超出视口：

```typescript
import { computePosition, flip, shift, offset } from '@floating-ui/dom'

async function updateDropdownPosition(
  triggerElement: HTMLElement,
  dropdownElement: HTMLElement
) {
  const { x, y } = await computePosition(triggerElement, dropdownElement, {
    placement: 'bottom-start',
    middleware: [
      offset(4),        // 与触发器的间距
      flip(),           // 空间不足时翻转到上方
      shift({ padding: 8 })  // 防止超出视口
    ]
  })
  
  Object.assign(dropdownElement.style, {
    left: `${x}px`,
    top: `${y}px`
  })
}
```

### 单例模式

确保同时只有一个下拉菜单打开：

```typescript
// 全局状态管理
let currentOpenDropdown: string | null = null

export function openDropdown(selectId: string) {
  // 关闭之前打开的下拉菜单
  if (currentOpenDropdown && currentOpenDropdown !== selectId) {
    closeDropdown(currentOpenDropdown)
  }
  
  currentOpenDropdown = selectId
  // 显示下拉菜单逻辑
}

export function closeDropdown(selectId: string) {
  if (currentOpenDropdown === selectId) {
    currentOpenDropdown = null
  }
  // 隐藏下拉菜单逻辑
}
```

### 点击外部关闭

监听全局点击事件，点击选择器外部时关闭下拉菜单：

```typescript
export function setupClickOutside(
  selectElement: HTMLElement,
  dropdownElement: HTMLElement,
  onClose: () => void
) {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node
    
    if (
      !selectElement.contains(target) &&
      !dropdownElement.contains(target)
    ) {
      onClose()
      document.removeEventListener('click', handleClickOutside)
    }
  }
  
  // 延迟添加监听器，避免立即触发
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 0)
}
```



## 键盘删除逻辑

### 删除场景

由于零宽字符由组件内置，删除逻辑相对简单，主要处理以下场景：

#### Backspace 删除

**场景1：删除选择器本身**
```
文本[选择器]|  →  文本|
```
- 光标在选择器后面
- 删除整个选择器节点（包括内置的零宽字符）

**场景2：删除选择器前的文本**
```
文本|[选择器]  →  文|[选择器]
```
- 光标在选择器前面
- 删除文本的最后一个字符

**场景3：段落末尾删除**
```
文本|  →  文|
```
- 光标在段落末尾（删除选择器后）
- 删除文本的最后一个字符

#### Delete 删除

**场景1：删除选择器本身**
```
|[选择器]文本  →  |文本
```
- 光标在选择器前面
- 删除整个选择器节点（包括内置的零宽字符）

**场景2：删除选择器后的文本**
```
[选择器]|文本  →  [选择器]|本
```
- 光标在选择器后面
- 删除文本的第一个字符

**场景3：段落开头删除**
```
|文本  →  |本
```
- 光标在段落开头（删除选择器后）
- 删除文本的第一个字符

### 插件实现

```typescript
export function selectKeyboardPlugin() {
  return new Plugin({
    key: new PluginKey('templateSelectKeyboard'),
    
    props: {
      handleKeyDown(view, event) {
        const { state, dispatch } = view
        const { selection } = state
        const { $from } = selection
        
        // 处理 Backspace 删除
        if (event.key === 'Backspace' && selection.empty) {
          const beforeNode = $from.nodeBefore
          const afterNode = $from.nodeAfter
          
          // 场景1：删除选择器本身
          if (beforeNode?.type.name === 'templateSelect') {
            dispatch(state.tr.delete($from.pos - beforeNode.nodeSize, $from.pos))
            event.preventDefault()
            return true
          }
          
          // 场景2：删除选择器前的文本
          if (afterNode?.type.name === 'templateSelect') {
            if (beforeNode?.isText && beforeNode.text !== ZERO_WIDTH_CHAR) {
              dispatch(state.tr.delete($from.pos - 1, $from.pos))
              event.preventDefault()
              return true
            }
            // 如果前面是 template 节点，交给 TemplateBlock 插件处理
            if (beforeNode?.type.name === 'template') {
              return false
            }
          }
          
          // 场景3：段落末尾删除
          if (!afterNode && beforeNode?.isText && beforeNode.text !== ZERO_WIDTH_CHAR) {
            dispatch(state.tr.delete($from.pos - 1, $from.pos))
            event.preventDefault()
            return true
          }
        }
        
        // 处理 Delete 删除
        if (event.key === 'Delete' && selection.empty) {
          const afterNode = $from.nodeAfter
          const beforeNode = $from.nodeBefore
          
          // 场景1：删除选择器本身
          if (afterNode?.type.name === 'templateSelect') {
            dispatch(state.tr.delete($from.pos, $from.pos + afterNode.nodeSize))
            event.preventDefault()
            return true
          }
          
          // 场景2：删除选择器后的文本
          if (beforeNode?.type.name === 'templateSelect') {
            if (afterNode?.isText && afterNode.text !== ZERO_WIDTH_CHAR) {
              dispatch(state.tr.delete($from.pos, $from.pos + 1))
              event.preventDefault()
              return true
            }
            // 如果后面是 template 节点，交给 TemplateBlock 插件处理
            if (afterNode?.type.name === 'template') {
              return false
            }
          }
          
          // 场景3：段落开头删除
          if (!beforeNode && afterNode?.isText && afterNode.text !== ZERO_WIDTH_CHAR) {
            dispatch(state.tr.delete($from.pos, $from.pos + 1))
            event.preventDefault()
            return true
          }
        }
        
        return false
      }
    }
  })
}
```

### 与 TemplateBlock 的协作

当选择器与 TemplateBlock 相邻时，删除逻辑会返回 `false`，让 TemplateBlock 插件处理：

```typescript
// 如果前面是 template 节点，交给 TemplateBlock 插件处理
if (beforeNode?.type.name === 'template') {
  return false
}
```

这样可以避免插件冲突，确保删除行为正确。

### Vue 组件中的键盘处理

```typescript
// 在 template-select-view.vue 中
const handleKeyDown = (event: KeyboardEvent) => {
  if (!showDropdown.value) return
  
  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault()
      navigateUp()
      break
    case 'ArrowDown':
      event.preventDefault()
      navigateDown()
      break
    case 'Enter':
      event.preventDefault()
      selectHighlightedOption()
      break
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
  }
}

const navigateUp = () => {
  highlightedIndex.value = 
    highlightedIndex.value <= 0 
      ? options.length - 1 
      : highlightedIndex.value - 1
}

const navigateDown = () => {
  highlightedIndex.value = 
    highlightedIndex.value >= options.length - 1 
      ? 0 
      : highlightedIndex.value + 1
}
```

## Vue 组件实现

### 组件结构

```vue
<!-- select/template-select-view.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'
import { computePosition, flip, shift, offset } from '@floating-ui/dom'

interface SelectOption {
  label: string
  value: string
  data?: string
}

interface Props {
  node: {
    attrs: {
      id: string
      placeholder: string
      options: SelectOption[]
      value?: string
    }
  }
  updateAttributes: (attrs: Record<string, any>) => void
  editor: any
}

const props = defineProps<Props>()

// 状态管理
const showDropdown = ref(false)
const highlightedIndex = ref(-1)
const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()

// 计算属性
const selectedOption = computed(() => {
  return props.node.attrs.options.find(
    opt => opt.value === props.node.attrs.value
  )
})

const displayText = computed(() => {
  return selectedOption.value?.label || props.node.attrs.placeholder
})

// 方法
const toggleDropdown = () => {
  if (showDropdown.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = async () => {
  // 关闭其他下拉菜单（单例模式）
  closeAllDropdowns()
  
  showDropdown.value = true
  
  // 设置高亮索引
  if (props.node.attrs.value) {
    highlightedIndex.value = props.node.attrs.options.findIndex(
      opt => opt.value === props.node.attrs.value
    )
  } else {
    highlightedIndex.value = 0
  }
  
  // 等待 DOM 更新后计算位置
  await nextTick()
  updatePosition()
  
  // 添加点击外部关闭监听
  setupClickOutside()
}

const closeDropdown = () => {
  showDropdown.value = false
  highlightedIndex.value = -1
}

const selectOption = (option: SelectOption) => {
  props.updateAttributes({ value: option.value })
  closeDropdown()
  
  // 触发回调（如果配置）
  // onSelect?.(option)
}

const updatePosition = async () => {
  if (!triggerRef.value || !dropdownRef.value) return
  
  const { x, y } = await computePosition(
    triggerRef.value,
    dropdownRef.value,
    {
      placement: 'bottom-start',
      middleware: [
        offset(4),
        flip(),
        shift({ padding: 8 })
      ]
    }
  )
  
  Object.assign(dropdownRef.value.style, {
    left: `${x}px`,
    top: `${y}px`
  })
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <NodeViewWrapper as="span" class="template-select">
    <span
      ref="triggerRef"
      class="template-select__trigger"
      :class="{ 'is-open': showDropdown }"
      @click="toggleDropdown"
    >
      <span class="template-select__text">{{ displayText }}</span>
      <span class="template-select__icon">▼</span>
    </span>
    
    <Teleport to="body">
      <div
        v-if="showDropdown"
        ref="dropdownRef"
        class="template-select__dropdown"
      >
        <div
          v-for="(option, index) in node.attrs.options"
          :key="option.value"
          class="template-select__option"
          :class="{ 
            'is-highlighted': index === highlightedIndex,
            'is-selected': option.value === node.attrs.value
          }"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
        >
          {{ option.label }}
        </div>
      </div>
    </Teleport>
  </NodeViewWrapper>
</template>
```



## 样式设计

### 选择器样式

```less
.template-select {
  display: inline-block;
  position: relative;
  
  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: var(--tr-color-primary-light);
    color: var(--tr-color-primary);
    border-radius: 4px;
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;
    
    &:hover {
      background: var(--tr-color-primary-light-hover);
    }
    
    &.is-open {
      background: var(--tr-color-primary-light-active);
    }
  }
  
  &__text {
    white-space: nowrap;
  }
  
  &__icon {
    font-size: 12px;
    transition: transform 0.2s;
    
    .is-open & {
      transform: rotate(180deg);
    }
  }
}
```

### 下拉菜单样式

```less
.template-select__dropdown {
  position: fixed;
  z-index: 1000;
  min-width: 120px;
  max-height: 240px;
  overflow-y: auto;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

.template-select__option {
  padding: 8px 16px;
  font-size: 14px;
  line-height: 22px;
  color: var(--tr-text-color);
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover,
  &.is-highlighted {
    background: var(--tr-color-primary-light);
  }
  
  &.is-selected {
    color: var(--tr-color-primary);
    font-weight: 500;
  }
}
```

### CSS 变量

```less
:root {
  --tr-color-primary: #1476ff;
  --tr-color-primary-light: rgba(20, 118, 255, 0.1);
  --tr-color-primary-light-hover: rgba(20, 118, 255, 0.15);
  --tr-color-primary-light-active: rgba(20, 118, 255, 0.2);
  --tr-text-color: #333;
}
```

## 提交数据格式

### submit 事件返回值

沿用现有 Template 插件的方式，`submit` 事件返回两个参数：

1. **纯文本**：所有内容拼接成的字符串
2. **结构化数据**：包含类型信息的数组

```typescript
// 示例输入
const templateData = [
  { type: 'text', content: 'Write about ' },
  { 
    type: 'select',
    placeholder: 'topic',
    options: [
      { label: 'Campus', value: 'campus life' }
    ],
    value: 'campus life'
  },
  { type: 'text', content: '. Word count: ' },
  { type: 'block', content: '800' }
]

// submit 事件返回
onSubmit((text, structuredData) => {
  // 参数 1：纯文本
  console.log(text)
  // "Write about campus life. Word count: 800"
  
  // 参数 2：结构化数据
  console.log(structuredData)
  // [
  //   { type: 'text', content: 'Write about ' },
  //   { type: 'select', content: 'campus life', value: 'campus life' },
  //   { type: 'text', content: '. Word count: ' },
  //   { type: 'block', content: '800' }
  // ]
})
```

### 工具函数实现

```typescript
/**
 * 获取包含所有模板类型的完整文本
 */
export function getTextWithTemplates(editor: Editor): string {
  const items = getTemplateStructuredData(editor)
  return items.map(item => item.content).join('')
}

/**
 * 获取结构化数据
 */
export function getTemplateStructuredData(editor: Editor): TemplateItem[] {
  const items: TemplateItem[] = []
  const ZERO_WIDTH_CHAR = '\u200B'
  
  editor.state.doc.descendants((node, _pos, parent) => {
    if (parent?.type.name !== 'paragraph') return
    
    if (node.type.name === 'template') {
      const content = (node.textContent || '').replace(
        new RegExp(ZERO_WIDTH_CHAR, 'g'), 
        ''
      )
      items.push({
        type: 'block',
        content
      })
    } else if (node.type.name === 'templateSelect') {
      // 获取选中的值
      const selectedOption = node.attrs.options.find(
        opt => opt.value === node.attrs.value
      )
      const content = selectedOption?.value || ''
      
      items.push({
        type: 'select',
        content,
        value: node.attrs.value,
        placeholder: node.attrs.placeholder,
        options: node.attrs.options
      })
    } else if (node.type.name === 'text') {
      const text = (node.text || '').replace(
        new RegExp(ZERO_WIDTH_CHAR, 'g'), 
        ''
      )
      if (text) {
        const lastItem = items[items.length - 1]
        if (lastItem && lastItem.type === 'text') {
          lastItem.content += text
        } else {
          items.push({
            type: 'text',
            content: text
          })
        }
      }
    }
  })
  
  return items
}
```



## 命令 API

### insertTemplateSelect

插入选择器节点。

**签名**：
```typescript
editor.commands.insertTemplateSelect(attrs: Partial<TemplateSelectAttrs>): boolean
```

**参数**：
- `attrs`: 选择器属性

**返回值**：
- `true`: 插入成功
- `false`: 插入失败

**示例**：
```typescript
editor.commands.insertTemplateSelect({
  placeholder: 'Select a topic',
  options: [
    { label: 'Campus', value: 'campus' },
    { label: 'Travel', value: 'travel' }
  ]
})
```

### updateTemplateSelect

更新选择器的选中值。

**签名**：
```typescript
editor.commands.updateTemplateSelect(id: string, value: string): boolean
```

**参数**：
- `id`: 选择器 ID
- `value`: 新的选中值

**返回值**：
- `true`: 更新成功
- `false`: 更新失败（未找到节点）

**示例**：
```typescript
editor.commands.updateTemplateSelect('select-1', 'campus')
```

### deleteTemplateSelect

删除选择器节点。

**签名**：
```typescript
editor.commands.deleteTemplateSelect(id: string): boolean
```

**参数**：
- `id`: 选择器 ID

**返回值**：
- `true`: 删除成功
- `false`: 删除失败（未找到节点）

**示例**：
```typescript
editor.commands.deleteTemplateSelect('select-1')
```

## 实现清单

### 文件结构

```
packages/components/src/chat-input/extensions/template/
├── index.ts                          # 统一导出
├── extension.ts                      # Template 扩展（统一入口）
├── types.ts                          # 统一类型定义
├── commands.ts                       # 统一命令
├── utils.ts                          # 统一工具函数
│
├── block/                            # TemplateBlock（可编辑块）
│   ├── extension.ts                  # TemplateBlock 节点定义
│   ├── template-block-view.vue       # 可编辑块视图组件
│   ├── plugins.ts                    # 块专用插件
│   └── index.less                    # 块样式
│
└── select/                           # TemplateSelect（选择器）
    ├── extension.ts                  # TemplateSelect 节点定义
    ├── template-select-view.vue      # 选择器视图组件
    ├── plugins.ts                    # 选择器专用插件
    ├── dropdown-manager.ts           # 下拉菜单管理（单例）
    └── index.less                    # 选择器样式
```

### 实现步骤

#### 1. 创建选择器节点定义 (`select/extension.ts`)
- 定义节点类型和属性
- 配置 HTML 解析和渲染
- 添加 Vue NodeView
- 添加插件

#### 2. 创建 Vue 组件 (`select/template-select-view.vue`)
- 选择器触发器渲染
- 下拉菜单渲染
- 键盘导航逻辑
- Floating UI 集成

#### 3. 创建插件 (`select/plugins.ts`)
- 零宽字符管理插件
- 键盘删除插件

#### 4. 创建下拉菜单管理器 (`select/dropdown-manager.ts`)
- 单例模式管理
- 全局状态维护
- 点击外部关闭

#### 5. 创建样式 (`select/index.less`)
- 选择器样式
- 下拉菜单样式
- 选项样式

#### 6. 更新 Template 扩展 (`extension.ts`)
- 作为统一入口，包含 TemplateBlock 和 TemplateSelect
- 通过 Extension.create 组合两个子扩展
- 添加统一命令入口

#### 7. 更新类型定义 (`types.ts`)
- 添加 SelectOption 接口
- 添加 TemplateSelectAttrs 接口
- 扩展 TemplateItem 类型

#### 8. 更新工具函数 (`utils.ts`)
- 更新 getTextWithTemplates
- 更新 getTemplateStructuredData
- 支持 select 类型处理

#### 9. 更新命令 (`commands.ts`)
- 添加 insertTemplateSelect
- 添加 updateTemplateSelect
- 添加 deleteTemplateSelect

#### 10. 更新导出 (`index.ts`)
- 导出 TemplateSelect 相关类型
- 导出选择器工具函数



## 与 TemplateBlock 的对比

### 核心差异

| 特性 | TemplateBlock | TemplateSelect |
|------|---------------|----------------|
| **节点类型** | `atom: false` | `atom: true` |
| **可编辑性** | 可编辑 | 不可编辑（只能选择） |
| **光标进入** | 可以 | 不可以 |
| **内容来源** | 用户输入 | 预设选项 |
| **零宽字符** | 前、后、内部 | 仅前、后 |
| **删除逻辑** | 渐进式删除 | 直接删除 |
| **交互方式** | 直接输入 | 下拉选择 |
| **视图组件** | NodeViewContent | 自定义渲染 |

### 零宽字符管理差异

```
TemplateBlock:
[文本]​[Block:​内容​]​[文本]
       ↑    ↑  ↑
       前  内部 后

TemplateSelect:
[文本]​[Select]​[文本]
       ↑       ↑
       前      后
```

### 键盘交互差异

**TemplateBlock**：
- 光标可以进入内部编辑
- 支持字符级删除
- 删除最后一个字符时保留块
- 边界保护防止内容吸入

**TemplateSelect**：
- 光标不能进入内部
- 只能整体删除
- Backspace 直接删除整个节点
- 无需边界保护（原子节点）

### 插件差异

**TemplateBlock 插件**：
- 复杂的键盘导航（进入、退出、编辑）
- 内部零宽字符管理
- 粘贴处理
- 边界保护

**TemplateSelect 插件**：
- 简单的键盘删除
- 仅前后零宽字符管理
- 无需粘贴处理
- 无需边界保护

## 注意事项

1. **Floating UI 依赖**：需要安装 `@floating-ui/dom` 包
2. **单例模式**：确保全局只有一个下拉菜单打开
3. **Teleport 使用**：下拉菜单需要 Teleport 到 body，避免被父容器裁剪
4. **零宽字符清理**：删除选择器时要清理前后的零宽字符
5. **选项数据序列化**：options 需要序列化为 JSON 存储在 HTML 属性中
6. **键盘事件冒泡**：下拉菜单打开时要阻止键盘事件冒泡到编辑器
7. **位置更新**：窗口滚动或调整大小时需要更新下拉菜单位置
8. **混合使用**：TemplateBlock 和 TemplateSelect 可以同时存在，注意零宽字符管理

## 常见问题

**Q: 为什么选择器是原子节点？**  
A: 选择器不需要用户直接编辑内容，只能通过下拉菜单选择，因此设计为原子节点更合理。

**Q: 选择器和 TemplateBlock 可以相邻吗？**  
A: 可以。零宽字符管理插件会在它们之间插入零宽字符，确保光标定位正确。

**Q: 如何自定义下拉菜单样式？**  
A: 通过 CSS 变量或覆盖 `.template-select__dropdown` 类样式。

**Q: 下拉菜单会被父容器裁剪吗？**  
A: 不会。使用 Teleport 将下拉菜单渲染到 body，并使用 fixed 定位。

**Q: 如何处理大量选项的性能问题？**  
A: 可以添加虚拟滚动或搜索过滤功能（后续优化）。

**Q: 选择器可以嵌套吗？**  
A: 不支持。选择器是 inline 节点，不能包含其他节点。

**Q: 如何获取所有选择器的值？**  
A: 使用 `getTemplateStructuredData(editor)` 工具函数，返回包含所有选择器信息的数组。

## 后续优化方向

### 1. 搜索过滤
为选项列表添加搜索功能，方便在大量选项中快速查找：

```typescript
const searchQuery = ref('')
const filteredOptions = computed(() => {
  if (!searchQuery.value) return options.value
  return options.value.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
```

### 2. 分组选项
支持选项分组显示：

```typescript
interface SelectOptionGroup {
  label: string
  options: SelectOption[]
}
```

### 3. 自定义渲染
支持自定义选项的渲染内容（图标、描述等）：

```typescript
interface SelectOption {
  label: string
  value: string
  icon?: VNode
  description?: string
}
```

### 4. 多选模式
支持选择多个选项：

```typescript
interface TemplateSelectAttrs {
  // ...
  multiple?: boolean
  values?: string[]  // 多选时使用
}
```

### 5. 异步加载
支持异步加载选项数据：

```typescript
interface TemplateSelectAttrs {
  // ...
  loadOptions?: () => Promise<SelectOption[]>
}
```

## 总结

TemplateSelect 扩展通过以下设计实现了下拉选择功能：

✅ **原子节点设计** - 不可编辑，只能通过下拉菜单选择  
✅ **单例下拉菜单** - 同时只能打开一个，避免混乱  
✅ **Floating UI 定位** - 智能计算位置，防止超出视口  
✅ **键盘导航** - 支持方向键、Enter、Esc 操作  
✅ **零宽字符管理** - 确保光标定位正确  
✅ **混合使用** - 与 TemplateBlock 和普通文本无缝集成  
✅ **结构化数据** - 提交时返回完整的类型信息  
✅ **类型区分** - 使用 `type: 'block'` 和 `type: 'select'` 清晰区分不同节点类型

通过 Template 扩展统一管理，用户只需传入符合要求的数据结构（`type: 'text' | 'block' | 'select'`），即可渲染对应的模板类型。
