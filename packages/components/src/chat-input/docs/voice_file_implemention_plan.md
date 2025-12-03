# 语音输入和文件上传组件化实施方案

## 📊 方案重新评估

### ✅ 更优方案：独立组件 + 插槽作用域

**核心思想：语音输入和文件上传与编辑器输入无关，应该作为完全独立的组件，通过插槽传入，并通过插槽作用域访问 ChatInput 的状态。**

### 为什么这个方案更好？

1. **职责更清晰**
   - ChatInput 只负责文本编辑
   - VoiceInput 和 FileUpload 是独立的功能组件
   - 用户可以自由组合

2. **更灵活**
   - 用户可以选择不使用这些组件
   - 用户可以自定义实现
   - 用户可以放在任何插槽位置

3. **更解耦**
   - ChatInput 不需要知道语音和文件上传的存在
   - 减少 ChatInput 的代码量和复杂度
   - 更容易维护和测试

---

## 🎯 核心优势

### 1. 完全解耦

```vue
<!-- ChatInput 不需要知道语音和文件上传的存在 -->
<chat-input v-model="content">
  <template #actions-inline="{ editor, focus, insert }">
    <!-- 用户自由选择是否使用这些组件 -->
    <voice-input @result="insert" />
    <file-upload @select="handleFiles" />
  </template>
</chat-input>
```

### 2. 插槽作用域共享状态

```typescript
// ChatInput 通过插槽作用域暴露必要的状态和方法
<template #actions-inline="{
  editor,        // 编辑器实例
  focus,         // 聚焦方法
  insert,        // 插入内容方法
  disabled,      // 禁用状态
  loading,       // 加载状态
}">
```

### 3. 组件完全独立

```typescript
// VoiceInput 和 FileUpload 是独立的组件
// 可以在任何地方使用，不依赖 ChatInput
<voice-input @result="handleVoiceResult" />
<file-upload @select="handleFileSelect" />
```

### 4. 更简单的实现

- ❌ 不需要在 ChatInput 中实现语音和文件上传逻辑
- ❌ 不需要 Context 中的 speechState、startSpeech 等
- ❌ 不需要 props.plugins 配置
- ✅ ChatInput 代码量减少
- ✅ 职责更单一

---

## 🏗️ 实施方案

### 阶段 1：优化 ChatInput 插槽作用域（1 天）

#### 1.1 定义插槽作用域类型

```typescript
// types/slots.ts

/**
 * ChatInput 插槽作用域
 * 
 * 通过插槽作用域暴露给外部组件的状态和方法
 */
export interface ChatInputSlotScope {
  /**
   * 编辑器实例
   */
  editor: Editor | undefined

  /**
   * 聚焦编辑器
   */
  focus: () => void

  /**
   * 失焦编辑器
   */
  blur: () => void

  /**
   * 插入内容到编辑器
   * @param content - 要插入的内容（文本或 HTML）
   */
  insert: (content: string) => void

  /**
   * 追加内容到编辑器末尾
   * @param content - 要追加的内容
   */
  append: (content: string) => void

  /**
   * 替换编辑器全部内容
   * @param content - 新内容
   */
  replace: (content: string) => void

  /**
   * 获取编辑器内容
   */
  getContent: () => string

  /**
   * 清空编辑器
   */
  clear: () => void

  /**
   * 是否禁用
   */
  disabled: boolean

  /**
   * 是否加载中
   */
  loading: boolean

  /**
   * 是否有内容
   */
  hasContent: boolean

  /**
   * 当前字符数
   */
  characterCount: number
}
```

#### 1.2 更新插槽定义

```typescript
// index.type.ts

export interface ChatInputSlots {
  /**
   * 头部插槽
   */
  header?: () => unknown

  /**
   * 前缀插槽
   */
  prefix?: () => unknown

  /**
   * 内容插槽
   */
  content?: (scope: { editor: Editor | undefined }) => unknown

  /**
   * 单行模式内联操作按钮插槽
   * 
   * @example
   * ```vue
   * <chat-input>
   *   <template #actions-inline="{ insert, focus, disabled }">
   *     <voice-input @result="insert" :disabled="disabled" />
   *     <file-upload @select="handleFiles" />
   *   </template>
   * </chat-input>
   * ```
   */
  'actions-inline'?: (scope: ChatInputSlotScope) => unknown

  /**
   * 底部插槽（多行模式）
   */
  footer?: (scope: ChatInputSlotScope) => unknown

  /**
   * 底部右侧插槽（多行模式）
   */
  'footer-right'?: (scope: ChatInputSlotScope) => unknown
}
```

### 阶段 2：实现独立的 VoiceInput 组件（2 天）

#### 2.1 组件设计

```typescript
// voice-input/index.type.ts

/**
 * VoiceInput 组件 Props
 */
export interface VoiceInputProps {
  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 语音识别语言
   * @default 'zh-CN'
   */
  lang?: string

  /**
   * 是否连续识别
   * @default false
   */
  continuous?: boolean

  /**
   * 是否返回临时结果
   * @default true
   */
  interimResults?: boolean

  /**
   * 自定义语音识别处理器
   */
  handler?: SpeechHandler

  /**
   * 按钮提示文本
   */
  tooltip?: string

  /**
   * 按钮尺寸
   */
  size?: number | string
}

/**
 * VoiceInput 组件 Emits
 */
export interface VoiceInputEmits {
  /**
   * 开始录音
   */
  (e: 'start'): void

  /**
   * 临时识别结果
   * @param transcript - 临时识别的文本
   */
  (e: 'interim', transcript: string): void

  /**
   * 最终识别结果
   * @param transcript - 最终识别的文本
   */
  (e: 'result', transcript: string): void

  /**
   * 结束录音
   * @param transcript - 最终识别的文本（可能为空）
   */
  (e: 'end', transcript?: string): void

  /**
   * 识别错误
   * @param error - 错误信息
   */
  (e: 'error', error: Error): void
}
```

#### 2.2 组件实现

```vue
<!-- voice-input/index.vue -->

<template>
  <action-button
    :icon="isRecording ? IconMicrophoneActive : IconMicrophone"
    :active="isRecording"
    :disabled="!isSupported || disabled"
    :size="size"
    :tooltip="computedTooltip"
    @click="handleClick"
  >
    <!-- 录音动画 -->
    <transition name="tr-pulse">
      <div v-if="isRecording" class="tr-voice-recording-indicator" />
    </transition>
  </action-button>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { VoiceInputProps, VoiceInputEmits } from './index.type'
import { createSpeechHandler } from './speech-handler'
import ActionButton from '../chat-input/components/action-button/index.vue'
import { IconMicrophone, IconMicrophoneActive } from '@opentiny/tiny-robot-svgs'

const props = withDefaults(defineProps<VoiceInputProps>(), {
  lang: 'zh-CN',
  continuous: false,
  interimResults: true,
})

const emit = defineEmits<VoiceInputEmits>()

// 状态
const isRecording = ref(false)
const isSupported = ref(false)
const error = ref<Error>()

// 创建语音处理器
const handler = props.handler ?? createSpeechHandler({
  lang: props.lang,
  continuous: props.continuous,
  interimResults: props.interimResults,
})

// 检查浏览器支持
isSupported.value = handler.isSupported()

// 计算提示文本
const computedTooltip = computed(() => {
  if (!isSupported.value) return '当前浏览器不支持语音识别'
  if (props.disabled) return '语音输入已禁用'
  if (props.tooltip) return props.tooltip
  return isRecording.value ? '停止录音' : '开始语音输入'
})

// 开始录音
const start = () => {
  if (!isSupported.value) {
    const err = new Error('当前浏览器不支持语音识别')
    error.value = err
    emit('error', err)
    return
  }

  if (isRecording.value) {
    console.warn('语音识别已在进行中')
    return
  }

  handler.start({
    onStart: () => {
      isRecording.value = true
      error.value = undefined
      emit('start')
    },
    onInterim: (transcript) => {
      emit('interim', transcript)
    },
    onFinal: (transcript) => {
      emit('result', transcript)
    },
    onEnd: (transcript) => {
      isRecording.value = false
      emit('end', transcript)
    },
    onError: (err) => {
      error.value = err
      isRecording.value = false
      emit('error', err)
    },
  })
}

// 停止录音
const stop = () => {
  if (!isRecording.value) return
  handler.stop()
}

// 处理点击
const handleClick = () => {
  if (isRecording.value) {
    stop()
  } else {
    start()
  }
}

// 清理
onUnmounted(() => {
  if (isRecording.value) {
    handler.stop()
  }
})

// 暴露方法
defineExpose({
  start,
  stop,
  isRecording,
  isSupported,
})
</script>

<style lang="less" scoped>
.tr-voice-recording-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 0, 0, 0.2);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.5;
  }
}
</style>
```

### 阶段 3：实现独立的 FileUpload 组件（2 天）

#### 3.1 组件设计

```typescript
// file-upload/index.type.ts

/**
 * FileUpload 组件 Props
 */
export interface FileUploadProps {
  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 接受的文件类型
   * @default '*'
   * @example 'image/*,.pdf,.doc'
   */
  accept?: string

  /**
   * 是否支持多选
   * @default false
   */
  multiple?: boolean

  /**
   * 文件大小限制（MB）
   */
  maxSize?: number

  /**
   * 最大文件数量
   */
  maxCount?: number

  /**
   * 按钮提示文本
   */
  tooltip?: string

  /**
   * 按钮尺寸
   */
  size?: number | string

  /**
   * 自定义图标
   */
  icon?: Component
}

/**
 * FileUpload 组件 Emits
 */
export interface FileUploadEmits {
  /**
   * 文件选择
   * @param files - 选择的文件列表
   */
  (e: 'select', files: File[]): void

  /**
   * 文件验证失败
   * @param error - 错误信息
   * @param file - 验证失败的文件
   */
  (e: 'error', error: Error, file?: File): void
}
```

#### 3.2 组件实现

```vue
<!-- file-upload/index.vue -->

<template>
  <action-button
    :icon="icon ?? IconUpload"
    :disabled="disabled"
    :size="size"
    :tooltip="computedTooltip"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { FileUploadProps, FileUploadEmits } from './index.type'
import ActionButton from '../chat-input/components/action-button/index.vue'
import { IconUpload } from '@opentiny/tiny-robot-svgs'

const props = withDefaults(defineProps<FileUploadProps>(), {
  accept: '*',
  multiple: false,
})

const emit = defineEmits<FileUploadEmits>()

// 文件输入元素引用
const fileInputRef = ref<HTMLInputElement>()

// 计算提示文本
const computedTooltip = computed(() => {
  if (props.disabled) return '文件上传已禁用'
  return props.tooltip ?? '上传文件'
})

// 创建文件输入元素
const createFileInput = () => {
  if (fileInputRef.value) return fileInputRef.value

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = props.accept
  input.multiple = props.multiple
  input.style.display = 'none'

  input.addEventListener('change', handleFileChange)

  document.body.appendChild(input)
  fileInputRef.value = input

  return input
}

// 处理文件选择
const handleFileChange = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  
  if (files.length === 0) return

  // 文件数量验证
  if (props.maxCount && files.length > props.maxCount) {
    const error = new Error(`最多只能选择 ${props.maxCount} 个文件`)
    emit('error', error)
    return
  }

  // 文件大小验证
  if (props.maxSize) {
    const maxBytes = props.maxSize * 1024 * 1024
    const oversized = files.filter(f => f.size > maxBytes)
    
    if (oversized.length > 0) {
      const error = new Error(
        `以下文件超过 ${props.maxSize}MB 限制: ${oversized.map(f => f.name).join(', ')}`
      )
      emit('error', error, oversized[0])
      return
    }
  }

  // 触发选择事件
  emit('select', files)

  // 清空 input 值，允许重复选择同一文件
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 打开文件选择对话框
const open = () => {
  if (props.disabled) return
  const input = createFileInput()
  input.click()
}

// 处理按钮点击
const handleClick = () => {
  open()
}

// 清理
onUnmounted(() => {
  if (fileInputRef.value) {
    fileInputRef.value.removeEventListener('change', handleFileChange)
    document.body.removeChild(fileInputRef.value)
  }
})

// 暴露方法
defineExpose({
  open,
})
</script>
```

### 阶段 4：更新 ChatInput 插槽实现（1 天）

#### 4.1 更新 SingleLineLayout

```vue
<!-- components/layouts/SingleLineLayout.vue -->

<template>
  <div class="tr-chat-input-single-layout">
    <!-- ... -->

    <!-- 单行模式操作按钮 -->
    <div class="tr-chat-input-actions-inline">
      <slot name="actions-inline" v-bind="slotScope">
        <!-- 默认内容：提交按钮 -->
        <div v-if="context.hasContent.value || context.loading.value">
          <ClearButton v-if="context.clearable.value && context.hasContent.value" />
          <SubmitButton />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChatInputContext } from '../../context'
import type { ChatInputSlotScope } from '../../types'

const context = useChatInputContext()

// 构建插槽作用域
const slotScope = computed<ChatInputSlotScope>(() => ({
  editor: context.editor.value,
  focus: context.focus,
  blur: context.blur,
  insert: (content: string) => {
    context.editor.value?.commands.insertContent(content + ' ')
    context.focus()
  },
  append: (content: string) => {
    context.editor.value?.commands.insertContent(content, {
      at: context.editor.value.state.doc.content.size,
    })
    context.focus()
  },
  replace: (content: string) => {
    context.setContent(content)
    context.focus()
  },
  getContent: context.getContent,
  clear: context.clear,
  disabled: context.disabled.value,
  loading: context.loading.value,
  hasContent: context.hasContent.value,
  characterCount: context.characterCount.value,
}))
</script>
```

#### 4.2 更新 MultiLineLayout

```vue
<!-- components/layouts/MultiLineLayout.vue -->

<template>
  <div class="tr-chat-input-multiple-layout">
    <!-- ... -->

    <!-- 底部操作区 -->
    <div class="tr-chat-input-footer">
      <div class="tr-chat-input-footer-left">
        <slot name="footer" v-bind="slotScope">
          <!-- 默认内容：字数统计 -->
          <WordCounter v-if="context.showWordLimit.value" />
        </slot>
      </div>

      <div class="tr-chat-input-footer-right">
        <slot name="footer-right" v-bind="slotScope">
          <!-- 默认内容：清空和提交按钮 -->
          <ClearButton v-if="context.clearable.value && context.hasContent.value" />
          <SubmitButton />
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChatInputContext } from '../../context'
import type { ChatInputSlotScope } from '../../types'

const context = useChatInputContext()

// 构建插槽作用域（同上）
const slotScope = computed<ChatInputSlotScope>(() => ({
  // ... 同 SingleLineLayout
}))
</script>
```

### 阶段 5：导出独立组件（1 天）

#### 5.1 组件导出配置

```typescript
// packages/components/src/voice-input/index.ts

export { default as VoiceInput } from './index.vue'
export * from './index.type'
export * from './speech-handler'
```

```typescript
// packages/components/src/file-upload/index.ts

export { default as FileUpload } from './index.vue'
export * from './index.type'
```

#### 5.2 主包导出

```typescript
// packages/components/src/index.ts

// ChatInput 组件
export { default as ChatInput } from './chat-input'
export * from './chat-input/index.type'

// 独立的语音和文件上传组件
export { VoiceInput } from './voice-input'
export { FileUpload } from './file-upload'
```

### 阶段 6：文档和示例（2 天）

#### 6.1 使用文档

创建 `docs/src/components/voice-input.md`：

```markdown
# VoiceInput 语音输入组件

独立的语音输入组件，可以在任何地方使用，不依赖 ChatInput。

## 基础使用

<demo vue="../../demos/voice-input/basic.vue" />

## 与 ChatInput 组合使用

<demo vue="../../demos/voice-input/with-chat-input.vue" />

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| disabled | boolean | false | 是否禁用 |
| lang | string | 'zh-CN' | 语音识别语言 |
| continuous | boolean | false | 是否连续识别 |
| interimResults | boolean | true | 是否返回临时结果 |
| handler | SpeechHandler | - | 自定义语音识别处理器 |
| tooltip | string | - | 按钮提示文本 |
| size | number \| string | - | 按钮尺寸 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| start | - | 开始录音 |
| interim | transcript: string | 临时识别结果 |
| result | transcript: string | 最终识别结果 |
| end | transcript?: string | 结束录音 |
| error | error: Error | 识别错误 |
```

创建 `docs/src/components/file-upload.md`：

```markdown
# FileUpload 文件上传组件

独立的文件上传组件，可以在任何地方使用，不依赖 ChatInput。

## 基础使用

<demo vue="../../demos/file-upload/basic.vue" />

## 与 ChatInput 组合使用

<demo vue="../../demos/file-upload/with-chat-input.vue" />

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| disabled | boolean | false | 是否禁用 |
| accept | string | '*' | 接受的文件类型 |
| multiple | boolean | false | 是否支持多选 |
| maxSize | number | - | 文件大小限制（MB） |
| maxCount | number | - | 最大文件数量 |
| tooltip | string | - | 按钮提示文本 |
| size | number \| string | - | 按钮尺寸 |
| icon | Component | - | 自定义图标 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| select | files: File[] | 文件选择 |
| error | error: Error, file?: File | 文件验证失败 |
```

#### 6.2 创建示例

```vue
<!-- docs/demos/voice-input/with-chat-input.vue -->

<template>
  <chat-input v-model="content" mode="single">
    <template #actions-inline="{ insert, disabled }">
      <voice-input 
        :disabled="disabled"
        @result="handleVoiceResult"
      />
    </template>
  </chat-input>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput, VoiceInput } from '@opentiny/tiny-robot'

const content = ref('')

const handleVoiceResult = (text: string) => {
  // 通过插槽作用域的 insert 方法插入内容
  content.value += text + ' '
}
</script>
```

```vue
<!-- docs/demos/file-upload/with-chat-input.vue -->

<template>
  <chat-input v-model="content" mode="single">
    <template #actions-inline="{ disabled }">
      <file-upload 
        :disabled="disabled"
        accept="image/*"
        :max-size="10"
        @select="handleFileSelect"
        @error="handleError"
      />
    </template>
  </chat-input>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput, FileUpload } from '@opentiny/tiny-robot'

const content = ref('')

const handleFileSelect = async (files: File[]) => {
  console.log('选择的文件:', files)
  // 处理文件上传逻辑
}

const handleError = (error: Error) => {
  console.error('文件选择错误:', error)
}
</script>
```

---

## 📈 实施时间表

| 阶段 | 任务 | 时间 | 负责人 |
|------|------|------|--------|
| **阶段 1** | 优化 ChatInput 插槽作用域 | 1 天 | - |
| **阶段 2** | 实现独立的 VoiceInput 组件 | 2 天 | - |
| **阶段 3** | 实现独立的 FileUpload 组件 | 2 天 | - |
| **阶段 4** | 更新 ChatInput 插槽实现 | 1 天 | - |
| **阶段 5** | 导出独立组件 | 1 天 | - |
| **阶段 6** | 文档和示例 | 2 天 | - |
| **总计** | | **9 天** | |

---

## ✅ 验收标准

### 功能验收

- [ ] VoiceInput 组件可以独立使用
- [ ] VoiceInput 语音识别功能正常（Chrome/Edge）
- [ ] FileUpload 组件可以独立使用
- [ ] FileUpload 文件选择和验证功能正常
- [ ] 组件可以通过插槽与 ChatInput 组合使用
- [ ] 插槽作用域正确传递状态和方法
- [ ] ChatInput 不包含语音和文件上传相关代码

### 代码质量

- [ ] TypeScript 类型定义完整
- [ ] 单元测试覆盖率 > 80%
- [ ] 无 ESLint 错误
- [ ] 代码注释完整

### 文档质量

- [ ] API 文档完整
- [ ] 使用示例完整
- [ ] 迁移指南完整

---

## 🎯 后续扩展

独立组件模式建立后，可以轻松添加更多功能组件：

### 1. 视频录制组件

```vue
<chat-input v-model="content">
  <template #footer="{ disabled }">
    <video-recorder 
      :disabled="disabled"
      :max-duration="60"
      @recorded="handleVideoRecorded"
    />
  </template>
</chat-input>
```

### 2. 绘图组件

```vue
<chat-input v-model="content">
  <template #footer="{ disabled }">
    <drawing-board 
      :disabled="disabled"
      :tools="['pen', 'eraser', 'shapes']"
      @save="handleDrawingSave"
    />
  </template>
</chat-input>
```

### 3. 位置选择组件

```vue
<chat-input v-model="content">
  <template #footer="{ disabled }">
    <location-picker 
      :disabled="disabled"
      map-provider="amap"
      @select="handleLocationSelect"
    />
  </template>
</chat-input>
```

---

## 📝 总结

### 为什么这个方案是最优的？

1. **完全符合"组合优于配置"设计思想**
   - ChatInput 保持纯净，不包含语音和文件上传逻辑
   - VoiceInput 和 FileUpload 是完全独立的组件
   - 通过插槽组合，而非配置启用

2. **职责清晰**
   - ChatInput 只负责文本编辑
   - VoiceInput 只负责语音识别
   - FileUpload 只负责文件选择
   - 各组件可独立使用和测试

3. **灵活性强**
   - 用户可以选择不使用这些组件
   - 用户可以自定义实现替代组件
   - 用户可以将组件放在任何插槽位置
   - 组件可以在 ChatInput 外部独立使用

4. **易于维护和扩展**
   - 代码解耦，修改一个组件不影响其他
   - 新增功能只需创建新的独立组件
   - 社区可以贡献第三方组件
   - 单元测试更简单

5. **性能优化**
   - 按需导入，不使用不加载
   - 减少 ChatInput 的代码量
   - 组件懒加载更容易实现

6. **开发体验好**
   - API 设计简洁直观
   - TypeScript 类型支持完善
   - 插槽作用域提供必要的状态和方法
   - 文档和示例完整

### 与配置方案的对比

| 维度 | 独立组件方案 ✅ | 配置方案 ❌ |
|------|----------------|------------|
| 设计思想 | 组合优于配置 | 配置优于组合 |
| ChatInput 复杂度 | 低（无需知道语音和文件上传） | 高（需要集成插件系统） |
| 组件独立性 | 完全独立 | 依赖 ChatInput |
| 灵活性 | 高（可放任何位置） | 中（固定位置） |
| 扩展性 | 高（创建新组件） | 中（需修改插件系统） |
| 学习成本 | 低（标准 Vue 组件） | 中（需理解插件配置） |
| 代码量 | 少（无插件系统） | 多（需插件系统） |

### 建议立即开始实施 ✅
