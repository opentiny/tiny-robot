---
outline: [1, 4]
---

# ChatInput 聊天输入框

`ChatInput` 是一个基于 [Tiptap](https://tiptap.dev/) 构建的高度可组合聊天输入组件。

- [代码示例](#代码示例) - 模式切换、状态控制、内容管理
- [输入增强](#输入增强) - 模板填充、提及功能
- [交互定制](#交互定制) - 快捷键、自定义底部、方法调用
- [样式配置](#样式配置) - 主题、组件尺寸

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

### 扩展使用

提供两种集成方式：

```typescript
import { ChatInput } from '@opentiny/tiny-robot'

// 便捷函数（推荐）
ChatInput.mention(mentions, '@')
ChatInput.suggestion(suggestions) // 不过滤
ChatInput.suggestion(suggestions, { filterFn: customFilter }) // 自定义过滤
ChatInput.template(templates)

// 标准配置（用于复杂场景）
ChatInput.Mention.configure({ items: mentions, char: '@', allowSpaces: false })
ChatInput.Suggestion.configure({ items: suggestions, filterFn: customFilter })
```

### 模板编辑

使用 `Template` 扩展实现模板填充功能，支持动态设置模板内容，光标自动聚焦到第一个可编辑字段。

:::tip 响应式数据
通过 `items` 配置项传入响应式 ref，模板数据变化时会自动更新编辑器内容。
:::

<demo vue="../../demos/chat-input/template-editor.vue" title="模板填充" description="支持动态模板切换，自动聚焦可编辑字段。" />

**配置详见**：[扩展属性 - Template](#templateblock)

### 提及功能

使用 `Mention` 扩展实现 @提及功能，输入触发字符（默认 `@`）触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。

:::tip 自定义触发字符
支持自定义触发字符，例如使用 `#` 代替 `@`。配置 `char: '#'` 后，输入 `#` 即可触发提及列表，选中后显示为 `#标签名` 的格式。
:::

:::tip 删除提及
按 `Backspace` 删除提及项时会保留触发字符（如 `@` 或 `#`），可继续选择其他项。
:::

<demo vue="../../demos/chat-input/mention.vue" title="提及功能" description="输入 @ 触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。" />

**配置详见**：[扩展属性 - Mention](#mention)

### 智能联想

使用 `Suggestion` 扩展实现智能联想功能，支持键盘导航（↑↓ 选择，Enter/Tab 确认）和自动补全提示。

:::tip 自动补全提示
选中建议项时，输入框会以灰色文本显示剩余部分，并显示 "TAB" 提示，按 Tab 键快速应用补全。
:::

#### 基础用法

不传 `filterFn` 时，直接显示所有建议项，不做任何过滤。

<demo vue="../../demos/chat-input/suggestion-basic.vue" title="基础用法" description="直接显示所有建议项，不过滤。" />

#### 自定义过滤

通过 `filterFn` 自定义过滤逻辑，实现模糊匹配、前缀匹配等。

<demo vue="../../demos/chat-input/suggestion-filter.vue" title="自定义过滤" description="使用 filterFn 实现自定义过滤逻辑。" />

#### 高亮模式

支持三种高亮模式，满足不同的使用场景：

1. **自动匹配**：不设置 `highlights`，自动高亮与输入内容匹配的部分
2. **精确指定**：通过 `highlights` 数组精确指定需要高亮的文本片段
3. **自定义函数**：通过 `highlights` 函数完全控制高亮逻辑，实现复杂的高亮规则

<demo vue="../../demos/chat-input/suggestion-highlight.vue" title="高亮模式" description="动态切换三种高亮模式，对比不同的高亮效果。" />

**配置详见**：[扩展属性 - Suggestion](#suggestion)

### 语音输入

通过 `VoiceButton` 组件实现语音输入功能，支持浏览器内置语音识别和第三方语音识别服务。

:::tip 组件化设计
语音输入功能通过独立的 `VoiceButton` 组件实现，可按需添加到 `footer` 插槽中，无需额外配置。
:::

#### 基础语音识别

使用浏览器内置的语音识别功能，支持混合输入和连续识别两种模式。

<demo vue="../../demos/chat-input/voice-input.vue" title="基础语音输入" description="使用浏览器内置语音识别，支持混合输入和连续识别。" />

#### 自定义语音服务

支持集成第三方语音识别服务（如阿里云、百度、Azure 等）。

<demo vue="../../demos/chat-input/voice-custom.vue" title="自定义语音识别" description="集成第三方语音识别服务，参考 speechHandlers.ts 查看完整实现。" />

:::tip 参考实现
`speechHandlers.ts` 提供了阿里云一句话识别和实时识别的完整示例，包括录音处理、API 调用、流式识别等。
:::

#### 自定义录音 UI

支持完全自定义语音录制界面，适用于移动端按住说话等场景。

<demo vue="../../demos/chat-input/voice-custom-ui.vue" title="移动端按住说话" description="自定义录音 UI，展示移动端按住说话的交互模式。" />

**配置详见**：[VoiceButton 属性](#voicebutton)

### 按钮配置

#### 默认按钮配置

通过 `defaultActions` 属性统一配置默认按钮（Clear、Submit）的状态和提示。

<demo vue="../../demos/chat-input/actions-config-basic.vue" title="默认按钮配置" description="通过 defaultActions 统一配置默认按钮的状态和提示。" />

#### 增强按钮

通过插槽添加增强按钮（Upload、Voice 等），每个按钮都有独立的配置。

<demo vue="../../demos/chat-input/actions-enhanced.vue" title="增强按钮" description="通过插槽添加 Upload、Voice 等增强按钮。" />

### 交互定制

#### 取消操作

在 loading 状态下，点击停止按钮会触发 `cancel` 事件，用于取消正在进行的操作（如 AI 响应）。

<demo vue="../../demos/chat-input/cancel-event.vue" title="取消操作" description="loading 状态下点击停止按钮触发 cancel 事件。" />

#### 提交方式

通过 `submitType` 属性控制提交快捷键，支持 `enter`、`ctrlEnter`、`shiftEnter` 三种方式。

<demo vue="../../demos/chat-input/submit-type.vue" title="提交方式" description="支持三种提交快捷键，适应不同使用场景。" />

#### 快捷键参考

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

:::tip 自定义选中按键
通过 `activeSuggestionKeys` 可自定义选中联想项的按键。默认支持 `Enter` 和 `Tab`。
:::

#### 自定义插槽

ChatInput 提供了多个插槽位置，方便扩展功能：

- **`header`** - 顶部区域，可添加标题、提示信息等
- **`prefix`** - 输入框前缀区域，可添加图标、标签等（位于输入框内部）
- **`footer`** - 底部左侧区域，可添加功能按钮
- **`footer-right`** - 底部右侧区域，可添加操作按钮

:::tip 插槽作用域
`footer` 和 `footer-right` 插槽提供了作用域数据，包括 `editor`、`hasContent`、`disabled`、`loading` 等状态，以及 `focus`、`insert`、`append`、`replace` 等操作方法，可用于实现自定义功能按钮。
:::

<demo vue="../../demos/chat-input/custom-slots.vue" title="自定义插槽" description="在插槽区域添加自定义按钮，如深度思考、网络搜索等功能。" />

#### 方法调用

<demo vue="../../demos/chat-input/methods-demo.vue" title="方法调用" description="通过 ref 调用组件方法，如聚焦、设置内容等。" />

### 样式配置

#### 主题支持

:::tip 主题继承
主题会根据父级 `ThemeProvider` 的配置自动继承，无需重复设置。
:::

#### 组件尺寸

通过 `size` 属性控制组件尺寸，支持 `normal`（默认）和 `small`（紧凑）两种尺寸。

<demo vue="../../demos/chat-input/size.vue" title="组件尺寸" description="支持正常和紧凑两种尺寸，适应不同的使用场景。" />

## Props

#### BasicInput

| 属性名        | 说明                                                         | 类型                                     | 默认值                       |
| ------------- | ------------------------------------------------------------ | ---------------------------------------- | ---------------------------- |
| modelValue    | 绑定值(v-model)                                              | `string`                                 | `''`                         |
| defaultValue  | 默认值(非响应式)                                             | `string`                                 | `''`                         |
| placeholder   | 输入框占位文本                                               | `string`                                 | `'请输入内容...'`            |
| mode          | 输入模式                                                     | `'single' \| 'multiple'`                 | `'single'`                   |
| size          | 组件尺寸                                                     | `'normal' \| 'small'`                    | `'normal'`                   |
| disabled      | 是否禁用                                                     | `boolean`                                | `false`                      |
| loading       | 是否加载中                                                   | `boolean`                                | `false`                      |
| autofocus     | 自动获取焦点                                                 | `boolean`                                | `false`                      |
| autoSize      | 自动调整高度，仅在 mode === 'multiple' 时有效              | `boolean \| { minRows: number, maxRows: number }` | `{ minRows: 1, maxRows: 3 }` |
| clearable     | 是否可清空                                                   | `boolean`                                | `false`                      |
| maxLength     | 最大输入长度                                                 | `number`                                 | `Infinity`                   |
| showWordLimit | 是否显示字数统计                                             | `boolean`                                | `false`                      |
| submitType    | 提交方式                                                     | `'enter' \| 'ctrlEnter' \| 'shiftEnter'` | `'enter'`                    |
| stopText      | 停止按钮文字                                                 | `string`                                 | `'停止响应'`                 |
| defaultActions | 默认操作按钮配置，用于统一配置默认按钮（Clear、Submit）的状态和提示 | `DefaultActions`                          | `undefined`                  |

#### Extension

| 属性名     | 说明                                                            | 类型          | 默认值 |
| ---------- | --------------------------------------------------------------- | ------------- | ------ |
| extensions | 扩展列表，用于添加功能（Template、Mention、Suggestion 等） | `Extension[]` | `[]`   |

:::tip 扩展系统
使用 `extensions` 属性配置功能扩展，提供灵活的配置和完整的类型支持。
:::

#### Template

模板填充功能扩展，支持动态设置模板内容。

```typescript
// 便捷函数
ChatInput.template(templates)

// 标准配置
ChatInput.Template.configure({ items: templates })
```

| 配置项  | 类型                                      | 说明         |
| ------- | ----------------------------------------- | ------------ |
| `items` | `TemplateItem[]` \| `Ref<TemplateItem[]>` | 模板数据列表 |

#### Mention

@提及功能扩展，支持快速引用预设的助手或对象，支持自定义触发字符。

```typescript
// 便捷函数（使用默认 '@' 触发）
ChatInput.mention(mentions)

// 便捷函数（自定义触发字符）
ChatInput.mention(mentions, '#') // 使用 '#' 触发

// 标准配置
ChatInput.Mention.configure({ items: mentions, char: '@', allowSpaces: false })
```

| 配置项        | 类型                                    | 默认值  | 说明                                                |
| ------------- | --------------------------------------- | ------- | --------------------------------------------------- |
| `items`       | `MentionItem[]` \| `Ref<MentionItem[]>` | `[]`    | 提及项列表，支持响应式 ref                          |
| `char`        | `string`                                | `'@'`   | 触发字符，支持任意字符（如 `'@'`、`'#'`、`'!'` 等） |
| `allowSpaces` | `boolean`                               | `false` | 是否允许在触发字符后输入空格                        |
| `onSelect`    | `Function`                              | -       | 选中提及项时的回调函数                              |

#### Suggestion

智能联想功能扩展，支持自动过滤、自定义过滤和多种高亮方式。

```typescript
// 便捷函数
ChatInput.suggestion(suggestions) // 不过滤，显示所有项
ChatInput.suggestion(suggestions, { filterFn: customFilter }) // 自定义过滤

// 标准配置
ChatInput.Suggestion.configure({
  items: suggestions,
  filterFn: (items, query) => items.filter((item) => item.content.includes(query)),
  showAutoComplete: true,
})
```

| 配置项                 | 类型                                          | 默认值             | 说明                     |
| ---------------------- | --------------------------------------------- | ------------------ | ------------------------ |
| `items`                | `SuggestionItem[]` \| `Ref<SuggestionItem[]>` | `[]`               | 建议项列表               |
| `filterFn`             | `Function`                                    | `undefined`        | 过滤函数（不传则不过滤） |
| `showAutoComplete`     | `boolean`                                     | `true`             | 自动补全                 |
| `activeSuggestionKeys` | `string[]`                                    | `['Enter', 'Tab']` | 激活按键                 |
| `popupWidth`           | `number` \| `string`                          | `400`              | 弹窗宽度                 |
| `onSelect`             | `Function`                                    | -                  | 选中回调                 |

:::tip popupWidth 格式
支持数字（如 `500`）、百分比（如 `'100%'`）、CSS 单位（如 `'20rem'`）
:::

**高亮方式**：

```typescript
{ content: 'ECS-云服务器' }  // 自动匹配
{ content: 'RDS-数据库', highlights: ['RDS', '数据库'] }  // 精确指定
{ content: 'OSS-存储', highlights: (text, query) => [...] }  // 自定义函数
```

#### UploadButton

文件上传按钮组件，支持文件类型过滤、大小限制和数量限制。

| 属性名           | 说明                     | 类型                 | 默认值       |
| ---------------- | ------------------------ | -------------------- | ------------ |
| disabled         | 是否禁用                 | `boolean`            | `false`      |
| accept           | 接受的文件类型           | `string`             | `'*'`        |
| multiple         | 是否支持多选             | `boolean`            | `false`      |
| reset            | 选择后是否重置 input     | `boolean`            | `true`       |
| maxSize          | 文件大小限制（MB）       | `number`             | -            |
| maxCount         | 最大文件数量             | `number`             | -            |
| tooltip          | Tooltip                 | `TooltipContent`     | `-`          |
| tooltipPlacement | Tooltip 位置             | `TooltipPlacement`   | `'top'`      |
| icon             | 自定义图标               | `VNode \| Component` | `IconUpload` |
| size             | 按钮尺寸                 | `number \| string`   | `32`         |

#### VoiceButton

语音输入按钮组件，支持浏览器内置语音识别和第三方语音识别服务。

| 属性名           | 说明                         | 类型                  | 默认值       |
| ---------------- | ---------------------------- | --------------------- | ------------ |
| icon             | 自定义图标                   | `VNode \| Component`  | `IconVoice`  |
| disabled         | 是否禁用                     | `boolean`             | `false`      |
| size             | 按钮尺寸                     | `'small' \| 'normal'` | `'normal'`   |
| tooltip          | Tooltip                     | `TooltipContent`      | `-`          |
| tooltipPlacement | Tooltip 位置                 | `TooltipPlacement`    | `'top'`      |
| speechConfig     | 语音配置                     | `SpeechConfig`        | -            |
| autoInsert       | 是否自动插入识别结果到编辑器 | `boolean`             | `true`       |
| onButtonClick    | 按钮点击拦截器               | `Function`            | -            |

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

#### BasicInput

| 事件名            | 说明                                                         | 回调参数                                |
| ----------------- | ------------------------------------------------------------ | --------------------------------------- |
| update:modelValue | 输入值变化时触发(v-model)                                    | `(value: string)`                       |
| blur              | 输入框失去焦点时触发                                         | `(event: FocusEvent)`                   |
| focus             | 输入框获得焦点时触发                                         | `(event: FocusEvent)`                   |
| submit            | 提交内容时触发                                               | `(text: string, data?: StructuredData)` |
| clear             | 清空内容时触发                                               | `()`                                    |
| cancel            | 在 loading 状态下点击停止按钮时触发，用于取消正在进行的操作（如 AI 响应） | `()`                                    |
| input             | 输入内容变化时触发                                           | `(value: string)`                       |

#### UploadButton

| 事件名 | 说明         | 回调参数                        |
| ------ | ------------ | ------------------------------- |
| select | 文件选择成功 | `(files: File[])`               |
| error  | 文件验证失败 | `(error: Error, file?: File)`   |

#### VoiceButton

| 事件名         | 说明     | 回调参数                |
| -------------- | -------- | ----------------------- |
| speech-start   | 开始录音 | `()`                    |
| speech-interim | 中间结果 | `(transcript: string)`  |
| speech-final   | 最终结果 | `(transcript: string)`  |
| speech-end     | 结束录音 | `(transcript?: string)` |
| speech-error   | 识别错误 | `(error: Error)`        |

## Methods

#### BasicInput

| 方法名     | 说明                                                       | 参数                | 返回值   |
| ---------- | ---------------------------------------------------------- | ------------------- | -------- |
| focus      | 使输入框获取焦点                                           | -                   | `void`   |
| blur       | 使输入框失去焦点                                           | -                   | `void`   |
| clear      | 清空输入内容                                               | -                   | `void`   |
| submit     | 手动触发提交事件                                           | -                   | `void`   |
| cancel     | 手动触发取消事件，用于在 loading 状态下取消正在进行的操作 | -                   | `void`   |
| setContent | 设置编辑器内容                                             | `(content: string)` | `void`   |
| getContent | 获取编辑器内容                                             | -                   | `string` |

#### UploadButton

| 方法名 | 说明           | 参数 | 返回值 |
| ------ | -------------- | ---- | ------ |
| open   | 打开文件选择器 | -    | `void` |

#### VoiceButton

| 方法名 | 说明     | 参数 | 返回值 |
| ------ | -------- | ---- | ------ |
| start  | 开始录音 | -    | `void` |
| stop   | 停止录音 | -    | `void` |

## Types

```typescript
// DefaultActions 默认按钮配置
interface DefaultActions {
  submit?: {
    disabled?: boolean // 是否禁用提交按钮
    tooltip?: string // 提交按钮提示文本
    tooltipPlacement?: TooltipPlacement // Tooltip 位置
  }
  clear?: {
    disabled?: boolean // 是否禁用清空按钮
    tooltip?: string // 清空按钮提示文本
    tooltipPlacement?: TooltipPlacement // Tooltip 位置
  }
}

// ToolTip 内容
type TooltipContent = string | (() => string | VNode)

// Tooltip 位置
type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

// SpeechConfig 语音配置
interface SpeechConfig {
  customHandler?: SpeechHandler // 自定义语音处理器
  lang?: string // 识别语言，默认浏览器语言
  continuous?: boolean // 是否持续识别
  interimResults?: boolean // 是否返回中间结果
  autoReplace?: boolean // 是否自动替换内容
  onVoiceButtonClick?: (isRecording, preventDefault) => void // 按钮点击拦截器
}

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
