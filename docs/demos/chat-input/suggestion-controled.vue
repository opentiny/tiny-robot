<template>
  <div class="demo-suggestion">
    <h3>基础用法</h3>
    <p class="demo-description">输入 "ECS" 或 "CDN" 查看建议，支持键盘导航和自动补全</p>
    <ChatInput
      v-model="input"
      :extensions="extensions"
      placeholder="输入 任意内容 查看建议..."
      @submit="handleSubmit"
    />

    <div v-if="selectedItem" class="demo-result"><strong>选中的建议：</strong> {{ selectedItem }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput, Suggestion } from '@opentiny/tiny-robot'
import type { SuggestionItem, StructuredData } from '@opentiny/tiny-robot'

const input = ref('')
const selectedItem = ref('')

// 所有建议项
const allSuggestions: SuggestionItem[] = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'ECS-实例无法启动' },
  { content: 'CDN-权限管理配置' },
  { content: 'CDN-缓存刷新问题' },
  { content: 'OSS-存储桶访问控制' },
]

// ✅ 受控模式：直接传入要显示的建议列表
// 组件只负责渲染，不做任何过滤
// 用户可以在外部控制这个列表（过滤、排序、异步加载等）
const displayedSuggestions = ref<SuggestionItem[]>(allSuggestions)

// ✅ 使用受控模式的 extensions API
const extensions = [
  Suggestion.configure({
    items: displayedSuggestions,
    controlled: true, // 受控模式：不做任何过滤，直接显示传入的数据
    onSelect: (item) => {
      selectedItem.value = item.content
      console.log('选中建议:', item.content)
    },
  }),
]

const handleSubmit = (text: string, data?: StructuredData) => {
  console.log('📝 提交内容：', text)
  console.log('📋 结构化数据：', data)
}
</script>

<style scoped>
.demo-suggestion {
  padding: 20px;
}

.demo-description {
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
}

.demo-result {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
}
</style>
