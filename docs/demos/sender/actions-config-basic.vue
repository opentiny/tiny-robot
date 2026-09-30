<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')

// 表单验证：至少 5 个字符
const isValid = computed(() => content.value.length >= 5)

// 按钮配置
const defaultActions = computed(() => ({
  submit: {
    disabled: !isValid.value,
    tooltip: isValid.value ? '发送消息' : '请输入至少 5 个字符',
  },
  clear: {
    tooltip: '清空内容',
  },
}))

const handleSubmit = (text: string) => {
  submittedContent.value = text
  content.value = ''
}
</script>

<template>
  <div class="demo-container">
    <p class="tip">输入至少 5 个字符后，提交按钮才会启用（{{ content.length }}/5）</p>

    <tr-sender
      v-model="content"
      :default-actions="defaultActions"
      placeholder="请输入至少 5 个字符..."
      clearable
      @submit="handleSubmit"
    />
    <p v-if="submittedContent" class="result" aria-live="polite">已提交：{{ submittedContent }}</p>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.tip {
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.result {
  margin: 12px 0 0;
  color: #606266;
}
</style>
