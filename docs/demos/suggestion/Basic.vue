<template>
  <div class="demo-container">
    <tr-suggestion
      title="快捷指令"
      :items="suggestItems"
      :categories="categories"
      v-model:open="showSuggestions"
      @select="handleCommandSelect"
      style="width: 100%"
      :theme="theme"
      :block="false"
      :maxVisibleItems="5"
    >
      <template #trigger="{ onKeyDown, onInput }">
        <tr-sender
          v-model="inputMessage"
          mode="multiple"
          :placeholder="placeholder"
          :theme="theme"
          @input="handleMessageInput($event, onInput)"
          @keydown="handleMessageKeydown($event, onKeyDown)"
        />
      </template>
    </tr-suggestion>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { TrSender } from '@opentiny/tiny-robot'
// import { TrSuggestion } from '@opentiny/tiny-robot'
import type { SuggestionItem, Category } from '@opentiny/tiny-robot'

const inputMessage = ref('')
const showSuggestions = ref(false)
const theme = ref('light')
const placeholder = ref('输入 / 查看可用命令...')

// 常用指令
const commonCommands: SuggestionItem[] = [
  {
    id: 'image',
    text: '/image',
    value: '/image',
    description: '生成图像 - 根据文本描述创建图像',
  },
  {
    id: 'sql',
    text: '/sql',
    value: '/sql',
    description: 'SQL查询 - 编写SQL查询语句并获取解释',
  },
  {
    id: 'code',
    text: '/code',
    value: '/code',
    description: '生成代码 - 根据描述生成代码片段',
  },
  {
    id: 'translate',
    text: '/translate',
    value: '/translate',
    description: '翻译文本 - 将文本翻译成指定语言',
  },
  {
    id: 'explain',
    text: '/explain',
    value: '/explain',
    description: '解释代码 - 分析并解释代码片段',
  },
]

// 高级指令
const advancedCommands: SuggestionItem[] = [
  {
    id: 'debug',
    text: '/debug',
    value: '/debug',
    description: '调试代码 - 查找并修复代码中的问题',
  },
  {
    id: 'optimize',
    text: '/optimize',
    value: '/optimize',
    description: '优化代码 - 提升代码性能和质量',
  },
  {
    id: 'format',
    text: '/format',
    value: '/format',
    description: '格式化代码 - 按照规范格式化代码',
  },
]

// 功能分类
const categories = ref<Category[]>([
  {
    id: 'common',
    label: '常用指令',
    items: commonCommands,
  },
  {
    id: 'advanced',
    label: '高级指令',
    items: advancedCommands,
  },
  {
    id: 'One',
    label: '高级指令1',
    items: advancedCommands,
  },
  {
    id: 'Two',
    label: '高级指令2',
    items: advancedCommands,
  },
])

// Suggestion 组件使用的建议项
const suggestCommands = [...commonCommands, ...advancedCommands]

// 初始化 suggestItems 为所有可用的命令项
const suggestItems = ref<SuggestionItem[]>(suggestCommands)

// 处理输入，检测命令触发
const handleMessageInput = (event, handleInput) => {
  const currentText = inputMessage.value

  handleInput(event, currentText)
}

// 处理 Suggestion 选中事件
const handleCommandSelect = (value) => {
  inputMessage.value = value
}

// 处理键盘事件
const handleMessageKeydown = (event, onKeyDown) => {
  // 将这些按键事件传递给 Suggestion 组件处理
  onKeyDown(event)
}
</script>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
