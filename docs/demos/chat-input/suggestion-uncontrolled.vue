<template>
  <div class="demo-uncontrolled">
    <div class="filter-selector">
      <label>
        <input type="radio" v-model="filterMode" value="default" />
        默认过滤
      </label>
      <label>
        <input type="radio" v-model="filterMode" value="prefix" />
        前缀匹配
      </label>
      <label>
        <input type="radio" v-model="filterMode" value="category" />
        分类匹配
      </label>
    </div>

    <p class="mode-description">{{ modeDescription }}</p>

    <ChatInput
      v-model="input"
      :extensions="extensions"
      placeholder="输入 ECS 或 CDN 查看建议..."
      @submit="handleSubmit"
    />

    <div v-if="selectedItem" class="demo-result"><strong>选中的建议：</strong> {{ selectedItem }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChatInput, Suggestion } from '@opentiny/tiny-robot'
import type { SuggestionItem, StructuredData } from '@opentiny/tiny-robot'

const input = ref('')
const selectedItem = ref('')
const filterMode = ref<'default' | 'prefix' | 'category'>('default')

// 模式说明
const modeDescription = computed(() => {
  switch (filterMode.value) {
    case 'default':
      return '默认过滤：模糊匹配，包含输入内容即可'
    case 'prefix':
      return '前缀匹配：只匹配以输入内容开头的建议'
    case 'category':
      return '分类匹配：只匹配分类标签（ECS、CDN、OSS）'
    default:
      return ''
  }
})

// 所有建议项
const allSuggestions: SuggestionItem[] = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'ECS-实例无法启动' },
  { content: 'CDN-权限管理配置' },
  { content: 'CDN-缓存刷新问题' },
  { content: 'OSS-存储桶访问控制' },
]

// ✅ 非受控模式：自定义过滤逻辑
const extensions = computed(() => [
  Suggestion.configure({
    items: allSuggestions,
    // 自定义过滤函数
    filterFn: (suggestions: SuggestionItem[], query: string) => {
      if (!query) return suggestions

      const lowerQuery = query.toLowerCase()

      switch (filterMode.value) {
        case 'prefix':
          // 前缀匹配
          return suggestions.filter((item) => item.content.toLowerCase().startsWith(lowerQuery))

        case 'category':
          // 分类匹配（只匹配 - 前面的部分）
          return suggestions.filter((item) => {
            const category = item.content.split('-')[0].toLowerCase()
            return category.includes(lowerQuery)
          })

        default:
          // 默认模糊匹配
          return suggestions.filter((item) => item.content.toLowerCase().includes(lowerQuery))
      }
    },
    onSelect: (item) => {
      selectedItem.value = item.content
      console.log('选中建议:', item.content)
    },
  }),
])

const handleSubmit = (text: string, data?: StructuredData) => {
  console.log('📝 提交内容：', text)
  console.log('📋 结构化数据：', data)
}
</script>

<style scoped>
.demo-uncontrolled {
  padding: 20px;
}

.filter-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.filter-selector label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.filter-selector input[type='radio'] {
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

.demo-result {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
}
</style>
