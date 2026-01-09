<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const content = ref('')
const mode = ref<'single' | 'multiple'>('single')

const handleSubmit = (value: string) => {
  console.log('提交内容:', value)
  content.value = ''
}
</script>

<template>
  <div class="demo-container">
    <div class="mode-selector">
      <button :class="['mode-btn', { active: mode === 'single' }]" @click="mode = 'single'">单行模式</button>
      <button :class="['mode-btn', { active: mode === 'multiple' }]" @click="mode = 'multiple'">多行模式</button>
    </div>
    <tr-sender
      v-model="content"
      :mode="mode"
      placeholder="尝试切换模式..."
      clearable
      show-word-limit
      :max-length="200"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}

.mode-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.mode-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: #1476ff;
  color: #1476ff;
}

.mode-btn.active {
  background: #1476ff;
  border-color: #1476ff;
  color: white;
}
</style>
