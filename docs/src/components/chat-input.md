---
outline: [1, 3]
---

# ChatInput 聊天输入框

`ChatInput` 是一个基于 [Tiptap](https://tiptap.dev/) 构建的高度可组合聊天输入组件，它是 `Sender` 组件的重构版本，专注于提供更强大的富文本编辑能力和灵活的扩展性。它不仅支持文本输入、模板填充、技能提及等功能，还拥有强大的插槽系统，适用于聊天界面、评论输入、表单填写等多种富文本输入场景。

- [代码示例](#代码示例) - 模式切换、状态控制、内容管理
- [输入增强](#输入增强) - 模板填充、提及功能
- [交互定制](#交互定制) - 快捷键、自定义底部、方法调用
- [样式配置](#样式配置) - 主题、紧凑模式

## 代码示例

### 输入模式

`ChatInput` 支持单行和多行两种输入模式，通过 `mode` 属性控制。

:::tip 单行模式自动切换
在单行模式下，当输入内容超出宽度时，会自动切换为多行模式。

当 `submitType="enter"` 时，按 `Ctrl+Enter` 或 `Shift+Enter` 也会自动切换为多行模式并换行。
:::

<demo vue="../../demos/chat-input/mode-switch.vue" title="输入模式" description="支持单行和多行模式，单行模式可自动切换为多行。" />

### 状态控制

通过 `loading` 和 `disabled` 属性控制组件状态。加载状态下可点击图标取消操作。

<demo vue="../../demos/chat-input/loading-state.vue" title="加载与禁用状态" description="展示加载和禁用两种状态的表现。" />

### 内容管理

#### 字数限制

通过 `maxLength` 和 `showWordLimit` 属性实现字数限制和统计。

:::warning 超出限制行为
超出字数限制时，不会自动截断内容，但会以红色标示真实字数，且无法提交。
:::

<demo vue="../../demos/chat-input/word-limit.vue" title="字数限制" description="限制输入字符数并显示字数统计。" />

## 输入增强

### 模板编辑器

通过 `v-model:templateData` 实现模板的动态设置，光标自动聚焦到第一个可编辑字段。

<demo vue="../../demos/chat-input/template-editor.vue" title="模板填充" description="支持动态模板切换，自动聚焦可编辑字段。" />

### 提及功能

输入 `@` 触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。

:::tip 删除提及
按 `Backspace` 删除提及项时会保留 `@` 符号，可继续选择其他项。
:::

<demo vue="../../demos/chat-input/mention.vue" title="提及功能" description="输入 @ 触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。" />

### 智能联想

根据用户输入显示匹配的建议项，支持键盘导航（↑↓ 选择，Enter/Tab 确认）和自动补全提示。

:::tip 自动补全提示
当通过键盘导航选中某个建议项时，输入框中会以灰色文本显示剩余未输入的部分，并显示 "TAB" 提示标签，按 Tab 键可快速应用补全。
:::

<demo vue="../../demos/chat-input/suggestion.vue" title="智能联想" description="根据输入内容显示匹配的建议项，支持键盘导航和自动补全。" />

#### 高亮模式

支持三种高亮模式，满足不同的使用场景：

1. **自动匹配**：传入对象数组，自动高亮与输入内容匹配的部分
2. **精确指定**：通过 `highlights` 数组精确指定需要高亮的文本片段
3. **自定义函数**：通过 `highlights` 函数完全控制高亮逻辑，实现复杂的高亮规则

<demo vue="../../demos/chat-input/suggestion-highlight.vue" title="高亮模式" description="动态切换三种高亮模式，对比不同的高亮效果。" />

:::warning 过滤逻辑
组件**不会自动过滤**联想项，只负责高亮渲染匹配的部分。如需根据输入内容筛选建议项，请在传入 `suggestions` 之前自行过滤数组。

```vue
<script setup>
import { ref, computed } from 'vue'

const inputText = ref('')
const allSuggestions = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'CDN-权限管理' },
  // ...
]

// 根据输入内容过滤建议项
const filteredSuggestions = computed(() => {
  if (!inputText.value) return allSuggestions
  return allSuggestions.filter((item) => item.content.toLowerCase().includes(inputText.value.toLowerCase()))
})
</script>

<template>
  <tr-chat-input v-model="inputText" :suggestions="filteredSuggestions" />
</template>
```

:::

<h2>交互定制</h2>

### 提交方式

通过 `submitType` 属性控制提交快捷键，支持 `enter`、`ctrlEnter`、`shiftEnter` 三种方式。

<demo vue="../../demos/chat-input/submit-type.vue" title="提交方式" description="支持三种提交快捷键，适应不同使用场景。" />

### 快捷键参考

| 快捷键      | 功能            | 适用条件                                     |
| ----------- | --------------- | -------------------------------------------- |
| Enter       | 提交内容 / 换行 | submitType="enter"                           |
| Ctrl+Enter  | 提交内容 / 换行 | submitType="ctrlEnter" / submitType="enter"  |
| Shift+Enter | 提交内容 / 换行 | submitType="shiftEnter" / submitType="enter" |
| Tab         | 选中联想项      | 联想开启时                                   |
| Esc         | 关闭联想        | 联想开启时                                   |
| ↑ / ↓       | 导航联想项      | 联想开启时                                   |

:::info 换行与提交行为说明

- **`submitType="enter"`** 时：按 `Enter` 提交，按 `Ctrl+Enter` 或 `Shift+Enter` 换行
- **`submitType="ctrlEnter"`** 时：按 `Ctrl+Enter` 提交，按 `Enter` 换行
- **`submitType="shiftEnter"`** 时：按 `Shift+Enter` 提交，按 `Enter` 换行

在单行模式下使用换行快捷键时，会自动切换为多行模式。
:::

:::warning 自定义选中按键
当 `activeSuggestionKeys` 可配置时，可自定义选中联想项的按键（Ctrl/Shift/Alt/Meta）。默认支持 `Enter` 和 `Tab`。
:::

<h3>自定义底部</h3>

通过 `footer` 和 `footer-right` 插槽在底部区域添加自定义按钮。

<demo vue="../../demos/chat-input/custom-footer.vue" title="自定义底部按钮" description="在底部区域添加自定义按钮，如深度思考、表情等。" />

<h3>方法调用</h3>

<demo vue="../../demos/chat-input/methods-demo.vue" title="方法调用" description="通过 ref 调用组件方法，如聚焦、设置内容等。" />

<h2>样式配置</h2>

<h3>主题支持</h3>

`ChatInput` 支持 `light` 和 `dark` 两种主题模式，通过 `theme` 属性配置。

:::tip 主题继承
主题会根据父级 `ThemeProvider` 的配置自动继承，无需重复设置。
:::

<h3>紧凑模式</h3>

通过添加 `tr-chat-input-compact` CSS 类启用紧凑模式，适用于空间受限的场景。

---

## Props

| 属性名               | 说明                                | 类型                                     | 默认值             |
| -------------------- | ----------------------------------- | ---------------------------------------- | ------------------ |
| modelValue           | 绑定值(v-model)                     | `string`                                 | `''`               |
| defaultValue         | 默认值(非响应式)                    | `string`                                 | `''`               |
| placeholder          | 输入框占位文本                      | `string`                                 | `'请输入内容...'`  |
| disabled             | 是否禁用                            | `boolean`                                | `false`            |
| loading              | 是否加载中                          | `boolean`                                | `false`            |
| autofocus            | 自动获取焦点                        | `boolean`                                | `false`            |
| mode                 | 输入框类型                          | `'single' \| 'multiple'`                 | `'single'`         |
| maxLength            | 最大输入长度                        | `number`                                 | `Infinity`         |
| showWordLimit        | 是否显示字数统计                    | `boolean`                                | `false`            |
| clearable            | 是否可清空                          | `boolean`                                | `false`            |
| submitType           | 提交方式                            | `'enter' \| 'ctrlEnter' \| 'shiftEnter'` | `'enter'`          |
| stopText             | 停止按钮文字                        | `string`                                 | `仅显示图标`       |
| templateData         | 模板数据，用于初始化或 v-model 更新 | `TemplateItem[]`                         | `[]`               |
| mentions             | 提及列表，用于 `@` 提及             | `MentionItem[]`                          | `[]`               |
| suggestions          | 建议列表，提供智能联想功能          | `SuggestionItem[]`                       | `[]`               |
| suggestionChar       | 建议触发字符（null 为全局匹配）     | `string \| null`                         | `null`             |
| suggestionPopupWidth | 建议弹窗宽度                        | `number \| string`                       | `400`              |
| activeSuggestionKeys | 激活建议项的按键                    | `string[]`                               | `['Enter', 'Tab']` |
| showAutoComplete     | 是否显示自动补全提示                | `boolean`                                | `true`             |
| theme                | 主题样式                            | `'light' \| 'dark'`                      | `'light'`          |

## Slots

| 插槽名称         | 描述                               | 默认内容                   | 作用域参数   |
| ---------------- | ---------------------------------- | -------------------------- | ------------ |
| `header`         | 头部插槽，位于输入框上方           | 无                         | -            |
| `prefix`         | 前缀插槽，位于输入框左侧           | 无                         | -            |
| `content`        | 内容插槽，用于完全自定义编辑器内容 | 输入内容区域               | `{ editor }` |
| `actions-inline` | 单行模式下的操作按钮区域           | 提交按钮、技能按钮等       | -            |
| `footer`         | 底部完全自定义插槽                 | 字数限制、多行模式操作按钮 | -            |
| `footer-right`   | 底部右侧插槽，保留字数限制         | 多行模式下的操作按钮       | -            |

## Events

| 事件名            | 说明                       | 回调参数                                                 |
| ----------------- | -------------------------- | -------------------------------------------------------- |
| update:modelValue | 输入值变化时触发(v-model)  | `(value: string)`                                        |
| blur              | 输入框失去焦点时触发       | `(event: FocusEvent)`                                    |
| focus             | 输入框获得焦点时触发       | `(event: FocusEvent)`                                    |
| submit            | 提交内容时触发             | `(textContent: string, structureContent: ContentNode[])` |
| clear             | 清空内容时触发             | `()`                                                     |
| cancel            | 取消发送（加载状态）时触发 | `()`                                                     |
| suggestion-select | 选择建议项时触发           | `(value: string)`                                        |

## Methods

```

| 方法名                  | 说明                     | 参数                      | 返回值           |
| ----------------------- | ------------------------ | ------------------------- | ---------------- |
| focus                   | 使输入框获取焦点         | -                         | `void`           |
| blur                    | 使输入框失去焦点         | -                         | `void`           |
| clear                   | 清空输入内容             | -                         | `void`           |
| submit                  | 手动触发提交事件         | -                         | `void`           |
| setContent              | 设置编辑器内容           | `(content: string)`       | `void`           |
| getContent              | 获取编辑器内容           | -                         | `string`         |
| setMode                 | 设置输入模式             | `(mode: InputMode)`       | `void`           |
| setTemplateData         | 设置模板数据             | `(items: TemplateItem[])` | `void`           |
| clearTemplateData       | 清空模板数据             | -                         | `void`           |
| focusFirstTemplateBlock | 激活模板的第一个输入字段 | -                         | `void`           |
| getTemplateData         | 获取模板数据             | -                         | `TemplateItem[]` |

```

## Types

```typescript
// 模板项
interface TemplateItem {
  id?: string // 模板块 ID（可选，自动生成）
  type: 'text' | 'template' // 项目类型，'text' 为普通文本，'template' 为可编辑模板块
  content: string // 内容
}

// 提及项
interface MentionItem {
  id?: string // 唯一标识（可选，自动生成）
  label: string // 显示名称，如 "小小画家"
  preset: string // 预设内容（选择后自动填充到输入框）
}

// 输入模式
type InputMode = 'single' | 'multiple'

// 内容节点（submit 事件返回的结构化数据）
interface ContentNode {
  type: 'text' | 'mention' | 'hardBreak' // 节点类型
  content: string // 节点内容
  preset?: string // 预设内容（仅 mention 类型有效）
}

// 建议项
interface SuggestionItem {
  content: string // 建议项内容（必填）
  label?: string // 显示标签（可选，默认使用 content）
  highlights?: string[] | HighlightFunction // 高亮方式（可选）
  data?: Record<string, unknown> // 自定义数据（可选）
}

// 高亮函数类型
type HighlightFunction = (suggestionText: string, inputText: string) => SuggestionTextPart[]

// 高亮文本片段
interface SuggestionTextPart {
  text: string // 文本片段
  isMatch: boolean // 是否高亮
}
```
