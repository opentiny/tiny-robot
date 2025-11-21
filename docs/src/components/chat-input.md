# ChatInput 聊天输入框

基于 Tiptap 的高度可组合聊天输入组件，是 Sender 组件的重构版本。

## 特性

- 🎨 **灵活的插槽系统** - 通过插槽自定义各个区域
- 🔄 **单行/多行模式** - 支持模式切换
- 📊 **字数统计** - 内置字数限制和统计
- 🎯 **Context 共享** - 子组件通过 Context 获取状态
- 📝 **基于 Tiptap** - 强大的编辑器能力
- 🎭 **主题支持** - Light/Dark 主题

## 基础用法

<demo vue="../../demos/chat-input/basic.vue" title="基础用法" description="最简单的用法，支持 v-model 双向绑定" />

## 模式切换

<demo vue="../../demos/chat-input/mode-switch.vue" title="单行/多行模式" description="支持单行和多行两种模式，可以动态切换" />

## 字数限制

<demo vue="../../demos/chat-input/word-limit.vue" title="字数限制" description="设置最大字符数，超出限制时禁止提交" />

## 加载状态

<demo vue="../../demos/chat-input/loading-state.vue" title="加载状态" description="提交后显示加载状态，可以取消生成" />

## 自定义底部

<demo vue="../../demos/chat-input/custom-footer.vue" title="自定义底部按钮" description="通过 footer 插槽添加自定义按钮，如深度思考、表情等" />

## 方法调用

<demo vue="../../demos/chat-input/methods-demo.vue" title="方法调用" description="通过 ref 调用组件方法，如聚焦、设置内容等" />

## 模板编辑器

<demo vue="../../demos/chat-input/template-editor.vue" title="模板编辑器" description="支持插入可编辑的模板块，点击模板块可直接修改内容，适用于快速填充场景" />

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | `string` | - | 输入内容（v-model） |
| defaultValue | `string` | - | 默认值（仅初始化时使用） |
| placeholder | `string` | `'请输入内容...'` | 占位符文本 |
| disabled | `boolean` | `false` | 是否禁用 |
| loading | `boolean` | `false` | 是否加载中 |
| autofocus | `boolean` | `false` | 是否自动聚焦 |
| mode | `'single' \| 'multiple'` | `'single'` | 输入模式 |
| maxLength | `number` | - | 最大字符数 |
| showWordLimit | `boolean` | `false` | 是否显示字数限制 |
| clearable | `boolean` | `false` | 是否显示清空按钮 |
| submitType | `'enter' \| 'ctrlEnter' \| 'shiftEnter'` | `'enter'` | 提交触发方式 |
| stopText | `string` | - | 停止按钮文字 |
| theme | `'light' \| 'dark'` | `'light'` | 主题 |
| templateData | `TemplateItem[]` | `[]` | 模板数据（v-model） |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | `(value: string)` | 内容变化 |
| update:templateData | `(data: TemplateItem[])` | 模板数据变化 |
| submit | `(value: string)` | 提交内容 |
| clear | `()` | 清空内容 |
| focus | `(event: FocusEvent)` | 获得焦点 |
| blur | `(event: FocusEvent)` | 失去焦点 |
| cancel | `()` | 取消操作（加载状态） |

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| header | 头部区域 | - |
| prefix | 输入框前缀 | - |
| content | 编辑器内容（完全自定义） | `{ editor }` |
| actions-inline | 单行模式操作按钮 | - |
| footer | 多行模式底部左侧（最常用） | - |
| footer-right | 多行模式底部右侧 | - |

### Methods

通过 ref 调用组件方法：

```vue
<template>
  <ChatInput ref="chatInputRef" v-model="content" />
</template>

<script setup>
import { ref } from 'vue'

const chatInputRef = ref()

// 调用方法
chatInputRef.value.focus()
chatInputRef.value.submit()
</script>
```

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| submit | - | `void` | 提交内容 |
| clear | - | `void` | 清空内容 |
| focus | - | `void` | 聚焦编辑器 |
| blur | - | `void` | 失焦编辑器 |
| setContent | `(content: string)` | `void` | 设置内容 |
| getContent | - | `string` | 获取内容 |
| setMode | `(mode: InputMode)` | `void` | 设置模式 |
| setTemplateData | `(items: TemplateItem[])` | `void` | 设置模板数据 |
| clearTemplateData | - | `void` | 清空模板数据 |
| focusFirstTemplateBlock | - | `void` | 聚焦第一个模板块 |
| getTemplateData | - | `TemplateItem[]` | 获取模板数据 |

### 
类型定义

```typescript
// 模板项
interface TemplateItem {
  id?: string                    // 模板块 ID（可选，自动生成）
  type: 'text' | 'template'     // 项目类型
  content: string               // 内容
}
```
