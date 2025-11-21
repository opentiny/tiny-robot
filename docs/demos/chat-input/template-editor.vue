<template>
  <div class="template-demo">
    <div class="template-buttons">
      <tiny-button size="small" @click="setTemplate1"> 模板1：自我介绍 </tiny-button>
      <tiny-button size="small" @click="setTemplate2"> 模板2：写报告 </tiny-button>
      <tiny-button size="small" @click="clearTemplate"> 清空 </tiny-button>
    </div>

    <ChatInput
      ref="chatInputRef"
      mode="multiple"
      v-model="content"
      v-model:template-data="templateData"
      placeholder="点击上方按钮插入模板，或直接输入..."
      :max-length="500"
      show-word-limit
      @submit="handleSubmit"
    />

    <div v-if="submittedContent" class="result">
      <div class="result-title">提交的内容：</div>
      <div class="result-content">{{ submittedContent }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button as TinyButton } from '@opentiny/vue'
import { ChatInput } from '@opentiny/tiny-robot'
import type { TemplateItem } from '@opentiny/tiny-robot'

const chatInputRef = ref()
const content = ref('')
const templateData = ref<TemplateItem[]>([])
const submittedContent = ref('')

const setTemplate1 = () => {
  templateData.value = [
    { type: 'text', content: '你好，我是 ' },
    { type: 'template', content: '张三' },
    { type: 'text', content: '，来自 ' },
    { type: 'template', content: '北京' },
    { type: 'text', content: '，很高兴认识你！' },
  ]
}

const setTemplate2 = () => {
  templateData.value = [
    { type: 'text', content: '请帮我写一份关于 ' },
    { type: 'template', content: '人工智能' },
    { type: 'text', content: ' 的 ' },
    { type: 'template', content: '技术报告' },
    { type: 'text', content: '，字数要求 ' },
    { type: 'template', content: '3000字' },
    { type: 'text', content: '。' },
  ]
}

const clearTemplate = () => {
  chatInputRef.value?.clearTemplateData()
  content.value = ''
}

const handleSubmit = (text: string) => {
  submittedContent.value = text
}
</script>

<style scoped>
.template-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.result {
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.result-content {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
