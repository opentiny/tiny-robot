<template>
  <div class="demo-container">
    <h3>字数限制</h3>
    <ChatInput
      v-model="content"
      placeholder="最多输入 100 个字符..."
      :max-length="100"
      show-word-limit
      clearable
      mode="multiple"
      @submit="handleSubmit"
    />
    <p class="tip">当前字数：{{ characterCount }} / 100</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const content = ref('')

const characterCount = computed(() => {
  const div = document.createElement('div')
  div.innerHTML = content.value
  return div.textContent?.length || 0
})

const handleSubmit = (value: string) => {
  console.log('提交内容:', value)
}
</script>

<style scoped>
.demo-container {
  padding: 20px;
}

.tip {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}
</style>
