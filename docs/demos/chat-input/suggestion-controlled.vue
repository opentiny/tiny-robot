<template>
  <div class="demo-controlled">
    <h3>受控模式</h3>
    <p class="demo-description">用户自己控制过滤逻辑，支持后端搜索、复杂匹配规则等场景</p>

    <ChatInput
      v-model="input"
      :suggestions="filteredSuggestions"
      :suggestion-controlled="true"
      :suggestion-query="currentQuery"
      @suggestion-query-change="handleQueryChange"
      @suggestion-select="handleSelect"
      placeholder="输入内容查看建议..."
    />

    <div v-if="selectedItem" class="demo-result"><strong>选中的建议：</strong> {{ selectedItem }}</div>

    <div class="demo-info">
      <p><strong>当前查询：</strong> {{ currentQuery || '(空)' }}</p>
      <p><strong>匹配数量：</strong> {{ filteredSuggestions.length }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const input = ref('')
const selectedItem = ref('')
const currentQuery = ref('')
const filteredSuggestions = ref<Array<{ content: string }>>([])

// 所有建议项
const allSuggestions = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'ECS-实例无法启动' },
  { content: 'CDN-权限管理配置' },
  { content: 'CDN-缓存刷新问题' },
  { content: 'OSS-存储桶访问控制' },
]

// 处理查询变化（用户自己的过滤逻辑）
const handleQueryChange = (query: string) => {
  currentQuery.value = query

  if (!query) {
    filteredSuggestions.value = allSuggestions
    return
  }

  // 自定义过滤逻辑：支持拼音首字母、模糊匹配等
  const lowerQuery = query.toLowerCase()
  filteredSuggestions.value = allSuggestions.filter((item) => {
    const content = item.content.toLowerCase()
    // 这里可以实现更复杂的匹配逻辑
    // 比如：拼音匹配、后端搜索等
    return content.includes(lowerQuery)
  })
}

// 处理选中事件
const handleSelect = (value: string) => {
  selectedItem.value = value
  console.log('选中建议:', value)
}

// 初始化
handleQueryChange('')
</script>

<style scoped>
.demo-controlled {
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

.demo-info {
  margin-top: 16px;
  padding: 12px;
  background: #e6f7ff;
  border-radius: 4px;
  font-size: 14px;
}

.demo-info p {
  margin: 4px 0;
}
</style>
