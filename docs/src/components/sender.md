---
outline: [1, 3]
---

# Sender 消息输入框

:::danger 重大版本升级 v0.4
Sender 在 v0.4 进行了重大升级。

**从 v0.3.x 升级？选择你的迁移方式：**

**方式一：快速迁移（推荐）** 🚀
- 使用 `SenderCompat` 组件，保持大部分 API 兼容
- 修改导入语句 + 处理少量破坏性变更
- 👉 查看 [SenderCompat 快速迁移指南](./sender-compat.md)

**方式二：完全升级** 📖
- 直接升级到 v0.4，使用全新 API
- 需要调整代码，但能获得更好的功能和性能
- ⚠️ 部分 API 已被移除，详见下方 [已移除的 API](#已移除的-api)
- 👉 查看 [完整迁移方案](./sender-compat.md#完整迁移方案)

**新项目：** 直接使用下方 v0.4 的 API 和示例即可。
:::

Sender 是一个高度可组合的聊天输入组件，支持文本输入、自动联想、提及功能、模板填充、语音输入和文件上传等多种功能。

- [代码示例](#代码示例) - 输入模式、状态控制、字数限制
- [输入增强](#输入增强) - 模板填充、提及功能、智能联想、语音输入、文件上传
- [交互定制](#交互定制) - 取消操作、提交方式、快捷键、自定义插槽、方法调用
- [样式配置](#样式配置) - 主题支持、组件尺寸

## 代码示例

### 输入模式

Sender 支持单行和多行两种输入模式，通过 `mode` 属性控制。

:::tip 单行模式自动切换
在单行模式下，当输入内容超出宽度时，会自动切换为多行模式。

当 `submitType="enter"` 时，按 `Ctrl+Enter` 或 `Shift+Enter` 也会自动切换为多行模式并换行。
:::

<demo vue="../../demos/sender/mode-switch.vue" title="输入模式" description="支持单行和多行模式，单行模式可自动切换为多行。" />

### 状态控制

通过 `loading` 和 `disabled` 属性控制组件状态。加载状态下可点击图标取消操作。

<demo vue="../../demos/sender/loading-state.vue" title="加载与禁用状态" description="展示加载和禁用两种状态的表现。" />

### 内容管理

#### 字数限制

通过 `maxLength` 和 `showWordLimit` 属性实现字数限制和统计。

:::warning 超出限制行为
超出字数限制时，不会自动截断内容，但会以红色标示真实字数，且无法提交。
:::

<demo vue="../../demos/sender/word-limit.vue" title="字数限制" description="限制输入字符数并显示字数统计。" />

## 输入增强

Sender 采用可插拔的扩展架构，通过 `extensions` prop 灵活添加功能。所有扩展都支持响应式数据自动同步。

### 扩展使用

提供两种集成方式：

```typescript
import { TrSender } from '@opentiny/tiny-robot'

// 便捷函数（推荐）
TrSender.mention(mentions, '@')
TrSender.suggestion(suggestions) // 不过滤
TrSender.suggestion(suggestions, { filterFn: customFilter }) // 自定义过滤
TrSender.template(templates)

// 标准配置（用于复杂场景）
TrSender.Mention.configure({ items: mentions, char: '@', allowSpaces: false })
TrSender.Suggestion.configure({ items: suggestions, filterFn: customFilter })
```

### 模板编辑

使用 `Template` 扩展实现模板填充功能，支持动态设置模板内容，光标自动聚焦到第一个可编辑字段。

:::tip 响应式数据
通过 `items` 配置项传入响应式 ref，模板数据变化时会自动更新编辑器内容。
:::

<demo vue="../../demos/sender/template-editor.vue" title="模板填充" description="支持动态模板切换，自动聚焦可编辑字段。" />

**配置详见**：[扩展属性 - Template](#template)

### 提及功能

使用 `Mention` 扩展实现 @提及功能，输入触发字符（默认 `@`）触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。

:::tip 自定义触发字符
支持自定义触发字符，例如使用 `#` 代替 `@`。配置 `char: '#'` 后，输入 `#` 即可触发提及列表，选中后显示为 `#标签名` 的格式。
:::

:::tip 删除提及
按 `Backspace` 删除提及项时会保留触发字符（如 `@` 或 `#`），可继续选择其他项。
:::

<demo vue="../../demos/sender/mention.vue" title="提及功能" description="输入 @ 触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。" />

**配置详见**：[扩展属性 - Mention](#mention)  
**结构化数据**：[submit 事件 - 结构化数据说明](#结构化数据)

### 智能联想

使用 `Suggestion` 扩展实现智能联想功能，支持键盘导航（↑↓ 选择，Enter 确认）和自动补全提示。

:::tip 自动补全提示
选中建议项时，输入框会以灰色文本显示剩余部分，并显示 "TAB" 提示，按 Tab 键快速应用补全。
:::

#### 基础用法

不传 `filterFn` 时，直接显示所有建议项，不做任何过滤。

<demo vue="../../demos/sender/suggestion-basic.vue" title="基础用法" description="直接显示所有建议项，不过滤。" />

#### 自定义过滤

通过 `filterFn` 自定义过滤逻辑，实现模糊匹配、前缀匹配等。

<demo vue="../../demos/sender/suggestion-filter.vue" title="自定义过滤" description="使用 filterFn 实现自定义过滤逻辑。" />

#### 高亮模式

支持三种高亮模式，满足不同的使用场景：

1. **自动匹配**：不设置 `highlights`，自动高亮与输入内容匹配的部分
2. **精确指定**：通过 `highlights` 数组精确指定需要高亮的文本片段
3. **自定义函数**：通过 `highlights` 函数完全控制高亮逻辑，实现复杂的高亮规则

<demo vue="../../demos/sender/suggestion-highlight.vue" title="高亮模式" description="动态切换三种高亮模式，对比不同的高亮效果。" />

**配置详见**：[扩展属性 - Suggestion](#suggestion)

### 语音输入

通过 `VoiceButton` 组件实现语音输入功能，支持浏览器内置语音识别和第三方语音识别服务。

:::tip 组件化设计
语音输入功能通过独立的 `VoiceButton` 组件实现，可按需添加到 `footer` 插槽中，无需额外配置。
:::

#### 基础语音识别

使用浏览器内置的语音识别功能，支持混合输入和连续识别两种模式。

<demo vue="../../demos/sender/voice-input.vue" title="基础语音输入" description="使用浏览器内置语音识别，支持混合输入和连续识别。" />

#### 自定义语音服务

支持集成第三方语音识别服务（如阿里云、百度、Azure 等）。

<demo vue="../../demos/sender/voice-custom.vue" title="自定义语音识别" description="集成第三方语音识别服务，参考 speechHandlers.ts 查看完整实现。" />

:::tip 参考实现
`speechHandlers.ts` 提供了阿里云一句话识别和实时识别的完整示例，包括录音处理、API 调用、流式识别等。
:::

#### 自定义录音 UI

支持完全自定义语音录制界面，适用于移动端按住说话等场景。

<demo vue="../../demos/sender/voice-custom-ui.vue" title="移动端按住说话" description="自定义录音 UI，展示移动端按住说话的交互模式。" />

**配置详见**：[VoiceButton 属性](#voicebutton)

### 按钮配置

#### 默认按钮配置

通过 `defaultActions` 属性统一配置默认按钮（Clear、Submit）的状态和提示。

<demo vue="../../demos/sender/actions-config-basic.vue" title="默认按钮配置" description="通过 defaultActions 统一配置默认按钮的状态和提示。" />

#### 增强按钮

通过插槽添加增强按钮（Upload、Voice 等），每个按钮都有独立的配置。

<demo vue="../../demos/sender/actions-enhanced.vue" title="增强按钮" description="通过插槽添加 Upload、Voice 等增强按钮；上传内容随消息提交见下方示例。" />

**配置详见**：[UploadButton 属性](#uploadbutton)、[VoiceButton 属性](#voicebutton)

### 上传内容

附件、图片等内容通常由上传按钮或独立列表维护，不会写入 Sender 的编辑器文本。当用户只上传附件或图片、不输入额外文本时，也需要让发送按钮可用，并在提交时拿到这些文件数据。把 `TrAttachments` 放在 Sender 内时，可通过 `content-source-id` 自动注册提交数据。

:::warning 兼容说明
`hasExternalContent` 仍可用于控制外部内容场景的可提交状态，但不会生成 `externalPayloads`。需要随提交返回附件数据时，请使用 `TrAttachments` 的 `content-source-id`。
:::

<demo vue="../../demos/sender/attachments-in-sender.vue" title="输入框内附件列表" description="使用 Attachments 在 Sender 内展示和管理附件，并随消息一起提交。" />

## 交互定制

### 取消操作

在 loading 状态下，点击停止按钮会触发 `cancel` 事件，用于取消正在进行的操作（如 AI 响应）。

<demo vue="../../demos/sender/cancel-event.vue" title="取消操作" description="loading 状态下点击停止按钮触发 cancel 事件。" />

### 提交方式

通过 `submitType` 属性控制提交快捷键，支持 `enter`、`ctrlEnter`、`shiftEnter` 三种方式。

<demo vue="../../demos/sender/submit-type.vue" title="提交方式" description="支持三种提交快捷键，适应不同使用场景。" />

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

:::tip 自定义选中按键
通过 `activeSuggestionKeys` 可自定义选中联想项的按键。默认支持 `Enter` 和 `Tab`。
:::

### 自定义插槽

Sender 提供了多个插槽位置，方便扩展功能：

- **`header`** - 顶部区域，可添加标题、提示信息等
- **`prefix`** - 输入框前缀区域，可添加图标、标签等（位于输入框内部）
- **`footer`** - 底部左侧区域，可添加功能按钮
- **`footer-right`** - 底部右侧区域，可添加操作按钮

:::tip 插槽作用域
`footer` 和 `footer-right` 插槽提供了作用域数据，包括 `editor`、`hasContent`、`disabled`、`loading` 等状态，以及 `focus`、`insert`、`append`、`replace` 等操作方法，可用于实现自定义功能按钮。
:::

<demo vue="../../demos/sender/custom-slots.vue" title="自定义插槽" description="在插槽区域添加自定义按钮，如深度思考、网络搜索等功能。" />

### 方法调用

<demo vue="../../demos/sender/methods-demo.vue" title="方法调用" description="通过 ref 调用组件方法，如聚焦、设置内容等。" />

## 样式配置

### 主题支持

:::tip 主题继承
主题会根据父级 `ThemeProvider` 的配置自动继承，无需重复设置。
:::

### 组件尺寸

通过 `size` 属性控制组件尺寸，支持 `normal`（默认）和 `small`（紧凑）两种尺寸。

<demo vue="../../demos/sender/size.vue" title="组件尺寸" description="支持正常和紧凑两种尺寸，适应不同的使用场景。" />

---

## Props

| 属性名 | 说明 | 类型 | 默认值 |
|-------|------|------|--------|
| modelValue | 绑定值(v-model) | `string` | `''` |
| defaultValue | 默认值(非响应式) | `string` | `''` |
| placeholder | 输入框占位文本 | `string` | `'请输入内容...'` |
| mode | 输入模式 | `'single' \| 'multiple'` | `'single'` |
| size @0.4 | 组件尺寸 | `'normal' \| 'small'` | `'normal'` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| autofocus | 自动获取焦点 | `boolean` | `false` |
| enterkeyhint @0.4 | 移动端虚拟键盘回车键提示 | `EnterKeyHint` | `'send'` |
| autoSize | 自动调整高度 | `boolean \| { minRows: number, maxRows: number }` | `{ minRows: 1, maxRows: 5 }` |
| clearable | 是否可清空 | `boolean` | `false` |
| hasExternalContent @0.5 兼容保留 | 是否存在外部可提交内容，适用于附件、图片等不写入编辑器文本的内容。该属性不会生成 `externalPayloads`；使用 `TrAttachments` 时请改用 `contentSourceId` | `boolean` | `false` |
| maxLength | 最大输入长度 | `number` | `Infinity` |
| showWordLimit | 是否显示字数统计 | `boolean` | `false` |
| submitType | 提交方式 | `'enter' \| 'ctrlEnter' \| 'shiftEnter'` | `'enter'` |
| stopText | 停止按钮文字 | `string` | `'停止响应'` |
| defaultActions @0.4 | 默认操作按钮配置 | `DefaultActions` | `undefined` |
| extensions @0.4 | 扩展列表 (Template, Mention, Suggestion 等) | `Extension[]` | `[]` |

:::tip 扩展系统
使用 `extensions` 属性配置功能扩展，提供灵活的配置和完整的类型支持。
::: 

#### Template

模板填充功能扩展，支持动态设置模板内容。

```typescript
// 便捷函数
TrSender.template(templates)

// 标准配置
TrSender.Template.configure({ items: templates })
```

| 配置项  | 类型                                      | 说明         |
| ------- | ----------------------------------------- | ------------ |
| `items` | `TemplateItem[]` \| `Ref<TemplateItem[]>` | 模板数据列表 |

#### Mention

@提及功能扩展，支持快速引用预设的助手或对象，支持自定义触发字符。

```typescript
// 便捷函数（使用默认 '@' 触发）
TrSender.mention(mentions)

// 便捷函数（自定义触发字符）
TrSender.mention(mentions, '#') // 使用 '#' 触发

// 标准配置
TrSender.Mention.configure({ items: mentions, char: '@', allowSpaces: false })
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
TrSender.suggestion(suggestions) // 不过滤，显示所有项
TrSender.suggestion(suggestions, { filterFn: customFilter }) // 自定义过滤

// 标准配置
TrSender.Suggestion.configure({
  items: suggestions,
  filterFn: (items, query) => items.filter((item) => item.content.includes(query)),
  showAutoComplete: true,
})
```

| 配置项                 | 类型                                                      | 默认值      | 说明                               |
| ---------------------- | --------------------------------------------------------- | ----------- | ---------------------------------- |
| `items`                | `SenderSuggestionItem[]` \| `Ref<SenderSuggestionItem[]>` | `[]`        | 建议项列表（可选）                 |
| `filterFn`             | `Function`                                                | `undefined` | 过滤函数（不传则不过滤）           |
| `showAutoComplete`     | `boolean`                                                 | `true`      | 自动补全                           |
| `activeSuggestionKeys` | `string[]`                                                | `['Enter']` | 激活按键                           |
| `popupWidth`           | `number` \| `string`                                      | `400`       | 弹窗宽度                           |
| `onSelect`             | `(item) => void \| false`                                 | -           | 选中回调，返回 false 阻止默认回填 |

:::tip popupWidth 格式
支持数字（如 `500`）、百分比（如 `'100%'`）、CSS 单位（如 `'20rem'`）
:::

**高亮方式**：

```typescript
{ content: 'ECS-云服务器' }  // 自动匹配
{ content: 'RDS-数据库', highlights: ['RDS', '数据库'] }  // 精确指定
{ content: 'OSS-存储', highlights: (text, query) => [...] }  // 自定义函数
```

**onSelect 回调**：

选中建议项时触发，返回 `false` 可阻止默认回填行为：

```typescript
// 默认行为：自动回填
onSelect: (item) => {
  console.log('Selected:', item)
  // 不返回 false，内容会自动回填到编辑器
}

// 阻止默认回填并自定义
onSelect: (item) => {
  editor.commands.setContent(`前缀-${item.content}-后缀`)
  return false // 阻止默认回填
}

// 条件性阻止
onSelect: (item) => {
  if (item.data?.needsValidation) {
    validateAndFill(item)
    return false
  }
  // 否则使用默认回填
}
```

:::tip 回调参数
`item` 包含完整的 `SenderSuggestionItem` 信息（`content`、`data`、`highlights`），可用于业务逻辑处理。
:::

#### UploadButton

文件上传按钮组件，支持文件类型过滤、大小限制和数量限制。

| 属性名           | 说明                 | 类型                 | 默认值       |
| ---------------- | -------------------- | -------------------- | ------------ |
| disabled         | 是否禁用             | `boolean`            | `false`      |
| accept           | 接受的文件类型       | `string`             | `'*'`        |
| multiple         | 是否支持多选         | `boolean`            | `false`      |
| reset            | 选择后是否重置 input | `boolean`            | `true`       |
| maxSize          | 文件大小限制（MB）   | `number`             | -            |
| maxCount         | 最大文件数量         | `number`             | -            |
| tooltip          | Tooltip              | `TooltipContent`     | `-`          |
| tooltipPlacement | Tooltip 位置         | `TooltipPlacement`   | `'top'`      |
| icon             | 自定义图标           | `VNode \| Component` | `IconUpload` |
| size             | 按钮尺寸             | `number \| string`   | `32`         |

#### VoiceButton

语音输入按钮组件，支持浏览器内置语音识别和第三方语音识别服务。

| 属性名           | 说明                         | 类型                  | 默认值      |
| ---------------- | ---------------------------- | --------------------- | ----------- |
| icon             | 自定义图标                   | `VNode \| Component`  | `IconVoice` |
| disabled         | 是否禁用                     | `boolean`             | `false`     |
| size             | 按钮尺寸                     | `'small' \| 'normal'` | `'normal'`  |
| tooltip          | Tooltip                      | `TooltipContent`      | `-`         |
| tooltipPlacement | Tooltip 位置                 | `TooltipPlacement`    | `'top'`     |
| speechConfig     | 语音配置                     | `SpeechConfig`        | -           |
| autoInsert       | 是否自动插入识别结果到编辑器 | `boolean`             | `true`      |
| onButtonClick    | 按钮点击拦截器               | `Function`            | -           |

## Slots

| 插槽名称 | 描述 | 作用域参数 |
|---------|------|-----------|
| header | 头部插槽，位于输入框上方 | - |
| prefix | 前缀插槽，位于输入框左侧 | - |
| content @0.4 | 内容插槽，用于完全自定义编辑器内容 | `{ editor }` |
| actions-inline @0.4 | 单行模式下的操作按钮区域 | - |
| footer | 底部自定义区域 | `{ editor, hasContent, disabled, loading }` |
| footer-right | 底部右侧区域 | - |

## Events

| 事件名            | 说明                                                                 | 回调参数                                |
| ----------------- | -------------------------------------------------------------------- | --------------------------------------- |
| update:modelValue | 内容更新                                                             | `(value: string)`                       |
| submit            | 提交内容，返回纯文本、结构化数据（可选）和外部内容 meta（可选）       | `(text: string, data?: StructuredData, meta?: SenderSubmitMeta)` |
| clear             | 清空内容                                                             | `()`                                    |
| focus             | 获得焦点                                                             | `(event: FocusEvent)`                   |
| blur              | 失去焦点                                                             | `(event: FocusEvent)`                   |
| input             | 输入变化                                                             | `(value: string)`                       |
| cancel @0.4     | 在 loading 状态下点击停止按钮时触发，用于取消正在进行的操作（如 AI 响应） | `()`                                    |

:::tip submit 事件参数说明
- **text**：纯文本内容，适用于简单场景（如直接发送给 AI）
- **data**：结构化数据数组，仅在使用 Template 或 Mention 扩展时返回，包含文本和特殊节点的完整信息
- **meta**：仅当存在附件 payload 时返回，当前包含 `externalPayloads`

根据业务需求选择使用：
- 简单场景：只使用 `text` 参数
- 复杂场景：使用 `data` 参数提取特殊节点信息或自定义拼接格式
- 附件等外部内容：使用 `meta.externalPayloads` 按 `sourceId` 和 `type` 读取

详见：[结构化数据](#结构化数据)
:::

#### UploadButton Events

| 事件名 | 说明         | 回调参数                      |
| ------ | ------------ | ----------------------------- |
| select | 文件选择成功 | `(files: File[])`             |
| error  | 文件验证失败 | `(error: Error, file?: File)` |

#### VoiceButton Events

| 事件名         | 说明     | 回调参数                |
| -------------- | -------- | ----------------------- |
| speech-start   | 开始录音 | `()`                    |
| speech-interim | 中间结果 | `(transcript: string)`  |
| speech-final   | 最终结果 | `(transcript: string)`  |
| speech-end     | 结束录音 | `(transcript?: string)` |
| speech-error   | 识别错误 | `(error: Error)`        |

## Methods

| 方法名            | 说明             | 参数                | 返回值   |
| ----------------- | ---------------- | ------------------- | -------- |
| focus             | 使输入框获取焦点 | -                   | `void`   |
| blur              | 使输入框失去焦点 | -                   | `void`   |
| clear             | 清空输入内容     | -                   | `void`   |
| submit            | 手动触发提交     | -                   | `void`   |
| setContent @0.4 | 设置编辑器内容   | `(content: string)` | `void`   |
| getContent @0.4 | 获取编辑器内容   | -                   | `string` |
| cancel @0.4     | 手动触发取消     | -                   | `void`   |

#### UploadButton Methods

| 方法名 | 说明           | 参数 | 返回值 |
| ------ | -------------- | ---- | ------ |
| open   | 打开文件选择器 | -    | `void` |

#### VoiceButton Methods

| 方法名 | 说明     | 参数 | 返回值 |
| ------ | -------- | ---- | ------ |
| start  | 开始录音 | -    | `void` |
| stop   | 停止录音 | -    | `void` |

#### 结构化数据

当使用 `Template` 或 `Mention` 扩展时，`submit` 事件的第二个参数 `data` 返回结构化数据数组。

**使用建议**：
- 简单场景：使用 `text` 参数（纯文本）
- 复杂场景：使用 `data` 参数提取特殊节点或自定义格式

##### Mention 扩展

```typescript
function handleSubmit(text: string, data?: StructuredData) {
  // text: "帮我分析 @张三 的周报"
  // data: [
  //   { type: 'text', content: '帮我分析 ' },
  //   { type: 'mention', content: '张三', value: '用户ID' },
  //   { type: 'text', content: ' 的周报' }
  // ]
  
  // 提取提及项
  const mentions = data?.filter(item => item.type === 'mention') || []
  
  // 自定义格式（如 Slack 风格）
  const customText = data?.map(item => 
    item.type === 'mention' ? `<@${item.value}>` : item.content
  ).join('')
}
```

#### Template 扩展

```typescript
function handleSubmit(text: string, data?: StructuredData) {
  // text: "帮我分析 张三 的周报"
  // data: [
  //   { type: 'text', content: '帮我分析 ' },
  //   { type: 'block', content: '张三' },
  //   { type: 'text', content: ' 的周报' }
  // ]
  
  // 提取模板块
  const blocks = data?.filter(item => item.type === 'block') || []
  
  // 自定义格式（如 Mustache 风格）
  const customText = data?.map(item => 
    item.type === 'block' ? `{{${item.content}}}` : item.content
  ).join('')
}
```

**类型定义**：详见 [Types - StructuredData](#types)

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

// 模板项（联合类型）
type TemplateItem =
  | {
      id?: string // 模板 ID（可选，组件会自动生成）
      type: 'text' // 类型：普通文本
      content: string // 内容
    }
  | {
      id?: string // 模板 ID（可选，组件会自动生成）
      type: 'block' // 类型：模板块（可编辑）
      content: string // 内容
    }
  | {
      id?: string // 模板 ID（可选，组件会自动生成）
      type: 'select' // 类型：选择器
      content: string // 内容（选中的值）
      placeholder?: string // 占位文字（仅用于输入配置）
      options?: SelectOption[] // 选项列表（仅用于输入配置）
      value?: string // 当前选中的值（仅用于输入配置）
    }

// 选择器选项
interface SelectOption {
  label: string // 显示文本
  value: string // 选择后的值
}

// 提及项（输入配置）
interface MentionItem {
  label: string // 显示名称，如 "小小画家"
  value: string // 关联值
}

// 提及项（输出结构）
type MentionStructuredItem = 
  | { type: 'text', content: string }
  | { type: 'mention', content: string, value: string }

// 建议项
interface SenderSuggestionItem {
  content: string // 建议项内容（必填）
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

// 结构化数据（submit 事件返回）
type StructuredData = TemplateItem[] | MentionStructuredItem[]

interface SenderAttachmentPayload {
  type: 'attachments'
  items: Attachment[]
}

type SenderExternalPayloadSourceId = string
type SenderExternalPayload = SenderAttachmentPayload & { readonly sourceId: SenderExternalPayloadSourceId }

interface SenderSubmitMeta {
  externalPayloads: SenderExternalPayload[]
}

// 输入模式
type InputMode = 'single' | 'multiple'

// 移动端虚拟键盘回车键提示
type EnterKeyHint = 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'

// 扩展类型
import type { Extension } from '@tiptap/core'
```

---

## CSS 变量

Sender 组件提供了丰富的 CSS 变量用于自定义样式。

**基础颜色**

| 变量名                          | 说明         |
| ------------------------------- | ------------ |
| `--tr-sender-bg-color`          | 背景颜色     |
| `--tr-sender-text-color`        | 文本颜色     |
| `--tr-sender-placeholder-color` | 占位符颜色   |
| `--tr-sender-button-hover-bg`   | 按钮悬停背景 |

**尺寸和间距**

| 变量名                       | 说明         |
| ---------------------------- | ------------ |
| `--tr-sender-font-size`      | 字体大小     |
| `--tr-sender-line-height`    | 行高         |
| `--tr-sender-border-radius`  | 圆角大小     |
| `--tr-sender-padding`        | 内边距       |
| `--tr-sender-gap`            | 元素间距     |
| `--tr-sender-footer-gap`     | 底部元素间距 |

**Header 区域**

| 变量名                             | 说明                 |
| ---------------------------------- | -------------------- |
| `--tr-sender-header-padding`       | 头部内边距           |
| `--tr-sender-header-divider-inset` | 头部分割线缩进       |
| `--tr-sender-multi-main-padding`   | 多行模式主区域内边距 |

**Footer 区域**

| 变量名                       | 说明       |
| ---------------------------- | ---------- |
| `--tr-sender-footer-padding` | 底部内边距 |

**前缀和操作区**

| 变量名                              | 说明             |
| ----------------------------------- | ---------------- |
| `--tr-sender-prefix-padding-right`  | 前缀区域右内边距 |
| `--tr-sender-actions-padding-right` | 操作区域右内边距 |

**按钮**

| 变量名                           | 说明         |
| -------------------------------- | ------------ |
| `--tr-sender-button-size`        | 按钮尺寸     |
| `--tr-sender-button-size-submit` | 提交按钮尺寸 |
| `--tr-sender-tooltip-gap`        | 按钮 Tooltip 与触发按钮的间距 |

:::tip 尺寸变体
所有变量都支持通过 `size` 属性自动切换。当 `size="small"` 时，组件会使用对应的 `-small` 变体（如 `--tr-sender-font-size-small`）。
:::

:::tip Tooltip 间距
Sender 按钮的 Tooltip 间距可通过 `--tr-sender-tooltip-gap` 全局自定义，默认值为 `8px`。由于 Tooltip 弹层通常挂载在全局层级，建议在 `:root` 或全局主题作用域下设置该变量。
:::

:::tip 使用示例
```css
/* 自定义背景色 */
.my-sender {
  --tr-sender-bg-color: #f5f5f5;
  --tr-sender-text-color: #333;
}

/* 自定义按钮尺寸 */
.my-sender {
  --tr-sender-button-size: 40px;
  --tr-sender-button-size-submit: 44px;
}

/* 全局调整 Sender 按钮 Tooltip 间距 */
:root {
  --tr-sender-tooltip-gap: 10px;
}
```
:::

## 已移除的 API {#已移除的-api}

以下 API 在 v0.4 中已被移除，请参考替代方案进行迁移。

### Props

| 属性名 | 原说明 | 替代方案 |
|--------|--------|----------|
| allowSpeech | 是否开启语音输入 | [使用 VoiceButton 组件](./sender-compat.md#语音输入迁移) |
| speech | 语音识别配置 | [使用 VoiceButton.speechConfig](./sender-compat.md#语音输入迁移) |
| allowFiles | 是否允许文件上传 | [使用 UploadButton 组件](./sender-compat.md#文件上传迁移) |
| buttonGroup | 按钮组配置 | [使用 defaultActions 和插槽](./sender-compat.md#按钮配置迁移) |
| theme | 主题样式 | [使用 ThemeProvider 包裹](./sender-compat.md#主题迁移) |
| suggestions | 输入建议列表 | [使用 Suggestion 扩展](./sender-compat.md#联想迁移) |
| suggestionPopupWidth | 建议弹窗宽度 | [使用 Suggestion 扩展配置](./sender-compat.md#联想迁移) |
| activeSuggestionKeys | 激活建议项的按键 | [使用 Suggestion 扩展配置](./sender-compat.md#联想迁移) |
| templateData | 模板数据 | [使用 Template 扩展](./sender-compat.md#模板迁移) |

### Slots

| 插槽名称 | 替代方案 |
|---------|----------|
| actions | 改用 `actions-inline` |
| footer-left | 改用 `footer` |
| decorativeContent | 改用 `disabled` + `content` |

### Events

| 事件名 | 替代方案 |
|-------|----------|
| change | 使用 `blur` 事件 |
| files-selected | 使用 `UploadButton` 的 `select` 事件 |
| speech-start | 使用 `VoiceButton` 的 `speech-start` 事件 |
| speech-end | 使用 `VoiceButton` 的 `speech-end` 事件 |
| speech-interim | 使用 `VoiceButton` 的 `speech-interim` 事件 |
| speech-error | 使用 `VoiceButton` 的 `speech-error` 事件 |
| suggestion-select | 使用 `Suggestion` 扩展的 `onSelect` 回调 |

### Methods

| 方法名 | 替代方案 |
|-------|----------|
| startSpeech | 使用 `VoiceButton.start()` |
| stopSpeech | 使用 `VoiceButton.stop()` |
| activateTemplateFirstField | 自动处理，无需调用 |
