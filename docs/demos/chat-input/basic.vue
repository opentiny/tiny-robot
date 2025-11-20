<template>
  <div class="demo-container">
    <h3>基础用法</h3>
    <ChatInput
      v-model="content"
      placeholder="请输入内容..."
      @submit="handleSubmit"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <div v-if="submittedContent" class="result">
      <strong>提交的内容：</strong>
      <div v-html="submittedContent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')

const handleSubmit = (value: string) => {
  submittedContent.value = value
  console.log('提交内容:', value)
}

const handleFocus = (event: FocusEvent) => {
  console.log('获得焦点', event)
}

const handleBlur = (event: FocusEvent) => {
  console.log('失去焦点', event)
}
</script>

<style scoped>
.demo-container {
  padding: 20px;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}
</style>
