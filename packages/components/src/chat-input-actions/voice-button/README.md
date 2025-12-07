# VoiceButton 语音输入按钮

VoiceButton 是一个独立的语音输入组件，支持浏览器内置语音识别和第三方语音识别服务。

## 特性

- ✅ **高度内聚**：所有语音相关逻辑封装在一个模块中
- ✅ **灵活配置**：支持自定义语音处理器
- ✅ **自动插入**：可自动将识别结果插入到编辑器
- ✅ **UI 拦截**：支持自定义录音 UI
- ✅ **独立复用**：可在 chat-input 外独立使用

## 基础使用

```vue
<template>
  <tr-chat-input>
    <template #footer>
      <VoiceButton />
      <SubmitButton />
    </template>
  </tr-chat-input>
</template>
<script setup>
import { VoiceButton, SubmitButton } from '@opentiny/tiny-robot'
</script>
```

## 自定义配置

```vue
<template>
  <tr-chat-input>
    <template #footer>
      <VoiceButton
        :speech-config="{
          lang: 'zh-CN',
          continuous: true,
          interimResults: true,
        }"
        @speech-final="handleSpeechResult"
      />
    </template>
  </tr-chat-input>
</template>
<script setup>
const handleSpeechResult = (transcript: string) => {
  console.log('识别结果:', transcript)
}
</script>
```

## 使用第三方语音识别

```vue
<template>
  <VoiceButton
    :speech-config="{
      customHandler: aliCloudHandler,
    }"
    @speech-error="handleError"
  />
</template>
<script setup>
import { ref } from 'vue'
import { VoiceButton } from '@opentiny/tiny-robot'
// 自定义阿里云语音识别处理器
const aliCloudHandler = {
  isSupported: () => true,
  start: async (callbacks) => {
    // 实现阿里云语音识别逻辑
    callbacks.onStart()
    // ...
  },
  stop: () => {
    // 停止识别
  }
}
const handleError = (error: Error) => {
  console.error('语音识别错误:', error)
}
</script>
```

## 自定义录音 UI

```vue
<template>
  <VoiceButton :on-button-click="handleButtonClick">
    <template #recording-overlay="{ isRecording, stop }">
      <MobileRecordingOverlay :visible="isRecording" @stop="stop" />
    </template>
  </VoiceButton>
</template>
<script setup>
import { ref } from 'vue'
const showCustomUI = ref(false)
const handleButtonClick = (isRecording, preventDefault) => {
  preventDefault() // 阻止默认行为
  showCustomUI.value = true
  // 显示自定义 UI
}
</script>
```

## 独立使用（不依赖 chat-input）

```vue
<template>
  <div>
    <VoiceButton :auto-insert="false" @speech-final="handleVoiceInput" />
  </div>
</template>
<script setup>
import { VoiceButton } from '@opentiny/tiny-robot'
const handleVoiceInput = (text: string) => {
  // 手动处理语音输入
  console.log('语音输入:', text)
}
</script>
```

## 高级用法：直接使用 Hook

```vue
<script setup>
import { useSpeechHandler } from '@opentiny/tiny-robot'
const { speechState, start, stop } = useSpeechHandler({
  onFinal: (transcript) => {
    console.log('识别结果:', transcript)
  },
  onError: (error) => {
    console.error('错误:', error)
  },
})
</script>
<template>
  <button @click="speechState.isRecording ? stop() : start()">
    {{ speechState.isRecording ? '停止' : '开始' }}录音
  </button>
</template>
```

## Props

| 属性             | 类型                | 默认值     | 说明                 |
| ---------------- | ------------------- | ---------- | -------------------- |
| icon             | VNode \| Component  | IconVoice  | 自定义图标           |
| disabled         | boolean             | false      | 是否禁用             |
| size             | 'small' \| 'normal' | 'normal'   | 按钮尺寸             |
| tooltip          | string              | '语音输入' | Tooltip 文本         |
| tooltipPlacement | TooltipPlacement    | 'top'      | Tooltip 位置         |
| speechConfig     | SpeechConfig        | -          | 语音配置             |
| autoInsert       | boolean             | true       | 是否自动插入到编辑器 |
| onButtonClick    | Function            | -          | 按钮点击拦截器       |

## Events

| 事件名         | 参数                | 说明     |
| -------------- | ------------------- | -------- |
| speech-start   | -                   | 开始录音 |
| speech-interim | transcript: string  | 中间结果 |
| speech-final   | transcript: string  | 最终结果 |
| speech-end     | transcript?: string | 结束录音 |
| speech-error   | error: Error        | 识别错误 |

## SpeechConfig

```typescript
interface SpeechConfig {
  customHandler?: SpeechHandler // 自定义语音处理器
  lang?: string // 识别语言
  continuous?: boolean // 是否持续识别
  interimResults?: boolean // 是否返回中间结果
  autoReplace?: boolean // 是否自动替换内容
  onVoiceButtonClick?: (isRecording, preventDefault) => void // 按钮点击拦截器
}
```

## 架构设计

VoiceButton 采用高内聚设计，所有语音相关功能都封装在一个模块中：

```
voice-button/
├── index.vue              # VoiceButton 组件
├── index.type.ts          # 类型定义
├── useSpeechHandler.ts    # 语音核心 Hook
├── webSpeechHandler.ts    # 内置 Web Speech 实现
└── speech.types.ts        # 语音相关类型
```
