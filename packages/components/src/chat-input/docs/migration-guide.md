# Sender → ChatInput 迁移指南

本文档说明从 `Sender` 组件迁移到 `ChatInput` 组件的主要变更。

## 核心变更

### 1. 组件名称

```vue
<!-- 旧版 -->
<tr-sender v-model="text" />

<!-- 新版 -->
<tr-chat-input v-model="text" />
```

### 2. 架构升级

- **旧版**：基于原生 textarea 实现
- **新版**：基于 [Tiptap](https://tiptap.dev/) 富文本编辑器，支持扩展系统

## 功能迁移对照

### 模板填充

```vue
<!-- 旧版：直接传入 -->
<tr-sender v-model:templateData="templates" />

<!-- 新版：通过扩展配置 -->
<tr-chat-input :extensions="[ChatInput.template(templates)]" />
```

### 智能联想

```vue
<!-- 旧版：直接传入 -->
<tr-sender 
  v-model="text"
  :suggestions="suggestions"
  :activeSuggestionKeys="['Enter', 'Tab']"
  suggestionPopupWidth="400px"
/>

<!-- 新版：通过扩展配置 -->
<tr-chat-input 
  v-model="text"
  :extensions="[
    ChatInput.suggestion(suggestions, {
      filterFn: customFilter,
      activeSuggestionKeys: ['Enter'],
      popupWidth: 400
    })
  ]"
/>
```

**关键差异**：
- 新版默认激活键只有 `Enter`（旧版包含 `Tab`）
- 新版需要通过 `filterFn` 自定义过滤逻辑（旧版自动过滤）
- 新版 `popupWidth` 为数字类型（旧版为字符串）

### 语音输入

```vue
<!-- 旧版：通过 props 配置 -->
<tr-sender 
  :allowSpeech="true"
  :speech="speechConfig"
/>

<!-- 新版：通过独立组件 -->
<tr-chat-input v-model="text">
  <template #footer>
    <tr-voice-button 
      :speechConfig="speechConfig"
      @speech-final="handleSpeech"
    />
  </template>
</tr-chat-input>
```

### 文件上传

```vue
<!-- 旧版：通过 props 配置 -->
<tr-sender 
  :allowFiles="true"
  :buttonGroup="{ file: { accept: 'image/*' } }"
/>

<!-- 新版：通过独立组件 -->
<tr-chat-input v-model="text">
  <template #footer>
    <tr-upload-button 
      accept="image/*"
      @select="handleFiles"
    />
  </template>
</tr-chat-input>
```

### 按钮配置

```vue
<!-- 旧版：通过 buttonGroup 统一配置 -->
<tr-sender 
  :buttonGroup="{
    submit: { disabled: true, tooltips: '提示' },
    file: { accept: 'image/*' }
  }"
/>

<!-- 新版：分离配置 -->
<tr-chat-input 
  :defaultActions="{
    submit: { disabled: true, tooltip: '提示' }
  }"
>
  <template #footer>
    <tr-upload-button accept="image/*" />
  </template>
</tr-chat-input>
```

## Props 变更

### 新增属性

| 属性名 | 说明 | 类型 |
|--------|------|------|
| `extensions` | 扩展列表（模板、联想、提及等） | `Extension[]` |
| `size` | 组件尺寸 | `'normal' \| 'small'` |
| `defaultActions` | 默认按钮配置 | `DefaultActions` |

### 移除属性

| 旧属性名 | 新方案 |
|----------|--------|
| `allowSpeech` | 使用 `VoiceButton` 组件 |
| `allowFiles` | 使用 `UploadButton` 组件 |
| `speech` | 传递给 `VoiceButton` 的 `speechConfig` |
| `buttonGroup` | 使用 `defaultActions` + 独立按钮组件 |
| `suggestions` | 使用 `ChatInput.suggestion()` 扩展 |
| `suggestionPopupWidth` | 扩展配置中的 `popupWidth` |
| `activeSuggestionKeys` | 扩展配置中的 `activeSuggestionKeys` |
| `templateData` | 使用 `ChatInput.template()` 扩展 |

### 默认值变更

| 属性名 | 旧版默认值 | 新版默认值 | 说明 |
|--------|-----------|-----------|------|
| `autoSize` | `false` | `{ minRows: 1, maxRows: 3 }` | 新版多行模式下默认启用自动高度 |
| `allowFiles` | `true` | 已移除 | 新版需手动添加 `UploadButton` 组件 |

### 属性重命名

| 旧属性名 | 新属性名 | 说明 |
|----------|----------|------|
| `buttonGroup.submit.tooltips` | `defaultActions.submit.tooltip` | 单数形式 |
| `buttonGroup.submit.tooltipPlacement` | `defaultActions.submit.tooltipPlacement` | 保持一致 |

## Events 变更

### 新增事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `cancel` | 取消操作（loading 状态下点击停止按钮） | `()` |

### 事件参数变更

```typescript
// submit 事件
// 旧版
emit('submit', text: string)

// 新版：增加结构化数据
emit('submit', text: string, data?: StructuredData)
```

**说明**：新版 `submit` 事件会返回模板或提及的结构化数据，方便业务处理。

### 移除事件

| 旧事件名 | 新方案 |
|----------|--------|
| `change` | 已移除，使用 `input` 或 `blur` 事件 |
| `speech-start` | 监听 `VoiceButton` 的 `speech-start` |
| `speech-end` | 监听 `VoiceButton` 的 `speech-end` |
| `speech-interim` | 监听 `VoiceButton` 的 `speech-interim` |
| `speech-error` | 监听 `VoiceButton` 的 `speech-error` |
| `suggestion-select` | 扩展配置中的 `onSelect` 回调 |

## Methods 变更

### 新增方法

| 方法名 | 说明 |
|--------|------|
| `setContent(content: string)` | 设置编辑器内容 |
| `getContent()` | 获取编辑器内容 |
| `cancel()` | 手动触发取消事件 |

### 移除方法

| 旧方法名 | 新方案 |
|----------|--------|
| `startSpeech()` | 调用 `VoiceButton` 的 `start()` |
| `stopSpeech()` | 调用 `VoiceButton` 的 `stop()` |
| `activateTemplateFirstField()` | 模板扩展自动处理 |

## Slots 变更

### 插槽重命名

| 旧插槽名 | 新插槽名 | 说明 |
|----------|----------|------|
| `actions` | `actions-inline` | 单行模式下的操作按钮区域 |

### 移除插槽

| 旧插槽名 | 新方案 |
|----------|--------|
| `decorativeContent` | 使用 `disabled` 属性 + `content` 插槽自定义内容 |

### 插槽作用域变更

```vue
<!-- 旧版：无作用域参数 -->
<template #footer-left>
  <button>自定义按钮</button>
</template>

<!-- 新版：提供作用域参数 -->
<template #footer="{ editor, hasContent, disabled, focus, insert }">
  <button @click="insert('文本')">插入文本</button>
</template>
```

## 样式变更

### 紧凑模式

```vue
<!-- 旧版：通过 CSS 类 -->
<tr-sender class="tr-sender-compact" />

<!-- 新版：通过 size 属性 -->
<tr-chat-input size="small" />
```

### 主题配置

```vue
<!-- 旧版：通过 theme 属性 -->
<tr-sender theme="dark" />

<!-- 新版：通过 ThemeProvider 统一管理 -->
<tr-theme-provider color-mode="dark">
  <tr-chat-input />
</tr-theme-provider>
```

**说明**：新版移除了组件级别的 `theme` 属性，改为通过 `ThemeProvider` 统一管理主题，支持嵌套和持久化。

## 新增功能

### 提及功能

新版新增 `@提及` 功能，支持快速引用预设的助手或对象：

```vue
<tr-chat-input 
  :extensions="[ChatInput.mention(mentions, '@')]"
/>
```

### 自动补全提示

新版联想功能支持自动补全提示（灰色文本 + TAB 提示）：

```vue
<tr-chat-input 
  :extensions="[
    ChatInput.suggestion(suggestions, {
      showAutoComplete: true
    })
  ]"
/>
```

## 行为变更

### 1. 自动高度默认启用

**旧版**：多行模式下需要手动设置 `autoSize` 才能自动调整高度  
**新版**：多行模式下默认启用自动高度（`minRows: 1, maxRows: 3`）

如需禁用：
```vue
<tr-chat-input :autoSize="false" />
```

### 2. 文件上传默认关闭

**旧版**：默认显示文件上传按钮（`allowFiles="true"`）  
**新版**：需要手动添加 `UploadButton` 组件

### 3. 联想激活键变更

**旧版**：默认支持 `Enter` 和 `Tab` 键选中联想项  
**新版**：默认只支持 `Enter` 键（`Tab` 用于自动补全提示）

### 4. 单行模式换行行为

**旧版**：单行模式下按 `Shift+Enter` 换行并切换为多行模式  
**新版**：
- `submitType="enter"` 时，按 `Ctrl+Enter` 或 `Shift+Enter` 换行并切换
- 其他模式下，按 `Enter` 换行

## 常见问题

### Q: 为什么多行模式下高度自动调整了？

A: 新版默认启用 `autoSize`，如需禁用：

```vue
<tr-chat-input :autoSize="false" />
```

### Q: 联想功能如何开启自动过滤呢？

A: 新版将过滤逻辑交给开发者控制，提供更大的灵活性。使用 `filterFn` 自定义过滤：

```typescript
ChatInput.suggestion(suggestions, {
  filterFn: (items, query) => 
    items.filter(item => item.content.includes(query))
})
```

### Q: 如何保持旧版的 Tab 键选中联想？

A: 在扩展配置中添加 `Tab` 键：

```typescript
ChatInput.suggestion(suggestions, {
  activeSuggestionKeys: ['Enter', 'Tab']
})
```

### Q: 语音按钮如何获取 ref？

A: 给 `VoiceButton` 添加 ref：

```vue
<template #footer>
  <tr-voice-button ref="voiceRef" />
</template>

<script setup>
const voiceRef = ref()
voiceRef.value?.start() // 调用方法
</script>
```

### Q: 如何监听语音识别事件？

A: 直接在 `VoiceButton` 上监听：

```vue
<tr-voice-button 
  @speech-start="handleStart"
  @speech-final="handleFinal"
  @speech-error="handleError"
/>
```

### Q: change 事件去哪了？

A: 新版移除了 `change` 事件，使用 `input` 事件监听实时变化，或使用 `blur` 事件监听失焦：

```vue
<!-- 实时监听 -->
<tr-chat-input @input="handleInput" />

<!-- 失焦时处理 -->
<tr-chat-input @blur="handleBlur" />
```

### Q: 如何实现装饰性内容（decorativeContent）？

A: 使用 `disabled` 属性配合 `content` 插槽：

```vue
<tr-chat-input disabled>
  <template #content>
    <div class="decorative-content">
      自定义提示内容
    </div>
  </template>
</tr-chat-input>
```

### Q: 如何设置深色主题？

A: 使用 `ThemeProvider` 包裹组件：

```vue
<tr-theme-provider color-mode="dark">
  <tr-chat-input />
</tr-theme-provider>
```
