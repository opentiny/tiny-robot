# Chat-Input 扩展系统重构方案

本文档详细阐述了 Chat-Input 扩展系统的重构方案，包括目录结构优化、职责分离、代码复用等内容。

## 目录

1. [当前问题分析](#当前问题分析)
2. [重构目标](#重构目标)
3. [新的目录结构](#新的目录结构)
4. [详细重构方案](#详细重构方案)
5. [实施路线图](#实施路线图)
6. [迁移影响](#迁移影响)

---

## 当前问题分析

### 1. 目录结构不统一

当前扩展系统的目录结构存在以下问题：

- **mention**: 包含 `plugins.ts`、`types.ts`、Vue 组件等，结构相对完整
- **suggestion**: 有 `utils/` 子目录用于存放过滤和高亮逻辑，但其他扩展没有
- **template**: 结构与 mention 类似，但缺少一些组织规范

```
extensions/
├── mention/
│   ├── index.ts          # 混合了扩展定义、辅助函数、命令等
│   ├── plugins.ts        # 插件实现
│   ├── types.ts          # 类型定义
│   ├── mention-view.vue
│   ├── mention-list.vue
│   ├── index.less
│   └── commands.d.ts
├── suggestion/
│   ├── index.ts          # 混合了扩展定义、辅助函数等
│   ├── plugins.ts        # 插件实现
│   ├── types.ts          # 类型定义
│   ├── suggestion-list.vue
│   ├── utils/            # 工具函数（仅此扩展有）
│   │   ├── filter.ts
│   │   └── highlight.ts
│   ├── index.less
│   └── commands.d.ts
├── template/
│   ├── index.ts          # 混合了扩展定义、辅助函数、命令等
│   ├── plugins.ts        # 插件实现
│   ├── types.ts          # 类型定义
│   ├── template-block-view.vue
│   ├── index.less
│   └── commands.d.ts
└── index.ts              # 统一导出
```

### 2. 文件职责混乱

各扩展的 `index.ts` 文件过于庞大，包含了多种职责：

- **扩展定义**: Node.create() 或 Extension.create()
- **辅助函数**: getMentions()、getTextWithMentions() 等
- **命令定义**: addCommands() 中的所有命令
- **插件集成**: addProseMirrorPlugins()
- **类型导出**: 导出所有相关类型

这导致单个文件可能超过 300+ 行代码，难以维护。

### 3. Helpers 职责不清

`packages/components/src/chat-input/helpers/extension-helpers.ts` 提供便捷函数：

```typescript
export function mention(items, char = '@', options) {
  return Mention.configure({ items, char, ...options })
}
```

**问题**：
- 便捷函数作为独立的 helpers 模块，职责不清晰
- 依赖关系复杂：helpers 依赖扩展，组件主入口依赖 helpers
- 新增扩展时需要同时修改 helpers 文件
- 与扩展定义分离，不利于维护

### 4. 代码复用性差

- 各扩展间有相似的模式但没有抽象
- 插件创建逻辑重复
- 缺少通用的工具函数和基类

---

## 重构目标

### 1. 职责单一

- 每个文件只负责一个特定的功能
- 扩展定义、命令、工具函数、插件实现分离
- 便于维护和测试

### 2. 结构统一

- 所有扩展遵循相同的目录结构
- 文件命名规范统一
- 便于新扩展的开发

### 3. 代码复用

- 通用逻辑抽象到共享模块
- 插件基类减少重复代码
- 通用组件提高开发效率

### 4. 可扩展性

- 新扩展可以继承基类快速开发
- 共享工具函数易于扩展
- 类型定义支持泛型扩展

---

## 新的目录结构

### 设计原则

1. **命令整合到 types.ts**：命令定义与类型紧密相关，整合后便于维护
2. **简化便捷函数**：使用简单函数而非工厂类，避免过度设计
3. **保持扩展独立性**：每个扩展的特殊工具保留在自己的目录中
4. **共享代码最小化**：只抽象真正通用的工具函数

### 完整的目录树

```
extensions/
├── shared/                          # 共享代码（最小化）
│   ├── utils/                       # 通用工具函数
│   │   ├── index.ts                 # 导出所有工具
│   │   ├── id-generator.ts          # ID 生成器
│   │   └── position.ts              # 位置计算（用于 mention/suggestion）
│   └── styles/                      # 通用样式
│       └── variables.less           # 样式变量
├── mention/                         # Mention 扩展
│   ├── index.ts                     # 扩展入口（仅导出）
│   ├── extension.ts                 # 扩展定义
│   ├── types.ts                     # 类型定义 + 命令定义
│   ├── utils.ts                     # 工具函数
│   ├── plugin.ts                    # 插件实现
│   ├── factory.ts                   # 便捷函数（简单函数）
│   ├── components/                  # 组件
│   │   ├── mention-view.vue         # 节点视图
│   │   └── mention-list.vue         # 建议列表
│   └── styles/                      # 样式
│       └── index.less               # 样式文件
├── suggestion/                      # Suggestion 扩展
│   ├── index.ts                     # 扩展入口（仅导出）
│   ├── extension.ts                 # 扩展定义
│   ├── types.ts                     # 类型定义（无命令）
│   ├── utils.ts                     # 工具函数
│   ├── plugin.ts                    # 插件实现
│   ├── factory.ts                   # 便捷函数（简单函数）
│   ├── components/                  # 组件
│   │   └── suggestion-list.vue      # 建议列表
│   ├── utils/                       # 专用工具（保留）
│   │   ├── filter.ts                # 过滤逻辑
│   │   └── highlight.ts             # 高亮逻辑
│   └── styles/                      # 样式
│       └── index.less               # 样式文件
├── template/                        # Template 扩展
│   ├── index.ts                     # 扩展入口（仅导出）
│   ├── extension.ts                 # 扩展定义
│   ├── types.ts                     # 类型定义 + 命令定义
│   ├── utils.ts                     # 工具函数
│   ├── factory.ts                   # 便捷函数（简单函数）
│   ├── plugins/                     # 多个插件（保留）
│   │   ├── index.ts                 # 导出所有插件
│   │   ├── navigation.ts            # 导航插件
│   │   ├── paste-handler.ts         # 粘贴处理插件
│   │   └── zero-width-chars.ts      # 零宽字符插件
│   ├── components/                  # 组件
│   │   └── template-block-view.vue  # 模板块视图
│   └── styles/                      # 样式
│       └── index.less               # 样式文件
└── index.ts                         # 统一导出
```

### 目录结构说明

#### shared/ - 共享代码（最小化原则）

只包含真正通用的工具函数，避免过度抽象：

- **utils/id-generator.ts**: 所有扩展都需要生成唯一 ID
- **utils/position.ts**: mention 和 suggestion 都需要查找触发位置
- **styles/variables.less**: 通用样式变量

**不包含**：
- ~~插件基类~~：各扩展的插件逻辑差异较大，强行抽象反而增加复杂度
- ~~通用组件~~：目前没有真正通用的组件
- ~~工厂基类~~：简单函数足够，不需要工厂模式

#### 各扩展目录结构统一

每个扩展遵循相同的文件组织：

- **index.ts**: 入口文件，仅负责导出
- **extension.ts**: 扩展定义，包含 Node.create() 或 Extension.create()
- **types.ts**: 类型定义 + 命令定义（如有）
- **utils.ts**: 扩展特定的工具函数
- **plugin.ts**: 插件实现（单个插件）
- **plugins/**: 插件集合（多个插件时使用，如 template）
- **factory.ts**: 便捷函数（简单函数包装）
- **components/**: Vue 组件
- **styles/**: 样式文件
- **utils/**: 扩展特定的工具模块（如 suggestion 的 filter 和 highlight）

---

## 详细重构方案

### Phase 1: 共享基础设施（最小化）

#### 1.1 通用工具函数

**文件**: `shared/utils/id-generator.ts`

```typescript
/**
 * 生成唯一 ID
 * 
 * @param prefix - ID 前缀
 * @returns 唯一 ID 字符串
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
```

**文件**: `shared/utils/position.ts`

```typescript
import type { Selection } from '@tiptap/pm/state'

/**
 * 查找触发字符的位置和查询文本
 * 
 * 用于 mention 和 suggestion 扩展
 * 
 * @param selection - 当前光标位置
 * @param char - 触发字符
 * @param allowSpaces - 是否允许空格
 * @returns 触发范围和查询文本，未找到返回 null
 */
export function findTextRange(
  selection: Selection,
  char: string,
  allowSpaces: boolean = false
): { range: { from: number; to: number }; query: string } | null {
  const { $from } = selection

  if (!selection.empty || !$from.parent.isTextblock) {
    return null
  }

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc')
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

  return {
    range: { from, to },
    query,
  }
}
```

**文件**: `shared/utils/index.ts`

```typescript
/**
 * 共享工具函数统一导出
 */
export { generateId } from './id-generator'
export { findTextRange } from './position'
```

#### 1.2 通用样式变量

**文件**: `shared/styles/variables.less`

```less
/**
 * 扩展通用样式变量
 */

// 弹窗样式
@popup-bg-color: #fff;
@popup-border-color: #e0e0e0;
@popup-border-radius: 8px;
@popup-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
@popup-max-height: 300px;

// 列表项样式
@item-padding: 8px 12px;
@item-hover-bg: #f5f5f5;
@item-selected-bg: #e6f7ff;
@item-selected-border: #1890ff;

// 高亮样式
@highlight-color: #1890ff;
@highlight-bg: #e6f7ff;
```

### Phase 2: 扩展重构示例 - Mention

#### 2.1 类型定义 + 命令定义（整合）

**文件**: `mention/types.ts`

```typescript
/**
 * Mention 扩展类型定义和命令
 */
import type { Ref } from 'vue'
import type { Editor } from '@tiptap/core'
import { generateId } from '../shared/utils'

// ===== 类型定义 =====

export interface MentionItem {
  id?: string
  label: string
  preset: string
  icon?: string
}

export interface MentionAttrs {
  id: string
  label: string
  preset?: string
}

export interface MentionOptions {
  items: MentionItem[] | Ref<MentionItem[]>
  char: string
  allowSpaces: boolean
  HTMLAttributes: Record<string, unknown>
}

export type MentionStructuredItem =
  | { type: 'text'; content: string }
  | { type: 'mention'; content: string; preset: string }

export interface MentionSuggestionState {
  active: boolean
  range: { from: number; to: number } | null
  query: string
  filteredItems: MentionItem[]
}

// ===== 命令定义 =====

export const mentionCommands = {
  /**
   * 插入 mention 节点
   */
  insertMention:
    (attrs: Partial<MentionAttrs>) =>
    ({ commands }: { commands: Editor['commands'] }) => {
      return commands.insertContent({
        type: 'mention',
        attrs: {
          id: attrs.id || generateId('mention'),
          label: attrs.label || '',
          preset: attrs.preset,
        },
      })
    },

  /**
   * 删除 mention 节点
   */
  deleteMention:
    (id: string) =>
    ({ tr, state }: { tr: Editor['state']['tr']; state: Editor['state'] }) => {
      let deleted = false
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'mention' && node.attrs.id === id) {
          tr.delete(pos, pos + node.nodeSize)
          deleted = true
          return false
        }
      })
      return deleted
    },
}
```

#### 2.2 扩展定义

**文件**: `mention/extension.ts`

```typescript
/**
 * Mention 扩展定义
 */
import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { watch, isRef } from 'vue'
import MentionView from './components/mention-view.vue'
import { createMentionPlugin, MentionPluginKey } from './plugin'
import { mentionCommands, type MentionOptions } from './types'
import './styles/index.less'

export const Mention = Node.create<MentionOptions>({
  name: 'mention',
  
  // 节点配置
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  // 配置选项
  addOptions() {
    return {
      items: [],
      char: '@',
      allowSpaces: false,
      HTMLAttributes: {},
    }
  },

  // 节点属性
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) return {}
          return { 'data-id': attributes.id }
        },
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) return {}
          return { 'data-label': attributes.label }
        },
      },
      preset: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-preset'),
        renderHTML: (attributes) => {
          if (!attributes.preset) return {}
          return { 'data-preset': attributes.preset }
        },
      },
    }
  },

  // HTML 解析
  parseHTML() {
    return [{ tag: 'span[data-mention]' }]
  },

  // HTML 渲染
  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-mention': '',
        'data-id': node.attrs.id,
        'data-label': node.attrs.label,
        'data-preset': node.attrs.preset,
      }),
      `${this.options.char}${node.attrs.label}`,
    ]
  },

  // Vue 组件渲染
  addNodeView() {
    return VueNodeViewRenderer(MentionView, {
      extension: {
        options: {
          char: this.options.char,
        },
      },
    })
  },

  // 响应式数据监听
  onCreate() {
    const { items } = this.options
    if (isRef(items)) {
      watch(
        items,
        () => {
          const tr = this.editor.state.tr
          tr.setMeta('mention-update', true)
          this.editor.view.dispatch(tr)
        },
        { deep: true }
      )
    }
  },

  // 添加插件
  addProseMirrorPlugins() {
    return [
      createMentionPlugin({
        editor: this.editor,
        char: this.options.char,
        items: this.options.items,
        allowSpaces: this.options.allowSpaces,
      }),
    ]
  },

  // 添加命令
  addCommands() {
    return mentionCommands
  },
})
```

#### 2.3 工具函数

**文件**: `mention/utils.ts`

```typescript
import type { Editor } from '@tiptap/core'
import type { MentionItem, MentionStructuredItem } from './types'

export function getMentions(editor: Editor): MentionItem[] {
  const mentions: MentionItem[] = []
  editor.state.doc.descendants((node: any) => {
    if (node.type.name === 'mention') {
      mentions.push({
        id: node.attrs.id,
        label: node.attrs.label,
        preset: node.attrs.preset || '',
      })
    }
  })
  return mentions
}

export function getTextWithMentions(editor: Editor): string {
  const mentionExt = editor.extensionManager.extensions.find((ext) => ext.name === 'mention')
  const char = mentionExt?.options?.char || '@'
  let text = ''

  editor.state.doc.descendants((node: any) => {
    if (node.type.name === 'mention') {
      text += `${char}${node.attrs.label}`
    } else if (node.type.name === 'text') {
      text += node.text || ''
    }
  })

  return text.trim()
}

export function getMentionStructuredData(editor: Editor): MentionStructuredItem[] {
  const items: MentionStructuredItem[] = []
  editor.state.doc.descendants((node: any, _pos: number, parent: any) => {
    if (parent && parent.type.name === 'paragraph') {
      if (node.type.name === 'mention') {
        items.push({
          type: 'mention',
          content: node.attrs.label,
          preset: node.attrs.preset || '',
        })
      } else if (node.type.name === 'text') {
        const text = node.text || ''
        if (text) {
          const lastItem = items[items.length - 1]
          if (lastItem && lastItem.type === 'text') {
            lastItem.content = (lastItem.content || '') + text
          } else {
            items.push({
              type: 'text',
              content: text,
            })
          }
        }
      }
    }
  })
  return items
}
```

#### 2.4 便捷函数（简单函数）

**文件**: `mention/factory.ts`

```typescript
/**
 * Mention 扩展便捷函数
 */
import type { Ref } from 'vue'
import { Mention } from './extension'
import type { MentionItem, MentionOptions } from './types'

/**
 * 创建 Mention 扩展的便捷函数
 *
 * @param items - 提及项列表
 * @param char - 触发字符，默认 '@'
 * @param options - 其他配置项
 *
 * @example
 * ```typescript
 * const extensions = [mention(items)]
 * const extensions = [mention(items, '#')]
 * const extensions = [mention(items, '@', { allowSpaces: true })]
 * ```
 */
export function mention(
  items: MentionItem[] | Ref<MentionItem[]>,
  char: string = '@',
  options?: Partial<Omit<MentionOptions, 'items' | 'char'>>
) {
  return Mention.configure({
    items,
    char,
    ...options,
  })
}
```

#### 2.5 扩展入口

**文件**: `mention/index.ts`

```typescript
/**
 * Mention 扩展
 *
 * 提及功能，用于提及某项的场景（如 @用户、#标签 等）
 */

export { Mention } from './extension'
export { mention } from './factory'
export { MentionPluginKey } from './plugin'
export * from './types'
export * from './utils'
```

### Phase 3: 统一导出

#### 3.1 扩展统一导出

**文件**: `extensions/index.ts`

```typescript
/**
 * Tiptap 扩展统一导出
 */

// ===== Mention =====
export { Mention, mention } from './mention'
export { MentionPluginKey } from './mention'
export type { MentionAttrs, MentionOptions, MentionItem, MentionStructuredItem } from './mention'
export { getMentions, getTextWithMentions, getMentionStructuredData } from './mention'

// ===== Suggestion =====
export { Suggestion, suggestion } from './suggestion'
export { SuggestionPluginKey } from './suggestion'
export type {
  SuggestionItem,
  SuggestionOptions,
  SuggestionState,
  SuggestionTextPart,
  HighlightFunction,
} from './suggestion'
export { syncAutoComplete, processHighlights, highlightSuggestionText } from './suggestion'

// ===== Template =====
export { Template, template } from './template'
export type { TemplateAttrs, TemplateOptions } from './template'
export { getTemplateStructuredData, getTextWithTemplates } from './template'
```

### Phase 4: 组件主入口更新

#### 4.1 更新 ChatInput 组件入口

**文件**: `chat-input/index.ts`

```typescript
/**
 * Chat-Input 组件入口
 *
 * 提供两种扩展使用方式：
 * 1. 静态属性：ChatInput.Mention.configure() - 用于扩展继承
 * 2. 便捷函数：ChatInput.mention() - 用于简单场景
 */

import type { App } from 'vue'
import ChatInputComponent from './index.vue'
import { Mention, Suggestion, Template, mention, suggestion, template } from './extensions'
import './index.less'

ChatInputComponent.name = 'TrChatInput'

const install = function <T>(app: App<T>) {
  app.component(ChatInputComponent.name!, ChatInputComponent)
}

const ChatInput = Object.assign(ChatInputComponent, {
  install,
  // 扩展类（用于继承）
  Mention,
  Suggestion,
  Template,
  // 便捷函数（用于简单场景）
  mention,
  suggestion,
  template,
})

export default ChatInput

export type {
  ChatInputProps,
  ChatInputEmits,
  ChatInputSlots,
  ChatInputContext,
  UseEditorReturn,
  UseModeSwitchReturn,
  UseSuggestionReturn,
  UseKeyboardShortcutsReturn,
  TemplateItem,
  MentionItem,
} from './index.type'

export { useChatInputContext } from './context'

// ========== 扩展类型导出 ==========
export type { TemplateAttrs, TemplateOptions } from './extensions/template'
export type { MentionAttrs, MentionOptions } from './extensions/mention'
export type {
  SuggestionItem,
  SuggestionOptions,
  SuggestionState,
  SuggestionTextPart,
  HighlightFunction,
} from './extensions/suggestion'
```

#### 4.2 删除 helpers 文件

删除 `packages/components/src/chat-input/helpers/extension-helpers.ts` 文件，因为其功能已整合到扩展中。

---

## 实施路线图

### 第一阶段：共享基础设施（最小化）

**目标**: 创建真正通用的工具函数和样式变量

**任务**:
1. 创建 `shared/utils/` 目录
2. 实现 `id-generator.ts`（所有扩展通用）
3. 实现 `position.ts`（mention 和 suggestion 通用）
4. 创建 `shared/styles/variables.less`（样式变量）
5. 创建 `shared/utils/index.ts` 统一导出

**预计工作量**: 0.5 天

### 第二阶段：Mention 扩展重构

**目标**: 按新结构重构 Mention 扩展，作为示例

**任务**:
1. 整合 `types.ts`：将命令定义移入类型文件
2. 拆分 `extension.ts`：从 index.ts 中提取扩展定义
3. 创建 `factory.ts`：实现简单的便捷函数
4. 更新 `utils.ts`：保持工具函数独立
5. 保持 `plugin.ts` 不变
6. 组织 `components/` 和 `styles/` 目录
7. 更新 `index.ts`：仅负责导出

**预计工作量**: 1-1.5 天

### 第三阶段：Suggestion 扩展重构

**目标**: 按 Mention 的模式重构 Suggestion

**任务**:
1. 整合 `types.ts`（Suggestion 无命令，仅类型）
2. 拆分 `extension.ts`
3. 创建 `factory.ts`
4. 更新 `utils.ts`
5. 保持 `plugin.ts` 和 `utils/` 子目录不变
6. 组织 `components/` 和 `styles/` 目录
7. 更新 `index.ts`

**预计工作量**: 1-1.5 天

### 第四阶段：Template 扩展重构

**目标**: 按统一模式重构 Template

**任务**:
1. 整合 `types.ts`：将命令定义移入类型文件
2. 拆分 `extension.ts`
3. 创建 `factory.ts`
4. 更新 `utils.ts`
5. 保持 `plugins/` 目录不变（多个插件）
6. 组织 `components/` 和 `styles/` 目录
7. 更新 `index.ts`

**预计工作量**: 1-1.5 天

### 第五阶段：整合与清理

**目标**: 更新导出和删除旧代码

**任务**:
1. 更新 `extensions/index.ts` 统一导出
2. 更新 `chat-input/index.ts` 导入路径
3. 删除 `helpers/extension-helpers.ts`
4. 更新 `types/module-augmentation.d.ts`
5. 验证所有导入导出正确

**预计工作量**: 0.5 天

### 第六阶段：测试与验证

**目标**: 确保重构后功能正常

**任务**:
1. 运行所有演示代码（docs/demos/）
2. 测试两种使用方式（扩展类和便捷函数）
3. 验证类型定义正确
4. 检查 TypeScript 编译无错误
5. 更新相关文档

**预计工作量**: 1 天

**总计**: 约 5-6 天

### 实施建议

1. **逐个扩展重构**: 不要同时修改多个扩展，降低风险
2. **保持功能测试**: 每完成一个扩展，立即测试
3. **提交小步快跑**: 每个阶段完成后提交代码
4. **文档同步更新**: 重构的同时更新相关文档

---

## 迁移影响

### 用户代码

**无需修改**，API 保持完全兼容：

```typescript
// 方式1：扩展类（继续支持）
const extensions = [
  ChatInput.Mention.configure({ items: mentions })
]

// 方式2：便捷函数（继续支持）
const extensions = [
  ChatInput.mention(mentions),
  ChatInput.suggestion(suggestions),
  ChatInput.template(templates)
]
```

### 内部结构

**改进**：

- 代码组织更清晰
- 职责分离更明确
- 新扩展开发更快速
- 代码复用性更高

### 文件变化

**新增**：

- `shared/utils/id-generator.ts`（通用 ID 生成器）
- `shared/utils/position.ts`（通用位置查找）
- `shared/utils/index.ts`（工具函数导出）
- `shared/styles/variables.less`（样式变量）
- 各扩展的 `factory.ts` 文件（便捷函数）
- 各扩展的 `extension.ts` 文件（扩展定义）
- 各扩展的 `components/` 目录（组件组织）
- 各扩展的 `styles/` 目录（样式组织）

**删除**：

- `helpers/extension-helpers.ts`（功能整合到各扩展）
- 各扩展的 `commands.d.ts`（类型声明文件，不再需要）

**修改**：

- 各扩展的 `index.ts`（从混合职责改为仅导出）
- 各扩展的 `types.ts`（整合命令定义）
- `extensions/index.ts`（更新导出）
- `chat-input/index.ts`（更新导入路径）
- `types/module-augmentation.d.ts`（更新类型声明）

**保持不变**：

- 各扩展的 `plugin.ts`（插件实现逻辑不变）
- 各扩展的 `utils.ts`（工具函数逻辑不变）
- 各扩展的 Vue 组件（组件逻辑不变，仅移动位置）
- `suggestion/utils/`（专用工具目录保留）
- `template/plugins/`（多插件目录保留）

---

## 总结

### 重构核心原则

1. **最小化共享代码**: 只抽象真正通用的工具，避免过度设计
2. **简化便捷函数**: 使用简单函数而非工厂类，遵循 KISS 原则
3. **整合相关代码**: 命令定义与类型定义放在一起，便于维护
4. **统一目录结构**: 所有扩展遵循相同的文件组织模式
5. **保持向后兼容**: 用户代码无需修改，API 完全兼容

### 重构收益

**代码组织**:
- 每个文件职责单一，易于理解和维护
- 目录结构统一，新扩展开发更快速
- 相关代码集中，减少文件跳转

**开发效率**:
- 便捷函数整合到扩展中，修改更方便
- 共享工具函数减少重复代码
- 清晰的文件职责降低学习成本

**可维护性**:
- 命令与类型在一起，修改不易遗漏
- 扩展定义独立，便于阅读和调试
- 统一的模式便于代码审查

### 实施建议

1. **小步快跑**: 逐个扩展重构，每完成一个立即测试
2. **保持测试**: 重构过程中持续运行演示代码验证功能
3. **文档同步**: 重构的同时更新相关文档和注释
4. **代码审查**: 完成后进行代码审查，确保符合规范

### 预期成果

- **代码量减少**: 删除重复代码和不必要的抽象
- **文件数量优化**: 合并相关文件，减少文件跳转
- **开发体验提升**: 清晰的结构和简单的 API
- **维护成本降低**: 统一的模式和良好的组织

建议按照实施路线图逐步推进，预计 5-6 天完成全部重构工作。
