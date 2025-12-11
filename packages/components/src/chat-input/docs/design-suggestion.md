# Suggestion 扩展设计文档

## 一、概述

### 1.1 功能定位

Suggestion 扩展为 ChatInput 提供智能输入联想功能，支持全局匹配模式，帮助用户快速输入常用内容。

### 1.2 核心特性

- **全局匹配**：根据输入内容实时过滤建议项
- **智能高亮**：支持自动匹配、精确指定、自定义函数三种高亮模式
- **自动补全**：显示补全预览和 Tab 提示
- **键盘导航**：支持上下键导航、Enter/Tab 选中、Esc 关闭
- **灵活配置**：支持自定义过滤、选中回调、弹窗宽度等

### 1.3 技术栈

- **编辑器**：Tiptap 3.x (基于 ProseMirror)
- **弹窗定位**：@floating-ui/dom
- **UI 渲染**：Vue 3 + VueRenderer

---

## 二、数据结构

### 2.1 建议项类型

```typescript
interface SuggestionItem {
  /**
   * 建议项内容（必填）
   */
  content: string

  /**
   * 显示标签（可选）
   * 默认使用 content
   */
  label?: string

  /**
   * 高亮方式（可选）
   * - undefined: 自动匹配（默认）
   * - string[]: 精确指定高亮片段
   * - function: 自定义高亮逻辑
   */
  highlights?: string[] | HighlightFunction

  /**
   * 自定义数据（可选）
   */
  data?: Record<string, unknown>
}
```

### 2.2 高亮相关类型

```typescript
// 高亮文本片段
interface SuggestionTextPart {
  text: string
  isMatch: boolean
}

// 高亮函数类型
type HighlightFunction = (
  suggestionText: string,
  inputText: string
) => SuggestionTextPart[]
```

### 2.3 插件状态

```typescript
interface SuggestionState {
  active: boolean                      // 是否激活
  range: { from: number; to: number } | null  // 匹配范围
  query: string                        // 查询文本
  filteredSuggestions: SuggestionItem[] // 过滤后的建议项
  selectedIndex: number                // 当前选中索引
  autoCompleteText: string             // 自动补全文本
  showTabIndicator: boolean            // 是否显示 Tab 提示
}
```

---

## 三、配置选项

### 3.1 Extension Options

```typescript
interface SuggestionOptions {
  /**
   * 建议项列表（必填）
   * 支持响应式 Ref
   */
  items?: SuggestionItem[] | Ref<SuggestionItem[]>

  /**
   * 自定义过滤函数（可选）
   * 不传则不过滤，直接显示所有项
   */
  filterFn?: (suggestions: SuggestionItem[], query: string) => SuggestionItem[]

  /**
   * 选中建议项的按键
   * 注意：Tab 键用于自动补全，不受此配置控制
   * @default ['Enter']
   */
  activeSuggestionKeys?: string[]

  /**
   * 弹窗宽度
   * @default 400
   */
  popupWidth?: number | string

  /**
   * 是否显示自动补全提示
   * @default true
   */
  showAutoComplete?: boolean

  /**
   * 选中建议项的回调
   * 返回 false 可阻止默认回填行为
   */
  onSelect?: (item: SuggestionItem) => void | false
}
```

### 3.2 配置示例

#### 基础使用

```typescript
import { Suggestion } from '@tencent/chat-input/extensions'

const extensions = [
  Suggestion.configure({
    items: [
      { content: 'ECS-云服务器' },
      { content: 'RDS-数据库' },
      { content: 'OSS-对象存储' }
    ]
  })
]
```

#### 响应式配置

```typescript
const suggestions = ref([
  { content: 'ECS-云服务器' },
  { content: 'RDS-数据库' }
])

const extensions = [
  Suggestion.configure({
    items: suggestions  // 支持响应式
  })
]

// 动态更新
suggestions.value.push({ content: 'CDN-内容分发' })
```

#### 自定义过滤

```typescript
Suggestion.configure({
  items: allItems,
  filterFn: (items, query) => {
    // 前缀匹配
    return items.filter(item =>
      item.content.toLowerCase().startsWith(query.toLowerCase())
    )
  }
})
```

#### 自定义选中回调

```typescript
Suggestion.configure({
  items: allItems,
  onSelect: (item) => {
    console.log('选中:', item)
    // 返回 false 阻止默认回填
    if (item.data?.needsValidation) {
      validateAndFill(item)
      return false
    }
  }
})
```

---

## 四、高亮模式

### 4.1 自动匹配（默认）

根据输入内容自动高亮匹配的部分。

```typescript
{ content: 'ECS-云服务器' }
// 输入 "ECS" 时，自动高亮 "ECS"
```

### 4.2 精确指定

精确指定需要高亮的文本片段。

```typescript
{
  content: 'ECS-云服务器卡顿问题',
  highlights: ['ECS', '云服务器']
}
// 精确高亮 "ECS" 和 "云服务器"
```

### 4.3 自定义函数

使用自定义函数实现复杂的高亮逻辑。

```typescript
{
  content: 'ECS-云服务器卡顿问题',
  highlights: (suggestionText, inputText) => {
    // 自定义逻辑：高亮产品名称
    const parts = suggestionText.split('-')
    return [
      { text: parts[0], isMatch: true },  // 产品名
      { text: '-', isMatch: false },
      { text: parts[1], isMatch: false }  // 问题描述
    ]
  }
}
```

---

## 五、自动补全功能

### 5.1 功能说明

当用户通过键盘导航选中某个建议项时，在输入框中以灰色文本预览剩余未输入的部分，并显示 "TAB" 提示。

### 5.2 视觉效果

```
输入框：ECS -云服务器 [TAB]
       ^^^  ^^^^^^^^ ^^^^^
       已输入  补全预览  Tab提示
```

### 5.3 交互行为

- **Tab 键**：应用补全文本，插入完整内容
- **继续输入**：补全文本实时更新
- **Esc 键**：关闭建议列表，隐藏补全提示
- **失焦**：隐藏补全提示

### 5.4 实现原理

使用 ProseMirror 的 Decoration 系统在光标位置插入补全提示：

```typescript
// 计算补全文本
function getAutoComplete(
  selectedIndex: number,
  query: string,
  filteredSuggestions: SuggestionItem[]
): { text: string; show: boolean; showTab: boolean } {
  if (selectedIndex === -1 || !filteredSuggestions[selectedIndex]) {
    return { text: '', show: false, showTab: false }
  }

  const selectedItem = filteredSuggestions[selectedIndex]
  return syncAutoComplete(selectedItem.content, query)
}

// 创建装饰器
function createAutoCompleteDecorations(state: SuggestionState): DecorationSet {
  if (!state.active || !state.autoCompleteText || !state.range) {
    return DecorationSet.empty
  }

  const widget = Decoration.widget(
    cursorPos,
    () => {
      const container = document.createElement('span')
      container.className = 'suggestion-autocomplete'
      
      // 补全文本
      const complete = document.createElement('span')
      complete.className = 'autocomplete-text'
      complete.textContent = state.autoCompleteText
      container.appendChild(complete)
      
      // Tab 提示
      if (state.showTabIndicator) {
        const tabHint = document.createElement('span')
        tabHint.className = 'tab-hint'
        tabHint.textContent = 'TAB'
        container.appendChild(tabHint)
      }
      
      return container
    },
    { side: 1 }
  )

  return DecorationSet.create(doc, [widget])
}
```

---

## 六、键盘交互

### 6.1 快捷键列表

| 按键 | 功能 | 说明 |
|------|------|------|
| ↑ / ↓ | 导航建议项 | 循环选择，同时更新补全提示 |
| Enter | 选中当前项 | 可通过 activeSuggestionKeys 配置 |
| Tab | 应用补全 | 优先应用补全文本 |
| Esc | 关闭建议列表 | 同时隐藏补全提示 |

### 6.2 实现逻辑

```typescript
handleKeyDown(view: EditorView, event: KeyboardEvent): boolean {
  const state = SuggestionPluginKey.getState(view.state)
  
  if (!state?.active) return false
  
  // Tab 键：应用自动补全
  if (event.key === 'Tab' && state.autoCompleteText) {
    event.preventDefault()
    selectAndClose(view, state)
    return true
  }
  
  // ↑↓ 键：导航
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    const direction = event.key === 'ArrowDown' ? 1 : -1
    const length = state.filteredSuggestions.length
    
    let newIndex = state.selectedIndex + direction
    if (newIndex < 0) newIndex = length - 1
    else if (newIndex >= length) newIndex = 0
    
    // 更新状态
    const tr = view.state.tr
    tr.setMeta(SuggestionPluginKey, { type: 'updateIndex', index: newIndex })
    view.dispatch(tr)
    return true
  }
  
  // 快捷键选中
  if (activeSuggestionKeys.includes(event.key)) {
    event.preventDefault()
    selectAndClose(view, state)
    return true
  }
  
  // Esc 键：关闭
  if (event.key === 'Escape') {
    event.preventDefault()
    const tr = view.state.tr
    tr.setMeta(SuggestionPluginKey, { type: 'close' })
    view.dispatch(tr)
    return true
  }
  
  return false
}
```

---

## 七、弹窗定位

### 7.1 定位策略

使用 @floating-ui/dom 实现智能定位，相对于输入框容器定位。

```typescript
function positionPopup(view: EditorView, popup: HTMLElement) {
  const editorWrapper = view.dom.closest('.tr-chat-input')
  const referenceElement = (editorWrapper as HTMLElement) || view.dom
  
  cleanup = autoUpdate(referenceElement, popup, () => {
    computePosition(referenceElement, popup, {
      placement: 'top-start',
      middleware: [
        offset(8),
        flip({
          fallbackPlacements: ['bottom-start', 'top-start'],
        }),
        shift({ padding: 8 }),
      ],
    }).then(({ x, y }) => {
      popup.style.position = 'absolute'
      popup.style.left = `${x}px`
      popup.style.top = `${y}px`
      popup.style.zIndex = '2000'
      popup.style.width = calculatePopupWidth()
    })
  })
}
```

### 7.2 宽度计算

支持固定宽度和百分比宽度：

```typescript
function calculatePopupWidth(): string {
  if (typeof popupWidth === 'number') {
    return `${popupWidth}px`
  }
  
  if (typeof popupWidth === 'string' && popupWidth.endsWith('%')) {
    const percentage = parseFloat(popupWidth) / 100
    const referenceWidth = referenceElement.offsetWidth
    return `${referenceWidth * percentage}px`
  }
  
  return popupWidth || '400px'
}
```

---

## 八、核心实现

### 8.1 插件状态管理

```typescript
state: {
  init(): SuggestionState {
    return {
      active: false,
      range: null,
      query: '',
      filteredSuggestions: [],
      selectedIndex: -1,
      autoCompleteText: '',
      showTabIndicator: false,
    }
  },

  apply(tr: Transaction, state: SuggestionState): SuggestionState {
    // 检查 meta 更新
    const meta = tr.getMeta(SuggestionPluginKey)
    
    if (meta) {
      if (meta.type === 'close') {
        return { /* 关闭状态 */ }
      }
      if (meta.type === 'updateIndex') {
        const newState = { ...state, selectedIndex: meta.index }
        const autoComplete = getAutoComplete(meta.index, state.query, state.filteredSuggestions)
        return { ...newState, ...autoComplete }
      }
    }
    
    // 如果文档没有变化，保持状态
    if (!tr.docChanged && !tr.selectionSet) {
      return state
    }
    
    // 提取查询文本
    const query = tr.doc.textContent.trim()
    
    // 输入框为空，关闭建议列表
    if (!query) {
      return { /* 关闭状态 */ }
    }
    
    // 过滤建议项
    const filteredSuggestions = doFilterSuggestions(query)
    
    // 没有匹配项，关闭建议列表
    if (filteredSuggestions.length === 0) {
      return { /* 关闭状态 */ }
    }
    
    // 计算补全文本
    const autoComplete = getAutoComplete(0, query, filteredSuggestions)
    
    return {
      active: true,
      range: { from: 0, to: tr.doc.content.size },
      query,
      filteredSuggestions,
      selectedIndex: 0,
      ...autoComplete
    }
  },
}
```

### 8.2 过滤逻辑

```typescript
function doFilterSuggestions(query: string): SuggestionItem[] {
  const suggestions = getCurrentSuggestions()
  
  // 如果提供了 filterFn，使用自定义过滤
  // 否则不过滤，直接返回所有项
  return filterFn ? filterFn(suggestions, query) : suggestions
}
```

### 8.3 文本插入

```typescript
function insertSuggestion(
  view: EditorView,
  range: { from: number; to: number } | null,
  item: SuggestionItem
) {
  if (!range) return
  
  // 触发回调，返回 false 可阻止默认回填
  const shouldInsert = onSelect?.(item) !== false
  
  if (shouldInsert) {
    editor.commands.setContent(item.content)
  }
  
  editor.commands.focus()
}
```

---

## 九、使用示例

### 9.1 基础使用

```vue
<template>
  <chat-input
    v-model="content"
    :extensions="extensions"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Suggestion } from '@tencent/chat-input/extensions'

const content = ref('')

const extensions = [
  Suggestion.configure({
    items: [
      { content: 'ECS-云服务器' },
      { content: 'RDS-数据库' },
      { content: 'OSS-对象存储' }
    ]
  })
]
</script>
```

### 9.2 动态过滤

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Suggestion } from '@tencent/chat-input/extensions'

const content = ref('')

const allItems = [
  { content: 'ECS-云服务器卡顿' },
  { content: 'ECS-实例无法启动' },
  { content: 'RDS-数据库连接失败' },
  { content: 'OSS-存储桶权限' }
]

// 根据输入内容动态过滤
const filteredItems = computed(() => {
  if (!content.value) return allItems
  return allItems.filter(item =>
    item.content.toLowerCase().includes(content.value.toLowerCase())
  )
})

const extensions = computed(() => [
  Suggestion.configure({
    items: filteredItems.value
  })
])
</script>
```

### 9.3 自定义高亮

```vue
<script setup lang="ts">
const extensions = [
  Suggestion.configure({
    items: [
      {
        content: 'ECS-云服务器卡顿问题',
        // 高亮产品名称
        highlights: (text, query) => {
          const [product, desc] = text.split('-')
          return [
            { text: product, isMatch: true },
            { text: '-', isMatch: false },
            { text: desc, isMatch: false }
          ]
        }
      }
    ]
  })
]
</script>
```

---

## 十、样式定制

### 10.1 CSS 变量

```less
:root {
  // 补全提示
  --tr-suggestion-autocomplete-color: #999;
  --tr-suggestion-tab-hint-border: #999;
  --tr-suggestion-tab-hint-color: #666;
  --tr-suggestion-tab-hint-bg: rgba(255, 255, 255, 0.8);
  
  // 建议列表
  --tr-suggestion-list-bg: #fff;
  --tr-suggestion-list-border: #e0e0e0;
  --tr-suggestion-item-hover-bg: #f5f5f5;
  --tr-suggestion-item-active-bg: #e3f2fd;
}
```

### 10.2 自定义样式

```less
.suggestion-autocomplete {
  .autocomplete-text {
    color: var(--tr-suggestion-autocomplete-color);
  }
  
  .tab-hint {
    border-color: var(--tr-suggestion-tab-hint-border);
    color: var(--tr-suggestion-tab-hint-color);
    background: var(--tr-suggestion-tab-hint-bg);
  }
}
```

---

## 十一、技术要点

### 11.1 响应式支持

扩展支持响应式的 items 配置：

```typescript
onCreate() {
  if (isRef(this.options.items)) {
    watch(
      this.options.items,
      () => {
        // 触发插件更新
        const tr = this.editor.state.tr
        tr.setMeta(SuggestionPluginKey, { type: 'update' })
        this.editor.view.dispatch(tr)
      },
      { deep: true }
    )
  }
}
```

### 11.2 防止立即重新打开

使用 `justClosed` 标记防止关闭后立即重新打开：

```typescript
let justClosed = false

if (meta?.type === 'close') {
  justClosed = true
  setTimeout(() => {
    justClosed = false
  }, 0)
  return { /* 关闭状态 */ }
}

if (justClosed) {
  return state
}
```

### 11.3 光标位置判断

只在光标位于文档末尾时显示补全提示：

```typescript
const { selection } = editor.state
const cursorPos = selection.$head.pos
const isAtEnd = cursorPos >= doc.content.size - 1

if (!isAtEnd) {
  return DecorationSet.empty
}
```

---

## 十二、最佳实践

### 12.1 性能优化

1. **限制建议项数量**：避免渲染过多项目
2. **使用防抖**：减少过滤频率
3. **按需加载**：大数据集考虑分页或虚拟滚动

### 12.2 用户体验

1. **合理的弹窗宽度**：建议使用百分比宽度适配不同屏幕
2. **清晰的高亮**：确保匹配部分易于识别
3. **流畅的动画**：添加过渡效果提升体验

### 12.3 可访问性

1. **键盘导航**：确保所有功能可通过键盘操作
2. **ARIA 属性**：为建议列表添加适当的 ARIA 标签
3. **焦点管理**：正确处理焦点状态

---

## 十三、常见问题

### 13.1 建议列表不显示

**原因：**
- items 为空
- filterFn 过滤掉了所有项
- 输入内容为空

**解决：**
- 检查 items 配置
- 检查 filterFn 逻辑
- 确保有输入内容

### 13.2 补全提示位置不对

**原因：**
- 光标不在文档末尾
- 编辑器样式影响定位

**解决：**
- 检查光标位置判断逻辑
- 确保编辑器样式正确

### 13.3 与其他插件冲突

**原因：**
- 键盘事件处理冲突
- 插件状态互相影响

**解决：**
- 在键盘处理器中检查其他插件状态
- 设置合理的优先级