<template>
  <div class="demo-highlight">
    <h3>高亮模式对比</h3>

    <div class="mode-selector">
      <label>
        <input type="radio" v-model="highlightMode" value="auto" />
        自动匹配
      </label>
      <label>
        <input type="radio" v-model="highlightMode" value="precise" />
        精确指定
      </label>
      <label>
        <input type="radio" v-model="highlightMode" value="custom" />
        自定义函数
      </label>
    </div>

    <p class="mode-description">{{ modeDescription }}</p>

    <ChatInput v-model="input" :suggestions="currentSuggestions" placeholder="输入 ECS 或 CDN 查看不同高亮效果..." />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'
import type {
  SuggestionItem,
  SuggestionTextPart,
} from '../../../packages/components/src/chat-input/extensions/suggestion/types'

const input = ref('')
const highlightMode = ref<'auto' | 'precise' | 'custom'>('auto')

// 模式说明
const modeDescription = computed(() => {
  switch (highlightMode.value) {
    case 'auto':
      return '自动高亮与输入内容匹配的部分'
    case 'precise':
      return '通过 highlights 数组精确指定需要高亮的文本片段'
    case 'custom':
      return '通过 highlights 函数完全控制高亮逻辑，实现复杂的高亮规则'
    default:
      return ''
  }
})

// 自动匹配模式的建议项
const autoSuggestions: SuggestionItem[] = [{ content: 'ECS-云服务器卡顿问题' }, { content: 'CDN-权限管理配置' }]

// 精确指定模式的建议项
const preciseSuggestions: SuggestionItem[] = [
  {
    content: 'ECS-云服务器卡顿问题',
    highlights: ['ECS', '云服务器'],
  },
  {
    content: 'CDN-权限管理配置',
    highlights: ['CDN', '权限管理'],
  },
]

// 自定义函数模式的建议项
const customSuggestions: SuggestionItem[] = [
  {
    content: 'ECS-云服务器卡顿问题',
    highlights: (text: string, _query: string): SuggestionTextPart[] => {
      // 高亮产品名称（ECS）
      const parts = text.split('-')
      return [
        { text: parts[0], isMatch: true },
        { text: '-', isMatch: false },
        { text: parts[1], isMatch: false },
      ]
    },
  },
  {
    content: 'CDN-权限管理配置',
    highlights: (text: string, _query: string): SuggestionTextPart[] => {
      // 高亮产品名称（CDN）
      const parts = text.split('-')
      return [
        { text: parts[0], isMatch: true },
        { text: '-', isMatch: false },
        { text: parts[1], isMatch: false },
      ]
    },
  },
]

// 当前使用的建议项（传递给 ChatInput，由插件内部负责过滤）
const currentSuggestions = computed(() => {
  switch (highlightMode.value) {
    case 'auto':
      return autoSuggestions
    case 'precise':
      return preciseSuggestions
    case 'custom':
      return customSuggestions
    default:
      return autoSuggestions
  }
})
</script>

<style scoped>
.demo-highlight {
  padding: 20px;
}

.mode-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.mode-selector label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.mode-selector input[type='radio'] {
  cursor: pointer;
}

.mode-description {
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
  color: #666;
  font-size: 14px;
  border-radius: 2px;
}
</style>
