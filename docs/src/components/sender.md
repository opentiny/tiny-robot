---
outline: [1, 4]
---

# Sender 消息输入框

:::danger 重大版本升级 v0.4.0
Sender 在 v0.4.0 进行了重大升级，基于 ChatInput 重新实现。

**从 v0.3.0 升级？选择你的迁移方式：**

**方式一：快速迁移（推荐）** 🚀
- 使用 `SenderCompat` 组件，保持现有代码不变
- 仅需修改导入语句即可完成迁移
- 👉 查看 [SenderCompat 快速迁移指南](./sender-compat.md)

**方式二：完全升级** 📖
- 直接升级到 v0.4.0，使用全新 API
- 需要调整代码，但能获得更好的功能和性能
- ⚠️ 部分 API 已被移除，详见下方 [已移除的 API](#已移除的-api)
- 👉 查看 [完整迁移方案](./sender-compat.md#完整迁移方案)

**新项目：** 直接使用下方 v0.4.0 的 API 和示例即可。
:::

Sender 是一个高度可组合的聊天输入组件，支持文本输入、自动联想、提及功能、模板填充、语音输入和文件上传等多种功能。

- [代码示例](#代码示例) - 模式切换、状态控制、内容管理
- [输入增强](#输入增强) - 模板填充、提及功能
- [交互定制](#交互定制) - 快捷键、自定义底部、方法调用
- [样式配置](#样式配置) - 主题、组件尺寸

## 代码示例

### 输入模式

Sender 支持单行和多行两种输入模式，通过 `mode` 属性控制。

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

Sender 采用可插拔的扩展架构，通过 `extensions` prop 灵活添加功能。

### 扩展使用

提供两种集成方式：

```typescript
import { ChatInput as Sender } from '@opentiny/tiny-robot'

// 便捷函数（推荐）
Sender.mention(mentions, '@')
Sender.suggestion(suggestions)
Sender.template(templates)

// 标准配置（用于复杂场景）
Sender.Mention.configure({ items: mentions, char: '@' })
```

### 模板编辑

使用 `Template` 扩展实现模板填充功能，支持动态设置模板内容，光标自动聚焦到第一个可编辑字段。

<demo vue="../../demos/chat-input/template-editor.vue" title="模板填充" description="支持动态模板切换，自动聚焦可编辑字段。" />

### 提及功能

使用 `Mention` 扩展实现 @提及功能，快速引用预设的助手或对象。

<demo vue="../../demos/chat-input/mention.vue" title="提及功能" description="输入 @ 触发提及选择，快速引用预设的助手或对象。" />

### 智能联想

使用 `Suggestion` 扩展实现智能联想功能，支持键盘导航和自动补全提示。

<demo vue="../../demos/chat-input/suggestion-highlight.vue" title="智能联想" description="动态切换三种高亮模式，对比不同的高亮效果。" />

### 语音输入

通过 `VoiceButton` 组件实现语音输入功能。

<demo vue="../../demos/chat-input/voice-input.vue" title="语音输入" description="使用浏览器内置语音识别，支持混合输入和连续识别。" />

### 文件上传

通过 `UploadButton` 组件实现文件上传功能。

<demo vue="../../demos/chat-input/actions-enhanced.vue" title="文件上传" description="通过插槽添加 UploadButton 增强按钮。" />

## 交互定制

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

### 自定义插槽

Sender 提供了多个插槽位置，方便扩展功能。

<demo vue="../../demos/chat-input/custom-slots.vue" title="自定义插槽" description="在插槽区域添加自定义按钮，如深度思考、网络搜索等功能。" />

### 方法调用

<demo vue="../../demos/chat-input/methods-demo.vue" title="方法调用" description="通过 ref 调用组件方法，如聚焦、设置内容等。" />

## 样式配置

### 组件尺寸

通过 `size` 属性控制组件尺寸，支持 `normal`（默认）和 `small`（紧凑）两种尺寸。

<demo vue="../../demos/chat-input/size.vue" title="组件尺寸" description="支持正常和紧凑两种尺寸，适应不同的使用场景。" />

---

## Props

### 当前支持的 Props

| 属性名 | 说明 | 类型 | 默认值 | 版本 |
|-------|------|------|--------|------|
| modelValue | 绑定值(v-model) | `string` | `''` | - |
| defaultValue | 默认值(非响应式) | `string` | `''` | - |
| placeholder | 输入框占位文本 | `string` | `'请输入内容...'` | - |
| mode | 输入模式 | `'single' \| 'multiple'` | `'single'` | - |
| size @0.4.0 | 组件尺寸 | `'normal' \| 'small'` | `'normal'` | v0.4.0 新增 |
| disabled | 是否禁用 | `boolean` | `false` | - |
| loading | 是否加载中 | `boolean` | `false` | - |
| autofocus | 自动获取焦点 | `boolean` | `false` | - |
| autoSize | 自动调整高度 | `boolean \| { minRows: number, maxRows: number }` | `{ minRows: 1, maxRows: 5 }` | - |
| clearable | 是否可清空 | `boolean` | `false` | - |
| maxLength | 最大输入长度 | `number` | `Infinity` | - |
| showWordLimit | 是否显示字数统计 | `boolean` | `false` | - |
| submitType | 提交方式 | `'enter' \| 'ctrlEnter' \| 'shiftEnter'` | `'enter'` | - |
| stopText | 停止按钮文字 | `string` | `'停止响应'` | - |
| defaultActions @0.4.0 | 默认操作按钮配置 | `DefaultActions` | `undefined` | v0.4.0 新增 |
| extensions @0.4.0 | 扩展列表 (Template, Mention, Suggestion 等) | `Extension[]` | `[]` | v0.4.0 新增 |

### 已移除的 Props (v0.3.0 → v0.4.0) {#已移除的-props}

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

## Slots

### 当前支持的 Slots

| 插槽名称 | 描述 | 作用域参数 |
|---------|------|-----------|
| `header` | 头部插槽，位于输入框上方 | - |
| `prefix` | 前缀插槽，位于输入框左侧 | - |
| `content` @0.4.0 | 内容插槽，用于完全自定义编辑器内容 | `{ editor }` |
| `actions-inline` @0.4.0 | 单行模式下的操作按钮区域 | - |
| `footer` | 底部自定义区域 | `{ editor, hasContent, disabled, loading }` |
| `footer-right` | 底部右侧区域 | - |

### 已移除的 Slots (v0.3.0 → v0.4.0) {#已移除的-slots}

| 插槽名称 | 替代方案 |
|---------|----------|
| `actions` | 改用 `actions-inline` |
| `footer-left` | 改用 `footer` |
| `decorativeContent` | 改用 `disabled` + `content` |

## Events

### 当前支持的 Events

| 事件名 | 说明 | 回调参数 |
|-------|------|----------|
| update:modelValue | 内容更新 | `(value: string)` |
| submit | 提交内容 | `(text: string, data?: any)` |
| clear | 清空内容 | `()` |
| focus | 获得焦点 | `(event: FocusEvent)` |
| blur | 失去焦点 | `(event: FocusEvent)` |
| input | 输入变化 | `(value: string)` |
| cancel @0.4.0 | 取消操作 | `()` |

### 已移除的 Events (v0.3.0 → v0.4.0) {#已移除的-events}

| 事件名 | 替代方案 |
|-------|----------|
| `change` | 使用 `blur` 事件 |
| `files-selected` | 使用 `UploadButton` 的 `select` 事件 |
| `speech-*` | 使用 `VoiceButton` 的对应事件 |
| `suggestion-select` | 使用 `Suggestion` 扩展的 `onSelect` 回调 |

## Methods

### 当前支持的 Methods

| 方法名 | 说明 | 参数 |
|-------|------|------|
| focus | 使输入框获取焦点 | - |
| blur | 使输入框失去焦点 | - |
| clear | 清空输入内容 | - |
| submit | 手动触发提交 | - |
| setContent @0.4.0 | 设置编辑器内容 | `(content: string)` |
| getContent @0.4.0 | 获取编辑器内容 | - |
| cancel @0.4.0 | 手动触发取消 | - |

### 已移除的 Methods (v0.3.0 → v0.4.0) {#已移除的-methods}

| 方法名 | 替代方案 |
|-------|----------|
| `startSpeech` | 使用 `VoiceButton.start()` |
| `stopSpeech` | 使用 `VoiceButton.stop()` |
| `activateTemplateFirstField` | 自动处理，无需调用 |