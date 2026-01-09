---
outline: [1, 3]
---

# SenderCompat - 快速迁移组件

:::info 组件定位
`SenderCompat` 是为 v0.3.0 用户提供的**过渡期兼容组件**。

它保留了 v0.3.0 的大部分 API，让你：
- ✅ 快速升级到 v0.4.0 的底层实现
- ✅ 保持现有代码最小改动
- ✅ 为将来完全升级到 v0.4.0 Sender 做准备

**推荐迁移路径：** v0.3.0 Sender → SenderCompat (快速) → v0.4.0 Sender (最终)
:::

## 快速开始

### 第一步：修改导入语句

```typescript
// ❌ 旧代码 (v0.3.0)
import { TrSender } from '@opentiny/tiny-robot'

// ✅ 新代码 (使用 SenderCompat)
import { TrSenderCompat as TrSender } from '@opentiny/tiny-robot'
```

### 第二步：处理破坏性变更

:::warning 重要提示
虽然大部分 API 保持兼容，但以下 5 个破坏性变更**必须处理**才能正常工作：
:::

#### 1. 紧凑模式实现方式

**v0.3.0 用法：**
```vue
<tr-sender class="tr-sender-compact" mode="single" />
```

**SenderCompat 用法：**
```vue
<tr-sender-compat size="small" mode="single" />
<!-- 或使用别名 -->
<tr-sender size="small" mode="single" />
```

---

#### 2. 装饰性内容插槽

**v0.3.0 用法：**
```vue
<tr-sender :allow-speech="false">
  <template #decorativeContent>
    缴费服务正在进行中，<a href="#">点击前往</a>
  </template>
</tr-sender>
```

**SenderCompat 用法：**
```vue
<tr-sender-compat :disabled="true">
  <template #content>
    缴费服务正在进行中，<a href="#">点击前往</a>
  </template>
</tr-sender-compat>
```

---

#### 3. 模板数据设置方法

**v0.3.0 用法：**
```typescript
// 推荐：修改 templateData 的值
templateData.value = data
senderRef.value?.activateTemplateFirstField()
```

**SenderCompat 用法：**
```typescript
// 推荐：使用新增的便捷方法
senderRef.value?.setTemplateData(data)
```

:::tip 数据结构说明
SenderCompat 保持 v0.3.0 的数据结构：
```typescript
// ✅ SenderCompat 使用
{ type: 'template', content: '...' }

// ⚠️ v0.4.0 Sender 使用（注意类型名变更）
{ type: 'block', content: '...' }
```
详见 [模板填充迁移](#模板迁移)
:::

---

#### 4. 插槽名称变更

| v0.3.0 插槽 | SenderCompat 替代方案 | 说明 |
|------------|----------------------|------|
| `#actions` | `#actions-inline` | 单行模式操作按钮区域 |
| `#footer-left` | `#footer` | 底部左侧区域 |
| `#decorativeContent` | `#content` (需配合 `disabled`) | 自定义编辑器内容 |

**示例：**

```vue
<!-- ❌ v0.3.0 -->
<tr-sender>
  <template #actions>
    <custom-button />
  </template>
</tr-sender>

<!-- ✅ SenderCompat -->
<tr-sender-compat>
  <template #actions-inline>
    <custom-button />
  </template>
</tr-sender-compat>
```

---

#### 5. 移除不必要的 key 绑定

**v0.3.0 用法：**
```vue
<!-- 模式切换时需要强制重新渲染 -->
<tr-sender :key="mode" :mode="mode" />
```

**SenderCompat 用法：**
```vue
<!-- 内部已优化，无需 key -->
<tr-sender-compat :mode="mode" />
```

---

## 完整迁移方案 {#完整迁移方案}

如果你准备好完全升级到 v0.4.0 Sender，这里是详细的迁移方案。

### 迁移路径对比

```
方案 A：快速迁移（当前）
v0.3.0 Sender → SenderCompat (改导入，小调整)

方案 B：完全升级（目标）
SenderCompat → v0.4.0 Sender (使用新 API)
```

---

### 1. 语音输入迁移 {#语音输入迁移}

**SenderCompat（当前）：**
```vue
<template>
  <tr-sender-compat 
    :allow-speech="true"
    :speech="{ lang: 'zh-CN', continuous: true }"
    @speech-start="onStart"
    @speech-end="onEnd"
    @speech-error="onError"
  />
</template>

<script setup>
const onStart = () => { console.log('开始录音') }
const onEnd = (transcript) => { console.log('识别结果:', transcript) }
const onError = (error) => { console.error('识别错误:', error) }
</script>
```

**v0.4.0 Sender（目标）：**
```vue
<template>
  <tr-sender>
    <template #footer>
      <voice-button
        :speech-config="{ lang: 'zh-CN', continuous: true }"
        @speech-start="onStart"
        @speech-end="onEnd"
        @speech-error="onError"
      />
    </template>
  </tr-sender>
</template>

<script setup>
import { VoiceButton } from '@opentiny/tiny-robot'

const onStart = () => { console.log('开始录音') }
const onEnd = (transcript) => { console.log('识别结果:', transcript) }
const onError = (error) => { console.error('识别错误:', error) }
</script>
```

**变更说明：**
- ❌ 移除 `allow-speech` prop
- ❌ 移除 `speech` prop
- ❌ 移除 `@speech-*` 事件
- ✅ 导入并使用独立的 `VoiceButton` 组件
- ✅ 通过 `footer` 插槽添加
- ✅ 使用 `speech-config` prop 替代 `speech`
- ✅ 事件绑定在 `VoiceButton` 上

---

### 2. 文件上传迁移 {#文件上传迁移}

**SenderCompat（当前）：**
```vue
<template>
  <tr-sender-compat 
    :allow-files="true"
    :button-group="{ file: { accept: 'image/*', multiple: true } }"
    @files-selected="onFilesSelected"
  />
</template>

<script setup>
const onFilesSelected = (files) => {
  console.log('选择的文件:', files)
}
</script>
```

**v0.4.0 Sender（目标）：**
```vue
<template>
  <tr-sender>
    <template #footer>
      <upload-button
        accept="image/*"
        :multiple="true"
        @select="onFilesSelected"
      />
    </template>
  </tr-sender>
</template>

<script setup>
import { UploadButton } from '@opentiny/tiny-robot'

const onFilesSelected = (files) => {
  console.log('选择的文件:', files)
}
</script>
```

**变更说明：**
- ❌ 移除 `allow-files` prop
- ❌ 移除 `button-group.file` 配置
- ❌ 移除 `@files-selected` 事件
- ✅ 导入并使用独立的 `UploadButton` 组件
- ✅ 配置项扁平化（accept、multiple 作为独立 prop）
- ✅ 使用 `@select` 事件替代 `@files-selected`

---

### 3. 按钮配置迁移 {#按钮配置迁移}

**SenderCompat（当前）：**
```vue
<tr-sender-compat 
  :button-group="{
    submit: { disabled: true, tooltip: '请先输入内容' },
    voice: { icon: customIcon }
  }"
/>
```

**v0.4.0 Sender（目标）：**
```vue
<tr-sender 
  :default-actions="{
    submit: { disabled: true, tooltip: '请先输入内容' }
  }"
>
  <template #footer>
    <voice-button :icon="customIcon" />
  </template>
</tr-sender>
```

**变更说明：**
- ❌ 移除 `button-group` prop
- ✅ 使用 `default-actions` 配置默认按钮（clear、submit）
- ✅ 增强按钮（voice、upload）通过插槽添加

---

### 4. 智能联想迁移 {#联想迁移}

**SenderCompat（当前）：**
```vue
<template>
  <tr-sender-compat 
    v-model="inputText"
    :suggestions="filteredSuggestions"
    :suggestion-popup-width="500"
    :active-suggestion-keys="['Enter']"
    @suggestion-select="onSelect"
  />
</template>

<script setup>
import { ref, computed } from 'vue'

const inputText = ref('')
const allSuggestions = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'CDN-权限管理' }
]

const filteredSuggestions = computed(() => {
  if (!inputText.value) return []
  return allSuggestions.filter(s => 
    s.content.includes(inputText.value)
  )
})

const onSelect = (value) => {
  console.log('选中:', value)
}
</script>
```

**v0.4.0 Sender（目标）：**
```vue
<template>
  <tr-sender 
    v-model="inputText"
    :extensions="extensions"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Sender } from '@opentiny/tiny-robot'

const inputText = ref('')
const allSuggestions = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'CDN-权限管理' }
]

const extensions = [
  Sender.Suggestion.configure({
    items: allSuggestions,
    filterFn: (items, query) => {
      if (!query) return []
      return items.filter(s => s.content.includes(query))
    },
    popupWidth: 500,
    activeSuggestionKeys: ['Enter'],
    onSelect: (item) => {
      console.log('选中:', item.content)
    }
  })
]
</script>
```

**变更说明：**
- ❌ 移除 `suggestions` prop
- ❌ 移除 `suggestion-popup-width` prop
- ❌ 移除 `active-suggestion-keys` prop
- ❌ 移除 `@suggestion-select` 事件
- ✅ 使用 `extensions` + `Suggestion.configure()` 配置
- ✅ 过滤逻辑通过 `filterFn` 实现
- ✅ 使用 `onSelect` 回调替代事件

---

### 5. 模板填充迁移 {#模板迁移}

**SenderCompat（当前）：**
```vue
<template>
  <tr-sender-compat 
    ref="senderRef"
    v-model:template-data="templateData"
  />
  <button @click="setTemplate">设置模板</button>
</template>

<script setup>
import { ref } from 'vue'

const senderRef = ref()
const templateData = ref([])

const setTemplate = () => {
  senderRef.value?.setTemplateData([
    { type: 'text', content: '请帮我' },
    { type: 'template', content: '翻译' }
  ])
}
</script>
```

**v0.4.0 Sender（目标）：**
```vue
<template>
  <tr-sender :extensions="extensions" />
  <button @click="setTemplate">设置模板</button>
</template>

<script setup>
import { ref } from 'vue'
import { Sender } from '@opentiny/tiny-robot'

const templateData = ref([])

const extensions = [
  Sender.Template.configure({
    items: templateData  // 响应式 ref，自动同步
  })
]

const setTemplate = () => {
  templateData.value = [
    { type: 'text', content: '请帮我' },
    { type: 'block', content: '翻译' }  // ⚠️ 注意：type 从 'template' 改为 'block'
  ]
  // ✅ 自动激活第一个字段，无需手动调用
}
</script>
```

**变更说明：**
- ❌ 移除 `v-model:template-data`
- ❌ 移除 `activateTemplateFirstField()` 方法
- ❌ 移除 `setTemplateData()` 便捷方法
- ✅ 使用 `extensions` + `Template.configure()` 配置
- ✅ 支持响应式 ref，数据变化自动更新
- ✅ 自动激活第一个可编辑字段
- ⚠️ **数据结构变更**：`type: 'template'` → `type: 'block'`

---

### 6. 主题配置迁移 {#主题迁移}

**v0.4.0 Sender（目标）：**
```vue
<template>
  <theme-provider theme="dark">
    <tr-sender />
  </theme-provider>
</template>

<script setup>
import { ThemeProvider } from '@opentiny/tiny-robot'
</script>
```

**变更说明：**
- ❌ 移除 `theme` prop
- ✅ 使用 `ThemeProvider` 包裹组件
- ✅ 支持全局主题配置，所有子组件自动继承

---

## API 参考

### Props

| 属性名 | 说明 | 类型 | 默认值 |
|-------|------|------|--------|
| modelValue | 绑定值(v-model) | `string` | `''` |
| defaultValue | 默认值(非响应式) | `string` | `''` |
| placeholder | 输入框占位文本 | `string` | `'请输入内容...'` |
| mode | 输入模式 | `'single' \| 'multiple'` | `'single'` |
| size @new | 组件尺寸 | `'normal' \| 'small'` | `'normal'` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |
| autofocus | 自动获取焦点 | `boolean` | `false` |
| autoSize | 自动调整高度 | `boolean \| { minRows: number, maxRows: number }` | `false` |
| clearable | 是否可清空 | `boolean` | `false` |
| maxLength | 最大输入长度 | `number` | `Infinity` |
| showWordLimit | 是否显示字数统计 | `boolean` | `false` |
| submitType | 提交方式 | `'enter' \| 'ctrlEnter' \| 'shiftEnter'` | `'enter'` |
| stopText | 停止按钮文字 | `string` | `'停止响应'` |
| allowSpeech @deprecated | 是否开启语音输入 | `boolean` | `false` |
| speech @deprecated | 语音识别配置 | `boolean \| SpeechConfig` | - |
| allowFiles @deprecated | 是否允许文件上传 | `boolean` | `true` |
| buttonGroup @deprecated | 按钮组配置 | `ButtonGroupConfig` | `{}` |
| theme @deprecated | 主题样式 | `'light' \| 'dark'` | `'light'` |
| suggestions @deprecated | 输入建议列表 | `(string \| SuggestionItem)[]` | `[]` |
| suggestionPopupWidth @deprecated | 建议弹窗宽度 | `number \| string` | `400px` |
| activeSuggestionKeys @deprecated | 激活建议项的按键 | `string[]` | `['Enter', 'Tab']` |
| templateData @deprecated | 模板数据 | `TemplateItem[]` | `[]` |

### Slots

| 插槽名称 | 描述 |
|---------|------|
| header | 头部插槽，位于输入框上方 |
| prefix | 前缀插槽，位于输入框左侧 |
| footer | 底部自定义区域 |
| footer-right | 底部右侧区域 |
| content | 内容插槽 |
| actions-inline @new | 单行模式操作按钮区域 |
| actions @deprecated | 后缀插槽，位于输入框右侧（改用 `actions-inline`） |
| footer-left @deprecated | 底部左侧插槽（改用 `footer`） |
| decorativeContent @deprecated | 装饰性内容插槽（改用 `content` + `disabled`） |

### Events

| 事件名 | 说明 | 回调参数 |
|-------|------|----------|
| update:modelValue | 内容更新 | `(value: string)` |
| submit | 提交内容 | `(value: string)` |
| clear | 清空内容 | `()` |
| focus | 获得焦点 | `(event: FocusEvent)` |
| blur | 失去焦点 | `(event: FocusEvent)` |
| input | 输入变化 | `(value: string)` |
| cancel | 取消操作 | `()` |
| change @deprecated | 输入值改变且失焦时触发 | `(value: string)` |
| files-selected @deprecated | 文件选择时触发 | `(files: File[])` |
| speech-start @deprecated | 语音识别开始时触发 | `()` |
| speech-end @deprecated | 语音识别结束时触发 | `(transcript: string)` |
| speech-interim @deprecated | 语音识别中间结果时触发 | `(transcript: string)` |
| speech-error @deprecated | 语音识别错误时触发 | `(error: Error)` |
| suggestion-select @deprecated | 选择输入建议时触发 | `(value: string)` |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|-------|------|------|--------|
| focus | 使输入框获取焦点 | - | `void` |
| blur | 使输入框失去焦点 | - | `void` |
| clear | 清空输入内容 | - | `void` |
| submit | 手动触发提交 | - | `void` |
| setTemplateData @new | 设置模板数据并激活首个字段 | `(data: TemplateItem[])` | `void` |
| startSpeech @deprecated | 开始语音识别 | - | `Promise<void>` |
| stopSpeech @deprecated | 停止语音识别 | - | `void` |
| activateTemplateFirstField @deprecated | 激活模板的第一个输入字段 | - | `void` |

---

## 常见问题

### Q: 我应该使用哪个组件？

**A**: 
- **v0.3.0 Sender**：仅用于维护旧项目，不建议新使用
- **SenderCompat**：✅ 推荐作为过渡，快速迁移保持 API 兼容
- **v0.4.0 Sender**：新项目或准备完全重构时使用，功能更强大

### Q: SenderCompat 的性能如何？

**A**: 性能损耗 < 10%，它只是一个薄适配层，相比 v0.3.0 甚至有性能提升。

### Q: SenderCompat 会一直维护吗？

**A**: SenderCompat 是过渡期组件，会在未来版本（如 v1.0.0）中废弃。建议逐步迁移到 v0.4.0 Sender。

### Q: 可以混合使用 SenderCompat 和 v0.4.0 Sender 吗？

**A**: 可以。在同一项目中，新页面使用 v0.4.0 Sender，旧页面继续使用 SenderCompat，逐步迁移。

### Q: 我的项目中使用了自定义插槽，会受影响吗？

**A**: 大部分插槽保持兼容，但 `#actions`、`#footer-left`、`#decorativeContent` 需要调整。详见 [第二步：处理破坏性变更](#第二步-处理破坏性变更)。