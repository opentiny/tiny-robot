<template>
  <div class="template-example">
    <!-- 集成 Suggestion 和 Sender 组件 -->
    <tr-suggestion
      v-model:open="suggestionOpen"
      :items="suggestionItems"
      :categories="categories"
      :loading="loading"
      title="快捷指令"
      @select="handleSuggestionSelect"
      @fill-template="handleFillTemplate"
    >
      <!-- 使用 trigger 插槽将 Sender 与 Suggestion 集成 -->
      <template #trigger="{ onTrigger, onKeyDown }">
        <div class="sender-container">
          <!-- 当前选中的指令名称显示 -->
          <div v-if="currentTemplateName" class="current-template-info">
            <span class="template-label">当前指令：</span>
            <span class="template-name">{{ currentTemplateName }}</span>
            <span class="template-clear" @click="clearTemplate">×</span>
          </div>

          <!-- Sender 组件 -->
          <tr-sender
            v-model="inputText"
            :template="currentTemplate"
            :placeholder="placeholder"
            :clearable="true"
            mode="multiple"
            :has-content="hasContent"
            @submit="handleSubmit"
            @keydown="(e) => handleKeyDown(e, onTrigger, onKeyDown)"
            @update:modelValue="updateInputValue"
            @reset-template="clearTemplate"
            ref="senderRef"
          />

          <!-- 提示信息 -->
          <div class="tip-text">输入 <span class="trigger-key">/</span> 可以打开指令菜单</div>
        </div>
      </template>
    </tr-suggestion>

    <!-- 消息记录区域 -->
    <div class="message-log" v-if="messages.length > 0">
      <h4>已发送消息</h4>
      <div v-for="(msg, index) in messages" :key="index" class="message-item">
        <div class="message-content">{{ msg }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
// import { TrSender, TrSuggestion } from '@opentiny/tiny-robot'
import { templateSuggestions, templateCategories } from './templateData'

// 状态管理
const inputText = ref('')
const currentTemplate = ref('')
const currentTemplateName = ref('')
const suggestionOpen = ref(false)
//  eslint-disable-next-line
const senderRef = ref<any>(null)
const loading = ref(false)
const placeholder = ref('输入 / 打开指令菜单...')
const messages = ref<string[]>([])

// 计算属性：判断是否有内容
const hasContent = computed(() => {
  // 当处于指令编辑模式且输入内容不为空时，视为有内容
  if (currentTemplate.value) {
    return inputText.value.trim().length > 0
  }
  return inputText.value.trim().length > 0
})

// 更新输入值
const updateInputValue = (value) => {
  inputText.value = value
}

// 指令列表
const suggestionItems = templateSuggestions
const categories = templateCategories

// 键盘事件处理
const handleKeyDown = (event, triggerFn, suggestionKeyDown) => {
  // 如果建议面板已打开，交给 suggestion 组件处理键盘事件
  if (suggestionOpen.value) {
    suggestionKeyDown(event)
    return
  }

  // 如果按下斜杠键并且不在指令编辑模式，触发建议面板
  if (event.key === '/' && !currentTemplate.value) {
    event.preventDefault()
    triggerFn({
      text: '',
      position: 0,
    })
  }

  // ESC 键清除当前指令
  if (event.key === 'Escape' && currentTemplate.value) {
    event.preventDefault()
    clearTemplate()
  }
}

// 处理指令选择
const handleSuggestionSelect = (text) => {
  console.log('选择了指令:', text)
}

// 设置指令
const handleFillTemplate = (templateText, item) => {
  // 模拟加载效果
  loading.value = true
  setTimeout(() => {
    currentTemplate.value = templateText
    currentTemplateName.value = item?.text
    inputText.value = ''
    loading.value = false

    // 等待DOM更新后激活第一个字段
    setTimeout(() => {
      senderRef.value?.activateTemplateFirstField()
    }, 100)
  }, 300)
}

// 提交处理
const handleSubmit = (text: string) => {
  if (!text.trim()) return

  messages.value.push(text)
  inputText.value = ''

  // 如果是指令提交，清空指令状态
  if (currentTemplate.value) {
    clearTemplate()
  }
}

// 清除当前指令
const clearTemplate = () => {
  // 清空指令相关状态
  currentTemplate.value = ''
  currentTemplateName.value = ''
  inputText.value = ''

  // 确保重新聚焦到输入框
  nextTick(() => {
    senderRef.value?.focus()
  })
}

// 页面加载完成后自动聚焦输入框
onMounted(() => {
  setTimeout(() => {
    senderRef.value?.focus()
  }, 500)
})
</script>

<style scoped>
.template-example {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.example-title {
  margin-bottom: 20px;
  color: #333;
  font-weight: 500;
  font-size: 20px;
}

.sender-container {
  position: relative;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 10px;
  background: #f9f9f9;
}

.current-template-info {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  margin-bottom: 10px;
  background: rgba(0, 120, 255, 0.1);
  border-radius: 4px;
  font-size: 14px;
}

.template-label {
  color: #666;
  margin-right: 6px;
}

.template-name {
  color: #0078ff;
  font-weight: 500;
}

.template-clear {
  margin-left: auto;
  cursor: pointer;
  color: #888;
  font-size: 16px;
  padding: 0 4px;
}

.template-clear:hover {
  color: #ff4d4f;
}

.tip-text {
  margin-top: 8px;
  color: #888;
  font-size: 12px;
  text-align: right;
}

.trigger-key {
  display: inline-block;
  padding: 0 4px;
  background: #e9e9e9;
  border-radius: 3px;
  color: #555;
  font-family: monospace;
}

.message-log {
  margin-top: 30px;
  padding: 15px;
  border-radius: 8px;
  background: #f0f0f0;
}

.message-log h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-weight: 500;
}

.message-item {
  padding: 10px 15px;
  margin-bottom: 8px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.message-content {
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}
</style>
