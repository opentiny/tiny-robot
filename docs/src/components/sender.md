---
outline: [1, 4]
---

# Sender 消息输入框

## 概览

Sender 是面向聊天场景的可组合输入组件，负责文本编辑、提交和取消交互，并可通过扩展、插槽和独立操作按钮接入联想、提及、模板、语音与附件能力。

### 适用场景

- 聊天或 AI 应用需要可控的文本输入与提交入口
- 输入区需要组合模板、提及、联想、语音或附件能力
- 应用需要接收结构化输入或额外提交内容，并自行管理发送流程

Sender 不负责消息列表、文件上传请求或 AI 响应状态本身。应用需要处理 `submit`、`cancel` 等事件，并把外部状态通过 Props 同步回来。

## 用法示例

绑定输入内容并监听 `submit`。示例会在页面中展示已提交文本，并由父组件清空受控值。

<demo vue="../../demos/sender/basic.vue" title="基础消息提交" description="绑定输入内容，提交后在页面中显示结果并清空输入框。" />

### 输入与状态

#### 输入模式

Sender 支持单行和多行两种输入模式，通过 `mode` 属性控制。

:::tip 单行模式自动切换
在单行模式下，当输入内容超出宽度时，会自动切换为多行模式。

当 `submitType="enter"` 时，按 `Ctrl+Enter` 或 `Shift+Enter` 也会自动切换为多行模式并换行。
:::

<demo vue="../../demos/sender/mode-switch.vue" title="输入模式" description="支持单行和多行模式，单行模式可自动切换为多行。" />

#### 加载、禁用与取消

通过 `loading` 和 `disabled` 属性控制组件状态。加载状态下可点击停止按钮触发 `cancel` 事件；应用需要终止外部任务，并把新的 `loading` 状态同步回组件。

<demo vue="../../demos/sender/loading-state.vue" title="加载、禁用与取消" description="展示加载与禁用状态，并模拟提交完成和取消处理。" />

#### 字数限制

通过 `maxLength` 和 `showWordLimit` 属性实现字数限制和统计。

:::warning 超出限制行为
超出字数限制时，不会自动截断内容，但会以红色标示真实字数，且无法提交。
:::

<demo vue="../../demos/sender/word-limit.vue" title="字数限制" description="限制输入字符数并显示字数统计。" />

### 扩展输入能力

Sender 采用可插拔的扩展架构，通过 `extensions` prop 灵活添加功能。所有扩展都支持响应式数据自动同步。

#### 扩展配置

提供两种集成方式：

```typescript
import { TrSender } from '@opentiny/tiny-robot'

// 便捷函数（推荐）
TrSender.mention(mentions, '@')
TrSender.suggestion(suggestions) // 不过滤
TrSender.suggestion(suggestions, { filterFn: customFilter }) // 自定义过滤
TrSender.template(templates)
TrSender.template(templates, { appendTo: '.chat-window' })

// 标准配置（用于复杂场景）
TrSender.Mention.configure({ items: mentions, char: '@', allowSpaces: false })
TrSender.Suggestion.configure({ items: suggestions, filterFn: customFilter })
```

#### 模板编辑

使用 `Template` 扩展实现模板填充功能，支持动态设置模板内容，光标自动聚焦到第一个可编辑字段。

:::tip 响应式数据
通过 `items` 配置项传入响应式 ref，模板数据变化时会自动更新编辑器内容。
:::

<demo vue="../../demos/sender/template-editor.vue" title="模板填充" description="支持动态模板切换，自动聚焦可编辑字段。" />

**配置详见**：[Template 配置](#template-配置)

#### 提及功能

使用 `Mention` 扩展实现 @提及功能，输入触发字符（默认 `@`）触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。

:::tip 自定义触发字符
支持自定义触发字符，例如使用 `#` 代替 `@`。配置 `char: '#'` 后，输入 `#` 即可触发提及列表，选中后显示为 `#标签名` 的格式。
:::

:::tip 删除提及
按 `Backspace` 删除提及项时会保留触发字符（如 `@` 或 `#`），可继续选择其他项。
:::

<demo vue="../../demos/sender/mention.vue" title="提及功能" description="输入 @ 触发提及选择，快速引用预设的助手或对象，支持键盘导航和搜索过滤。" />

**配置详见**：[Mention 配置](#mention-配置)

**结构化数据**：[submit 事件 - 结构化数据说明](#结构化数据)

#### 智能联想

使用 `Suggestion` 扩展实现智能联想功能，支持键盘导航（↑↓ 选择，Enter 确认）和自动补全提示。

:::tip 自动补全提示
选中建议项时，输入框会以灰色文本显示剩余部分，并显示 "TAB" 提示，按 Tab 键快速应用补全。
:::

**基础用法**

不传 `filterFn` 时，直接显示所有建议项，不做任何过滤。

<demo vue="../../demos/sender/suggestion-basic.vue" title="基础用法" description="直接显示所有建议项，不过滤。" />

**自定义过滤**

通过 `filterFn` 自定义过滤逻辑，实现模糊匹配、前缀匹配等。

<demo vue="../../demos/sender/suggestion-filter.vue" title="自定义过滤" description="使用 filterFn 实现自定义过滤逻辑。" />

**高亮模式**

支持三种高亮模式，满足不同的使用场景：

1. **自动匹配**：不设置 `highlights`，自动高亮与输入内容匹配的部分
2. **精确指定**：通过 `highlights` 数组精确指定需要高亮的文本片段
3. **自定义函数**：通过 `highlights` 函数完全控制高亮逻辑，实现复杂的高亮规则

<demo vue="../../demos/sender/suggestion-highlight.vue" title="高亮模式" description="动态切换三种高亮模式，对比不同的高亮效果。" />

**配置详见**：[Suggestion 配置](#suggestion-配置)

### 语音输入与服务集成

通过 `VoiceButton` 组件实现语音输入功能，支持浏览器内置语音识别和第三方语音识别服务。

:::tip 组件化设计
语音输入功能通过独立的 `VoiceButton` 组件实现，可按需添加到 `footer` 插槽中，无需额外配置。
:::

#### 基础语音交互

`auto-insert` 默认为 `true`，会把最终识别结果插入编辑器；关闭后，应用可以只通过 `speech-final` 接收结果并自行决定后续处理。

<demo
  vue="../../demos/sender/voice-input.vue"
  :vueFiles="['../../demos/sender/voice-input.vue', '../../demos/sender/mockSpeechHandler.ts']"
  title="基础语音输入"
  description="使用本地 Mock 处理器对比自动写入编辑器和仅接收识别事件。"
/>

浏览器内置处理器是 `VoiceButton` 在未传 `customHandler` 时的默认实现。它会请求麦克风权限，且可用性取决于浏览器；正式产品应处理不支持、拒绝授权和识别失败等情况。

#### 第三方语音服务

支持集成第三方语音识别服务（如阿里云、百度、Azure 等）。这是高级集成示例，需要应用提供服务端代理、鉴权信息和浏览器录音权限，不属于基础使用的运行前提。

<demo vue="../../demos/sender/voice-custom.vue" :vueFiles="['../../demos/sender/voice-custom.vue', '../../demos/sender/speechHandlers.ts']" title="自定义语音识别" description="先用本地 Mock handler 验证接入流程，再参考 speechHandlers.ts 接入受保护的服务端代理。" />

:::warning 参考实现不是可直接部署的服务
`speechHandlers.ts` 展示阿里云一句话识别和实时识别所需的录音、API 调用与流式处理结构。示例中的代理地址和鉴权信息都是占位配置，应用必须在服务端保护凭据并实现对应代理。
:::

#### 自定义录音 UI

支持完全自定义语音录制界面，适用于移动端按住说话等场景。

<demo vue="../../demos/sender/voice-custom-ui.vue" title="移动端按住说话" description="自定义录音 UI，展示移动端按住说话的交互模式。" />

**配置详见**：[VoiceButton 属性](#voicebutton)

### 操作按钮与外部内容

#### 默认按钮配置

通过 `defaultActions` 属性统一配置默认按钮（Clear、Submit）的状态和提示。

<demo vue="../../demos/sender/actions-config-basic.vue" title="默认按钮配置" description="通过 defaultActions 统一配置默认按钮的状态和提示。" />

#### 增强按钮

通过插槽添加增强按钮（Upload、Voice 等），每个按钮都有独立的配置。

<demo
  vue="../../demos/sender/actions-enhanced.vue"
  :vueFiles="['../../demos/sender/actions-enhanced.vue', '../../demos/sender/mockSpeechHandler.ts']"
  title="增强按钮"
  description="通过插槽添加 Upload、Voice 等增强按钮；语音按钮使用本地 Mock，上传内容随消息提交见下方示例。"
/>

**配置详见**：[UploadButton 属性](#uploadbutton)、[VoiceButton 属性](#voicebutton)

#### 上传内容

附件、图片等内容通常由上传按钮或独立列表维护，不会写入 Sender 的编辑器文本。把 `TrAttachments` 放在 `TrSender` 内时会自动注册提交数据；提交时可从 `extra.externalPayloads` 中读取 `source="attachments"` 的 payload，其值为原样透传的 `Attachment[]`，具体过滤或上传失败提示由应用处理。自定义外部内容组件也可以通过 `useSenderContentRegistration` 注册数据。

:::warning 兼容说明
`hasExternalContent` 仍可用于控制外部内容场景的可提交状态，但不会生成 `externalPayloads`。
:::

<demo vue="../../demos/sender/attachments-in-sender.vue" title="输入框内附件列表" description="使用 Attachments 在 Sender 内展示和管理附件，并随消息一起提交。" />

### 交互与状态管理

#### 提交方式

通过 `submitType` 属性控制提交快捷键，支持 `enter`、`ctrlEnter`、`shiftEnter` 三种方式。

<demo vue="../../demos/sender/submit-type.vue" title="提交方式" description="支持三种提交快捷键，适应不同使用场景。" />

#### 快捷键参考

| 快捷键      | 功能             | 适用条件                                     |
| ----------- | ---------------- | -------------------------------------------- |
| Enter       | 提交内容 / 换行  | submitType="enter"                           |
| Ctrl+Enter  | 提交内容 / 换行  | submitType="ctrlEnter" / submitType="enter"  |
| Shift+Enter | 提交内容 / 换行  | submitType="shiftEnter" / submitType="enter" |
| Tab         | 应用自动补全文本 | 联想开启且存在自动补全文本时                 |
| Esc         | 关闭联想         | 联想开启时                                   |
| ↑ / ↓       | 导航联想项       | 联想开启时                                   |

:::info 换行与提交行为说明

- **`submitType="enter"`** 时：按 `Enter` 提交，按 `Ctrl+Enter` 或 `Shift+Enter` 换行
- **`submitType="ctrlEnter"`** 时：按 `Ctrl+Enter` 提交，按 `Enter` 换行
- **`submitType="shiftEnter"`** 时：按 `Shift+Enter` 提交，按 `Enter` 换行

在单行模式下使用换行快捷键时，会自动切换为多行模式。
:::

:::tip 自定义选中按键
通过 `activeSuggestionKeys` 可自定义选中联想项的按键，默认只有 `Enter`。`Tab` 专门用于应用灰色提示中的自动补全文本，不受 `activeSuggestionKeys` 控制。
:::

#### 自定义插槽

Sender 提供了多个插槽位置，方便扩展功能：

- **`header`** - 顶部区域，可添加标题、提示信息等
- **`prefix`** - 输入框前缀区域，可添加图标、标签等（位于输入框内部）
- **`footer`** - 底部左侧区域，可添加功能按钮
- **`footer-right`** - 底部右侧区域，可添加操作按钮

:::info 当前插槽作用域
当前版本只有 `content` 插槽提供 `editor`。`actions-inline`、`footer` 和 `footer-right` 只负责放置内容，不提供作用域参数；需要操作输入内容时，请通过 Sender 实例公开的方法接入。
:::

<demo vue="../../demos/sender/custom-slots.vue" title="自定义插槽" description="在插槽区域添加自定义按钮，如深度思考、网络搜索等功能。" />

#### 方法调用

<demo vue="../../demos/sender/methods-demo.vue" title="方法调用" description="通过 ref 调用组件方法，如聚焦、设置内容等。" />

### 组合、主题与尺寸

#### 主题继承

:::tip 主题继承
主题会根据父级 `ThemeProvider` 的配置自动继承，无需重复设置。
:::

#### 组件尺寸

通过 `size` 属性控制组件尺寸，支持 `normal`（默认）和 `small`（紧凑）两种尺寸。

<demo vue="../../demos/sender/size.vue" title="组件尺寸" description="支持正常和紧凑两种尺寸，适应不同的使用场景。" />

---

## API

### 公开导出

| 导出                                              | 用途与约束                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| `TrSender` / `Sender`                             | 消息输入主组件；静态提供 `Template`、`Mention`、`Suggestion` 及对应便捷工厂 |
| `TrActionButton` / `ActionButton`                 | 可独立使用的基础图标按钮                                                    |
| `TrUploadButton` / `UploadButton`                 | 文件选择按钮；必须放在 Sender 组件树内以读取禁用状态                        |
| `TrVoiceButton` / `VoiceButton`                   | 语音输入按钮；必须放在 Sender 组件树内以访问编辑器和禁用状态                |
| `TrSubmitButton` / `SubmitButton`                 | 默认提交 / 停止按钮；依赖 Sender Context                                    |
| `TrClearButton` / `ClearButton`                   | 默认清空按钮；依赖 Sender Context                                           |
| `TrWordCounter` / `WordCounter`                   | 字数统计；依赖 Sender Context                                               |
| `TrDefaultActionButtons` / `DefaultActionButtons` | 组合默认清空与提交按钮；依赖 Sender Context                                 |
| `SENDER_CONTEXT_KEY`                              | Sender 依赖注入键；主要供高级集成与定制子组件使用                           |

### Props

#### Sender

| 属性名                           | 说明                                                                                                                               | 类型                  | 默认值                       | 必填 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------- | ---- |
| `model-value`                    | 受控输入内容；父组件收到 `update:model-value` 后需要更新绑定值                                                                     | `string`              | —                            | 否   |
| `default-value`                  | 非受控初始内容，只在初始化时读取；同时提供 `model-value` 时以受控值为准                                                            | `string`              | `''`                         | 否   |
| `placeholder`                    | 编辑器为空时显示的占位文本                                                                                                         | `string`              | `'请输入内容...'`            | 否   |
| `mode`                           | 输入布局；单行内容溢出或插入换行时可自动切换为多行                                                                                 | `InputMode`           | `'single'`                   | 否   |
| `size`                           | Sender 及其默认操作按钮的尺寸                                                                                                      | `'normal' \| 'small'` | `'normal'`                   | 否   |
| `disabled`                       | 禁用编辑和默认操作按钮                                                                                                             | `boolean`             | `false`                      | 否   |
| `loading`                        | 显示停止操作；此时提交按钮触发 `cancel` 而不是 `submit`                                                                            | `boolean`             | `false`                      | 否   |
| `autofocus`                      | 编辑器创建后自动聚焦                                                                                                               | `boolean`             | `false`                      | 否   |
| `enterkeyhint`                   | 设置移动端虚拟键盘的回车键提示                                                                                                     | `EnterKeyHint`        | `'send'`                     | 否   |
| `auto-size`                      | 多行模式的自动高度范围；传 `true` 时使用 1～5 行                                                                                   | `AutoSize`            | `{ minRows: 1, maxRows: 5 }` | 否   |
| `clearable`                      | 有编辑器文本时显示清空按钮                                                                                                         | `boolean`             | `false`                      | 否   |
| `has-external-content`（已弃用） | 兼容性地把空文本视为可提交；1.0 仍保留该属性但不推荐新代码使用；不会生成 `externalPayloads`，请改用 `useSenderContentRegistration` | `boolean`             | `false`                      | 否   |
| `max-length`                     | 最大字素数；超出后保留输入但禁止提交                                                                                               | `number`              | `Infinity`                   | 否   |
| `show-word-limit`                | 提供 `max-length` 时显示字数统计                                                                                                   | `boolean`             | `false`                      | 否   |
| `submit-type`                    | 设置 Enter 组合键的提交方式                                                                                                        | `SubmitTrigger`       | `'enter'`                    | 否   |
| `stop-text`                      | `loading` 状态下停止操作旁的文字；省略或传空字符串时只显示图标                                                                     | `string`              | `''`（仅图标）               | 否   |
| `default-actions`                | 配置默认提交和清空按钮的禁用状态与 Tooltip；提交按钮禁用会参与 `canSubmit` 计算                                                    | `DefaultActions`      | —                            | 否   |
| `extensions`                     | Tiptap 扩展列表，例如 Template、Mention 和 Suggestion                                                                              | `Extension[]`         | `[]`                         | 否   |

:::tip 扩展系统
使用 `extensions` 属性配置功能扩展，提供灵活的配置和完整的类型支持。
:::

#### Template 配置

模板填充功能扩展，支持动态设置模板内容。

```typescript
// 便捷函数
TrSender.template(templates)
TrSender.template(templates, { appendTo: '.chat-window' })

// 标准配置
TrSender.Template.configure({ items: templates, appendTo: '.chat-window' })
```

| 配置项           | 说明                                      | 类型                                      | 默认值          | 必填 |
| ---------------- | ----------------------------------------- | ----------------------------------------- | --------------- | ---- |
| `items`          | 模板数据列表；传入 `Ref` 时会响应后续变化 | `TemplateItem[]` \| `Ref<TemplateItem[]>` | —               | 否   |
| `HTMLAttributes` | 合并到模板块节点的 HTML 属性              | `Record<string, unknown>`                 | —               | 否   |
| `appendTo`       | Template Select 下拉菜单的挂载目标        | `string` \| `HTMLElement`                 | `document.body` | 否   |

#### Mention 配置

@提及功能扩展，支持快速引用预设的助手或对象，支持自定义触发字符。

```typescript
// 便捷函数（使用默认 '@' 触发）
TrSender.mention(mentions)

// 便捷函数（自定义触发字符）
TrSender.mention(mentions, '#') // 使用 '#' 触发

// 标准配置
TrSender.Mention.configure({ items: mentions, char: '@', allowSpaces: false })
```

| 配置项           | 说明                                    | 类型                                    | 默认值  | 必填 |
| ---------------- | --------------------------------------- | --------------------------------------- | ------- | ---- |
| `items`          | 提及项列表；传入 `Ref` 时会响应后续变化 | `MentionItem[]` \| `Ref<MentionItem[]>` | `[]`    | 否   |
| `char`           | 触发字符，例如 `'@'`、`'#'` 或 `'!'`    | `string`                                | `'@'`   | 否   |
| `allowSpaces`    | 是否允许触发字符后的查询文本包含空格    | `boolean`                               | `false` | 否   |
| `HTMLAttributes` | 合并到 Mention 节点的 HTML 属性         | `Record<string, unknown>`               | —       | 否   |

#### Suggestion 配置

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

| 配置项                 | 说明                                                    | 类型                                                                       | 默认值      | 必填 |
| ---------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------- | ----------- | ---- |
| `items`                | 建议项列表；传入 `Ref` 时会响应后续变化                 | `SenderSuggestionItem[]` \| `Ref<SenderSuggestionItem[]>`                  | `[]`        | 否   |
| `filterFn`             | 过滤建议；不提供时直接显示全部条目                      | `(items: SenderSuggestionItem[], query: string) => SenderSuggestionItem[]` | —           | 否   |
| `showAutoComplete`     | 是否展示当前建议项的自动补全文本与 Tab 提示             | `boolean`                                                                  | `true`      | 否   |
| `activeSuggestionKeys` | 确认当前建议项的按键；Tab 的自动补全行为不受此配置控制  | `string[]`                                                                 | `['Enter']` | 否   |
| `popupWidth`           | 建议弹层宽度；数字按像素处理，也可使用百分比或 CSS 长度 | `number` \| `string`                                                       | `400`       | 否   |
| `onSelect`             | 选中回调；返回 `false` 时阻止默认回填                   | `(item: SenderSuggestionItem) => void \| false`                            | —           | 否   |

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
`item` 包含完整的 `SenderSuggestionItem` 信息（`content`、`label`、`data`、`highlights`），可用于应用逻辑处理。
:::

#### UploadButton

文件上传按钮组件，支持文件类型过滤、大小限制和数量限制。

| 属性名              | 说明                                               | 类型               | 默认值             | 必填 |
| ------------------- | -------------------------------------------------- | ------------------ | ------------------ | ---- |
| `disabled`          | 禁用文件选择；同时会与 Sender 的禁用状态合并       | `boolean`          | `false`            | 否   |
| `accept`            | 传给文件选择器的 MIME 类型或扩展名过滤条件         | `string`           | `'*'`              | 否   |
| `multiple`          | 是否允许一次选择多个文件                           | `boolean`          | `true`             | 否   |
| `reset`             | 选择后是否重置原生文件输入，使同一文件可以再次选择 | `boolean`          | `true`             | 否   |
| `max-size`          | 单个文件的大小上限，单位 MB；超限时触发 `error`    | `number`           | —                  | 否   |
| `max-count`         | 单次选择的文件数量上限；超限时触发 `error`         | `number`           | —                  | 否   |
| `tooltip`           | 按钮的 Tooltip 内容                                | `TooltipContent`   | —                  | 否   |
| `tooltip-placement` | Tooltip 位置                                       | `TooltipPlacement` | `'top'`            | 否   |
| `icon`              | 未提供图标插槽时使用的图标组件                     | `Component`        | `IconImageUpload`  | 否   |
| `size`              | 按钮尺寸；数字按像素处理，也可使用 CSS 长度        | `number \| string` | `32px`（CSS 默认） | 否   |

#### ActionButton

Sender Actions 的基础图标按钮，也可以独立用于自定义操作区。

| 属性名              | 说明                                       | 类型                 | 默认值             | 必填 |
| ------------------- | ------------------------------------------ | -------------------- | ------------------ | ---- |
| `icon`              | 未提供 `icon` 插槽时渲染的图标             | `VNode \| Component` | —                  | 是   |
| `disabled`          | 禁用原生按钮                               | `boolean`            | `false`            | 否   |
| `active`            | 显示激活样式                               | `boolean`            | `false`            | 否   |
| `tooltip`           | Tooltip 内容                               | `TooltipContent`     | —                  | 否   |
| `tooltip-placement` | Tooltip 位置                               | `TooltipPlacement`   | `'top'`            | 否   |
| `size`              | `small`、`normal`、像素数字或其他 CSS 长度 | `string \| number`   | `32px`（CSS 默认） | 否   |

#### VoiceButton

语音输入按钮组件，支持浏览器内置语音识别和第三方语音识别服务。

| 属性名              | 说明                                                          | 类型                                                                          | 默认值              | 必填 |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------- | ---- |
| `icon`              | 未录音时的图标                                                | `VNode \| Component`                                                          | `IconVoice`         | 否   |
| `recording-icon`    | 录音中的图标                                                  | `VNode \| Component`                                                          | `IconRecordingWave` | 否   |
| `disabled`          | 禁用录音按钮；同时会与 Sender 的禁用状态合并                  | `boolean`                                                                     | `false`             | 否   |
| `size`              | 按钮尺寸                                                      | `'small' \| 'normal'`                                                         | `normal`（32px）    | 否   |
| `tooltip`           | 按钮的 Tooltip 内容                                           | `TooltipContent`                                                              | —                   | 否   |
| `tooltip-placement` | Tooltip 位置                                                  | `TooltipPlacement`                                                            | `'top'`             | 否   |
| `speech-config`     | 浏览器或自定义语音处理器配置                                  | `SpeechConfig`                                                                | —                   | 否   |
| `auto-insert`       | 收到最终识别结果时是否插入编辑器                              | `boolean`                                                                     | `true`              | 否   |
| `on-button-click`   | 点击拦截器；调用 `preventDefault()` 后由应用接管录音开始/停止 | `(isRecording: boolean, preventDefault: () => void) => void \| Promise<void>` | —                   | 否   |

### Slots

#### Sender Slots

| 插槽名           | 用途                                 | 作用域参数            |
| ---------------- | ------------------------------------ | --------------------- |
| `header`         | 在输入区域上方添加内容               | —                     |
| `prefix`         | 在编辑器左侧添加内容                 | —                     |
| `content`        | 完全替换默认编辑器内容               | `{ editor: unknown }` |
| `actions-inline` | 在单行模式的默认操作按钮前添加内容   | —                     |
| `footer`         | 在多行模式底部左侧添加内容           | —                     |
| `footer-right`   | 在多行模式底部默认操作按钮前添加内容 | —                     |

#### ActionButton Slots

| 插槽名 | 用途                       | 作用域参数 |
| ------ | -------------------------- | ---------- |
| `icon` | 替换 `icon` 属性提供的图标 | —          |

#### VoiceButton Slots

| 插槽名              | 用途                                                 | 作用域参数                                   |
| ------------------- | ---------------------------------------------------- | -------------------------------------------- |
| `icon`              | 替换按钮图标；未提供时使用 `icon` / `recording-icon` | `{ isRecording: boolean }`                   |
| `recording-overlay` | 在按钮外渲染自定义录音界面                           | `{ isRecording: boolean; stop: () => void }` |

### Events

#### Sender Events

| 事件名               | 触发时机                                                                                       | 回调参数                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `update:model-value` | 编辑器文本变化时触发；受控模式下父组件需要据此更新 `model-value`                               | `(value: string) => void`                                                  |
| `input`              | 编辑器文本变化时同步通知                                                                       | `(value: string) => void`                                                  |
| `submit`             | 用户使用当前提交快捷键或调用 `submit()`，且内容可提交时触发；组件不会自动清空内容              | `(text: string, data?: StructuredData, extra?: SenderSubmitExtra) => void` |
| `clear`              | 用户点击清空按钮或调用 `clear()`，并且编辑器内容已被清空后触发                                 | `() => void`                                                               |
| `focus`              | 编辑器获得焦点时触发                                                                           | `(event: FocusEvent) => void`                                              |
| `blur`               | 编辑器失去焦点时触发                                                                           | `(event: FocusEvent) => void`                                              |
| `cancel`             | `loading` 状态下点击停止操作或调用 `cancel()` 时触发；应用负责终止外部异步任务并更新 `loading` | `() => void`                                                               |

:::tip submit 事件参数说明

- **text**：纯文本内容，适用于简单场景（如直接发送给 AI）
- **data**：结构化数据数组，仅在使用 Template 或 Mention 扩展时返回，包含文本和特殊节点的完整信息
- **extra**：仅当存在外部 payload 时返回，当前包含 `externalPayloads`

根据提交数据的复杂度选择使用：

- 简单场景：只使用 `text` 参数
- 复杂场景：使用 `data` 参数提取特殊节点信息或自定义拼接格式
- 附件等外部内容：使用 `extra.externalPayloads` 读取。Sender 只透传外部内容的 `source` 和 `payload`，不内置解析特定来源，也不按状态过滤

详见：[结构化数据](#结构化数据)
:::

#### UploadButton Events

| 事件名   | 触发时机                               | 回调参数                                 |
| -------- | -------------------------------------- | ---------------------------------------- |
| `select` | 通过数量和大小校验后完成文件选择       | `(files: File[]) => void`                |
| `error`  | 文件数量超限或存在超过大小上限的文件时 | `(error: Error, files?: File[]) => void` |

#### VoiceButton Events

| 事件名           | 触发时机                     | 回调参数                        |
| ---------------- | ---------------------------- | ------------------------------- |
| `speech-start`   | 语音处理器开始识别时         | `() => void`                    |
| `speech-interim` | 语音处理器返回中间识别结果时 | `(transcript: string) => void`  |
| `speech-final`   | 语音处理器返回最终结果时     | `(transcript: string) => void`  |
| `speech-end`     | 语音处理器结束时             | `(transcript?: string) => void` |
| `speech-error`   | 语音处理器报告错误时         | `(error: Error) => void`        |

### Methods / Expose

#### Sender Methods / Expose

| 公开成员     | 说明                                                      | 签名                        |
| ------------ | --------------------------------------------------------- | --------------------------- |
| `focus`      | 将焦点移入编辑器                                          | `() => void`                |
| `blur`       | 使编辑器失去焦点                                          | `() => void`                |
| `clear`      | 清空编辑器内容并触发 `clear`                              | `() => void`                |
| `submit`     | 内容满足提交条件时触发 `submit`；不会自动清空内容         | `() => void`                |
| `setContent` | 通过 Tiptap 替换编辑器全部内容；字符串可包含纯文本或 HTML | `(content: string) => void` |
| `getContent` | 读取编辑器的纯文本内容                                    | `() => string`              |
| `cancel`     | 触发 `cancel`；应用仍需终止外部任务并同步 `loading`       | `() => void`                |
| `editor`     | 当前 Tiptap 编辑器引用；挂载完成前可能为 `undefined`      | `Ref<Editor \| undefined>`  |

#### UploadButton Methods

| 公开成员 | 说明           | 签名                  |
| -------- | -------------- | --------------------- |
| `open`   | 打开文件选择器 | `() => Promise<void>` |

#### VoiceButton Methods

| 公开成员      | 说明                       | 签名或类型    |
| ------------- | -------------------------- | ------------- |
| `start`       | 请求语音处理器开始识别     | `() => void`  |
| `stop`        | 停止识别并释放处理器       | `() => void`  |
| `speechState` | 当前录音、支持性与错误状态 | `SpeechState` |

### Composables

| 函数                           | 用途                                                 | 签名与行为                                                                       |
| ------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| `useSenderContext`             | 在 Sender 内部的自定义子组件中读取编辑器、状态和操作 | `() => SenderContext`；必须在 `TrSender` 组件树内调用，否则抛出错误              |
| `useSenderContentRegistration` | 为 Sender 注册附件等不写入编辑器的外部提交内容       | `() => SenderContentRegister \| undefined`；不在 `TrSender` 内时返回 `undefined` |

`useSenderContentRegistration()` 返回的注册函数接收稳定的 `source` 和普通值、Ref 或 Getter 形式的 `payload`，并返回注销函数。Sender 会持续读取响应式 payload；提交时复制当前注册项，作为 `extra.externalPayloads` 传给 `submit`。注册组件卸载时必须调用注销函数；`TrAttachments` 已在内部完成注册与清理。

### 结构化提交数据 {#结构化数据}

当使用 `Template` 或 `Mention` 扩展时，`submit` 事件的第二个参数 `data` 返回结构化数据数组。

**使用建议**：

- 简单场景：使用 `text` 参数（纯文本）
- 复杂场景：使用 `data` 参数提取特殊节点或自定义格式

#### Mention 扩展

```typescript
function handleSubmit(text: string, data?: StructuredData) {
  // text: "帮我分析 @张三 的周报"
  // data: [
  //   { type: 'text', content: '帮我分析 ' },
  //   { type: 'mention', content: '张三', value: '用户ID' },
  //   { type: 'text', content: ' 的周报' }
  // ]

  // 提取提及项
  const mentions = data?.filter((item) => item.type === 'mention') || []

  // 自定义格式（如 Slack 风格）
  const customText = data?.map((item) => (item.type === 'mention' ? `<@${item.value}>` : item.content)).join('')
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
  const blocks = data?.filter((item) => item.type === 'block') || []

  // 自定义格式（如 Mustache 风格）
  const customText = data?.map((item) => (item.type === 'block' ? `{{${item.content}}}` : item.content)).join('')
}
```

**类型定义**：详见 [Types - StructuredData](#types)

### Types

以下类型均从 `@opentiny/tiny-robot` 导出。索引按用途和支持级别分组：推荐公共类型可直接用于应用集成；高级类型服务于公开组合式函数。

#### 推荐公共类型

| 类型名                  | 类别            | 类型或签名                                                            | 说明                                 |
| ----------------------- | --------------- | --------------------------------------------------------------------- | ------------------------------------ |
| `SenderProps`           | 组件 Props      | `interface`                                                           | Sender 属性                          |
| `SenderEmits`           | 组件 Events     | `interface`                                                           | Sender 事件                          |
| `SenderSlots`           | 组件 Slots      | `interface`                                                           | Sender 插槽                          |
| `SenderExternalPayload` | 提交数据        | `interface`                                                           | 单个外部提交内容                     |
| `SenderSubmitExtra`     | 提交数据        | `interface`                                                           | `submit` 的额外提交数据              |
| `InputMode`             | Prop 类型       | `'single' \| 'multiple'`                                              | 输入布局模式                         |
| `SubmitTrigger`         | Prop 类型       | `'enter' \| 'ctrlEnter' \| 'shiftEnter'`                              | 提交快捷键模式                       |
| `EnterKeyHint`          | Prop 类型       | HTML `enterkeyhint` 联合类型                                          | 移动端虚拟键盘提示                   |
| `AutoSize`              | Prop 类型       | `boolean \| { minRows: number; maxRows: number }`                     | 多行编辑器高度范围                   |
| `DefaultActions`        | 配置对象        | `interface`                                                           | 默认提交和清空按钮配置               |
| `StructuredData`        | 结构化数据      | `TemplateItem[] \| MentionStructuredItem[]`                           | Template 或 Mention 的结构化提交数据 |
| `SelectOption`          | Template 数据   | `interface`                                                           | Template 选择项                      |
| `TemplateItem`          | Template 数据   | `type`                                                                | 文本、可编辑块或选择器模板项         |
| `MentionItem`           | Mention 数据    | `interface`                                                           | Mention 输入项                       |
| `SenderSuggestionItem`  | Suggestion 数据 | `interface`                                                           | Suggestion 输入项                    |
| `SuggestionOptions`     | 扩展配置        | `interface`                                                           | Suggestion 扩展配置                  |
| `SuggestionState`       | 扩展状态        | `interface`                                                           | Suggestion 插件状态                  |
| `SuggestionTextPart`    | 高亮数据        | `interface`                                                           | 建议文本的高亮片段                   |
| `HighlightFunction`     | 扩展回调        | `(suggestionText: string, inputText: string) => SuggestionTextPart[]` | 自定义建议高亮函数                   |
| `ActionButtonProps`     | 组件 Props      | `interface`                                                           | Sender Action 基础按钮属性           |
| `UploadButtonProps`     | 组件 Props      | `interface`                                                           | 上传按钮属性                         |
| `UploadButtonEmits`     | 组件 Events     | `interface`                                                           | 上传按钮事件                         |
| `VoiceButtonProps`      | 组件 Props      | `interface`                                                           | 语音按钮属性                         |
| `VoiceButtonEmits`      | 组件 Events     | `interface`                                                           | 语音按钮事件                         |
| `TooltipContent`        | Prop 类型       | `string \| (() => string \| VNode)`                                   | Sender Action 的 Tooltip 内容        |
| `TooltipPlacement`      | Prop 类型       | `type`                                                                | Tooltip 方位联合类型                 |
| `SpeechCallbacks`       | 语音回调        | `interface`                                                           | 语音处理过程回调                     |
| `SpeechHandler`         | 服务接口        | `interface`                                                           | 可替换的语音处理器                   |
| `SpeechConfig`          | 配置对象        | `interface`                                                           | 语音识别配置                         |
| `SpeechState`           | 状态对象        | `interface`                                                           | 语音识别状态                         |

#### 高级组合式 API 类型

| 类型名                                     | 对应入口                       | 类型或签名                                                           | 说明                          |
| ------------------------------------------ | ------------------------------ | -------------------------------------------------------------------- | ----------------------------- |
| `SenderContext` / `UseSenderContextReturn` | `useSenderContext`             | `interface` / `SenderContext`                                        | Sender 上下文及其返回类型别名 |
| `SenderContentRegister`                    | `useSenderContentRegistration` | `(source: string, payload: MaybeRefOrGetter<unknown>) => () => void` | 注册外部内容并返回注销函数    |

#### 常用字段

`SenderSuggestionItem`：

| 字段         | 说明                                               | 类型                            | 必填 |
| ------------ | -------------------------------------------------- | ------------------------------- | ---- |
| `content`    | 用于匹配和默认回填的建议内容                       | `string`                        | 是   |
| `label`      | 可选元数据；当前列表展示和默认回填仍使用 `content` | `string`                        | 否   |
| `highlights` | 精确片段或自定义高亮函数                           | `string[] \| HighlightFunction` | 否   |
| `data`       | 应用附加数据                                       | `Record<string, unknown>`       | 否   |

`MentionItem`：

| 字段    | 说明                           | 类型     | 必填 |
| ------- | ------------------------------ | -------- | ---- |
| `id`    | 提及项标识；未提供时由组件生成 | `string` | 否   |
| `label` | 列表和编辑器中显示的名称       | `string` | 是   |
| `value` | 提交到结构化数据中的关联值     | `string` | 是   |
| `icon`  | 列表中显示的图标地址           | `string` | 否   |

`SelectOption`：

| 字段    | 说明           | 类型     | 必填 |
| ------- | -------------- | -------- | ---- |
| `label` | 显示文本       | `string` | 是   |
| `value` | 选择后的值     | `string` | 是   |
| `data`  | 应用附加字符串 | `string` | 否   |

`SenderSubmitExtra` 只在存在已注册外部内容时传给 `submit`：

| 字段               | 说明               | 类型                      | 必填 |
| ------------------ | ------------------ | ------------------------- | ---- |
| `externalPayloads` | 当前外部内容的快照 | `SenderExternalPayload[]` | 是   |

`SenderExternalPayload`：

| 字段      | 说明                     | 类型      | 必填 |
| --------- | ------------------------ | --------- | ---- |
| `source`  | 注册来源的稳定标识       | `string`  | 是   |
| `payload` | 由对应来源定义的原始数据 | `unknown` | 是   |

`DefaultActions`：

| 字段                      | 说明                                                | 类型               | 必填 |
| ------------------------- | --------------------------------------------------- | ------------------ | ---- |
| `submit.disabled`         | 禁用默认提交按钮，并参与 Sender 的 `canSubmit` 计算 | `boolean`          | 否   |
| `submit.tooltip`          | 提交按钮 Tooltip                                    | `TooltipContent`   | 否   |
| `submit.tooltipPlacement` | 提交按钮 Tooltip 位置                               | `TooltipPlacement` | 否   |
| `clear.disabled`          | 禁用默认清空按钮                                    | `boolean`          | 否   |
| `clear.tooltip`           | 清空按钮 Tooltip                                    | `TooltipContent`   | 否   |
| `clear.tooltipPlacement`  | 清空按钮 Tooltip 位置                               | `TooltipPlacement` | 否   |

`SpeechConfig`：

| 字段                 | 说明                                                                             | 类型                                                                          | 默认值                   |
| -------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| `customHandler`      | 替换浏览器内置识别器；处理器负责支持性检查、启动、停止和资源清理                 | `SpeechHandler`                                                               | 浏览器 Web Speech 处理器 |
| `lang`               | 浏览器内置识别器使用的语言                                                       | `string`                                                                      | `navigator.language`     |
| `continuous`         | 浏览器内置识别器是否持续识别                                                     | `boolean`                                                                     | `false`                  |
| `interimResults`     | 浏览器内置识别器是否返回中间结果                                                 | `boolean`                                                                     | `true`                   |
| `autoReplace`        | 公开类型中的兼容字段；当前 `VoiceButton` 和内置处理器不会读取该值                | `boolean`                                                                     | —                        |
| `onVoiceButtonClick` | 公开类型中的兼容字段；当前点击拦截应使用 `VoiceButton` 的 `on-button-click` Prop | `(isRecording: boolean, preventDefault: () => void) => void \| Promise<void>` | —                        |

`SpeechHandler` 的完整接口如下。`start` 应通过回调报告识别过程；`stop` 必须停止录音、网络连接和计时器等外部资源。

```ts
interface SpeechHandler {
  start: (callbacks: SpeechCallbacks) => Promise<void> | void
  stop: () => Promise<void> | void
  isSupported: () => boolean
}
```

`SenderContext` 是 `useSenderContext()` 的完整返回类型。常用字段按职责分组如下；所有状态字段都是响应式 `Ref`。

| 分组           | 字段                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| 编辑器         | `editor`、`editorRef`                                                                 |
| 输入与布局状态 | `mode`、`isAutoSwitching`、`disabled`、`loading`、`size`                              |
| 提交派生状态   | `hasContent`、`hasEditorContent`、`canSubmit`、`isOverLimit`、`characterCount`        |
| 配置状态       | `maxLength`、`showWordLimit`、`clearable`、`defaultActions`、`submitType`、`stopText` |
| 动作           | `submit`、`clear`、`cancel`、`focus`、`blur`、`setContent`、`getContent`              |

Context 动作与同名 Expose 方法具有相同行为；它们会修改编辑器内部状态或触发对应事件，但不会替应用结束外部请求，也不会在提交后自动清空受控值。

### CSS Variables

以下变量由公共主题样式声明。颜色标为“主题值”时，会随 `ThemeProvider` 的明暗主题切换；其余值可在 Sender 的样式作用域中覆盖。Tooltip 弹层通常挂载到全局层级，因此 `--tr-sender-tooltip-gap` 应设置在 `:root` 或全局主题作用域。

**容器、文本与状态**

| 变量名                                   | 说明                 | 默认值                           |
| ---------------------------------------- | -------------------- | -------------------------------- |
| `--tr-sender-bg-color`                   | Sender 背景色        | `var(--tr-container-bg-default)` |
| `--tr-sender-bg-color-disabled`          | 禁用时的背景色       | 主题值                           |
| `--tr-sender-text-color`                 | 编辑器文字颜色       | `var(--tr-text-primary)`         |
| `--tr-sender-text-color-disabled`        | 禁用时的文字颜色     | 主题值                           |
| `--tr-sender-placeholder-color`          | 占位文字颜色         | `var(--tr-text-tertiary)`        |
| `--tr-sender-placeholder-color-disabled` | 禁用时的占位文字颜色 | 主题值                           |
| `--tr-sender-box-shadow`                 | Sender 阴影          | 主题值                           |
| `--tr-sender-header-border-bottom`       | Header 分隔线        | 主题值                           |
| `--tr-sender-button-hover-bg`            | 操作按钮悬停背景     | `var(--tr-container-bg-hover)`   |
| `--tr-sender-button-active-bg`           | 操作按钮激活背景     | 主题值                           |
| `--tr-sender-word-limit-color`           | 字数统计文字颜色     | 主题值                           |
| `--tr-sender-word-limit-error-color`     | 超出字数限制时的颜色 | 主题值                           |
| `--tr-sender-transition-duration`        | 容器状态过渡时长     | `0.2s`                           |

**尺寸与布局**

| 变量名                              | 说明                            | 默认值                               |
| ----------------------------------- | ------------------------------- | ------------------------------------ |
| `--tr-sender-font-size`             | 编辑器字号                      | `16px`                               |
| `--tr-sender-line-height`           | 编辑器行高                      | `26px`                               |
| `--tr-sender-border-radius`         | Sender 圆角                     | `26px`                               |
| `--tr-sender-padding`               | 单行模式主区域内边距            | `15px 20px`                          |
| `--tr-sender-gap`                   | 同一区域内的元素间距            | `8px`                                |
| `--tr-sender-footer-gap`            | Footer 左右区域间距             | `12px`                               |
| `--tr-sender-header-padding`        | Header 内边距                   | `12px 20px`                          |
| `--tr-sender-header-divider-inset`  | Header 分隔线左右缩进           | `20px`                               |
| `--tr-sender-multi-main-padding`    | 多行模式主输入区内边距          | `16px 20px 12px`                     |
| `--tr-sender-footer-padding`        | Footer 内边距                   | `0 10px 10px`                        |
| `--tr-sender-prefix-padding-right`  | Prefix 右内边距                 | `4px`                                |
| `--tr-sender-actions-padding-right` | 单行操作区右内边距              | `10px`                               |
| `--tr-sender-button-size`           | 普通操作按钮尺寸                | `32px`                               |
| `--tr-sender-button-size-submit`    | 提交按钮尺寸                    | `36px`                               |
| `--tr-sender-action-button-size`    | ActionButton 在 Sender 内的尺寸 | `var(--tr-sender-button-size, 32px)` |
| `--tr-sender-action-button-padding` | ActionButton 内边距             | `4px`                                |
| `--tr-sender-action-gap`            | 相邻普通操作按钮间距            | `4px`                                |
| `--tr-sender-action-submit-gap`     | 普通操作区与提交按钮间距        | `12px`                               |
| `--tr-sender-tooltip-gap`           | Tooltip 与触发按钮的间距        | `8px`                                |

当 `size="small"` 时，组件把下列基础变量映射到对应的 `-small` 变量。未列出 `-small` 版本的颜色和布局变量继续继承普通值。

| 变量名                                    | 默认值           |
| ----------------------------------------- | ---------------- |
| `--tr-sender-font-size-small`             | `14px`           |
| `--tr-sender-line-height-small`           | `24px`           |
| `--tr-sender-border-radius-small`         | `24px`           |
| `--tr-sender-padding-small`               | `12px 16px`      |
| `--tr-sender-footer-gap-small`            | `8px`            |
| `--tr-sender-header-padding-small`        | `12px 16px`      |
| `--tr-sender-multi-main-padding-small`    | `14px 16px 10px` |
| `--tr-sender-footer-padding-small`        | `0 10px 10px`    |
| `--tr-sender-button-size-small`           | `28px`           |
| `--tr-sender-button-size-submit-small`    | `32px`           |
| `--tr-sender-prefix-padding-right-small`  | `4px`            |
| `--tr-sender-actions-padding-right-small` | `8px`            |

**Suggestion**

| 变量名                                        | 说明               | 默认值 |
| --------------------------------------------- | ------------------ | ------ |
| `--tr-suggestion-bg-color`                    | 建议弹层背景       | 主题值 |
| `--tr-suggestion-box-shadow-color`            | 建议弹层阴影颜色   | 主题值 |
| `--tr-suggestion-text-color`                  | 建议文字颜色       | 主题值 |
| `--tr-suggestion-hover-bg-color`              | 建议项悬停背景     | 主题值 |
| `--tr-suggestion-scrollbar-thumb-color`       | 滚动条滑块颜色     | 主题值 |
| `--tr-suggestion-scrollbar-thumb-hover-color` | 滚动条滑块悬停颜色 | 主题值 |
| `--tr-suggestion-item-font-size`              | 建议项字号         | `14px` |
| `--tr-suggestion-item-icon-size`              | 建议项图标尺寸     | `16px` |
| `--tr-suggestion-autocomplete-color`          | 自动补全文字颜色   | 主题值 |
| `--tr-suggestion-tab-hint-border`             | Tab 提示边框       | 主题值 |
| `--tr-suggestion-tab-hint-color`              | Tab 提示文字颜色   | 主题值 |
| `--tr-suggestion-tab-hint-bg`                 | Tab 提示背景       | 主题值 |

**Mention**

| 变量名                                      | 说明                       | 默认值 |
| ------------------------------------------- | -------------------------- | ------ |
| `--tr-sender-mention-color`                 | Mention 节点文字颜色       | 主题值 |
| `--tr-sender-mention-bg`                    | Mention 节点背景           | 主题值 |
| `--tr-sender-mention-hover-bg`              | Mention 节点悬停背景       | 主题值 |
| `--tr-sender-mention-list-bg`               | Mention 列表背景           | 主题值 |
| `--tr-sender-mention-list-shadow`           | Mention 列表阴影           | 主题值 |
| `--tr-sender-mention-text-primary`          | Mention 列表主要文字颜色   | 主题值 |
| `--tr-sender-mention-text-secondary`        | Mention 列表次要文字颜色   | 主题值 |
| `--tr-sender-mention-text-tertiary`         | Mention 列表辅助文字颜色   | 主题值 |
| `--tr-sender-mention-item-hover-bg`         | Mention 条目悬停背景       | 主题值 |
| `--tr-sender-mention-item-selected-bg`      | Mention 条目选中背景       | 主题值 |
| `--tr-sender-mention-scrollbar-thumb`       | Mention 滚动条滑块颜色     | 主题值 |
| `--tr-sender-mention-scrollbar-thumb-hover` | Mention 滚动条滑块悬停颜色 | 主题值 |
| `--tr-sender-mention-trigger-bg`            | 触发字符背景               | 主题值 |

**Template**

| 变量名                                              | 说明                       | 默认值    |
| --------------------------------------------------- | -------------------------- | --------- |
| `--tr-sender-template-color`                        | 可编辑模板块文字颜色       | 主题值    |
| `--tr-sender-template-bg`                           | 可编辑模板块背景           | 主题值    |
| `--tr-sender-template-border-radius`                | 可编辑模板块圆角           | `6px`     |
| `--tr-sender-template-padding`                      | 可编辑模板块内边距         | `2px 4px` |
| `--tr-sender-template-margin`                       | 可编辑模板块外边距         | `0 4px`   |
| `--tr-sender-template-min-width`                    | 可编辑模板块最小宽度       | `32px`    |
| `--tr-sender-template-select-color`                 | 模板选择器文字颜色         | 主题值    |
| `--tr-sender-template-select-placeholder-color`     | 模板选择器占位文字颜色     | 主题值    |
| `--tr-sender-template-select-bg`                    | 模板选择器背景             | 主题值    |
| `--tr-sender-template-select-bg-hover`              | 模板选择器悬停背景         | 主题值    |
| `--tr-sender-template-select-bg-active`             | 模板选择器激活背景         | 主题值    |
| `--tr-sender-template-select-dropdown-bg`           | 模板下拉菜单背景           | 主题值    |
| `--tr-sender-template-select-dropdown-shadow`       | 模板下拉菜单阴影           | 主题值    |
| `--tr-sender-template-select-text-primary`          | 模板下拉菜单主要文字颜色   | 主题值    |
| `--tr-sender-template-select-text-secondary`        | 模板下拉菜单次要文字颜色   | 主题值    |
| `--tr-sender-template-select-option-hover-bg`       | 模板选项悬停背景           | 主题值    |
| `--tr-sender-template-select-option-selected-bg`    | 模板选项选中背景           | 主题值    |
| `--tr-sender-template-select-scrollbar-thumb`       | 模板下拉菜单滚动条颜色     | 主题值    |
| `--tr-sender-template-select-scrollbar-thumb-hover` | 模板下拉菜单滚动条悬停颜色 | 主题值    |

## 迁移与弃用

### 升级路径

- **快速迁移**：使用 `SenderCompat` 保持大部分 v0.3.x API 兼容，再处理少量破坏性变更。请查看 [SenderCompat 快速迁移指南](./sender-compat.md)。
- **完全升级**：直接采用当前 Sender API，按照 [完整迁移方案](./sender-compat.md#完整迁移方案) 调整扩展、按钮、事件与主题接入。

### 1.0 保留的弃用 API

`has-external-content` 在 1.0 中仍保留兼容，但不推荐新代码继续使用。它只能让空文本进入可提交状态，不会生成 `externalPayloads`；请改用 `useSenderContentRegistration`，或将 `TrAttachments` 放在 `TrSender` 内自动注册附件内容。

### v0.4 已移除的 API {#已移除的-api}

以下列表集中记录 v0.4 已移除的入口及替代方案。

#### Props

| 属性名               | 原说明           | 替代方案                                                         |
| -------------------- | ---------------- | ---------------------------------------------------------------- |
| allowSpeech          | 是否开启语音输入 | [使用 VoiceButton 组件](./sender-compat.md#语音输入迁移)         |
| speech               | 语音识别配置     | [使用 VoiceButton.speechConfig](./sender-compat.md#语音输入迁移) |
| allowFiles           | 是否允许文件上传 | [使用 UploadButton 组件](./sender-compat.md#文件上传迁移)        |
| buttonGroup          | 按钮组配置       | [使用 defaultActions 和插槽](./sender-compat.md#按钮配置迁移)    |
| theme                | 主题样式         | [使用 ThemeProvider 包裹](./sender-compat.md#主题迁移)           |
| suggestions          | 输入建议列表     | [使用 Suggestion 扩展](./sender-compat.md#联想迁移)              |
| suggestionPopupWidth | 建议弹窗宽度     | [使用 Suggestion 扩展配置](./sender-compat.md#联想迁移)          |
| activeSuggestionKeys | 激活建议项的按键 | [使用 Suggestion 扩展配置](./sender-compat.md#联想迁移)          |
| templateData         | 模板数据         | [使用 Template 扩展](./sender-compat.md#模板迁移)                |

#### Slots

| 插槽名称          | 替代方案                    |
| ----------------- | --------------------------- |
| actions           | 改用 `actions-inline`       |
| footer-left       | 改用 `footer`               |
| decorativeContent | 改用 `disabled` + `content` |

#### Events

| 事件名            | 替代方案                                    |
| ----------------- | ------------------------------------------- |
| change            | 使用 `blur` 事件                            |
| files-selected    | 使用 `UploadButton` 的 `select` 事件        |
| speech-start      | 使用 `VoiceButton` 的 `speech-start` 事件   |
| speech-end        | 使用 `VoiceButton` 的 `speech-end` 事件     |
| speech-interim    | 使用 `VoiceButton` 的 `speech-interim` 事件 |
| speech-error      | 使用 `VoiceButton` 的 `speech-error` 事件   |
| suggestion-select | 使用 `Suggestion` 扩展的 `onSelect` 回调    |

#### Methods

| 方法名                     | 替代方案                   |
| -------------------------- | -------------------------- |
| startSpeech                | 使用 `VoiceButton.start()` |
| stopSpeech                 | 使用 `VoiceButton.stop()`  |
| activateTemplateFirstField | 自动处理，无需调用         |
