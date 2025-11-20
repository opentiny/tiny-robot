<template>
  <div class="demo-container">
    <h3>方法调用</h3>
    <div class="controls">
      <button @click="handleFocus">聚焦</button>
      <button @click="handleBlur">失焦</button>
      <button @click="handleSetContent">设置内容</button>
      <button @click="handleGetContent">获取内容</button>
      <button @click="handleClear">清空</button>
      <button @click="handleSubmit">提交</button>
    </div>
    <ChatInput
      ref="chatInputRef"
      v-model="content"
      placeholder="通过上方按钮控制输入框..."
      mode="multiple"
      clearable
      @submit="onSubmit"
    />
    <div v-if="result" class="result">{{ result }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'

const chatInputRef = ref()
const content = ref('')
const result = ref('')

const handleFocus = () => {
  chatInputRef.value?.focus()
  result.value = '已聚焦'
}

const handleBlur = () => {
  chatInputRef.value?.blur()
  result.value = '已失焦'
}

const handleSetContent = () => {
  chatInputRef.value?.setContent('<p>这是通过方法设置的内容</p>')
  result.value = '已设置内容'
}

const handleGetContent = () => {
  const content = chatInputRef.value?.getContent()
  result.value = `当前内容: ${content}`
}

const handleClear = () => {
  chatInputRef.value?.clear()
  result.value = '已清空'
}

const handleSubmit = () => {
  chatInputRef.value?.submit()
}

const onSubmit = (value: string) => {
  result.value = `已提交: ${value}`
}
</script>

<style scoped>
.demo-container {
  padding: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.controls button:hover {
  border-color: #1476ff;
  color: #1476ff;
}

.result {
  margin-top: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 14px;
}
</style>
