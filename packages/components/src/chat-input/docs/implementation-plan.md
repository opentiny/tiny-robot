# Suggestion 插件实施计划

## 📋 总览

本文档详细规划 Suggestion 插件的实现步骤，确保有序、高效地完成开发工作。

### 实施原则

1. **渐进式开发**：先核心后增强，先简单后复杂
2. **持续验证**：每个阶段完成后进行测试验证
3. **代码复用**：优先复用 Sender 的成熟代码
4. **文档同步**：代码实现与文档保持同步

### 时间估算

- **阶段一（核心功能）**：3-4 天
- **阶段二（增强功能）**：2-3 天
- **阶段三（测试文档）**：1-2 天
- **总计**：6-9 天

---

## 🎯 阶段一：核心功能实现（必需）

### Step 1: 创建插件目录结构 ✅

**目标**：搭建基础架构

**任务清单**：
- [x] 创建 `packages/components/src/chat-input/extensions/suggestion/` 目录
- [x] 创建以下文件：
  - [x] `index.ts` - 插件入口
  - [x] `plugins.ts` - ProseMirror 插件逻辑
  - [x] `types.ts` - 类型定义
  - [x] `suggestion-list.vue` - 建议列表 UI
  - [x] `utils/highlight.ts` - 高亮处理工具
  - [x] `utils/filter.ts` - 过滤逻辑
  - [x] `index.less` - 样式文件

**验收标准**：
- [x] 目录结构清晰，文件命名规范
- [x] 所有文件都有基础的注释说明

**预计时间**：0.5 小时 ✅ 完成

---

### Step 2: 复用 Sender 代码 ✅

**目标**：复用成熟的类型定义、工具函数和 UI 组件

#### 2.1 复制类型定义 ✅

**源文件**：`packages/components/src/sender/index.type.ts`

**目标文件**：`packages/components/src/chat-input/extensions/suggestion/types.ts`

**复制内容**：
```typescript
// 从 Sender 复制以下类型
- SuggestionTextPart ✅
- HighlightFunction ✅
- ISuggestionItem (重命名为 SuggestionItem) ✅
```

**调整**：
- [x] 移除 Sender 特有的类型
- [x] 添加 Suggestion 插件特有的类型

**任务清单**：
- [x] 复制基础类型定义
- [x] 添加插件配置类型 `SuggestionOptions`
- [x] 添加插件状态类型 `SuggestionState`
- [x] 添加插件 Key 类型

**验收标准**：
- [x] 类型定义完整，无 TypeScript 错误
- [x] 注释清晰，说明每个类型的用途

**预计时间**：1 小时 ✅ 完成


#### 2.2 复制高亮处理工具 ✅

**源文件**：`packages/components/src/sender/utils/suggestionHighlight.ts`

**目标文件**：`packages/components/src/chat-input/extensions/suggestion/utils/highlight.ts`

**复制内容**：
```typescript
- convertHighlightsArrayToTextParts ✅
- highlightSuggestionText ✅
- processHighlights ✅
```

**任务清单**：
- [x] 复制所有高亮处理函数
- [x] 调整导入路径
- [ ] 添加单元测试（可选）

**验收标准**：
- [x] 函数功能完整，逻辑正确
- [x] 类型定义准确

**预计时间**：0.5 小时 ✅ 完成

#### 2.3 复制并调整 UI 组件 ✅

**源文件**：`packages/components/src/sender/components/SuggestionList.vue`

**目标文件**：`packages/components/src/chat-input/extensions/suggestion/suggestion-list.vue`

**调整内容**：
1. [x] 移除对 TinyInput 的依赖
2. [x] 调整事件命名（适配 ProseMirror）
3. [x] 适配 chat-input 的主题系统
4. [x] 调整样式变量

**任务清单**：
- [x] 复制组件基础结构
- [x] 调整 Props 定义
- [x] 调整 Emits 定义
- [x] 更新样式（使用 chat-input 的 CSS 变量）
- [x] 移除 Sender 特有的逻辑

**验收标准**：
- [x] 组件可以独立运行
- [x] 样式与 skill-mention 保持一致
- [x] 事件触发正常

**预计时间**：1.5 小时 ✅ 完成

---

### Step 3: 实现 ProseMirror 插件核心逻辑 ✅

**目标**：实现插件的状态管理和基础交互

#### 3.1 定义插件状态 ✅

**文件**：`packages/components/src/chat-input/extensions/suggestion/plugins.ts`

**任务清单**：
- [x] 创建 `SuggestionPluginKey`
- [x] 定义 `SuggestionState` 接口
- [x] 实现 `init` 函数（初始化状态）
- [x] 实现 `apply` 函数（状态更新逻辑）

**核心逻辑**：
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
      showTabIndicator: false
    }
  },
  
  apply(tr, state): SuggestionState {
    // 1. 检查 meta 更新 ✅
    // 2. 检查文档变化 ✅
    // 3. 提取查询文本 ✅
    // 4. 过滤建议项 ✅
    // 5. 计算补全文本 ✅
    // 6. 返回新状态 ✅
  }
}
```

**验收标准**：
- [x] 状态初始化正确
- [x] 状态更新逻辑完整
- [x] 无 TypeScript 错误

**预计时间**：2 小时 ✅ 完成


#### 3.2 实现查询文本提取（全局模式） ✅

**任务清单**：
- [x] 实现查询文本提取逻辑
- [x] 提取编辑器的完整文本内容
- [x] 处理空白字符

**核心代码**：
```typescript
// 全局模式：提取完整文本
const query = tr.doc.textContent.trim()
```

**验收标准**：
- [x] 能正确提取编辑器文本
- [x] 处理多行文本（取第一行或全部）

**预计时间**：0.5 小时 ✅ 完成

#### 3.3 实现建议项过滤 ✅

**文件**：`packages/components/src/chat-input/extensions/suggestion/utils/filter.ts`

**任务清单**：
- [x] 实现 `filterSuggestions` 函数
- [x] 支持模糊匹配（忽略大小写）
- [x] 支持匹配 content 和 label
- [x] 限制返回数量（最多 50 条）

**核心代码**：
```typescript
function filterSuggestions(
  suggestions: SuggestionItem[],
  query: string,
  maxResults = 50
): SuggestionItem[] {
  if (!query) return suggestions.slice(0, maxResults)
  
  const lowerQuery = query.toLowerCase()
  
  return suggestions
    .filter(item => {
      const content = item.content.toLowerCase()
      const label = item.label?.toLowerCase() || ''
      return content.includes(lowerQuery) || label.includes(lowerQuery)
    })
    .slice(0, maxResults)
}
```

**验收标准**：
- [x] 过滤逻辑正确
- [x] 性能良好（大量数据时）
- [ ] 有单元测试

**预计时间**：1 小时 ✅ 完成

#### 3.4 实现自动补全文本计算 ✅

**任务清单**：
- [x] 实现 `syncAutoComplete` 函数
- [x] 检查前缀匹配
- [x] 提取剩余部分
- [x] 返回补全信息

**核心代码**：
```typescript
function syncAutoComplete(
  selectedSuggestion: string,
  inputText: string
): {
  text: string
  show: boolean
  showTab: boolean
} {
  if (!selectedSuggestion || !inputText) {
    return { text: '', show: false, showTab: false }
  }
  
  const lowerSuggestion = selectedSuggestion.toLowerCase()
  const lowerInput = inputText.toLowerCase()
  
  if (!lowerSuggestion.startsWith(lowerInput)) {
    return { text: '', show: false, showTab: false }
  }
  
  const suffix = selectedSuggestion.substring(inputText.length)
  const shouldShow = suffix.length > 0
  
  return {
    text: suffix,
    show: shouldShow,
    showTab: shouldShow
  }
}
```

**验收标准**：
- [x] 补全文本计算正确
- [x] 边界情况处理完善
- [ ] 有单元测试

**预计时间**：1 小时 ✅ 完成

---

### Step 4: 实现 UI 渲染

**目标**：使用 VueRenderer 渲染建议列表和补全提示

#### 4.1 渲染建议列表

**任务清单**：
- [ ] 使用 VueRenderer 创建组件实例
- [ ] 传递 props（suggestions, command）
- [ ] 挂载到 DOM
- [ ] 实现组件更新逻辑
- [ ] 实现组件销毁逻辑

**核心代码**：
```typescript
view() {
  let component: VueRenderer | null = null
  let popup: HTMLElement | null = null
  
  return {
    update(view: EditorView) {
      const state = SuggestionPluginKey.getState(view.state)
      
      if (state?.active && state.filteredSuggestions.length > 0) {
        if (!component) {
          // 创建组件
          component = new VueRenderer(SuggestionList, {
            props: {
              suggestions: state.filteredSuggestions,
              selectedIndex: state.selectedIndex,
              inputValue: state.query,
              command: (item: SuggestionItem) => {
                insertSuggestion(view, state.range, item.content)
              }
            },
            editor
          })
          
          popup = component.element as HTMLElement
          document.body.appendChild(popup)
        } else {
          // 更新 props
          component.updateProps({
            suggestions: state.filteredSuggestions,
            selectedIndex: state.selectedIndex
          })
        }
        
        // 定位弹窗
        positionPopup(view, popup)
      } else {
        // 销毁组件
        if (component) {
          component.destroy()
          component = null
        }
        if (popup) {
          popup.remove()
          popup = null
        }
      }
    },
    
    destroy() {
      component?.destroy()
      popup?.remove()
    }
  }
}
```

**验收标准**：
- 建议列表正确显示
- 组件更新流畅
- 无内存泄漏

**预计时间**：2 小时


#### 4.2 实现弹窗定位

**任务清单**：
- [ ] 安装 @floating-ui/dom（如果未安装）
- [ ] 实现 `positionPopup` 函数
- [ ] 使用 autoUpdate 自动更新位置
- [ ] 处理边界溢出（flip, shift）

**核心代码**：
```typescript
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom'

let cleanup: (() => void) | null = null

function positionPopup(view: EditorView, popup: HTMLElement) {
  // 清理旧的自动更新
  cleanup?.()
  
  // 全局模式：相对于编辑器容器
  const referenceElement = view.dom
  
  // 设置自动更新
  cleanup = autoUpdate(referenceElement, popup, () => {
    computePosition(referenceElement, popup, {
      placement: 'bottom-start',
      middleware: [
        offset(8),
        flip(),
        shift({ padding: 8 })
      ]
    }).then(({ x, y }) => {
      Object.assign(popup.style, {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        zIndex: '1000'
      })
    })
  })
}
```

**验收标准**：
- 弹窗位置正确
- 自动处理边界溢出
- 滚动时位置更新

**预计时间**：1.5 小时

#### 4.3 渲染自动补全提示

**任务清单**：
- [ ] 实现 `renderAutoComplete` 函数
- [ ] 创建补全提示覆盖层
- [ ] 实现镜像文本对齐
- [ ] 添加 Tab 提示标签
- [ ] 处理显示/隐藏逻辑

**核心代码**：
```typescript
function renderAutoComplete(view: EditorView, state: SuggestionState) {
  // 移除旧的补全提示
  const oldOverlay = view.dom.querySelector('.suggestion-autocomplete')
  if (oldOverlay) {
    oldOverlay.remove()
  }
  
  // 如果没有补全文本，直接返回
  if (!state.autoCompleteText || !state.show) {
    return
  }
  
  // 创建补全提示
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
  complete.textContent = state.autoCompleteText
  overlay.appendChild(complete)
  
  // Tab 提示
  if (state.showTabIndicator) {
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

**验收标准**：
- 补全提示正确显示
- 文本对齐精确
- Tab 提示清晰可见

**预计时间**：2 小时

---

### Step 5: 实现键盘交互

**目标**：处理所有键盘事件

#### 5.1 实现基础键盘处理

**任务清单**：
- [ ] 实现 `handleKeyDown` 函数
- [ ] 检查插件激活状态
- [ ] 检查与其他插件的冲突

**核心代码**：
```typescript
props: {
  handleKeyDown(view: EditorView, event: KeyboardEvent): boolean {
    // 检查 skill-mention 是否激活
    const skillMentionState = SkillMentionPluginKey.getState(view.state)
    if (skillMentionState?.active) {
      return false // 让 skill-mention 处理
    }
    
    // 检查 suggestion 是否激活
    const state = SuggestionPluginKey.getState(view.state)
    if (!state?.active) {
      return false
    }
    
    // 处理各种按键...
    return false
  }
}
```

**验收标准**：
- 不与其他插件冲突
- 仅在激活时处理按键

**预计时间**：0.5 小时

#### 5.2 实现 Tab 键应用补全

**任务清单**：
- [ ] 检测 Tab 键
- [ ] 检查是否有补全文本
- [ ] 应用补全文本
- [ ] 关闭建议列表

**核心代码**：
```typescript
// Tab 键：应用补全
if (event.key === 'Tab' && state.autoCompleteText) {
  event.preventDefault()
  
  // 构建完整文本
  const fullText = state.query + state.autoCompleteText
  
  // 插入文本
  insertSuggestion(view, state.range, fullText)
  
  // 关闭建议列表
  const tr = view.state.tr
  tr.setMeta(SuggestionPluginKey, { type: 'close' })
  view.dispatch(tr)
  
  return true
}
```

**验收标准**：
- Tab 键正确应用补全
- 光标位置正确
- 建议列表关闭

**预计时间**：1 小时


#### 5.3 实现 ↑↓ 键导航

**任务清单**：
- [ ] 检测 ↑↓ 键
- [ ] 计算新的选中索引
- [ ] 更新插件状态
- [ ] 同步更新补全提示

**核心代码**：
```typescript
// ↑↓ 键：导航
if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
  event.preventDefault()
  
  const direction = event.key === 'ArrowDown' ? 1 : -1
  const length = state.filteredSuggestions.length
  
  // 计算新索引（循环）
  let newIndex = state.selectedIndex + direction
  if (newIndex < 0) {
    newIndex = length - 1
  } else if (newIndex >= length) {
    newIndex = 0
  }
  
  // 更新状态
  const tr = view.state.tr
  tr.setMeta(SuggestionPluginKey, {
    type: 'updateIndex',
    index: newIndex
  })
  view.dispatch(tr)
  
  return true
}
```

**验收标准**：
- 导航流畅
- 循环选择正常
- 补全提示同步更新

**预计时间**：1 小时

#### 5.4 实现 Enter 键选中

**任务清单**：
- [ ] 检测 Enter 键
- [ ] 获取当前选中项
- [ ] 插入建议内容
- [ ] 关闭建议列表

**核心代码**：
```typescript
// Enter 键：选中
if (event.key === 'Enter') {
  event.preventDefault()
  
  const selectedItem = state.filteredSuggestions[state.selectedIndex]
  if (selectedItem) {
    insertSuggestion(view, state.range, selectedItem.content)
    
    // 关闭建议列表
    const tr = view.state.tr
    tr.setMeta(SuggestionPluginKey, { type: 'close' })
    view.dispatch(tr)
  }
  
  return true
}
```

**验收标准**：
- Enter 键正确选中
- 内容插入正确
- 建议列表关闭

**预计时间**：0.5 小时

#### 5.5 实现 Esc 键关闭

**任务清单**：
- [ ] 检测 Esc 键
- [ ] 关闭建议列表
- [ ] 清除补全提示

**核心代码**：
```typescript
// Esc 键：关闭
if (event.key === 'Escape') {
  event.preventDefault()
  
  const tr = view.state.tr
  tr.setMeta(SuggestionPluginKey, { type: 'close' })
  view.dispatch(tr)
  
  return true
}
```

**验收标准**：
- Esc 键正确关闭
- 补全提示清除

**预计时间**：0.5 小时

---

### Step 6: 实现文本插入

**目标**：正确插入建议内容并设置光标位置

**任务清单**：
- [ ] 实现 `insertSuggestion` 函数
- [ ] 删除查询文本
- [ ] 插入建议内容
- [ ] 设置光标位置
- [ ] 触发回调事件

**核心代码**：
```typescript
function insertSuggestion(
  view: EditorView,
  range: { from: number; to: number } | null,
  content: string
) {
  if (!range) return
  
  const { state, dispatch } = view
  const { tr } = state
  
  // 删除查询文本
  tr.delete(range.from, range.to)
  
  // 插入建议内容
  tr.insertText(content, range.from)
  
  // 设置光标位置
  const newPos = range.from + content.length
  tr.setSelection(TextSelection.create(tr.doc, newPos))
  
  dispatch(tr)
  
  // 聚焦编辑器
  view.focus()
}
```

**验收标准**：
- 文本插入正确
- 光标位置正确
- 编辑器保持聚焦

**预计时间**：1 小时

---

### Step 7: 创建 Extension 定义

**目标**：封装为 Tiptap Extension

**文件**：`packages/components/src/chat-input/extensions/suggestion/index.ts`

**任务清单**：
- [ ] 创建 Extension
- [ ] 定义 options
- [ ] 注册 ProseMirror 插件
- [ ] 导出类型

**核心代码**：
```typescript
import { Extension } from '@tiptap/core'
import { createSuggestionPlugin } from './plugins'
import type { SuggestionOptions } from './types'

export const Suggestion = Extension.create<SuggestionOptions>({
  name: 'suggestion',

  addOptions() {
    return {
      char: null,
      suggestions: [],
      activeSuggestionKeys: ['Enter', 'Tab'],
      allowSpaces: true,
      popupWidth: 400,
      showAutoComplete: true,
      filterFn: undefined,
      onSelect: undefined
    }
  },

  addProseMirrorPlugins() {
    return [
      createSuggestionPlugin({
        editor: this.editor,
        ...this.options
      })
    ]
  }
})

export * from './types'
export { SuggestionPluginKey } from './plugins'
```

**验收标准**：
- Extension 可以正常注册
- Options 配置生效
- 类型导出完整

**预计时间**：1 小时

---

### Step 8: 集成到 ChatInput

**目标**：将 Suggestion 插件集成到 ChatInput 组件

#### 8.1 扩展类型定义

**文件**：`packages/components/src/chat-input/index.type.ts`

**任务清单**：
- [ ] 添加 suggestions 相关 Props
- [ ] 添加 suggestion-select 事件
- [ ] 导出 SuggestionItem 类型

**代码**：
```typescript
export interface ChatInputProps {
  // ... 现有 props
  
  /**
   * 建议列表
   */
  suggestions?: SuggestionItem[]
  
  /**
   * 建议触发字符
   */
  suggestionChar?: string | null
  
  /**
   * 建议弹窗宽度
   */
  suggestionPopupWidth?: number | string
  
  /**
   * 激活建议项的按键
   */
  activeSuggestionKeys?: string[]
  
  /**
   * 是否显示自动补全提示
   */
  showAutoComplete?: boolean
}

export interface ChatInputEmits {
  // ... 现有 events
  
  /**
   * 选择建议项时触发
   */
  (e: 'suggestion-select', value: string): void
}
```

**验收标准**：
- 类型定义完整
- 无 TypeScript 错误

**预计时间**：0.5 小时


#### 8.2 在 useEditor 中注册插件

**文件**：`packages/components/src/chat-input/composables/useEditor.ts`

**任务清单**：
- [ ] 导入 Suggestion 扩展
- [ ] 根据 props 配置插件
- [ ] 注册到 extensions 数组

**代码**：
```typescript
import { Suggestion } from '../extensions/suggestion'

export function useEditor(props: ChatInputProps, emit: ChatInputEmits) {
  // ... 现有代码
  
  const extensions = [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder
    }),
    Template,
    SkillMention.configure({
      skills: props.skills || []
    }),
    // 添加 Suggestion 插件
    ...(props.suggestions && props.suggestions.length > 0
      ? [
          Suggestion.configure({
            char: props.suggestionChar ?? null,
            suggestions: props.suggestions,
            activeSuggestionKeys: props.activeSuggestionKeys ?? ['Enter', 'Tab'],
            popupWidth: props.suggestionPopupWidth ?? 400,
            showAutoComplete: props.showAutoComplete ?? true,
            onSelect: (item) => {
              emit('suggestion-select', item.content)
            }
          })
        ]
      : [])
  ]
  
  // ... 创建编辑器
}
```

**验收标准**：
- 插件正确注册
- 配置项生效
- 事件正确触发

**预计时间**：1 小时

#### 8.3 添加样式

**文件**：`packages/components/src/chat-input/extensions/suggestion/index.less`

**任务清单**：
- [ ] 定义 CSS 变量
- [ ] 实现建议列表样式
- [ ] 实现自动补全提示样式
- [ ] 适配 light/dark 主题

**代码**：
```less
:root {
  // 建议列表
  --tr-suggestion-bg-color: #fff;
  --tr-suggestion-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --tr-suggestion-hover-bg: rgba(0, 0, 0, 0.04);
  --tr-suggestion-item-font-size: 14px;
  
  // 自动补全提示
  --tr-suggestion-autocomplete-color: #999;
  --tr-suggestion-tab-hint-border: #999;
  --tr-suggestion-tab-hint-color: #666;
  --tr-suggestion-tab-hint-bg: rgba(255, 255, 255, 0.8);
}

.suggestion-list {
  position: absolute;
  background: var(--tr-suggestion-bg-color);
  border-radius: 12px;
  box-shadow: var(--tr-suggestion-box-shadow);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  
  &__item {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    cursor: pointer;
    font-size: var(--tr-suggestion-item-font-size);
    gap: 8px;
    
    &.highlighted {
      background-color: var(--tr-suggestion-hover-bg);
      border-radius: 8px;
    }
  }
  
  &__icon {
    font-size: 16px;
  }
  
  &__text {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    &--match {
      font-weight: 600;
    }
  }
}

.suggestion-autocomplete {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
  color: var(--tr-suggestion-autocomplete-color);
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  display: flex;
  align-items: center;
  white-space: pre;
  
  .user-input-mirror {
    visibility: hidden;
  }
  
  .tab-hint {
    margin-left: 8px;
    padding: 2px 6px;
    border: 1px dashed var(--tr-suggestion-tab-hint-border);
    border-radius: 4px;
    font-size: 12px;
    color: var(--tr-suggestion-tab-hint-color);
    background: var(--tr-suggestion-tab-hint-bg);
  }
}
```

**验收标准**：
- 样式美观
- 主题适配正常
- 与 skill-mention 风格一致

**预计时间**：1.5 小时

---

### Step 9: 基础功能测试

**目标**：验证核心功能正常工作

**任务清单**：
- [ ] 创建测试 demo
- [ ] 测试建议列表显示
- [ ] 测试键盘导航
- [ ] 测试 Tab 键应用补全
- [ ] 测试 Enter 键选中
- [ ] 测试 Esc 键关闭
- [ ] 测试自动补全提示显示
- [ ] 测试与 skill-mention 的兼容性

**测试用例**：
```vue
<template>
  <tr-chat-input
    v-model="input"
    :suggestions="suggestions"
    @suggestion-select="handleSelect"
  />
</template>

<script setup>
const input = ref('')
const suggestions = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'CDN-权限管理' }
]

const handleSelect = (value) => {
  console.log('选中:', value)
}
</script>
```

**验收标准**：
- 所有基础功能正常
- 无明显 bug
- 性能良好

**预计时间**：2 小时

---

## 🚀 阶段一总结

完成阶段一后，应该实现以下功能：

✅ 建议列表显示和过滤  
✅ 键盘导航（↑↓ Enter Tab Esc）  
✅ 自动补全提示（包括 Tab 提示）  
✅ 高亮匹配  
✅ 文本插入  
✅ 与 ChatInput 集成  
✅ 基础样式  

**预计总时间**：20-24 小时（3-4 天）

---

## 🎨 阶段二：增强功能（可选）

### Step 10: 实现字符触发模式

**目标**：支持类似 `/` 的字符触发

**任务清单**：
- [ ] 实现 `findTrigger` 函数（参考 skill-mention）
- [ ] 检测触发字符
- [ ] 提取触发字符后的查询文本
- [ ] 添加触发区域装饰器
- [ ] 实现相对于光标的定位

**核心代码**：
```typescript
function findTrigger(
  selection: Selection,
  char: string,
  allowSpaces: boolean
): {
  range: { from: number; to: number }
  query: string
} | null {
  const { $from } = selection
  
  if (!selection.empty || !$from.parent.isTextblock) {
    return null
  }
  
  const textBefore = $from.parent.textBetween(0, $from.parentOffset)
  const lastCharIndex = textBefore.lastIndexOf(char)
  
  if (lastCharIndex === -1) {
    return null
  }
  
  const query = textBefore.slice(lastCharIndex + char.length)
  
  if (!allowSpaces && query.includes(' ')) {
    return null
  }
  
  const from = $from.start() + lastCharIndex
  const to = $from.pos
  
  return { range: { from, to }, query }
}
```

**验收标准**：
- 字符触发正常
- 查询文本提取正确
- 装饰器显示正常

**预计时间**：3 小时

---

### Step 11: 高级配置支持

**目标**：支持更多自定义配置

#### 11.1 自定义过滤函数

**任务清单**：
- [ ] 支持 `filterFn` 配置
- [ ] 在过滤时调用自定义函数
- [ ] 提供默认过滤函数

**代码**：
```typescript
const filteredSuggestions = options.filterFn
  ? options.filterFn(options.suggestions, query)
  : filterSuggestions(options.suggestions, query)
```

**预计时间**：0.5 小时

#### 11.2 禁用自动补全提示

**任务清单**：
- [ ] 支持 `showAutoComplete` 配置
- [ ] 根据配置控制补全提示显示

**代码**：
```typescript
if (options.showAutoComplete && autoCompleteText) {
  renderAutoComplete(view, state)
}
```

**预计时间**：0.5 小时


---

### Step 12: 性能优化

**目标**：提升性能和用户体验

#### 12.1 防抖处理

**任务清单**：
- [ ] 对过滤逻辑添加防抖
- [ ] 避免频繁更新 DOM

**代码**：
```typescript
import { debounce } from 'lodash-es'

const debouncedFilter = debounce((query: string) => {
  const filtered = filterSuggestions(suggestions, query)
  updateState({ filteredSuggestions: filtered })
}, 150)
```

**预计时间**：1 小时

#### 12.2 限制建议项数量

**任务清单**：
- [ ] 限制最多显示 50 条
- [ ] 添加"显示更多"提示（可选）

**代码**：
```typescript
const MAX_SUGGESTIONS = 50

function filterSuggestions(suggestions, query) {
  return suggestions
    .filter(item => matches(item, query))
    .slice(0, MAX_SUGGESTIONS)
}
```

**预计时间**：0.5 小时

#### 12.3 DOM 复用

**任务清单**：
- [ ] 复用补全提示元素
- [ ] 避免频繁创建/销毁

**代码**：
```typescript
let autocompleteElement: HTMLElement | null = null

function renderAutoComplete(view, state) {
  if (!autocompleteElement) {
    autocompleteElement = createAutocompleteElement()
  }
  
  // 更新内容
  updateAutocompleteContent(autocompleteElement, state)
}
```

**预计时间**：1 小时

---

## 🚀 阶段二总结

完成阶段二后，应该实现以下增强功能：

✅ 字符触发模式（如 `/` 命令）  
✅ 自定义过滤函数  
✅ 可配置的自动补全提示  
✅ 性能优化（防抖、限制数量、DOM 复用）  

**预计总时间**：6-8 小时（1-2 天）

---

## 📚 阶段三：测试与文档

### Step 13: 单元测试

**目标**：确保核心逻辑正确

#### 13.1 高亮处理测试

**文件**：`packages/components/src/chat-input/extensions/suggestion/__tests__/highlight.test.ts`

**任务清单**：
- [ ] 测试自动匹配
- [ ] 测试精确指定
- [ ] 测试自定义函数
- [ ] 测试边界情况

**代码示例**：
```typescript
import { describe, it, expect } from 'vitest'
import { processHighlights } from '../utils/highlight'

describe('processHighlights', () => {
  it('应该自动匹配输入内容', () => {
    const item = { content: 'ECS-云服务器' }
    const result = processHighlights(item, 'ECS')
    expect(result).toEqual([
      { text: 'ECS', isMatch: true },
      { text: '-云服务器', isMatch: false }
    ])
  })
  
  // 更多测试...
})
```

**预计时间**：2 小时

#### 13.2 过滤逻辑测试

**文件**：`packages/components/src/chat-input/extensions/suggestion/__tests__/filter.test.ts`

**任务清单**：
- [ ] 测试模糊匹配
- [ ] 测试空查询
- [ ] 测试数量限制
- [ ] 测试边界情况

**预计时间**：1 小时

#### 13.3 自动补全测试

**文件**：`packages/components/src/chat-input/extensions/suggestion/__tests__/autocomplete.test.ts`

**任务清单**：
- [ ] 测试补全文本计算
- [ ] 测试前缀匹配
- [ ] 测试边界情况

**预计时间**：1 小时

---

### Step 14: 集成测试

**目标**：测试插件在实际环境中的表现

**文件**：`packages/components/src/chat-input/extensions/suggestion/__tests__/integration.test.ts`

**任务清单**：
- [ ] 测试建议列表显示
- [ ] 测试键盘交互
- [ ] 测试自动补全提示
- [ ] 测试与 skill-mention 的兼容性
- [ ] 测试与模板编辑器的兼容性

**代码示例**：
```typescript
import { describe, it, expect } from 'vitest'
import { createEditor } from '@tiptap/core'
import { Suggestion } from '../index'

describe('Suggestion Plugin Integration', () => {
  it('应该在输入时显示建议列表', async () => {
    const editor = createEditor({
      extensions: [
        Suggestion.configure({
          suggestions: [{ content: 'ECS-云服务器' }]
        })
      ]
    })
    
    editor.commands.insertContent('ECS')
    await nextTick()
    
    const popup = document.querySelector('.suggestion-list')
    expect(popup).toBeTruthy()
  })
  
  // 更多测试...
})
```

**预计时间**：3 小时

---

### Step 15: 文档与示例

**目标**：完善文档和示例

#### 15.1 更新 chat-input.md

**文件**：`docs/src/components/chat-input.md`

**任务清单**：
- [ ] 添加智能联想章节
- [ ] 添加 API 文档
- [ ] 添加使用示例
- [ ] 添加配置说明

**内容大纲**：
```markdown
## 输入增强

### 智能联想

根据用户输入显示匹配的建议项，支持键盘导航和自动补全。

<demo vue="../../demos/chat-input/suggestion.vue" />

#### 基础用法

#### 高亮模式

#### 自动补全提示

#### 字符触发模式

## Props

| 属性名 | 说明 | 类型 | 默认值 |
|--------|------|------|--------|
| suggestions | 建议列表 | SuggestionItem[] | [] |
| suggestionChar | 触发字符 | string \| null | null |
| ... | ... | ... | ... |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| suggestion-select | 选择建议项时触发 | (value: string) |

## Types

```typescript
interface SuggestionItem {
  content: string
  label?: string
  highlights?: string[] | HighlightFunction
}
```
```

**预计时间**：2 小时

#### 15.2 创建示例 Demo

**文件**：`demos/chat-input/suggestion.vue`

**任务清单**：
- [ ] 创建基础示例
- [ ] 创建高亮模式示例
- [ ] 创建字符触发示例
- [ ] 添加交互说明

**代码示例**：
```vue
<template>
  <div class="demo-container">
    <h3>基础用法</h3>
    <tr-chat-input
      v-model="input1"
      :suggestions="filteredSuggestions"
      placeholder="输入 ECS 或 CDN 查看建议..."
      @suggestion-select="handleSelect"
    />
    
    <h3>字符触发模式</h3>
    <tr-chat-input
      v-model="input2"
      :suggestions="commands"
      suggestion-char="/"
      placeholder="输入 / 查看命令..."
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const input1 = ref('')
const input2 = ref('')

const allSuggestions = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'CDN-权限管理' }
]

const filteredSuggestions = computed(() => {
  if (!input1.value) return allSuggestions
  return allSuggestions.filter(item =>
    item.content.toLowerCase().includes(input1.value.toLowerCase())
  )
})

const commands = [
  { content: 'help', label: '帮助' },
  { content: 'clear', label: '清空' }
]

const handleSelect = (value: string) => {
  console.log('选中:', value)
}
</script>
```

**预计时间**：2 小时

#### 15.3 添加 API 文档注释

**任务清单**：
- [ ] 为所有公开 API 添加 JSDoc 注释
- [ ] 添加使用示例
- [ ] 添加注意事项

**代码示例**：
```typescript
/**
 * Suggestion 扩展
 * 
 * 提供智能联想功能，支持键盘导航和自动补全
 * 
 * @example
 * ```typescript
 * import { Suggestion } from '@opentiny/vue-robot'
 * 
 * const editor = useEditor({
 *   extensions: [
 *     Suggestion.configure({
 *       suggestions: [
 *         { content: 'ECS-云服务器' }
 *       ]
 *     })
 *   ]
 * })
 * ```
 */
export const Suggestion = Extension.create<SuggestionOptions>({
  // ...
})
```

**预计时间**：1 小时

---

## 🚀 阶段三总结

完成阶段三后，应该完成：

✅ 完整的单元测试  
✅ 完整的集成测试  
✅ 详细的文档  
✅ 丰富的示例  
✅ API 注释  

**预计总时间**：12-14 小时（2-3 天）

---

## 📊 总体进度跟踪

### 阶段一：核心功能（必需）✅

- [x] Step 1: 创建插件目录结构 (0.5h) ✅
- [x] Step 2: 复用 Sender 代码 (3h) ✅
- [x] Step 3: 实现 ProseMirror 插件核心逻辑 (5.5h) ✅
- [x] Step 4: 实现 UI 渲染 (5.5h) ✅
- [x] Step 5: 实现键盘交互 (3.5h) ✅
- [x] Step 6: 实现文本插入 (1h) ✅
- [x] Step 7: 创建 Extension 定义 (1h) ✅
- [x] Step 8: 集成到 ChatInput (3h) ✅
- [x] Step 9: 基础功能测试 (2h) ✅

**小计**：25 小时（3-4 天）✅ **已完成**

### 阶段二：增强功能（可选）

- [ ] Step 10: 实现字符触发模式 (3h)
- [ ] Step 11: 高级配置支持 (1h)
- [ ] Step 12: 性能优化 (2.5h)

**小计**：6.5 小时（1 天）

### 阶段三：测试与文档（必需）

- [ ] Step 13: 单元测试 (4h)
- [ ] Step 14: 集成测试 (3h)
- [ ] Step 15: 文档与示例 (5h)

**小计**：12 小时（2 天）

### 总计

**必需部分**：37 小时（5-6 天）  
**可选部分**：6.5 小时（1 天）  
**总计**：43.5 小时（6-7 天）

---

## 🎯 里程碑

### 里程碑 1：核心功能可用（Day 4）
- 建议列表显示
- 键盘导航
- 自动补全提示
- 基础集成

### 里程碑 2：功能完善（Day 5）
- 字符触发模式
- 性能优化
- 边界处理

### 里程碑 3：发布就绪（Day 7）
- 完整测试
- 完善文档
- 示例齐全

---

## 📝 注意事项

1. **优先级**：先完成阶段一的核心功能，确保基础可用
2. **测试驱动**：每完成一个 Step 都要进行测试验证
3. **代码质量**：保持代码整洁，添加必要的注释
4. **性能考虑**：注意大量数据时的性能表现
5. **兼容性**：确保与现有插件（skill-mention）不冲突
6. **文档同步**：代码实现与设计文档保持一致

---

**文档版本**：v1.0  
**创建日期**：2024-11-26  
**最后更新**：2024-11-26
