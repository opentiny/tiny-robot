---
outline: [1, 4]
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

`ChatInput` 采用可插拔的扩展架构，通过 `extensions` prop 灵活添加功能。所有扩展都支持响应式数据自动同步。

### 模板编辑器

使用 `TemplateBlock` 扩展实现模板填充功能，支持动态设置模板内容，光标自动聚焦到第一个可编辑字段。

:::tip 响应式数据
通过 `items` 配置项传入响应式 ref，模板数据变化时会自动更新编辑器内容。
:::

<demo vue="../../demos/chat-input/template-editor.vue" title="模板填充" description="支持动态模板切换，自动聚焦可编辑字段。" />

**插件配置**：

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `items` | `TemplateItem[]` \| `Ref<TemplateItem[]>` | `[]` | 模板数据列表，支持响应式 ref |
| `onUpdate` | `Function` | - | 模板内容更新时的回调 |

**配置示例**：

```typescript
import { ref } from 'vue'
import { TemplateBlock } from '@opentiny/tiny-robot'

const templateData = ref([
  { type: 'text', content: '你好，我是 ' },
  { type: 'template', content: '张三' },
  { type: 'text', content: '，来自 ' },
  { type: 'template', content: '北京' }
])

const extensions = [
  TemplateBlock.configure({
    items: templateData  // 传入响应式 ref，数据变化时自动更新
  })
]
```

### 提及功能

使用 `Mention` 扩展实现 @提及功能，输入 `@` 触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。

:::tip 删除提及
按 `Backspace` 删除提及项时会保留 `@` 符号，可继续选择其他项。
:::

<demo vue="../../demos/chat-input/mention.vue" title="提及功能" description="输入 @ 触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。" />

**插件配置**：

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `items` | `MentionItem[]` | `[]` | 提及项列表（必填） |
| `char` | `string` | `'@'` | 触发提及的字符 |
| `onSelect` | `Function` | - | 选中提及项时的回调 |

**配置示例**：

```typescript
import { Mention } from '@opentiny/tiny-robot'

const mentions = [
  { label: '小小画家', preset: '你是一个绘画助手...' },
  { label: '代码助手', preset: '你是一个编程助手...' }
]

const extensions = [
  Mention.configure({
    items: mentions,
    char: '@',  // 输入 @ 触发
    onSelect: (item) => {
      console.log('选中了:', item.label)
    }
  })
]
```

### 智能联想

使用 `Suggestion` 扩展实现智能联想功能，支持键盘导航（↑↓ 选择，Enter/Tab 确认）和自动补全提示。

:::tip 自动补全提示
选中建议项时，输入框会以灰色文本显示剩余部分，并显示 "TAB" 提示，按 Tab 键快速应用补全。
:::

#### 受控模式

用户完全控制显示的建议列表，组件不做任何过滤。适用于后端搜索、复杂业务逻辑等场景。

<demo vue="../../demos/chat-input/suggestion-controled.vue" title="受控模式" description="用户控制建议列表，组件只负责渲染，不做过滤。" />

#### 非受控模式

组件内部自动过滤，支持自定义过滤逻辑。适用于前端过滤场景。

<demo vue="../../demos/chat-input/suggestion-uncontrolled.vue" title="非受控模式" description="组件内部自动过滤，支持自定义过滤逻辑。" />

**配置示例**：

```typescript
Suggestion.configure({
  items: allSuggestions,        // 完整的建议列表
  filterFn: (suggestions, query) => {
    // 自定义过滤逻辑（可选，不设置则使用默认模糊匹配）
    return suggestions.filter(item => 
      item.content.toLowerCase().includes(query.toLowerCase())
    )
  }
})
```

#### 高亮模式

支持三种高亮模式，满足不同的使用场景：

1. **自动匹配**：不设置 `highlights`，自动高亮与输入内容匹配的部分
2. **精确指定**：通过 `highlights` 数组精确指定需要高亮的文本片段
3. **自定义函数**：通过 `highlights` 函数完全控制高亮逻辑，实现复杂的高亮规则

<demo vue="../../demos/chat-input/suggestion-highlight.vue" title="高亮模式" description="动态切换三种高亮模式，对比不同的高亮效果。" />

**配置示例**：

```typescript
// 自动匹配
{ content: 'ECS-云服务器' }

// 精确指定
{ content: 'ECS-云服务器', highlights: ['ECS', '云服务器'] }

// 自定义函数
{ 
  content: 'ECS-云服务器',
  highlights: (text, query) => [
    { text: 'ECS', isMatch: true },
    { text: '-云服务器', isMatch: false }
  ]
}
```

#### 插件配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `items` | `SuggestionItem[]` \| `Ref<SuggestionItem[]>` | `[]` | 建议项列表（必填），支持响应式 ref |
| `controlled` | `boolean` | `false` | **受控模式**：`true` = 用户控制过滤，`false` = 组件自动过滤 |
| `filterFn` | `Function` | 内置模糊匹配 | **非受控模式**专用：自定义过滤函数 |
| `onSelect` | `Function` | - | 选中建议时的回调 |
| `onQueryChange` | `Function` | - | **受控模式**专用：查询文本变化时的回调 |
| `showAutoComplete` | `boolean` | `true` | 显示自动补全提示 |
| `activeSuggestionKeys` | `string[]` | `['Enter', 'Tab']` | 激活建议的按键 |
| `popupWidth` | `number` \| `string` | `400` | 弹窗宽度。支持数字（如 `500`）、百分比（如 `'100%'`，基于输入框宽度）、CSS 单位（如 `'20rem'`） |


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

### 基础属性

| 属性名        | 说明                   | 类型                                     | 默认值            |
| ------------- | ---------------------- | ---------------------------------------- | ----------------- |
| modelValue    | 绑定值(v-model)        | `string`                                 | `''`              |
| defaultValue  | 默认值(非响应式)       | `string`                                 | `''`              |
| placeholder   | 输入框占位文本         | `string`                                 | `'请输入内容...'` |
| disabled      | 是否禁用               | `boolean`                                | `false`           |
| loading       | 是否加载中             | `boolean`                                | `false`           |
| autofocus     | 自动获取焦点           | `boolean`                                | `false`           |
| mode          | 输入框类型             | `'single' \| 'multiple'`                 | `'single'`        |
| maxLength     | 最大输入长度           | `number`                                 | `Infinity`        |
| showWordLimit | 是否显示字数统计       | `boolean`                                | `false`           |
| clearable     | 是否可清空             | `boolean`                                | `false`           |
| submitType    | 提交方式               | `'enter' \| 'ctrlEnter' \| 'shiftEnter'` | `'enter'`         |
| stopText      | 停止按钮文字           | `string`                                 | `仅显示图标`      |
| theme         | 主题样式               | `'light' \| 'dark'`                      | `'light'`         |

### 扩展属性

| 属性名     | 说明                                                   | 类型          | 默认值 |
| ---------- | ------------------------------------------------------ | ------------- | ------ |
| extensions | 扩展列表，用于添加功能（TemplateBlock、Mention、Suggestion 等） | `Extension[]` | `[]`   |

:::tip 扩展系统
推荐使用 `extensions` 属性配置功能扩展，提供更灵活的配置和更好的类型支持。

旧版 API（`templateData`、`mentions`、`suggestions` 等）仍然支持，但建议迁移到新的扩展系统。
:::

### 旧版属性（兼容性）

以下属性仍然支持，但建议使用 `extensions` 替代：

| 属性名               | 说明                                | 类型                 | 默认值             | 替代方案                                |
| -------------------- | ----------------------------------- | -------------------- | ------------------ | --------------------------------------- |
| templateData         | 模板数据，用于初始化或 v-model 更新 | `TemplateItem[]`     | `[]`               | `TemplateBlock.configure({ items })`    |
| mentions             | 提及列表，用于 `@` 提及             | `MentionItem[]`      | `[]`               | `Mention.configure({ items })`          |
| suggestions          | 建议列表，提供智能联想功能          | `SuggestionItem[]`   | `[]`               | `Suggestion.configure({ items })`       |
| suggestionChar       | 建议触发字符（null 为全局匹配）     | `string \| null`     | `null`             | `Suggestion.configure({ char })`        |
| suggestionPopupWidth | 建议弹窗宽度（支持百分比，基于输入框宽度） | `number \| string`   | `400`              | `Suggestion.configure({ popupWidth })`  |
| activeSuggestionKeys | 激活建议项的按键                    | `string[]`           | `['Enter', 'Tab']` | `Suggestion.configure({ activeSuggestionKeys })` |
| showAutoComplete     | 是否显示自动补全提示                | `boolean`            | `true`             | `Suggestion.configure({ showAutoComplete })` |

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
| submit            | 提交内容时触发             | `(text: string, data?: StructuredData)`                  |
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
  type: 'text' | 'template' // 项目类型，'text' 为普通文本，'template' 为可编辑模板块
  content: string // 内容
}

// 提及项
interface MentionItem {
  label: string // 显示名称，如 "小小画家"
  preset: string // 预设内容
}

// 建议项
interface SuggestionItem {
  content: string // 建议项内容（必填）
  highlights?: string[] | HighlightFunction // 高亮方式（可选）
}

// 高亮函数类型
type HighlightFunction = (suggestionText: string, inputText: string) => SuggestionTextPart[]

// 高亮文本片段
interface SuggestionTextPart {
  text: string // 文本片段
  isMatch: boolean // 是否高亮
}

// 结构化数据（submit 事件返回）
type StructuredData = TemplateItem[] | MentionItem[]

// 输入模式
type InputMode = 'single' | 'multiple'

// 扩展类型
import type { Extension } from '@tiptap/core'
```

:::tip 类型变更
新版本的结构化数据不再包含 `id` 字段，简化了数据结构。如果需要唯一标识，请在应用层自行管理。
:::
