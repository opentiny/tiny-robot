---
outline: deep
---

# Sender 组件

TrSender 是一个灵活的输入组件，支持单行和多行模式，具有丰富的功能和自定义选项。适用于聊天界面、评论输入、搜索框等多种场景。

## 组件能力展示

### 基础用法

#### 单行模式

单行模式(`mode="single"`)适用于简单的输入场景，如搜索框、简短消息输入等。

<TrSender  />

```vue
<TrSender />
```

#### 多行模式

多行模式(`mode="multiple"`)适用于较长文本输入，如评论、聊天消息等。

<TrSender mode="multiple" />

```vue
<TrSender mode="multiple" />
```

### 状态控制

#### 加载状态

通过设置`loading`属性控制组件的加载状态，加载状态下输入框将显示加载动画并禁用输入。

<TrSender :loading="true" />

```vue
<TrSender :loading="true" />
```

#### 禁用状态

通过设置`disabled`属性禁用整个组件，禁用状态下无法输入内容或触发任何操作。

<TrSender :disabled="true" />

```vue
<TrSender :disabled="true" />
```

### 内容控制

#### 字数限制与统计

通过`maxLength`属性限制输入字符数，搭配`showWordLimit`显示字数统计。

<TrSender mode="multiple" :showWordLimit="true" :maxLength="1000" />

```vue
<TrSender mode="multiple" :showWordLimit="true" :maxLength="1000" />
```

#### 自动调整高度

设置`autoSize`属性使输入框高度自动适应内容。

<TrSender mode="multiple" :autoSize="true" />

```vue
<TrSender mode="multiple" :autoSize="true" />
```

#### 可清空输入

通过`clearable`属性添加清空按钮，方便用户快速清除输入内容。

<TrSender :clearable="true" />

```vue
<TrSender :clearable="true" />
```

### 高级功能

#### 语音输入

启用`allowSpeech`支持语音输入功能，用户可以通过语音录入文本。

<TrSender :allowSpeech="true" />

```vue
<TrSender :allowSpeech="true" />
```

#### 文件上传

支持附件上传功能，可通过`allowFiles`控制。

> 目前仅支持按钮显示，后续会添加附件上传相关功能。

<TrSender :allowFiles="true"  />

```vue
<TrSender :allowFiles="true" />
```

#### 自定义提交方式

通过`submitType`属性控制提交方式，支持多种键盘快捷键组合。

- `enter`: 按下回车键提交（默认）
- `ctrlEnter`: 按下Ctrl+回车键提交（Windows/Linux中常用）
- `shiftEnter`: 按下Shift+回车键提交（Mac中常用）

这些快捷键适用于不同的使用习惯和操作系统，方便用户根据自己的喜好选择提交方式。

<TrSender submitType="ctrlEnter" placeholder="按Ctrl+Enter提交" />

```vue
<TrSender submitType="ctrlEnter" placeholder="按Ctrl+Enter提交" />
```

<TrSender submitType="shiftEnter" placeholder="按Shift+Enter提交" />

```vue
<TrSender submitType="shiftEnter" placeholder="按Shift+Enter提交" />
```

使用不同的提交方式可以适应不同的使用场景：

- 聊天应用通常使用`enter`快速提交消息
- 多行文本编辑时，使用`ctrl+enter`或`shift+enter`可避免误提交
- 代码编辑器类应用通常使用`ctrl+enter`提交，保持编辑文本的结构

### 键盘快捷键支持

TrSender 组件支持多种键盘快捷键操作，提高用户输入效率：

| 快捷键      | 功能                      | 适用条件                       |
| ----------- | ------------------------- | ------------------------------ |
| Enter       | 提交内容                  | submitType="enter"（默认）     |
| Ctrl+Enter  | 提交内容                  | submitType="ctrlEnter"         |
| Shift+Enter | 提交内容                  | submitType="shiftEnter"        |
| Esc         | 取消语音录入/关闭建议列表 | 在语音录入状态或显示建议列表时 |
| Tab         | 切换焦点                  | 输入框获得焦点时               |

您可以在实际开发中根据应用场景和用户需求选择最适合的快捷键方式。

### 布局定制

#### 使用插槽自定义布局

TrSender 提供了丰富的插槽，可以自定义组件的各个部分。

<TrSender mode="multiple">
  <template #header>
    <div style="padding: 8px; background-color: #f5f5f5; text-align: center">自定义头部</div>
  </template>
  <template #prefix>
    <div style="display: flex; justify-content: center; align-items: center">头像</div>
  </template>
  <template #footer>
    <div style="padding: 8px; display: flex; justify-content: space-between">
      <span>底部工具栏</span>
      <button>发送</button>
    </div>
  </template>
</TrSender>

```vue
<TrSender mode="multiple">
  <template #header>
    <div style="padding: 8px; background-color: #f5f5f5; text-align: center">自定义头部</div>
  </template>
  <template #prefix>
    <div style="display: flex; justify-content: center; align-items: center">头像</div>
  </template>
  <template #footer>
    <div style="padding: 8px; display: flex; justify-content: space-between">
      <span>底部工具栏</span>
      <button>发送</button>
    </div>
  </template>
</TrSender>
```

## API 说明

### Props

| 属性名         | 说明             | 类型                                       | 默认值            |
| -------------- | ---------------- | ------------------------------------------ | ----------------- |
| autofocus      | 自动获取焦点     | `boolean`                                  | `false`           |
| autoSize       | 自动调整高度     | `boolean`                                  | `false`           |
| allowSpeech    | 是否开启语音输入 | `boolean`                                  | `false`           |
| allowFiles     | 是否允许文件上传 | `boolean`                                  | `true`            |
| clearable      | 是否可清空       | `boolean`                                  | `false`           |
| disabled       | 是否禁用         | `boolean`                                  | `false`           |
| modelValue     | 绑定值(v-model)  | `string`                                   | `''`              |
| defaultValue   | 默认值(非响应式) | `string`                                   | `''`              |
| loading        | 是否加载中       | `boolean`                                  | `false`           |
| mode           | 输入框类型       | `'single' \| 'multiple'`                   | `'single'`        |
| maxLength      | 最大输入长度     | `number`                                   | `Infinity`        |
| placeholder    | 输入框占位文本   | `string`                                   | `'请输入内容...'` |
| showWordLimit  | 是否显示字数统计 | `boolean`                                  | `false`           |
| submitType     | 提交方式         | `'enter' \| 'ctrl+enter' \| 'shift+enter'` | `'enter'`         |
| theme          | 主题样式         | `'light' \| 'dark'`                        | `'light'`         |
| suggestions    | 输入建议列表     | `string[]`                                 | `[]`              |
| debounceSubmit | 提交防抖延迟(ms) | `number`                                   | `300`             |

### Events

| 事件名            | 说明                      | 回调参数               |
| ----------------- | ------------------------- | ---------------------- |
| update:modelValue | 输入值变化时触发(v-model) | `(value: string)`      |
| blur              | 输入框失去焦点时触发      | `(event: FocusEvent)`  |
| change            | 输入值改变且失焦时触发    | `(value: string)`      |
| focus             | 输入框获得焦点时触发      | `(event: FocusEvent)`  |
| input             | 输入值改变时触发          | `(value: string)`      |
| submit            | 提交内容时触发            | `(value: string)`      |
| clear             | 清空内容时触发            | `()`                   |
| speech-start      | 语音识别开始时触发        | `()`                   |
| speech-end        | 语音识别结束时触发        | `(transcript: string)` |
| speech-interim    | 语音识别中间结果时触发    | `(transcript: string)` |
| speech-error      | 语音识别错误时触发        | `(error: Error)`       |
| suggestion-select | 选择输入建议时触发        | `(value: string)`      |

### Methods

| 方法名      | 说明             | 参数 | 返回值          |
| ----------- | ---------------- | ---- | --------------- |
| focus       | 使输入框获取焦点 | -    | `void`          |
| blur        | 使输入框失去焦点 | -    | `void`          |
| clear       | 清空输入内容     | -    | `void`          |
| submit      | 手动触发提交事件 | -    | `void`          |
| startSpeech | 开始语音识别     | -    | `Promise<void>` |
| stopSpeech  | 停止语音识别     | -    | `void`          |

### Slots

组件布局结构如下：

```
+----------------------+
|      header slot     |  <!-- 位于内容区域上方 -->
+----------------------+
| prefix |   content   | actions  <!-- 横向排列 -->
| slot   |    area     | slot
+----------------------+
|      footer slot     |  <!-- 位于内容区域下方 -->
+----------------------+
```

| 插槽名称  | 描述                     | CSS类名                      | 默认内容               |
| --------- | ------------------------ | ---------------------------- | ---------------------- |
| `header`  | 头部插槽，位于输入框上方 | `.tiny-sender__header-slot`  | 无                     |
| `prefix`  | 前缀插槽，位于输入框左侧 | `.tiny-sender__prefix-slot`  | 无                     |
| `actions` | 后缀插槽，位于输入框右侧 | `.tiny-sender__actions-slot` | 单行模式下的操作按钮   |
| `footer`  | 底部插槽，位于输入框下方 | `.tiny-sender__footer-slot`  | 字数限制和多行模式按钮 |

### 样式定制

可以通过CSS变量自定义组件样式：

#### 容器样式变量

- `--tr-sender-border-radius`: 组件边框圆角，默认 8px
- `--tr-sender-border-color`: 边框颜色，默认 #e4e7ed
- `--tr-sender-focus-border-color`: 聚焦时边框颜色，默认 #409eff
- `--tr-sender-bg-color`: 背景色，默认 #fff
- `--tr-sender-padding`: 内边距，默认 10px

#### 输入区域变量

- `--tr-sender-content-padding`: 内容区域内边距，默认 10px
- `--tr-sender-content-padding-with-prefix`: 有前缀时内容区域内边距，默认 10px 10px 10px 0
- `--tr-sender-input-font-size`: 输入字体大小，默认 14px
- `--tr-sender-input-line-height`: 输入行高，默认 1.5
- `--tr-sender-input-color`: 输入文本颜色，默认 #303133

#### 插槽样式变量

##### 头部插槽（Header）

- `--tr-sender-header-max-height`: 最大高度，默认 120px
- `--tr-sender-header-min-height`: 最小高度，默认 40px
- `--tr-sender-header-shadow`: 阴影效果，默认 0 2px 8px rgba(0,0,0,0.1)
- `--tr-sender-header-padding`: 内边距

##### 前缀插槽（Prefix）

- `--tr-sender-prefix-width`: 宽度，默认 60px
- `--tr-sender-prefix-min-width`: 最小宽度，默认 44px
- `--tr-sender-prefix-hover-bg`: 悬停背景色，默认 #f5f5f5
- `--tr-sender-prefix-padding-left`: 左内边距，默认 16px

##### 操作区域（Actions）

- `--tr-sender-actions-width`: 宽度，默认 auto
- `--tr-sender-actions-min-width`: 最小宽度，默认 32px
- `--tr-sender-actions-gap`: 按钮间距，默认 8px
- `--tr-sender-actions-icon-size`: 图标大小，默认 20px
- `--tr-sender-actions-padding-right`: 右侧内边距，默认 10px

##### 底部插槽（Footer）

- `--tr-sender-footer-max-height`: 最大高度，默认 200px
- `--tr-sender-footer-min-height`: 最小高度，默认 0
- `--tr-sender-footer-bg`: 背景色，默认 #fff
- `--tr-sender-footer-hover`: 悬停背景色，默认 #f9f9f9

### 使用示例

以下是一个综合使用示例：

```vue
<template>
  <TrSender
    v-model="inputMessage"
    mode="multiple"
    submitType="ctrl+enter"
    :maxLength="2000"
    :showWordLimit="true"
    :autoSize="true"
    :clearable="true"
    :allowSpeech="true"
    :loading="isSubmitting"
    placeholder="请输入您的消息..."
    @submit="handleSubmit"
    @speech-end="handleSpeechEnd"
  >
    <template #header>
      <div class="conversation-title">聊天对话</div>
    </template>

    <template #prefix>
      <img :src="currentUserAvatar" alt="User Avatar" class="user-avatar" />
    </template>

    <template #footer>
      <div class="custom-toolbar">
        <div class="emoji-picker">
          <!-- 表情选择器组件 -->
        </div>
        <button @click="submitMessage" :disabled="isSubmitting">发送消息</button>
      </div>
    </template>
  </tiny-sender>
</template>

<script setup>
import { ref } from 'vue'

const inputMessage = ref('')
const isSubmitting = ref(false)
const currentUserAvatar = 'https://example.com/avatar.jpg'

const handleSubmit = async (message) => {
  isSubmitting.value = true
  try {
    await sendMessageToServer(message)
    inputMessage.value = '' // 清空输入
  } catch (error) {
    console.error('发送失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleSpeechEnd = (transcript) => {
  console.log('语音识别结果:', transcript)
}

const handleFileSelect = (files) => {
  console.log('已选择文件:', files)
}

const submitMessage = () => {
  if (inputMessage.value.trim()) {
    handleSubmit(inputMessage.value)
  }
}
</script>

<style>
.conversation-title {
  font-weight: bold;
  padding: 8px 0;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.custom-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-top: 1px solid #eee;
}
</style>
```

### 主题适配

TrSender 支持亮色和暗色两种主题模式，通过`theme`属性控制：

<TrSender theme="dark" />

```vue
<TrSender theme="dark" />
```

也可以通过CSS变量实现更细致的主题定制：

```css
/* 亮色主题 */
.theme-light {
  --tr-sender-bg-color: #fff;
  --tr-sender-border-color: #e4e7ed;
  --tr-sender-input-color: #303133;
}

/* 暗色主题 */
.theme-dark {
  --tr-sender-bg-color: #1e1e1e;
  --tr-sender-border-color: #4c4c4c;
  --tr-sender-input-color: #e0e0e0;
  --tr-sender-actions-icon-color: #b0b0b0;
}
```

### 性能优化

对于频繁输入的场景，TrSender 提供了防抖处理，可通过`debounceSubmit`属性控制延迟时间：

```vue
<TrSender :debounceSubmit="500" />
```
