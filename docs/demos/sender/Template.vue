<template>
  <div class="app-container">
    <h3 style="margin-bottom: 20px">选择常用模板</h3>
    <tr-sender v-model="inputText" mode="multiple" :template="currentTemplate" @submit="handleSubmit" ref="senderRef" />

    <div class="template-selector">
      <button v-for="(item, index) in templates" :key="index" @click="selectTemplate(item)" class="template-button">
        {{ item.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
import { ref } from 'vue'

const inputText = ref('')
const currentTemplate = ref('')
const senderRef = ref(null)

// 预定义模板
const templates = [
  {
    name: '问候模板',
    template: '你好 [称呼]，希望您一切顺利！',
  },
  {
    name: '感谢模板',
    template: '感谢您的 [事项]，我们会尽快处理。',
  },
  {
    name: '通知模板',
    template: '请注意，[事件] 将在 [时间] 进行，请 [操作] 准备。',
  },
]

// 选择模板
const selectTemplate = (template) => {
  currentTemplate.value = template.template
  inputText.value = ''
}

// 提交处理
const handleSubmit = (text) => {
  console.log('提交模板填充内容:', text)
  inputText.value = ''
  currentTemplate.value = ''
}
</script>

<style scoped>
.app-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.template-selector {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.template-button {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.template-button:hover {
  background: #e0e0e0;
}
</style>
