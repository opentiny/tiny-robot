<script setup lang="ts">
import { ref } from 'vue'
import { TrSender, type SubmitTrigger } from '@opentiny/tiny-robot'

const content = ref('')
const submittedContent = ref('')
const submitType = ref<SubmitTrigger>('enter')

const handleSubmit = (value: string) => {
  submittedContent.value = value
  console.log('提交内容:', value)
}
</script>

<template>
  <div class="demo-container">
    <div class="options-panel">
      <label>提交方式：</label>
      <div class="radio-group">
        <label> <input type="radio" value="enter" v-model="submitType" /> Enter </label>
        <label> <input type="radio" value="ctrlEnter" v-model="submitType" /> Ctrl + Enter </label>
        <label> <input type="radio" value="shiftEnter" v-model="submitType" /> Shift + Enter </label>
      </div>
    </div>

    <tr-sender v-model="content" :submitType="submitType" placeholder="请输入内容..." @submit="handleSubmit" />

    <div v-if="submittedContent" class="result">
      <strong>已提交: </strong>
      <span>{{ submittedContent }}</span>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.options-panel {
  margin-bottom: 20px;
  padding: 15px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.radio-group {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.radio-group label {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.radio-group input {
  margin-right: 8px;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background: #e9e9e9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.result strong {
  color: #333;
}

.result span {
  color: #555;
  word-break: break-all;
}
</style>
