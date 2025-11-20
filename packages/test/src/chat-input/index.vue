<template>
  <div class="chat-input-demo">
    <h2>ChatInput 组件测试</h2>

    <div class="control-container">
      <div>
        <label>mode：</label>
        <tiny-switch data-testid="toggle-mode-btn" v-model="isMultipleMode" @change="handleModeChange"></tiny-switch>
        <span>{{ mode }}</span>
      </div>
      <div>
        <label>clearable：</label>
        <tiny-switch data-testid="toggle-clearable-btn" v-model="clearable"></tiny-switch>
      </div>
      <div>
        <label>loading：</label>
        <tiny-switch data-testid="toggle-loading-btn" v-model="loading"></tiny-switch>
      </div>
      <div class="button-group">
        <button data-testid="set-content-btn" @click="handleSetContent">设置内容</button>
        <button data-testid="get-content-btn" @click="handleGetContent">获取内容</button>
        <button data-testid="focus-btn" @click="handleFocus">聚焦</button>
      </div>
    </div>

    <TrChatInput
      ref="chatInputRef"
      v-model="content"
      data-testid="test-chat-input"
      :mode="mode"
      :clearable="clearable"
      :loading="loading"
      :max-length="100"
      show-word-limit
      placeholder="请输入内容..."
      @submit="handleSubmit"
      @clear="handleClear"
    >
      <template #footer>
        <button data-testid="custom-footer-btn" class="custom-btn" @click="handleCustomAction">自定义按钮</button>
      </template>
    </TrChatInput>

    <div v-if="result" class="result-display" data-testid="result-display">
      {{ result }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import { TrChatInput } from '@opentiny/tiny-robot'

const chatInputRef = ref()
const content = ref('')
const isMultipleMode = ref(false)
const clearable = ref(false)
const loading = ref(false)
const result = ref('')

const mode = computed(() => (isMultipleMode.value ? 'multiple' : 'single'))

const handleModeChange = () => {
  result.value = `模式切换为: ${mode.value}`
}

const handleSubmit = (value: string) => {
  result.value = `提交内容: ${value}`
}

const handleClear = () => {
  result.value = '内容已清空'
}

const handleSetContent = () => {
  chatInputRef.value?.setContent('<p>测试内容</p>')
  result.value = '已设置内容'
}

const handleGetContent = () => {
  const content = chatInputRef.value?.getContent()
  result.value = `当前内容: ${content}`
}

const handleFocus = () => {
  chatInputRef.value?.focus()
  result.value = '已聚焦'
}

const handleCustomAction = () => {
  result.value = '自定义按钮被点击'
}
</script>

<style scoped>
.chat-input-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.control-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.control-container > div {
  display: flex;
  align-items: center;
  gap: 10px;
}

.button-group {
  display: flex;
  gap: 8px;
}

.button-group button {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.button-group button:hover {
  background: #f0f0f0;
}

.custom-btn {
  padding: 6px 12px;
  background: #1476ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.custom-btn:hover {
  background: #0d5dd7;
}

.result-display {
  margin-top: 15px;
  padding: 12px;
  background: #e7f3ff;
  border-radius: 6px;
  color: #1476ff;
  font-size: 14px;
}
</style>
