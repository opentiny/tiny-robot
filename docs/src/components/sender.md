---
outline: deep 
---

# Sender 消息输入框

Sender 是一个功能丰富的输入组件，支持文本输入、语音识别、文件上传、模板填充等多种输入方式。适用于聊天界面、评论输入、表单填写等场景。

## 功能导航

- [基础功能](#基础功能) - 模式切换、状态控制、内容管理
- [输入增强](#输入增强) - 语音输入、文件上传、模板填充、智能联想
- [交互定制](#交互定制) - 快捷键、自定义按钮、插槽布局
- [样式配置](#样式配置) - 紧凑模式

## 基础功能

### 输入模式

Sender 支持单行和多行两种输入模式，通过 `mode` 属性控制。

:::tip 单行模式自动切换
在单行模式下，当输入内容超出宽度或按 `Shift+Enter` 时，会自动切换为多行模式。
:::

<demo vue="../../demos/sender/Mode.vue" title="输入模式" description="支持单行和多行模式，单行模式可自动切换为多行。" />

### 状态控制

通过 `loading` 和 `disabled` 属性控制组件状态。加载状态下可点击图标取消操作。

<demo vue="../../demos/sender/States.vue" title="加载与禁用状态" description="展示加载和禁用两种状态的表现。" />

### 内容管理

#### 字数限制

通过 `maxLength` 和 `showWordLimit` 属性实现字数限制和统计。

:::warning 超出限制行为
超出字数限制时，不会自动截断内容，但会以红色标示真实字数，且无法提交。
:::

<demo vue="../../demos/sender/WordLimit.vue" title="字数限制" description="限制输入字符数并显示字数统计。" />

#### 高度自适应

通过 `autoSize` 属性设置输入框根据内容自动调整高度（仅多行模式有效）。

<demo vue="../../demos/sender/AutoSize.vue" title="自动调整高度" description="输入框高度随内容自动调整，可配置最小/最大行数。" />

#### 快速清空

通过 `clearable` 属性添加清空按钮，有内容时自动显示。

<demo vue="../../demos/sender/Clearable.vue" title="清空内容" description="添加清空按钮，快速清除输入内容。" />

## 输入增强

### 语音输入

#### 基础语音识别

启用 `allowSpeech` 支持浏览器内置的语音识别功能。

<demo vue="../../demos/sender/voiceInput.vue" title="基础语音输入" description="使用浏览器内置语音识别，支持混合输入和连续识别。" />

#### 自定义语音服务

支持集成第三方语音识别服务（如阿里云、百度、Azure 等）。

<demo vue="../../demos/sender/CustomSpeech.vue" :vueFiles="['../../demos/sender/CustomSpeech.vue', '../../demos/sender/speechHandlers.ts']" title="自定义语音识别" description="集成第三方语音识别服务，参考 speechHandlers.ts 查看完整实现。" />

:::tip 参考实现
`speechHandlers.ts` 提供了阿里云一句话识别和实时识别的完整示例，包括录音处理、API 调用、流式识别等。
:::

#### 自定义录音 UI

支持完全自定义语音录制界面，适用于移动端按住说话等场景。

<demo vue="../../demos/sender/CustomRecordingUI.vue" title="移动端按住说话" description="自定义录音 UI，展示移动端按住说话的交互模式。" :vueFiles="['../../demos/sender/CustomRecordingUI.vue', '../../demos/sender/PressToTalkOverlay.vue']" />

### 文件上传

通过 `allowFiles` 启用文件上传，结合 `buttonGroup` 可动态控制按钮状态和提示。

<demo vue="../../demos/sender/FileUpload.vue" title="文件上传" description="支持文件上传，可动态控制按钮状态和 tooltip 位置。" />

### 模板填充

通过 `v-model:templateData` 实现模板的动态设置，光标自动聚焦到第一个可编辑字段。

<demo vue="../../demos/sender/Template.vue" title="模板填充" description="支持动态模板切换，自动聚焦可编辑字段。" />

### 智能联想

根据用户输入显示匹配的建议项，支持键盘导航（↑↓ 选择，Enter/Tab 确认）和多种高亮模式。

<demo vue="../../demos/sender/Suggestions.vue" title="智能联想" description="动态切换三种高亮模式，对比不同的高亮效果。" />

:::tip 高亮模式
- **自动匹配**：传入对象数组，自动高亮与输入内容匹配的部分
- **精确指定**：通过 `highlights` 数组精确指定需要高亮的文本片段
- **自定义函数**：通过 `highlights` 函数完全控制高亮逻辑，实现复杂的高亮规则
:::

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
  return allSuggestions.filter(item => 
    item.content.toLowerCase().includes(inputText.value.toLowerCase())
  )
})
</script>

<template>
  <tr-sender v-model="inputText" :suggestions="filteredSuggestions" />
</template>
```
:::

:::info 激活按键配置
默认使用 `Enter` 和 `Tab` 键选中联想项，可通过 `activeSuggestionKeys` 属性自定义激活按键。详见 [快捷键参考](#快捷键参考)。
:::

## 交互定制

### 提交方式

通过 `submitType` 属性控制提交快捷键，支持 `enter`、`ctrlEnter`、`shiftEnter` 三种方式。

<demo vue="../../demos/sender/ShortcutSubmit.vue" title="提交方式" description="支持三种提交快捷键，适应不同使用场景。" />

### 快捷键参考

| 快捷键      | 功能                      | 适用条件                       |
| ----------- | ------------------------- | ------------------------------ |
| Enter       | 提交内容 / 选中联想项     | submitType="enter" / 联想开启时 |
| Ctrl+Enter  | 提交内容                  | submitType="ctrlEnter"         |
| Shift+Enter | 提交内容                  | submitType="shiftEnter"        |
| Tab         | 选中联想项                | 联想开启时                     |
| Esc         | 取消语音/关闭联想         | 对应功能激活时                 |
| ↑ / ↓       | 导航联想项                | 联想开启时                     |

:::warning 自定义选中按键
通过 `activeSuggestionKeys` 可自定义选中联想项的按键，但请勿使用纯修饰键（Ctrl/Shift/Alt/Meta），避免劫持常用快捷键。
:::

### 自定义按钮

通过 `footer-left` 和 `footer-right` 插槽在底部区域添加自定义按钮。

<demo vue="../../demos/sender/DeepThink.vue" title="自定义按钮" description="在底部区域添加自定义按钮，保留原有功能。" />

### 插槽布局

综合展示各种插槽的使用方式：

<demo vue="../../demos/sender/All.vue" title="插槽综合示例" description="展示 header、prefix、actions、footer 等插槽的使用。" />

### 装饰性内容

在输入框内显示提示信息，适用于服务状态提示、功能引导等场景。

:::tip 自动禁用
使用 `decorativeContent` 插槽时，输入框会自动禁用，仅展示插槽内容。
:::

<demo vue="../../demos/sender/DecorativeContent.vue" title="装饰性内容" description="在输入框内显示提示信息和可点击链接。" />

## 样式配置

### 紧凑模式

通过添加 `tr-sender-compact` CSS 类启用紧凑模式，适用于空间受限的场景。

<demo vue="../../demos/sender/CompactMode.vue" title="紧凑模式" description="更小的字体、间距和图标，适合空间受限的场景。" />

---


## Props

| 属性名               | 说明                     | 类型                                                    | 默认值            |
| -------------------- | ------------------------ | ------------------------------------------------------- | ----------------- |
| autofocus            | 自动获取焦点             | `boolean`                                               | `false`           |
| autoSize             | 自动调整高度             | `boolean \| { minRows: number, maxRows: number }` | `false`           |
| allowSpeech          | 是否开启语音输入         | `boolean`                                               | `false`           |
| allowFiles           | 是否允许文件上传         | `boolean`                                               | `true`            |
| clearable            | 是否可清空               | `boolean`                                               | `false`           |
| disabled             | 是否禁用                 | `boolean`                                               | `false`           |
| modelValue           | 绑定值(v-model)          | `string`                                                | `''`              |
| defaultValue         | 默认值(非响应式)         | `string`                                                | `''`              |
| loading              | 是否加载中               | `boolean`                                               | `false`           |
| mode                 | 输入框类型               | `'single' \| 'multiple'`                                | `'single'`        |
| maxLength            | 最大输入长度             | `number`                                                | `Infinity`        |
| buttonGroup          | 按钮组配置               | `ButtonGroupConfig`                                     | `{}`              |
| placeholder          | 输入框占位文本           | `string`                                                | `'请输入内容...'` |
| speech               | 语音识别配置             | `'boolean' \| 'SpeechConfig'`                           | 无                |
| showWordLimit        | 是否显示字数统计         | `boolean`                                               | `false`           |
| stopText             | 停止按钮文字             | `string`                                                | `仅显示图标`      |
| submitType           | 提交方式                 | `'enter' \| 'ctrl+enter' \| 'shift+enter'`              | `'enter'`         |
| theme                | 主题样式                 | `'light' \| 'dark'`                                     | `'light'`         |
| suggestions          | 输入建议列表             | `(string \| SuggestionItem)[]`                          | `[]`              |
| suggestionPopupWidth | 输入建议弹窗宽度         | `'number' \| 'string'`                                                 | `400px`             |
| activeSuggestionKeys | 激活建议项的按键         | `string[]`                                              | `['Enter', 'Tab']` |
| templateData         | 模板数据，用于初始化或 v-model 更新 | `UserItem[]`                                            | `[]`              |


## Slots


| 插槽名称          | 描述                             | 默认内容                |
| ----------------- | -------------------------------- | ----------------------- |
| `header`          | 头部插槽，位于输入框上方         | 无                      |
| `prefix`          | 前缀插槽，位于输入框左侧         | 无                      |
| `actions`         | 后缀插槽，位于输入框右侧         | 单行模式下的操作按钮    |
| `content`         | 内容插槽                         | 输入内容区域            |
| `footer-left`     | 底部左侧插槽，保留字数限制       | 字数限制                |
| `footer-right`    | 底部右侧插槽，保留操作按钮       | 多行模式下的操作按钮    |
| `footer`          | 底部完全自定义插槽(向后兼容)     | 无 (会覆盖其他底部元素) |
| `decorativeContent` | 装饰性内容插槽，启用后禁止输入 | 无                      |

## Events

| 事件名            | 说明                       | 回调参数               |
| ----------------- | -------------------------- | ---------------------- |
| update:modelValue | 输入值变化时触发(v-model)  | `(value: string)`      |
| blur              | 输入框失去焦点时触发       | `(event: FocusEvent)`  |
| change            | 输入值改变且失焦时触发     | `(value: string)`      |
| focus             | 输入框获得焦点时触发       | `(event: FocusEvent)`  |
| input             | 输入值改变时触发           | `(value: string)`      |
| submit            | 提交内容时触发             | `(value: string)`      |
| clear             | 清空内容时触发             | `()`                   |
| cancel            | 取消发送（加载状态）时触发 | `()`                   |
| speech-start      | 语音识别开始时触发         | `()`                   |
| speech-end        | 语音识别结束时触发         | `(transcript: string)` |
| speech-interim    | 语音识别中间结果时触发     | `(transcript: string)` |
| speech-error      | 语音识别错误时触发         | `(error: Error)`       |
| suggestion-select | 选择输入建议时触发         | `(value: string)`      |

## Methods

| 方法名                     | 说明                     | 参数 | 返回值          |
| -------------------------- | ------------------------ | ---- | --------------- |
| focus                      | 使输入框获取焦点         | -    | `void`          |
| blur                       | 使输入框失去焦点         | -    | `void`          |
| clear                      | 清空输入内容             | -    | `void`          |
| submit                     | 手动触发提交事件         | -    | `void`          |
| startSpeech                | 开始语音识别             | -    | `Promise<void>` |
| stopSpeech                 | 停止语音识别             | -    | `void`          |
| activateTemplateFirstField | 激活模板的第一个输入字段 | -    | `void`          |

## Types
```typescript
// 语音回调函数集合
interface SpeechCallbacks {
  onStart: () => void
  onInterim: (transcript: string) => void
  onFinal: (transcript: string) => void
  onEnd: (transcript?: string) => void
  onError: (error: Error) => void
}

// 自定义语音处理器接口
interface SpeechHandler {
  start: (callbacks: SpeechCallbacks) => Promise<void> | void
  stop: () => Promise<void> | void
  isSupported: () => boolean
}
interface SpeechConfig {
  customHandler?: SpeechHandler // 自定义语音处理器
  lang?: string // 识别语言，默认浏览器语言
  continuous?: boolean // 是否持续识别
  interimResults?: boolean // 是否返回中间结果
  autoReplace?: boolean // 是否自动替换当前输入内容
  onVoiceButtonClick?: (isRecording: boolean, preventDefault: () => void) => void | Promise<void> // 录音按钮点击拦截器
}
```

```typescript
export interface ControlState {
  tooltips?: string | Function // 工具提示
  disabled?: boolean // 是否禁用
  tooltipPlacement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end' // tooltip 弹窗位置
}

interface fileUploadConfig {
  accept?: string // 接受的文件类型
  multiple?: boolean // 是否支持多选文件
  reset?: boolean // 是否重置文件选择
}

interface VoiceButtonConfig {
  icon?: VNode | Component // 自定义语音图标（未录音状态）
}

interface ButtonGroupConfig {
  file?: ControlState & fileUploadConfig // 文件上传按钮
  submit?: ControlState // 提交按钮
  voice?: VoiceButtonConfig // 语音按钮
}
```

```typescript
// 高亮文本片段类型
interface SuggestionTextPart {
  text: string;  // 文本片段
  isMatch: boolean;  // 是否高亮
}

// 高亮函数类型
type HighlightFunction = (suggestionText: string, inputText: string) => SuggestionTextPart[]

// 建议项类型
type SuggestionItem = string | {
  content: string;  // 建议项文本内容
  highlights?: string[] | HighlightFunction;  // 高亮方式
}
``` 