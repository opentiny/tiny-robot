# Suggestion 插件设计文档

## 1. 概述

### 1.1 目标

将 Sender 组件的智能联想功能迁移到 ChatInput 组件，作为独立的 Tiptap 扩展插件实现。

### 1.2 设计原则

- **插件化**：作为独立的 Tiptap Extension，不侵入核心组件
- **可配置**：支持灵活的触发方式、过滤逻辑、高亮模式
- **可复用**：复用 Sender 的核心逻辑和 UI 组件
- **高性能**：按需加载，不使用时零开销

### 1.3 核心差异

| 维度 | Sender | ChatInput (Suggestion 插件) |
|------|--------|---------------------------|
| 编辑器 | TinyInput (原生) | Tiptap (ProseMirror) |
| 触发方式 | 输入内容变化 | 可配置触发字符（默认无，全局匹配） |
| 弹窗定位 | 相对于输入框 | 相对于光标位置 |
| 文本替换 | 直接赋值 | ProseMirror Transaction |
| 高亮逻辑 | 三种模式 | 完全复用 |

## 2. 功能设计

### 2.1 触发模式

支持两种触发模式：

#### 模式 1：全局匹配（默认）

- 不需要特定触发字符
- 根据当前输入内容实时过滤建议项
- 类似 Sender 的行为

```typescript
// 配置示例
{
  char: null, // 无触发字符
  suggestions: [
    { content: 'ECS-云服务器卡顿问题' },
    { content: 'CDN-权限管理' }
  ]
}
```

#### 模式 2：字符触发
- 输入特定字符（如 `/`）触发
- 类似 skill-mention 的 `@` 触发
- 适用于命令、快捷输入等场景

```typescript
// 配置示例
{
  char: '/', // 触发字符
  suggestions: [
    { content: 'help', label: '帮助' },
    { content: 'clear', label: '清空' }
  ]
}
```

### 2.2 建议项数据结构

完全复用 Sender 的类型定义：

```typescript
// 高亮文本片段
interface SuggestionTextPart {
  text: string
  isMatch: boolean
}

// 高亮函数类型
type HighlightFunction = (suggestionText: string, inputText: string) => SuggestionTextPart[]

// 建议项类型
interface SuggestionItem {
  content: string // 建议项文本内容
  label?: string // 显示标签（可选，默认使用 content）
  highlights?: string[] | HighlightFunction // 高亮方式
}
```

### 2.3 高亮模式

支持三种高亮模式（复用 Sender 逻辑）：


#### 1. 自动匹配（默认）
```typescript
{ content: 'ECS-云服务器卡顿问题' }
// 输入 "ECS" 时，自动高亮 "ECS"
```

#### 2. 精确指定
```typescript
{
  content: 'ECS-云服务器卡顿问题',
  highlights: ['ECS', '云服务器']
}
// 精确高亮指定的文本片段
```

#### 3. 自定义函数
```typescript
{
  content: 'ECS-云服务器卡顿问题',
  highlights: (suggestionText, inputText) => {
    // 自定义高亮逻辑
    return [
      { text: 'ECS', isMatch: true },
      { text: '-云服务器卡顿问题', isMatch: false }
    ]
  }
}
```

### 2.4 自动补全提示

当建议列表中有匹配项且用户通过键盘导航选中某一项时，在输入框中显示自动补全预览：

#### 功能说明

1. **补全文本显示**：在输入框中以灰色文本显示剩余未输入的部分
2. **Tab 按键提示**：在补全文本后显示 "TAB" 提示标签
3. **实时同步**：随着用户输入和选中项变化实时更新

#### 视觉效果

```
输入框内容：ECS -备份弹性云服务器 [TAB]
           ^^^  ^^^^^^^^^^^^^^^^^ ^^^^
           已输入  补全预览(灰色)   提示标签
```

#### 实现原理

```typescript
// 1. 计算补全文本
const autoCompleteText = computed(() => {
  const selected = activeSuggestion.value
  const input = inputValue.value
  
  if (!selected || !input) return ''
  
  // 检查选中项是否以输入内容开头
  if (selected.toLowerCase().startsWith(input.toLowerCase())) {
    return selected.substring(input.length) // 返回剩余部分
  }
  
  return ''
})

// 2. 显示条件
const showAutoComplete = computed(() => {
  return autoCompleteText.value && 
         !isComposing.value && // 非输入法组合状态
         isPopupVisible.value // 建议列表已打开
})
```

#### UI 实现

使用绝对定位的覆盖层，通过隐藏的镜像文本实现对齐：

```vue
<div class="suggestion-autocomplete">
  <!-- 镜像用户输入（隐藏） -->
  <span class="user-input-mirror">{{ inputValue }}</span>
  <!-- 补全文本（灰色） -->
  <span class="autocomplete-text">{{ autoCompleteText }}</span>
  <!-- Tab 提示 -->
  <span v-if="showTabIndicator" class="tab-hint">TAB</span>
</div>
```

```less
.suggestion-autocomplete {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none; // 不阻挡输入
  color: #999; // 灰色
  display: flex;
  align-items: center;
  
  .user-input-mirror {
    visibility: hidden; // 隐藏但占位
  }
  
  .tab-hint {
    margin-left: 8px;
    padding: 2px 6px;
    border: 1px dashed #999;
    border-radius: 4px;
    font-size: 12px;
  }
}
```

#### 交互行为

- **Tab 键**：应用补全文本，插入完整的建议内容
- **继续输入**：补全文本实时更新
- **Esc 键**：关闭建议列表，同时隐藏补全提示
- **失焦**：隐藏补全提示

### 2.5 键盘交互

| 按键 | 功能 | 说明 |
|------|------|------|
| ↑ / ↓ | 导航建议项 | 循环选择，同时更新补全提示 |
| Enter | 选中当前项 | 可配置 |
| Tab | 应用补全 / 选中当前项 | 优先应用补全文本 |
| Esc | 关闭建议列表 | 同时隐藏补全提示 |

配置示例：
```typescript
{
  activeSuggestionKeys: ['Enter', 'Tab'], // 默认值
  showAutoComplete: true // 是否显示自动补全提示
}
```

### 2.6 弹窗定位

使用 `@floating-ui/dom` 实现智能定位：

- **全局匹配模式**：相对于输入框底部
- **字符触发模式**：相对于触发字符位置（光标）
- 自动处理边界溢出（flip、shift）

### 2.7 功能对比

| 功能 | Sender | ChatInput Suggestion 插件 |
|------|--------|--------------------------|
| 建议列表 | ✅ | ✅ |
| 键盘导航 | ✅ | ✅ |
| 高亮匹配 | ✅ | ✅ |
| 自动补全提示 | ✅ | ✅ |
| Tab 按键提示 | ✅ | ✅ |
| 全局匹配 | ✅ | ✅ |
| 字符触发 | ❌ | ✅ |
| 富文本支持 | ❌ | ✅ |

## 3. 技术架构

### 3.1 目录结构

```
packages/components/src/chat-input/extensions/suggestion/
├── index.ts                    # 插件入口，导出 Suggestion Extension
├── plugins.ts                  # ProseMirror 插件逻辑
├── suggestion-list.vue         # 建议列表 UI（复用 Sender）
├── types.ts                    # 类型定义
└── utils/
    ├── highlight.ts            # 高亮处理（复用 Sender）
    └── filter.ts               # 过滤逻辑
```


### 3.2 插件实现

#### 3.2.1 Extension 定义

```typescript
import { Extension } from '@tiptap/core'

export const Suggestion = Extension.create<SuggestionOptions>({
  name: 'suggestion',

  addOptions() {
    return {
      char: null, // 触发字符，null 表示全局匹配
      suggestions: [], // 建议项列表
      activeSuggestionKeys: ['Enter', 'Tab'], // 激活按键
      allowSpaces: true, // 是否允许空格
      popupWidth: 400, // 弹窗宽度
    }
  },

  addProseMirrorPlugins() {
    return [
      createSuggestionPlugin({
        editor: this.editor,
        ...this.options,
      }),
    ]
  },
})
```

#### 3.2.2 ProseMirror 插件状态

```typescript
interface SuggestionState {
  active: boolean // 是否激活
  range: { from: number; to: number } | null // 匹配范围
  query: string // 查询文本
  filteredSuggestions: SuggestionItem[] // 过滤后的建议项
  selectedIndex: number // 当前选中索引
  autoCompleteText: string // 自动补全文本
  showTabIndicator: boolean // 是否显示 Tab 提示
}
```

#### 3.2.3 核心逻辑流程

```
1. 监听输入变化（Transaction）
   ↓
2. 检测触发条件
   - 全局模式：有输入内容
   - 字符模式：检测触发字符
   ↓
3. 提取查询文本
   - 全局模式：整个输入内容
   - 字符模式：触发字符后的文本
   ↓
4. 过滤建议项
   - 根据查询文本匹配
   - 支持自定义过滤函数
   ↓
5. 显示建议列表
   - 使用 VueRenderer 渲染组件
   - 使用 @floating-ui/dom 定位
   ↓
6. 计算自动补全文本
   - 提取选中项的剩余部分
   - 在编辑器中叠加显示
   - 显示 Tab 按键提示
   ↓
7. 处理用户交互
   - 键盘导航（更新补全提示）
   - 鼠标悬停（更新补全提示）
   - Tab 键应用补全
   - Enter 键选中确认
   ↓
8. 插入选中内容
   - 删除查询文本
   - 插入建议内容
   - 设置光标位置
```


### 3.3 关键技术点

#### 3.3.1 查询文本提取

**全局匹配模式**：
```typescript
function getGlobalQuery(state: EditorState): string {
  return state.doc.textContent.trim()
}
```

**字符触发模式**（参考 skill-mention）：
```typescript
function findTrigger(selection: Selection, char: string): {
  range: { from: number; to: number }
  query: string
} | null {
  const { $from } = selection
  const textBefore = $from.parent.textBetween(0, $from.parentOffset)
  const lastCharIndex = textBefore.lastIndexOf(char)
  
  if (lastCharIndex === -1) return null
  
  const query = textBefore.slice(lastCharIndex + char.length)
  const from = $from.start() + lastCharIndex
  const to = $from.pos
  
  return { range: { from, to }, query }
}
```

#### 3.3.2 建议项过滤

```typescript
function filterSuggestions(
  suggestions: SuggestionItem[],
  query: string
): SuggestionItem[] {
  if (!query) return suggestions
  
  const lowerQuery = query.toLowerCase()
  
  return suggestions.filter(item => {
    const content = item.content.toLowerCase()
    const label = item.label?.toLowerCase() || ''
    return content.includes(lowerQuery) || label.includes(lowerQuery)
  })
}
```

#### 3.3.3 文本替换

```typescript
function insertSuggestion(
  view: EditorView,
  range: { from: number; to: number },
  content: string
) {
  const { state, dispatch } = view
  const { tr } = state
  
  // 删除查询文本
  tr.delete(range.from, range.to)
  
  // 插入建议内容
  tr.insertText(content, range.from)
  
  // 设置光标位置
  tr.setSelection(
    TextSelection.create(tr.doc, range.from + content.length)
  )
  
  dispatch(tr)
  view.focus()
}
```

#### 3.3.4 弹窗定位

```typescript
import { computePosition, flip, shift, offset } from '@floating-ui/dom'

// 全局模式：相对于编辑器容器
const referenceElement = editorContainer

// 字符模式：相对于触发字符
const referenceElement = view.dom.querySelector('.suggestion-trigger')

computePosition(referenceElement, popup, {
  placement: 'bottom-start',
  middleware: [
    offset(8),
    flip(),
    shift({ padding: 8 })
  ]
}).then(({ x, y }) => {
  Object.assign(popup.style, {
    left: `${x}px`,
    top: `${y}px`
  })
})
```

#### 3.3.5 自动补全提示实现

**核心逻辑**：

```typescript
// 1. 计算补全文本
function syncAutoComplete(
  selectedSuggestion: string,
  inputText: string
): { text: string; show: boolean } {
  if (!selectedSuggestion || !inputText) {
    return { text: '', show: false }
  }
  
  // 检查是否匹配前缀
  const isValidPrefix = selectedSuggestion
    .toLowerCase()
    .startsWith(inputText.toLowerCase())
  
  if (!isValidPrefix) {
    return { text: '', show: false }
  }
  
  // 提取剩余部分
  const suffix = selectedSuggestion.substring(inputText.length)
  
  return {
    text: suffix,
    show: suffix.length > 0
  }
}

// 2. 在编辑器中渲染补全提示
function renderAutoComplete(view: EditorView, state: SuggestionState) {
  const { autoCompleteText, showTabIndicator } = state
  
  if (!autoCompleteText) {
    // 移除现有的补全提示
    removeAutoCompleteOverlay()
    return
  }
  
  // 创建补全提示覆盖层
  const overlay = document.createElement('div')
  overlay.className = 'suggestion-autocomplete'
  
  // 镜像用户输入（用于对齐）
  const mirror = document.createElement('span')
  mirror.className = 'user-input-mirror'
  mirror.textContent = state.query
  mirror.style.visibility = 'hidden'
  
  // 补全文本
  const complete = document.createElement('span')
  complete.className = 'autocomplete-text'
  complete.textContent = autoCompleteText
  
  overlay.appendChild(mirror)
  overlay.appendChild(complete)
  
  // Tab 提示
  if (showTabIndicator) {
    const tabHint = document.createElement('span')
    tabHint.className = 'tab-hint'
    tabHint.textContent = 'TAB'
    overlay.appendChild(tabHint)
  }
  
  // 定位到编辑器内容区域
  const editorContent = view.dom.querySelector('.ProseMirror')
  if (editorContent) {
    editorContent.appendChild(overlay)
  }
}
```

**样式实现**：

```less
.suggestion-autocomplete {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  color: var(--tr-suggestion-autocomplete-color, #999);
  font-size: inherit;
  line-height: inherit;
  display: flex;
  align-items: center;
  white-space: pre;
  
  .user-input-mirror {
    visibility: hidden;
  }
  
  .autocomplete-text {
    color: inherit;
  }
  
  .tab-hint {
    margin-left: 8px;
    padding: 2px 6px;
    border: 1px dashed var(--tr-suggestion-tab-hint-border, #999);
    border-radius: 4px;
    font-size: 12px;
    color: var(--tr-suggestion-tab-hint-color, #666);
  }
}
```

**Tab 键处理**：

```typescript
handleKeyDown(view: EditorView, event: KeyboardEvent): boolean {
  const state = SuggestionPluginKey.getState(view.state)
  
  if (!state?.active) return false
  
  // Tab 键：应用补全
  if (event.key === 'Tab' && state.autoCompleteText) {
    event.preventDefault()
    
    // 插入完整的建议内容
    const fullText = state.query + state.autoCompleteText
    insertSuggestion(view, state.range, fullText)
    
    return true
  }
  
  // 其他键盘处理...
}
```


## 4. 组件集成

### 4.1 Props 扩展

在 `ChatInputProps` 中添加：

```typescript
interface ChatInputProps {
  // ... 现有 props
  
  /**
   * 建议列表
   * 
   * 提供输入联想功能
   */
  suggestions?: SuggestionItem[]
  
  /**
   * 建议触发字符
   * 
   * - null: 全局匹配模式（默认）
   * - string: 字符触发模式（如 '/'）
   */
  suggestionChar?: string | null
  
  /**
   * 建议弹窗宽度
   * 
   * @default 400
   */
  suggestionPopupWidth?: number | string
  
  /**
   * 激活建议项的按键
   * 
   * @default ['Enter', 'Tab']
   */
  activeSuggestionKeys?: string[]
}
```

### 4.2 Events 扩展

```typescript
interface ChatInputEmits {
  // ... 现有 events
  
  /**
   * 选择建议项时触发
   * 
   * @param value - 选中的建议内容
   */
  (e: 'suggestion-select', value: string): void
}
```

### 4.3 使用示例

```vue
<template>
  <tr-chat-input
    v-model="inputValue"
    :suggestions="suggestions"
    :suggestion-char="null"
    :suggestion-popup-width="400"
    :active-suggestion-keys="['Enter', 'Tab']"
    @suggestion-select="handleSuggestionSelect"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const inputValue = ref('')

const allSuggestions = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'CDN-权限管理' },
  { content: 'OSS-存储桶配置' }
]

// 根据输入内容过滤建议项
const suggestions = computed(() => {
  if (!inputValue.value) return allSuggestions
  return allSuggestions.filter(item =>
    item.content.toLowerCase().includes(inputValue.value.toLowerCase())
  )
})

const handleSuggestionSelect = (value: string) => {
  console.log('选中建议:', value)
}
</script>
```


## 5. 代码复用策略

### 5.1 从 Sender 复用

#### 5.1.1 类型定义
- `SuggestionTextPart`
- `HighlightFunction`
- `ISuggestionItem`（重命名为 `SuggestionItem`）

**位置**：`packages/components/src/sender/index.type.ts`  
**目标**：`packages/components/src/chat-input/extensions/suggestion/types.ts`

#### 5.1.2 高亮处理工具
- `convertHighlightsArrayToTextParts`
- `highlightSuggestionText`
- `processHighlights`

**位置**：`packages/components/src/sender/utils/suggestionHighlight.ts`  
**目标**：`packages/components/src/chat-input/extensions/suggestion/utils/highlight.ts`

#### 5.1.3 UI 组件
- `SuggestionList.vue`（需调整样式和事件）

**位置**：`packages/components/src/sender/components/SuggestionList.vue`  
**目标**：`packages/components/src/chat-input/extensions/suggestion/suggestion-list.vue`

**调整点**：
- 移除对 TinyInput 的依赖
- 适配 chat-input 的主题系统
- 调整事件命名和参数

### 5.2 参考 skill-mention

#### 5.2.1 插件架构
- ProseMirror 插件状态管理
- VueRenderer 组件渲染
- @floating-ui/dom 弹窗定位
- 键盘事件处理

**位置**：`packages/components/src/chat-input/extensions/skill-mention/plugins.ts`

#### 5.2.2 触发检测
- `findSuggestion` 函数逻辑
- 光标位置计算
- 文本提取方法

### 5.3 新增逻辑

#### 5.3.1 全局匹配模式
- 监听整个文档内容变化
- 提取完整输入文本
- 相对于编辑器容器定位

#### 5.3.2 过滤逻辑
- 基于查询文本的模糊匹配
- 支持自定义过滤函数（可选）

#### 5.3.3 状态同步
- 与 chat-input 核心状态集成
- 避免与其他插件冲突（如 skill-mention）


## 6. 实现计划

### 6.1 阶段一：基础架构（核心功能）

#### 任务 1：创建插件目录结构
- [ ] 创建 `extensions/suggestion/` 目录
- [ ] 创建基础文件（index.ts, plugins.ts, types.ts）

#### 任务 2：复用 Sender 代码
- [ ] 复制类型定义到 `types.ts`
- [ ] 复制高亮工具到 `utils/highlight.ts`
- [ ] 复制 UI 组件到 `suggestion-list.vue`

#### 任务 3：实现 ProseMirror 插件
- [ ] 定义插件状态（SuggestionState）
- [ ] 实现状态更新逻辑（apply 函数）
- [ ] 实现触发检测（全局模式）
- [ ] 实现建议项过滤

#### 任务 4：实现 UI 渲染
- [ ] 使用 VueRenderer 渲染建议列表
- [ ] 使用 @floating-ui/dom 定位弹窗
- [ ] 处理组件生命周期

#### 任务 5：实现自动补全提示
- [ ] 实现补全文本计算逻辑
- [ ] 创建补全提示覆盖层
- [ ] 实现镜像文本对齐
- [ ] 添加 Tab 按键提示标签
- [ ] 处理补全提示的显示/隐藏

#### 任务 6：实现键盘交互
- [ ] 处理 ↑↓ 导航（同步更新补全提示）
- [ ] 处理 Tab 键应用补全
- [ ] 处理 Enter 选中
- [ ] 处理 Esc 关闭
- [ ] 支持可配置激活按键

#### 任务 7：实现文本替换
- [ ] 删除查询文本
- [ ] 插入建议内容
- [ ] 设置光标位置

#### 任务 8：集成到 ChatInput
- [ ] 扩展 Props 类型
- [ ] 扩展 Emits 类型
- [ ] 在 useEditor 中注册插件
- [ ] 传递配置选项

### 6.2 阶段二：增强功能（可选）

#### 任务 9：字符触发模式
- [ ] 实现触发字符检测
- [ ] 实现相对于光标的定位
- [ ] 添加触发区域高亮装饰器

#### 任务 10：高级配置
- [ ] 支持自定义过滤函数
- [ ] 支持自定义渲染函数
- [ ] 支持异步加载建议项
- [ ] 支持禁用自动补全提示

#### 任务 11：性能优化
- [ ] 防抖处理
- [ ] 虚拟滚动（建议项过多时）
- [ ] 按需加载

### 6.3 阶段三：测试与文档

#### 任务 12：单元测试
- [ ] 测试过滤逻辑
- [ ] 测试高亮处理
- [ ] 测试键盘交互

#### 任务 13：集成测试
- [ ] 测试与 skill-mention 的兼容性
- [ ] 测试与模板编辑器的兼容性
- [ ] 测试自动补全提示的显示/隐藏
- [ ] 测试边界情况

#### 任务 14：文档与示例
- [ ] 更新 chat-input.md 文档
- [ ] 创建示例 demo
- [ ] 添加 API 文档


## 7. 技术挑战与解决方案

### 7.1 挑战 1：插件冲突

**问题**：Suggestion 插件可能与 skill-mention 插件冲突（都处理键盘事件）

**解决方案**：
- 在键盘处理器中检查其他插件状态
- 优先级控制：skill-mention > suggestion
- 使用插件状态标识激活状态

```typescript
handleKeyDown(view, event) {
  // 检查 skill-mention 是否激活
  const skillMentionState = SkillMentionPluginKey.getState(view.state)
  if (skillMentionState?.active) {
    return false // 让 skill-mention 处理
  }
  
  // 处理 suggestion 逻辑
  const suggestionState = SuggestionPluginKey.getState(view.state)
  if (suggestionState?.active) {
    // 处理键盘事件
  }
}
```

### 7.2 挑战 2：光标定位精度

**问题**：全局模式下，弹窗应该相对于编辑器容器，而非光标

**解决方案**：
- 全局模式：使用编辑器容器作为参考元素
- 字符模式：使用装饰器标记触发位置

```typescript
const referenceElement = options.char === null
  ? view.dom // 全局模式
  : view.dom.querySelector('.suggestion-trigger') // 字符模式
```

### 7.3 挑战 3：性能优化

**问题**：建议项过多时，过滤和渲染可能影响性能

**解决方案**：
- 限制建议项数量（如最多显示 50 条）
- 使用防抖处理输入事件
- 考虑虚拟滚动（未来优化）

```typescript
const MAX_SUGGESTIONS = 50

function filterSuggestions(suggestions, query) {
  return suggestions
    .filter(item => matches(item, query))
    .slice(0, MAX_SUGGESTIONS)
}
```

### 7.4 挑战 4：样式适配

**问题**：Sender 的样式可能不适配 chat-input 的主题系统

**解决方案**：
- 使用 CSS 变量统一主题
- 适配 light/dark 模式
- 保持与 skill-mention 一致的视觉风格

```less
.suggestion-list {
  background: var(--tr-chat-input-bg-color);
  color: var(--tr-chat-input-text-color);
  // ...
}
```

### 7.5 挑战 5：自动补全提示在富文本编辑器中的定位

**问题**：Tiptap 使用 contenteditable，文本渲染和定位比原生 input 复杂

**解决方案**：

1. **使用绝对定位覆盖层**：
   - 在 ProseMirror 编辑器内部创建覆盖层
   - 使用隐藏的镜像文本实现精确对齐

2. **处理多行情况**：
   - 仅在单行模式下显示补全提示
   - 多行模式下禁用（避免定位复杂性）

3. **同步字体样式**：
   - 继承编辑器的字体、大小、行高
   - 确保补全文本与输入文本完美对齐

```typescript
// 获取编辑器的计算样式
const editorStyle = window.getComputedStyle(view.dom)
overlay.style.font = editorStyle.font
overlay.style.lineHeight = editorStyle.lineHeight
```

4. **处理光标位置**：
   - 全局模式：补全提示跟随输入内容
   - 字符模式：补全提示跟随触发字符后的文本

```typescript
// 计算补全提示的起始位置
const range = state.range
const coords = view.coordsAtPos(range.to)

overlay.style.left = `${coords.left}px`
overlay.style.top = `${coords.top}px`
```


## 8. API 设计

### 8.1 Extension Options

```typescript
interface SuggestionOptions {
  /**
   * 触发字符
   * 
   * - null: 全局匹配模式（默认）
   * - string: 字符触发模式
   * 
   * @default null
   */
  char?: string | null
  
  /**
   * 建议项列表
   * 
   * @default []
   */
  suggestions?: SuggestionItem[]
  
  /**
   * 激活建议项的按键
   * 
   * @default ['Enter', 'Tab']
   */
  activeSuggestionKeys?: string[]
  
  /**
   * 是否允许查询文本包含空格
   * 
   * 仅在字符触发模式下有效
   * 
   * @default true
   */
  allowSpaces?: boolean
  
  /**
   * 弹窗宽度
   * 
   * @default 400
   */
  popupWidth?: number | string
  
  /**
   * 是否显示自动补全提示
   * 
   * @default true
   */
  showAutoComplete?: boolean
  
  /**
   * 自定义过滤函数
   * 
   * @default 内置模糊匹配
   */
  filterFn?: (suggestions: SuggestionItem[], query: string) => SuggestionItem[]
  
  /**
   * 选中建议项的回调
   */
  onSelect?: (item: SuggestionItem) => void
}
```

### 8.2 SuggestionItem 类型

```typescript
interface SuggestionItem {
  /**
   * 建议项内容（必填）
   */
  content: string
  
  /**
   * 显示标签（可选）
   * 
   * 默认使用 content
   */
  label?: string
  
  /**
   * 高亮方式（可选）
   * 
   * - undefined: 自动匹配（默认）
   * - string[]: 精确指定高亮片段
   * - function: 自定义高亮逻辑
   */
  highlights?: string[] | HighlightFunction
  
  /**
   * 自定义数据（可选）
   * 
   * 用于扩展功能
   */
  data?: Record<string, any>
}
```

### 8.3 命令 API

```typescript
// 手动打开建议列表
editor.commands.openSuggestion()

// 手动关闭建议列表
editor.commands.closeSuggestion()

// 选中指定索引的建议项
editor.commands.selectSuggestion(index: number)

// 导航建议项
editor.commands.navigateSuggestion(direction: 'up' | 'down')
```


## 9. 测试用例

### 9.1 单元测试

#### 高亮处理
```typescript
describe('processHighlights', () => {
  it('应该自动匹配输入内容', () => {
    const item = { content: 'ECS-云服务器' }
    const result = processHighlights(item, 'ECS')
    expect(result).toEqual([
      { text: 'ECS', isMatch: true },
      { text: '-云服务器', isMatch: false }
    ])
  })
  
  it('应该支持精确指定高亮', () => {
    const item = {
      content: 'ECS-云服务器',
      highlights: ['云服务器']
    }
    const result = processHighlights(item, 'ECS')
    expect(result).toEqual([
      { text: 'ECS-', isMatch: false },
      { text: '云服务器', isMatch: true }
    ])
  })
})

describe('syncAutoComplete', () => {
  it('应该计算正确的补全文本', () => {
    const result = syncAutoComplete('ECS-云服务器', 'ECS')
    expect(result).toEqual({
      text: '-云服务器',
      show: true
    })
  })
  
  it('输入不匹配时不显示补全', () => {
    const result = syncAutoComplete('ECS-云服务器', 'CDN')
    expect(result).toEqual({
      text: '',
      show: false
    })
  })
  
  it('输入完整时不显示补全', () => {
    const result = syncAutoComplete('ECS', 'ECS')
    expect(result).toEqual({
      text: '',
      show: false
    })
  })
})
```

#### 过滤逻辑
```typescript
describe('filterSuggestions', () => {
  const suggestions = [
    { content: 'ECS-云服务器' },
    { content: 'CDN-权限管理' },
    { content: 'OSS-存储桶' }
  ]
  
  it('应该根据查询文本过滤', () => {
    const result = filterSuggestions(suggestions, 'ECS')
    expect(result).toHaveLength(1)
    expect(result[0].content).toBe('ECS-云服务器')
  })
  
  it('空查询应该返回所有建议', () => {
    const result = filterSuggestions(suggestions, '')
    expect(result).toHaveLength(3)
  })
})
```

### 9.2 集成测试

#### 基础交互
```typescript
describe('Suggestion Plugin', () => {
  it('应该在输入时显示建议列表', async () => {
    const editor = createEditor({
      extensions: [Suggestion],
      content: ''
    })
    
    editor.commands.insertContent('ECS')
    await nextTick()
    
    const popup = document.querySelector('.suggestion-list')
    expect(popup).toBeTruthy()
  })
  
  it('应该显示自动补全提示', async () => {
    const editor = createEditor({
      extensions: [Suggestion.configure({
        suggestions: [{ content: 'ECS-云服务器' }]
      })],
      content: ''
    })
    
    editor.commands.insertContent('ECS')
    await nextTick()
    
    // 按下方向键选中第一项
    editor.view.dom.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown' })
    )
    await nextTick()
    
    const autocomplete = document.querySelector('.suggestion-autocomplete')
    expect(autocomplete).toBeTruthy()
    expect(autocomplete.textContent).toContain('-云服务器')
    expect(autocomplete.textContent).toContain('TAB')
  })
  
  it('应该支持 Tab 键应用补全', async () => {
    // 测试 Tab 键应用补全文本
  })
  
  it('应该支持键盘导航', async () => {
    // 测试 ↑↓ 键导航
  })
  
  it('应该支持 Enter 选中', async () => {
    // 测试 Enter 键选中
  })
})
```

#### 插件兼容性
```typescript
describe('Plugin Compatibility', () => {
  it('不应该与 skill-mention 冲突', async () => {
    const editor = createEditor({
      extensions: [SkillMention, Suggestion]
    })
    
    // 测试 @ 触发 skill-mention
    editor.commands.insertContent('@')
    // 验证 suggestion 不激活
    
    // 测试普通输入触发 suggestion
    editor.commands.insertContent('test')
    // 验证 suggestion 激活
  })
})
```


## 10. 示例场景

### 10.1 场景 1：问题联想（全局模式）

```vue
<template>
  <tr-chat-input
    v-model="question"
    :suggestions="filteredQuestions"
    placeholder="输入问题关键词..."
    @suggestion-select="handleSelect"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const question = ref('')

const allQuestions = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-实例无法启动' },
  { content: 'CDN-权限管理配置' },
  { content: 'OSS-存储桶访问控制' }
]

const filteredQuestions = computed(() => {
  if (!question.value) return allQuestions
  return allQuestions.filter(item =>
    item.content.toLowerCase().includes(question.value.toLowerCase())
  )
})

const handleSelect = (value: string) => {
  console.log('选中问题:', value)
}
</script>
```

### 10.2 场景 2：命令输入（字符触发）

```vue
<template>
  <tr-chat-input
    v-model="command"
    :suggestions="commands"
    suggestion-char="/"
    placeholder="输入 / 查看命令..."
    @suggestion-select="executeCommand"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const command = ref('')

const commands = [
  {
    content: 'help',
    label: '帮助',
    highlights: ['help']
  },
  {
    content: 'clear',
    label: '清空对话',
    highlights: ['clear']
  },
  {
    content: 'export',
    label: '导出记录',
    highlights: ['export']
  }
]

const executeCommand = (value: string) => {
  console.log('执行命令:', value)
  // 执行对应的命令逻辑
}
</script>
```

### 10.3 场景 3：自定义高亮

```vue
<template>
  <tr-chat-input
    v-model="input"
    :suggestions="customSuggestions"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')

const customSuggestions = [
  {
    content: 'ECS-云服务器卡顿问题',
    // 自定义高亮逻辑：高亮产品名称
    highlights: (text, query) => {
      const parts = text.split('-')
      return [
        { text: parts[0], isMatch: true }, // 产品名
        { text: '-', isMatch: false },
        { text: parts[1], isMatch: false } // 问题描述
      ]
    }
  }
]
</script>
```


## 11. 未来扩展

### 11.1 异步加载

支持异步获取建议项：

```typescript
interface SuggestionOptions {
  // 异步加载函数
  loadSuggestions?: (query: string) => Promise<SuggestionItem[]>
  
  // 加载状态提示
  loadingText?: string
  
  // 防抖延迟
  debounce?: number
}
```

### 11.2 分组显示

支持建议项分组：

```typescript
interface SuggestionGroup {
  title: string
  items: SuggestionItem[]
}

interface SuggestionOptions {
  suggestionGroups?: SuggestionGroup[]
}
```

### 11.3 自定义渲染

支持自定义建议项渲染：

```typescript
interface SuggestionOptions {
  renderItem?: (item: SuggestionItem) => VNode
}
```

### 11.4 快捷操作

支持建议项的快捷操作：

```typescript
interface SuggestionItem {
  content: string
  actions?: Array<{
    icon: string
    label: string
    handler: () => void
  }>
}
```

## 12. 总结

### 12.1 核心优势

1. **插件化设计**：不侵入核心组件，保持架构清晰
2. **高度复用**：充分利用 Sender 的成熟逻辑和 UI
3. **灵活配置**：支持多种触发模式和高亮方式
4. **良好兼容**：与现有插件（skill-mention）和谐共存

### 12.2 技术亮点

1. **ProseMirror 插件机制**：利用 Tiptap 的扩展能力
2. **智能定位**：使用 @floating-ui/dom 实现自适应定位
3. **键盘交互**：完整的键盘导航和选择支持
4. **性能优化**：防抖、限制数量等优化手段

### 12.3 实施建议

1. **优先实现核心功能**：全局匹配模式 + 基础交互
2. **充分测试兼容性**：确保与其他插件不冲突
3. **渐进式增强**：先实现基础功能，再添加高级特性
4. **文档先行**：完善的文档和示例有助于推广使用

## 13. 自动补全提示详细设计

### 13.1 功能概述

自动补全提示是一个增强用户体验的功能，当用户通过键盘导航选中某个建议项时，在输入框中以灰色文本预览剩余未输入的部分，并显示 "TAB" 按键提示，用户可以按 Tab 键快速应用补全。

### 13.2 视觉设计

```
┌─────────────────────────────────────────────────────────┐
│ ECS -备份弹性云服务器 [TAB]                 🎤  ➤      │
│ ^^^  ^^^^^^^^^^^^^^^^^ ^^^^^                            │
│ 已输入  补全预览(灰色)  Tab提示                          │
└─────────────────────────────────────────────────────────┘
     ↑
建议列表
┌─────────────────────────────────────┐
│ 🔍 ECS-云服务器卡顿问题              │ ← 高亮选中
│ 🔍 ECS-备份弹性云服务器              │
│ 🔍 ECS-实例无法启动                  │
└─────────────────────────────────────┘
```

### 13.3 交互流程

```
1. 用户输入 "ECS"
   ↓
2. 显示建议列表（3个匹配项）
   ↓
3. 用户按 ↓ 键选中第一项 "ECS-云服务器卡顿问题"
   ↓
4. 在输入框中显示：
   - 已输入部分："ECS"（正常颜色）
   - 补全部分："-云服务器卡顿问题"（灰色）
   - Tab 提示："TAB"（虚线边框）
   ↓
5. 用户按 Tab 键
   ↓
6. 应用补全，输入框内容变为 "ECS-云服务器卡顿问题"
   ↓
7. 关闭建议列表，隐藏补全提示
```

### 13.4 实现细节

#### 13.4.1 DOM 结构

```html
<div class="ProseMirror">
  <!-- 用户输入的实际内容 -->
  <p>ECS</p>
  
  <!-- 补全提示覆盖层（绝对定位） -->
  <div class="suggestion-autocomplete">
    <!-- 镜像文本（隐藏，用于对齐） -->
    <span class="user-input-mirror">ECS</span>
    <!-- 补全文本（灰色显示） -->
    <span class="autocomplete-text">-云服务器卡顿问题</span>
    <!-- Tab 提示 -->
    <span class="tab-hint">TAB</span>
  </div>
</div>
```

#### 13.4.2 样式实现

```less
.suggestion-autocomplete {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none; // 不阻挡用户输入
  z-index: 1; // 在输入内容之上
  
  // 继承编辑器样式
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  
  display: flex;
  align-items: center;
  white-space: pre; // 保留空格
  
  .user-input-mirror {
    visibility: hidden; // 隐藏但占据空间
    color: transparent;
  }
  
  .autocomplete-text {
    color: var(--tr-suggestion-autocomplete-color, #999);
  }
  
  .tab-hint {
    margin-left: 8px;
    padding: 2px 6px;
    border: 1px dashed var(--tr-suggestion-tab-hint-border, #999);
    border-radius: 4px;
    font-size: 12px;
    color: var(--tr-suggestion-tab-hint-color, #666);
    background: var(--tr-suggestion-tab-hint-bg, rgba(255, 255, 255, 0.8));
  }
}
```

#### 13.4.3 核心算法

```typescript
/**
 * 同步自动补全文本
 * 
 * @param selectedSuggestion - 当前选中的建议项
 * @param inputText - 用户输入的文本
 * @returns 补全信息
 */
function syncAutoComplete(
  selectedSuggestion: string,
  inputText: string
): {
  text: string      // 补全文本
  show: boolean     // 是否显示
  showTab: boolean  // 是否显示 Tab 提示
} {
  // 1. 基础检查
  if (!selectedSuggestion || !inputText) {
    return { text: '', show: false, showTab: false }
  }
  
  // 2. 检查前缀匹配（忽略大小写）
  const lowerSuggestion = selectedSuggestion.toLowerCase()
  const lowerInput = inputText.toLowerCase()
  
  if (!lowerSuggestion.startsWith(lowerInput)) {
    return { text: '', show: false, showTab: false }
  }
  
  // 3. 提取剩余部分
  const suffix = selectedSuggestion.substring(inputText.length)
  
  // 4. 判断是否显示
  const shouldShow = suffix.length > 0
  
  return {
    text: suffix,
    show: shouldShow,
    showTab: shouldShow // Tab 提示与补全文本同步显示
  }
}
```

#### 13.4.4 渲染逻辑

```typescript
/**
 * 渲染自动补全提示
 */
function renderAutoComplete(
  view: EditorView,
  state: SuggestionState
): void {
  const { autoCompleteText, showTabIndicator } = state
  
  // 移除旧的补全提示
  const oldOverlay = view.dom.querySelector('.suggestion-autocomplete')
  if (oldOverlay) {
    oldOverlay.remove()
  }
  
  // 如果没有补全文本，直接返回
  if (!autoCompleteText) {
    return
  }
  
  // 创建新的补全提示
  const overlay = document.createElement('div')
  overlay.className = 'suggestion-autocomplete'
  
  // 镜像用户输入
  const mirror = document.createElement('span')
  mirror.className = 'user-input-mirror'
  mirror.textContent = state.query
  overlay.appendChild(mirror)
  
  // 补全文本
  const complete = document.createElement('span')
  complete.className = 'autocomplete-text'
  complete.textContent = autoCompleteText
  overlay.appendChild(complete)
  
  // Tab 提示
  if (showTabIndicator) {
    const tabHint = document.createElement('span')
    tabHint.className = 'tab-hint'
    tabHint.textContent = 'TAB'
    overlay.appendChild(tabHint)
  }
  
  // 插入到编辑器
  const editorContent = view.dom.querySelector('.ProseMirror')
  if (editorContent) {
    editorContent.appendChild(overlay)
  }
}
```

#### 13.4.5 键盘处理

```typescript
handleKeyDown(view: EditorView, event: KeyboardEvent): boolean {
  const state = SuggestionPluginKey.getState(view.state)
  
  if (!state?.active) return false
  
  // Tab 键：应用补全
  if (event.key === 'Tab' && state.autoCompleteText) {
    event.preventDefault()
    
    // 构建完整文本
    const fullText = state.query + state.autoCompleteText
    
    // 插入文本
    insertSuggestion(view, state.range, fullText)
    
    // 关闭建议列表
    closeSuggestion(view)
    
    return true
  }
  
  // ↑↓ 键：导航并更新补全
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    
    // 更新选中索引
    const direction = event.key === 'ArrowDown' ? 1 : -1
    const newIndex = calculateNewIndex(state.selectedIndex, direction, state.filteredSuggestions.length)
    
    // 更新状态（包括补全文本）
    updateSuggestionState(view, { selectedIndex: newIndex })
    
    return true
  }
  
  // 其他键处理...
  return false
}
```

### 13.5 边界情况处理

#### 13.5.1 输入法组合状态

```typescript
// 输入法组合时不显示补全提示
if (isComposing) {
  return { text: '', show: false, showTab: false }
}
```

#### 13.5.2 多行模式

```typescript
// 多行模式下禁用补全提示（定位复杂）
if (currentMode === 'multiple') {
  return { text: '', show: false, showTab: false }
}
```

#### 13.5.3 特殊字符

```typescript
// 处理包含特殊字符的补全文本
const escapedText = autoCompleteText
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
```

#### 13.5.4 长文本溢出

```less
.suggestion-autocomplete {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### 13.6 性能优化

1. **防抖处理**：避免频繁更新补全提示
2. **DOM 复用**：复用补全提示元素，减少创建/销毁
3. **条件渲染**：仅在必要时渲染补全提示
4. **事件委托**：使用 pointer-events: none 避免事件处理

### 13.7 可访问性

1. **屏幕阅读器**：添加 aria-label 描述补全提示
2. **键盘导航**：确保 Tab 键行为符合预期
3. **视觉提示**：使用足够的颜色对比度

```html
<div 
  class="suggestion-autocomplete"
  role="status"
  aria-live="polite"
  aria-label="自动补全建议"
>
  <!-- ... -->
</div>
```

---

**文档版本**：v1.1  
**创建日期**：2024-11-26  
**最后更新**：2024-11-26  
**更新内容**：补充自动补全提示功能的详细设计
