<template>
  <div class="demo-suggestion">
    <h3>基础用法</h3>
    <p class="demo-description">输入 "ECS" 或 "CDN" 查看建议，支持键盘导航和自动补全</p>
    <ChatInput
      v-model="input"
      :suggestions="allSuggestions"
      placeholder="输入 ECS 或 CDN 查看建议..."
      @suggestion-select="handleSelect"
    />

    <div v-if="selectedItem" class="demo-result"><strong>选中的建议：</strong> {{ selectedItem }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const input = ref('')
const selectedItem = ref('')

// 所有建议项（传递给 ChatInput，由插件内部负责过滤）
const allSuggestions = [
  { content: 'ECS-云服务器卡顿问题' },
  { content: 'ECS-备份弹性云服务器' },
  { content: 'ECS-实例无法启动' },
  { content: 'CDN-权限管理配置' },
  { content: 'CDN-缓存刷新问题' },
  { content: 'OSS-存储桶访问控制' },
]

// 处理选中事件
const handleSelect = (value: string) => {
  selectedItem.value = value
  console.log('选中建议:', value)
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
