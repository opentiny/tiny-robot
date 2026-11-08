<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')

const handleSubmit = (value: string) => {
  submittedContent.value = value
  content.value = ''
}
</script>

<template>
  <div class="demo-container">
    <tr-sender v-model="content" placeholder="输入消息后按 Enter 发送" @submit="handleSubmit" />
    <p v-if="submittedContent" class="result" aria-live="polite">已提交：{{ submittedContent }}</p>
  </div>
</template>

<style scoped>
.demo-container {
  display: grid;
  gap: 12px;
  padding: 20px;
}

.result {
  margin: 0;
  color: #606266;
}
</style>
