# ChatInput 组件

一个功能强大、可扩展的聊天输入框组件，基于 Tiptap 编辑器构建。

## ✨ 特性

- 🎨 **可插拔架构**：通过扩展系统灵活添加功能
- 📝 **富文本支持**：支持模板块、提及、建议等功能
- 🎯 **类型安全**：完整的 TypeScript 类型支持
- 🔄 **响应式数据**：支持 Vue 响应式数据自动同步
- 🎭 **双模式**：支持单行和多行模式自动切换
- ⌨️ **快捷键**：灵活的提交和换行快捷键配置
- 📊 **结构化数据**：提交时自动提取结构化数据

## 📦 安装

```bash
npm install @opentiny/tiny-robot
```

## 🚀 快速开始

### 基础用法

```vue
<template>
  <ChatInput
    v-model="content"
    placeholder="请输入内容..."
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const content = ref('')

const handleSubmit = (text: string) => {
  console.log('提交内容:', text)
}
</script>
```

## 🔌 扩展系统

ChatInput 采用可插拔的扩展架构，通过 `extensions` prop 添加功能。

### 可用扩展

| 扩展 | 功能 | 使用场景 |
|------|------|---------|
| **TemplateBlock** | 模板填充 | 结构化输入、表单填充 |
| **Mention** | @提及 | 协作、通知 |
| **Suggestion** | 智能建议 | 自动补全、快捷输入 |

## 📖 扩展使用指南

### 1. TemplateBlock 扩展

用于模板填充场景，支持动态设置模板内容。

#### 基础用法

```vue
<template>
  <ChatInput
    v-model="content"
    :extensions="extensions"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChatInput, TemplateBlock } from '@opentiny/tiny-robot'
import type { TemplateItem, StructuredData } from '@opentiny/tiny-robot'

const content = ref('')
const templateData = ref<TemplateItem[]>([])

// 配置扩展
const extensions = computed(() => [
  TemplateBlock.configure({
    items: templateData  // 传入响应式数据
  })
])

// 设置模板
const setTemplate = () => {
  templateData.value = [
    { type: 'text', content: '你好，我是 ' },
    { type: 'template', content: '张三' },
    { type: 'text', content: '，来自 ' },
    { type: 'template', content: '北京' }
  ]
}

// 提交处理
const handleSubmit = (text: string, data?: StructuredData) => {
  console.log('纯文本:', text)  // "你好，我是张三，来自北京"
  console.log('结构化数据:', data)  // [{ type: 'text', content: '...' }, ...]
}
</script>
```

#### TemplateItem 类型

```typescript
type TemplateItem = {
  type: 'text' | 'template'
  content: string
}
```

#### 插件配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `items` | `TemplateItem[]` \| `Ref<TemplateItem[]>` | `[]` | 模板数据列表，支持响应式 ref |
| `onUpdate` | `Function` | - | 模板内容更新时的回调 |

### 2. Mention 扩展

用于 @提及场景，支持键盘导航和自定义触发字符。

#### 基础用法

```vue
<template>
  <ChatInput
    v-model="content"
    :extensions="extensions"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput, Mention } from '@opentiny/tiny-robot'
import type { MentionItem, StructuredData } from '@opentiny/tiny-robot'

const content = ref('')

const mentions: MentionItem[] = [
  { label: '小小画家', preset: '你是一个专业的绘画助手...' },
  { label: '代码助手', preset: '你是一个专业的编程助手...' }
]

const extensions = [
  Mention.configure({
    items: mentions,
    char: '@'  // 触发字符
  })
]

const handleSubmit = (text: string, data?: StructuredData) => {
  console.log('纯文本:', text)  // "@小小画家 帮我画一幅画"
  console.log('提及数据:', data)  // [{ label: '小小画家', preset: '...' }]
}
</script>
```

#### MentionItem 类型

```typescript
type MentionItem = {
  label: string    // 显示名称
  preset: string   // 预设内容
}
```

#### 插件配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `items` | `MentionItem[]` | `[]` | 提及项列表（必填） |
| `char` | `string` | `'@'` | 触发提及的字符 |
| `onSelect` | `Function` | - | 选中提及项时的回调 |

### 3. Suggestion 扩展

用于智能建议场景，支持全局匹配、受控模式、自定义高亮。

#### 基础用法（全局模式）

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput, Suggestion } from '@opentiny/tiny-robot'
import type { SuggestionItem } from '@opentiny/tiny-robot'

const content = ref('')

const suggestions: SuggestionItem[] = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'CDN-缓存刷新问题' }
]

const extensions = [
  Suggestion.configure({
    items: suggestions,
    onSelect: (item) => {
      console.log('选中:', item.content)
    }
  })
]
</script>
```

#### 受控模式

用户完全控制显示的建议列表，组件不做任何过滤。适用于后端搜索、复杂业务逻辑等场景。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput, Suggestion } from '@opentiny/tiny-robot'
import type { SuggestionItem } from '@opentiny/tiny-robot'

const content = ref('')
const displayedSuggestions = ref<SuggestionItem[]>([])

const allSuggestions: SuggestionItem[] = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'CDN-缓存刷新问题' }
]

const extensions = [
  Suggestion.configure({
    items: displayedSuggestions,  // 响应式数据，用户控制内容
    controlled: true,             // 受控模式：组件不过滤，直接显示 items
    onQueryChange: (query) => {
      // 用户自己控制过滤逻辑
      if (!query) {
        displayedSuggestions.value = []
        return
      }
      
      displayedSuggestions.value = allSuggestions.filter(item =>
        item.content.toLowerCase().includes(query.toLowerCase())
      )
    }
  })
]
</script>
```

#### 非受控模式

组件内部自动过滤，支持自定义过滤逻辑。适用于前端过滤场景。

```vue
<script setup lang="ts">
import { ChatInput, Suggestion } from '@opentiny/tiny-robot'
import type { SuggestionItem } from '@opentiny/tiny-robot'

const allSuggestions: SuggestionItem[] = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'CDN-缓存刷新问题' }
]

const extensions = [
  Suggestion.configure({
    items: allSuggestions,        // 完整的建议列表
    filterFn: (suggestions, query) => {
      // 自定义过滤逻辑（可选，不设置则使用默认模糊匹配）
      return suggestions.filter(item =>
        item.content.toLowerCase().includes(query.toLowerCase())
      )
    }
  })
]
</script>
```

#### 自定义高亮

支持三种高亮模式：

**1. 自动模式**（默认）
```typescript
{ content: 'ECS-云服务器卡顿问题' }
// 自动高亮与输入匹配的部分
```

**2. 精确模式**
```typescript
{
  content: 'ECS-云服务器卡顿问题',
  highlights: ['ECS', '云服务器']  // 指定高亮关键词
}
```

**3. 自定义函数模式**
```typescript
{
  content: 'ECS-云服务器卡顿问题',
  highlights: (text: string, query: string): SuggestionTextPart[] => {
    // 完全自定义高亮逻辑
    return [
      { text: 'ECS', isMatch: true },
      { text: '-云服务器卡顿问题', isMatch: false }
    ]
  }
}
```

#### SuggestionItem 类型

```typescript
type SuggestionItem = {
  content: string                                    // 建议内容（必填）
  label?: string                                     // 显示标签（可选）
  highlights?: string[] | HighlightFunction          // 高亮配置（可选）
  data?: Record<string, unknown>                     // 自定义数据（可选）
}

type HighlightFunction = (text: string, query: string) => SuggestionTextPart[]

type SuggestionTextPart = {
  text: string      // 文本片段
  isMatch: boolean  // 是否高亮
}
```

#### 插件配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `items` | `SuggestionItem[]` \| `Ref<SuggestionItem[]>` | `[]` | 建议项列表（必填），支持响应式 ref |
| `controlled` | `boolean` | `false` | 受控模式：`true` = 用户控制过滤，`false` = 组件自动过滤 |
| `filterFn` | `Function` | 内置模糊匹配 | 非受控模式专用：自定义过滤函数 |
| `onSelect` | `Function` | - | 选中建议时的回调 |
| `onQueryChange` | `Function` | - | 受控模式专用：查询文本变化时的回调 |
| `showAutoComplete` | `boolean` | `true` | 显示自动补全提示 |
| `activeSuggestionKeys` | `string[]` | `['Enter', 'Tab']` | 激活建议的按键 |
| `popupWidth` | `number` \| `string` | `400` | 弹窗宽度。支持数字（如 `500`）、百分比（如 `'100%'`，基于输入框宽度）、CSS 单位（如 `'20rem'`） |

**弹窗宽度配置示例**：

```typescript
// 固定宽度（像素）
Suggestion.configure({ items: suggestions, popupWidth: 500 })

// 百分比（基于输入框宽度）
Suggestion.configure({ items: suggestions, popupWidth: '100%' })

// CSS 单位
Suggestion.configure({ items: suggestions, popupWidth: '20rem' })
```

## 🎛️ Props

### 基础 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | 输入内容（v-model） |
| `placeholder` | `string` | `'请输入内容...'` | 占位符 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `loading` | `boolean` | `false` | 加载状态 |
| `autofocus` | `boolean` | `false` | 自动聚焦 |
| `mode` | `'single' \| 'multiple'` | `'single'` | 输入模式 |
| `maxLength` | `number` | `undefined` | 最大字符数 |
| `showWordLimit` | `boolean` | `false` | 显示字数统计 |
| `clearable` | `boolean` | `false` | 显示清空按钮 |

### 扩展 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `extensions` | `Extension[]` | `[]` | 扩展列表 |

### 快捷键 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `submitType` | `'enter' \| 'ctrl-enter' \| 'shift-enter'` | `'enter'` | 提交快捷键 |

## 📤 Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: string)` | 内容变化 |
| `submit` | `(text: string, data?: StructuredData)` | 提交内容 |
| `focus` | `(event: FocusEvent)` | 获得焦点 |
| `blur` | `(event: FocusEvent)` | 失去焦点 |
| `clear` | `()` | 清空内容 |

### submit 事件详解

`submit` 事件返回两个参数：

1. **text**: `string` - 纯文本内容（与输入框显示一致）
2. **data**: `StructuredData | undefined` - 结构化数据（可选）

```typescript
// TemplateBlock 场景
type StructuredData = TemplateItem[]
// 示例: [{ type: 'text', content: '你好' }, { type: 'template', content: '张三' }]

// Mention 场景
type StructuredData = MentionItem[]
// 示例: [{ label: '小小画家', preset: '...' }]
```

## 🔧 Methods

通过 ref 访问组件实例方法：

```vue
<template>
  <ChatInput ref="chatInputRef" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const chatInputRef = ref()

// 调用方法
chatInputRef.value?.submit()
chatInputRef.value?.clear()
chatInputRef.value?.focus()
</script>
```

| 方法 | 参数 | 说明 |
|------|------|------|
| `submit()` | - | 提交内容 |
| `clear()` | - | 清空内容 |
| `focus()` | - | 聚焦输入框 |
| `blur()` | - | 失焦输入框 |
| `setContent(content: string)` | `content` | 设置内容 |
| `getContent()` | - | 获取 HTML 内容 |
| `setTemplateData(items: TemplateItem[])` | `items` | 设置模板数据 |
| `clearTemplateData()` | - | 清空模板数据 |
| `getTemplateData()` | - | 获取模板数据 |

## 🎨 样式定制

组件使用 CSS 变量支持主题定制：

```css
:root {
  --tr-chat-input-bg-color: #ffffff;
  --tr-chat-input-border-radius: 8px;
  --tr-chat-input-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --tr-chat-input-text-color: #333333;
  --tr-chat-input-placeholder-color: #999999;
}
```

## 📚 完整示例

查看 `docs/demos/chat-input/` 目录下的完整示例：

- `mention.vue` - Mention 扩展示例
- `template-editor.vue` - TemplateBlock 扩展示例
- `suggestion-basic.vue` - Suggestion 基础示例
- `suggestion-filter.vue` - Suggestion 自定义过滤示例
- `suggestion-highlight.vue` - Suggestion 高亮模式示例
