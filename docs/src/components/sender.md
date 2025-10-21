---
outline: deep
---

# Sender 消息输入框组件

Sender 是一个灵活的输入组件，支持多种输入方式和功能，包括文本输入、语音输入、模板填充等。具有丰富的功能和自定义选项。适用于聊天界面、评论输入、搜索框等多种场景。

## 代码示例

### 基础用法

> 单行模式(`mode="single"`), 适用于简单的输入场景，如搜索框、简短消息输入等。

- **换行说明，在单行模式下**：

- 1.输入文字超出单行宽度限制时，会自动切换至多行模式。

- 2.使用快捷键组合 `shift+enter` 可以直接切换至多行模式

> 多行模式(`mode="multiple"`)适用于较长文本输入，如评论、聊天消息等。

<demo vue="../../demos/sender/Mode.vue" title="基础用法" description="Sender 组件的基础用法，支持单行和多行模式。" />

### 状态控制

#### 加载状态

通过设置`loading`属性控制组件的加载状态，加载状态下输入框将显示加载动画并禁用输入。
在加载状态下，点击加载图标可以取消发送操作，这会触发 `cancel` 事件。

<tr-sender :loading="true" stopText="停止回答" />

```vue
<tr-sender :loading="true" stopText="停止回答" />
```

#### 禁用状态

通过设置`disabled`属性禁用整个组件，禁用状态下无法输入内容或触发任何操作。

<tr-sender :disabled="true" />

```vue
<tr-sender :disabled="true" />
```

### 内容控制

#### 字数限制与统计

通过`maxLength`属性限制输入字符数，搭配`showWordLimit`显示字数统计。
> **注意**：当输入内容超出字数限制时，系统不会自动截断，真实字数会以红色标示，且无法发送。

<tr-sender mode="multiple" :showWordLimit="true" :maxLength="20" defaultValue="测试超出字数限制，当前已经超过了字数限制。"/>

```vue
<tr-sender mode="multiple" :showWordLimit="true" :maxLength="20" defaultValue="测试超出字数限制，当前已经超过了字数限制。"/>
```

#### 自动调整高度

通过`autoSize`属性可以设置输入框是否自动调整高度。当设置为`true`时，输入框会根据内容自动调整高度，适用于需要动态适应内容长度的场景。

**注意**：只对 mode="multiple" 有效。

> 可传入对象，如{ minRows: 2, maxRows: 3 }。

<demo vue="../../demos/sender/AutoSize.vue" title="自动调整高度" description="Sender 组件支持自动调整高度。" />

#### 可清空输入

通过`clearable`属性添加清空按钮，方便用户快速清除输入内容。

<demo vue="../../demos/sender/Clearable.vue" title="清空内容" description="在用户输入内容后才显示，没有内容时自动隐藏" />

### 高级功能

#### 自定义按钮


Sender 组件支持在多行模式下灵活定制底部区域。通过 `footer-left` 和 `footer-right` 插槽，您可以在保留现有功能的同时添加自定义内容。

- `footer-left`: 在字数限制左侧添加自定义内容
- `footer-right`: 在操作按钮左侧添加自定义内容
- `footer`: 完全自定义底部区域（会覆盖默认内容，仅用于向后兼容）

<demo vue="../../demos/sender/DeepThink.vue" title="自定义按钮" description="Sender 组件支持在多行模式下灵活定制底部区域。" />

注意：`footer` 插槽与 `footer-left`/`footer-right` 插槽互斥，如果同时使用，将优先显示 `footer-left`/`footer-right` 插槽。

#### 语音输入

启用`allowSpeech`支持语音输入功能，用户可以通过语音录入文本。

- 混合模式：用户可以先用键盘输入部分内容，然后通过语音继续补充，自动停止录音。

- 连续语音输入：用户可以连续录入语音，系统会自动将语音转换为文本，点击按钮手动停止录音。

<demo vue="../../demos/sender/voiceInput.vue" title="语音输入" description="可以使用 speech 属性进行配置" />

#### 消息提示

此功能适用于需要在输入框内显示提示信息并引导用户操作的场景，如：

- **1. 服务状态提示**
- **2. 快捷操作链接**
- **3. 功能引导等**

当使用 `decorativeContent` 插槽时，输入框会自动被禁用，仅展示插槽内容，无法输入文本或触发发送操作。

<demo vue="../../demos/sender/DecorativeContent.vue" title="装饰性内容示例" description="在输入框内显示装饰性内容和可点击链接，可用于服务状态提示、功能引导等场景。" />

#### 文件上传

支持附件上传功能，可通过`allowFiles`控制。

结合 `buttonGroup` 属性，您可以实现更复杂的交互逻辑。例如，通过监听 `files-selected` 事件返回的文件列表，动态地禁用上传按钮或提交按钮，并更新其 `tooltips` 提示信息，以引导用户操作。

**自定义 Tooltip 位置**

通过 `buttonGroup.file.tooltipPlacement` 属性可以自定义文件上传按钮的 tooltip 弹窗位置：

```vue
<tr-sender 
  :allowFiles="true" 
  :buttonGroup="{
    file: {
      tooltips: '点击上传文件',
      tooltipPlacement: 'bottom' // 自定义 tooltip 位置
    }
  }"
/>
```

支持的位置选项：`'top'` | `'top-start'` | `'top-end'` | `'bottom'` | `'bottom-start'` | `'bottom-end'` | `'left'` | `'left-start'` | `'left-end'` | `'right'` | `'right-start'` | `'right-end'`

默认值为 `'top'`。

<demo vue="../../demos/sender/FileUpload.vue" title="文件上传" description="Sender 组件支持文件上传功能，并可通过 buttonGroup 动态控制按钮状态。" />

#### 模版填充

通过 `templateData` prop 实现模板的动态设置与双向绑定。推荐使用 `v-model:templateData` 的语法糖。

该功能加载后，光标会自动聚焦在第一个可编辑的模板字段上，方便用户直接开始编辑。

**模板示例**

<demo vue="../../demos/sender/Template.vue" title="模板填充示例" description="Sender 组件支持模板填充，展示动态模板切换功能。" />

**备注**
`templateData` prop 接收一个 `UserItem[]` 类型的数组。
`UserItem` 的结构为 `{ type: 'text', content: string }` 或 `{ type: 'template', content: string }`。
当 `type` 为 `'template'` 时，对应的 `content` 会渲染为一个可编辑的模板字段。

#### 输入联想

Sender 组件支持输入联想功能，当用户输入时，可以根据提供的 `suggestions` 列表显示匹配的建议项。此功能有助于提高输入效率和准确性。

**核心特性:**
- **Tab 提示器**: 仅在有联想数据且输入框有内容时显示，提示用户可按 Tab 选择。
- **输入框补全**: 用户输入部分正常显示，联想到的补全部分以半透明灰色文本展示。

- **键盘交互**:
    - `↑`/`↓`: 在联想弹窗中导航。
    - `Tab`/`Enter`: 确认当前高亮的联想项（可通过 `activeSuggestionKeys` 属性自定义）。
    - `Esc`: 关闭联想弹窗。

> **注意**: 输入框内的补全文本特性在匹配到联想项的前置字符时显示，否则不显示。

**高亮匹配模式**

Sender 组件支持三种高亮匹配模式，通过 `suggestions` 属性实现：

1. **自动匹配高亮**（默认）：直接传入字符串数组到 `suggestions` 属性，组件会根据用户输入自动高亮匹配部分。
   ```vue
   <tr-sender :suggestions="['你好世界', '你好中国', '你好北京']" />
   ```

2. **精确指定高亮**：传入对象数组到 `suggestions` 属性，通过 `content` 和 `highlights` 字段精确指定要高亮的文本片段。
   ```vue
   <tr-sender :suggestions="[
     { content: '你好世界', highlights: ['你好'] },
     { content: '你好中国', highlights: ['中国'] },
     { content: '你好北京', highlights: ['你好', '北京'] }
   ]" />
   ```

3. **完全自定义高亮**：传入对象数组到 `suggestions` 属性，`highlights` 字段为函数，可完全自定义高亮逻辑。
   ```vue
   <tr-sender :suggestions="[
    { 
      content: '你好世界',
      // 自定义高亮：根据输入内容高亮匹配部分
      highlights: (content, input) => {
        // 简单示例：输入"你"时高亮"你好"
        if (input === '你') {
          return [
            { text: '你', isMatch: true },
            { text: '好世界', isMatch: false }
          ]
        }
        return [{ text: content, isMatch: false }]
      }
    }
   ]" />
   ```

> **优先级**：完全自定义高亮 > 精确指定高亮 > 自动匹配高亮

<demo vue="../../demos/sender/Suggestions.vue" title="输入联想示例" description="展示 Sender 组件的输入联想功能。" />

#### 自定义提交方式

通过`submitType`属性控制提交方式，支持多种键盘快捷键组合。

- 提交行为说明：
- - 当 submitType 为 enter 时：按 Enter 键提交
- - 当 submitType 为 ctrlEnter 时：按 Ctrl+Enter 提交，单独按 Enter 换行
- - 当 submitType 为 shiftEnter 时：按 Shift+Enter 提交，单独按 Enter 换行

这些快捷键适用于不同的使用习惯和操作系统，方便用户根据自己的喜好选择提交方式。

<tr-sender submitType="ctrlEnter" mode="multiple" placeholder="按Ctrl+Enter提交" />

```vue
<tr-sender submitType="ctrlEnter" mode="multiple" placeholder="按Ctrl+Enter提交" />
```

<tr-sender submitType="shiftEnter" mode="multiple" placeholder="按Shift+Enter提交" />

```vue
<tr-sender submitType="shiftEnter" mode="multiple" placeholder="按Shift+Enter提交" />
```

使用不同的提交方式可以适应不同的使用场景：

- 聊天应用通常使用`enter`快速提交消息
- 多行文本编辑时，使用`ctrl+enter`或`shift+enter`可避免误提交
- 代码编辑器类应用通常使用`ctrl+enter`提交，保持编辑文本的结构

### 键盘快捷键支持

Sender 组件支持多种键盘快捷键操作，提高用户输入效率：

| 快捷键      | 功能                      | 适用条件                       |
| ----------- | ------------------------- | ------------------------------ |
| Enter       | 提交内容 / 选中联想项     | submitType="enter"（默认） / 联想弹窗开启时 |
| Ctrl+Enter  | 提交内容                  | submitType="ctrlEnter"(多行)   |
| Shift+Enter | 提交内容                  | submitType="shiftEnter"(多行)  |
| Tab         | 选中联想项                | 联想弹窗开启并有联想数据时     |
| Esc         | 取消语音/关闭联想/建议    | 对应功能激活时                |
| ↑ / ↓       | 导航联想项                | 联想弹窗开启时                 |

**自定义选中按键**：可以通过 `activeSuggestionKeys` 属性自定义选中联想项的按键，默认值为 `['Enter', 'Tab']`。例如设置为 `['Tab']` 可仅使用 Tab 键选中联想项。  
注意：请勿使用纯修饰键（如 `Control`/`Shift`/`Alt`/`Meta`）作为选中按键，否则会劫持常见快捷键（如 Ctrl+C/Ctrl+V/Ctrl+A）。

您可以在实际开发中根据应用场景和用户需求选择最适合的快捷键方式。

### 布局与插槽

以下是一个关于插槽的综合使用示例：

<demo vue="../../demos/sender/All.vue" />

### 紧凑模式配置

Sender 组件支持紧凑模式，适用于空间受限的场景。通过添加 `tr-sender-compact` CSS类可以启用紧凑样式。

紧凑模式的特点：
- 较小的字体和输入框（14px vs 16px）
- 更紧凑的内边距和间距
- 更小的图标尺寸（32px vs 36px）
- 更小的圆角（24px vs 26px）

**使用方式：**

```vue
<!-- 默认样式（宽松模式） -->
<TrSender />

<!-- 紧凑模式 -->
<TrSender class="tr-sender-compact" />
```

<demo vue="../../demos/sender/CompactMode.vue" />

## API 说明

### Props

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


### Events

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

### Methods

| 方法名                     | 说明                     | 参数 | 返回值          |
| -------------------------- | ------------------------ | ---- | --------------- |
| focus                      | 使输入框获取焦点         | -    | `void`          |
| blur                       | 使输入框失去焦点         | -    | `void`          |
| clear                      | 清空输入内容             | -    | `void`          |
| submit                     | 手动触发提交事件         | -    | `void`          |
| startSpeech                | 开始语音识别             | -    | `Promise<void>` |
| stopSpeech                 | 停止语音识别             | -    | `void`          |
| activateTemplateFirstField | 激活模板的第一个输入字段 | -    | `void`          |

### Slots

组件布局结构如下：

```
+----------------------+
|      header slot     |  <!-- 位于内容区域上方 -->
+----------------------+
| prefix |   content   | actions  <!-- 横向排列 -->
| slot   |    area     | slot
+----------------------+
|footer-left | footer-right|  <!-- 底部左右两侧区域 -->
+----------------------+
```

| 插槽名称          | 描述                             | CSS类名                           | 默认内容                |
| ----------------- | -------------------------------- | --------------------------------- | ----------------------- |
| `header`          | 头部插槽，位于输入框上方         | `.tiny-sender__header-slot`       | 无                      |
| `prefix`          | 前缀插槽，位于输入框左侧         | `.tiny-sender__prefix-slot`       | 无                      |
| `actions`         | 后缀插槽，位于输入框右侧         | `.tiny-sender__actions-slot`      | 单行模式下的操作按钮    |
| `footer-left`     | 底部左侧插槽，保留字数限制       | `.tiny-sender__footer-left`       | 字数限制                |
| `footer-right`    | 底部右侧插槽，保留操作按钮       | `.tiny-sender__footer-right`      | 多行模式下的操作按钮    |
| `footer`          | 底部完全自定义插槽(向后兼容)     | `.tiny-sender__footer-slot`       | 无 (会覆盖其他底部元素) |
| `decorativeContent` | 装饰性内容插槽，启用后禁止输入 | `.tiny-sender__decorative-content` | 无                      |

### Types

```typescript
interface SpeechConfig {
  lang?: string // 识别语言，默认浏览器语言
  continuous?: boolean // 是否持续识别
  interimResults?: boolean // 是否返回中间结果
  autoReplace?: boolean // 是否自动替换当前输入内容
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

interface ButtonGroupConfig {
  file?: ControlState & fileUploadConfig // 文件上传按钮
  submit?: ControlState // 提交按钮
  // 后续可扩展至其他按钮...
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