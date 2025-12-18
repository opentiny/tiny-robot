# TrSenderCompat - 过渡期兼容组件

## 概述

`TrSenderCompat` 是基于 `ChatInput` 实现的 `TrSender` 兼容层，用于在迁移期间提供平滑的过渡。

## 快速迁移

只需更新导入语句即可完成迁移：

```typescript
// 旧代码
import { TrSender } from '@opentiny/tiny-robot'

// 新代码
import { TrSenderCompat as TrSender } from '@opentiny/tiny-robot'
```

## 破坏性变更

### 1. 紧凑模式实现方式

**变更原因**：统一组件尺寸控制方式，使用标准 prop 替代 CSS 类

```vue
<!-- 旧用法 -->
<tr-sender class="tr-sender-compact" mode="single" />

<!-- 新用法 -->
<tr-sender size="small" mode="single" />
```

### 2. 插槽名称变更

**变更原因**：简化命名，语义更清晰

```vue
<!-- 旧用法 -->
<tr-sender :allow-speech="false">
  <template #decorativeContent>
    缴费服务正在进行中，<a href="#">点击前往</a>
  </template>
</tr-sender>

<!-- 新用法 -->
<tr-sender :disabled="true">
  <template #content>
    缴费服务正在进行中，<a href="#">点击前往</a>
  </template>
</tr-sender>
```

### 3. 模板数据设置方法

**变更原因**：简化操作流程，一次调用完成数据设置和字段激活

```typescript
// 旧方式
templateData.value = data
senderRef.value?.activateTemplateFirstField()

// 新方式
senderRef.value?.setTemplateData(data)
```

### 4. 移除不必要的 key 绑定

**变更原因**：内部已优化模式切换逻辑，无需强制重新渲染

```vue
<!-- 旧代码 -->
<tr-sender :key="mode" :mode="mode" />

<!-- 新代码 -->
<tr-sender :mode="mode" />
```

## API 兼容性

### 完全支持的 Props

| Props | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| `modelValue` | `string` | `''` | 双向绑定值 |
| `placeholder` | `string` | `'请输入...'` | 占位符 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `loading` | `boolean` | `false` | 加载状态 |
| `mode` | `'single' \| 'multiple'` | `'single'` | 输入模式 |
| `submitType` | `'enter' \| 'ctrlEnter' \| 'shiftEnter'` | `'ctrlEnter'` | 提交触发方式 |
| `maxLength` | `number` | - | 最大字符数 |
| `showWordLimit` | `boolean` | `false` | 显示字数限制 |
| `autoSize` | `boolean \| object` | `false` | 自动调整高度 |
| `clearable` | `boolean` | `false` | 显示清空按钮 |
| `autofocus` | `boolean` | `false` | 自动聚焦 |
| `stopText` | `string` | `'停止'` | 停止按钮文字 |
| `size` | `'default' \| 'small'` | `'default'` | 组件尺寸 ⚠️ 新增 |

### 适配层处理的 Props

以下 Props 在 `TrSenderCompat` 中通过适配层支持，迁移到 `TrChatInput` 时需要调整：

| Props | 迁移方式 |
|-------|---------|
| `allowSpeech` | 改用 `footer` 插槽 + `VoiceButton` |
| `speech` | 改用 `VoiceButton` 的 `speechConfig` |
| `allowFiles` | 改用 `footer` 插槽 + `UploadButton` |
| `buttonGroup` | 拆分为 `defaultActions` 和插槽 |
| `suggestions` | 改用 `extensions: [Suggestion.configure()]` |
| `templateData` | 改用 `extensions: [Template.configure()]` |

### 完全支持的 Events

| Events | 说明 |
|--------|------|
| `update:modelValue` | 内容更新 |
| `submit` | 提交 |
| `clear` | 清空 |
| `cancel` | 取消 |
| `focus` | 聚焦 |
| `blur` | 失焦 |

### 适配层处理的 Events

| Events | 迁移方式 |
|--------|---------|
| `speech-start` / `speech-end` / `speech-interim` / `speech-error` | 改用 `VoiceButton` 的对应事件 |
| `suggestion-select` | 改用 `Suggestion` 扩展的 `onSelect` |
| `files-selected` | 改用 `UploadButton` 的 `select` |

### 完全支持的 Methods

| Methods | 说明 |
|---------|------|
| `focus()` | 聚焦 |
| `blur()` | 失焦 |
| `clear()` | 清空 |
| `submit()` | 提交 |
| `setTemplateData(data)` | 设置模板数据并激活首个字段 ⚠️ 新增 |

### 已废弃的功能

| 废弃项 | 替代方案 |
|--------|---------|
| `#decorativeContent` 插槽 | 使用 `#content` 插槽 |
| `class="tr-sender-compact"` | 使用 `size="small"` prop |
| `activateTemplateFirstField()` 方法 | 使用 `setTemplateData()` 方法 |
| `@change` 事件 | 使用 `@blur` 事件 |

## 迁移示例

### 语音输入

```vue
<!-- TrSenderCompat（过渡期） -->
<TrSenderCompat 
  :allow-speech="true"
  :speech="{ lang: 'zh-CN', continuous: true }"
  @speech-start="onStart"
/>

<!-- TrChatInput（最终目标） -->
<TrChatInput>
  <template #footer>
    <VoiceButton
      :speech-config="{ lang: 'zh-CN', continuous: true }"
      @speech-start="onStart"
    />
  </template>
</TrChatInput>
```

### 文件上传

```vue
<!-- TrSenderCompat（过渡期） -->
<TrSenderCompat 
  :allow-files="true"
  :button-group="{ file: { accept: 'image/*', multiple: true } }"
  @files-selected="onFiles"
/>

<!-- TrChatInput（最终目标） -->
<TrChatInput>
  <template #footer>
    <UploadButton
      accept="image/*"
      :multiple="true"
      @select="onFiles"
    />
  </template>
</TrChatInput>
```

### 建议列表

```vue
<!-- TrSenderCompat（过渡期） -->
<TrSenderCompat 
  :suggestions="suggestions"
  @suggestion-select="onSelect"
/>

<!-- TrChatInput（最终目标） -->
<script setup>
import { ChatInput } from '@opentiny/tiny-robot'

const extensions = [
  ChatInput.Suggestion.configure({
    items: allSuggestions,
    filterFn: (items, query) => items.filter(s => s.content.includes(query)),
    onSelect: onSelect
  })
]
</script>

<TrChatInput :extensions="extensions" />
```

## 常见问题

### Q: 我应该使用哪个组件？

**A**: 
- **TrSender**（旧实现）：仅用于维护旧项目
- **TrSenderCompat**（过渡期）：快速迁移，保持旧 API ✅ 推荐
- **TrChatInput**（新实现）：新项目使用，功能更强大

### Q: TrSenderCompat 的性能如何？

**A**: 性能损耗 < 10%，它只是一个薄适配层，核心逻辑完全使用 ChatInput。

### Q: 可以混合使用吗？

**A**: 可以。在过渡期，你可以在旧项目中继续使用 TrSender，在新项目中使用 TrChatInput。

### Q: 最终会发生什么？

**A**: TrSender 会完全替换为 ChatInput 实现，API 会有 Breaking Changes。我们会提供详细的迁移指南。