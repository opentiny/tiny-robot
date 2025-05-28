<template>
  <div class="app-container">
    <h4 style="margin-bottom: 20px">模板编辑器</h4>
    <tr-sender
      v-model="inputText"
      mode="multiple"
      :template="currentTemplate"
      :templateInitialValues="currentInitialValues"
      @submit="handleSubmit"
      ref="senderRef"
    />

    <div class="template-selector-container">
      <h4>请选择模板</h4>
    </div>

    <div class="template-selector">
      <button
        v-for="(item, index) in templates"
        :key="index"
        @click="selectTemplate(item)"
        class="template-button"
        :class="{ active: currentTemplate === item.template }"
      >
        {{ item.name }}
      </button>
    </div>

    <div class="test-info" v-if="currentTemplate">
      <h4>当前模板:</h4>
      <p>
        <code>{{ currentTemplate }}</code>
      </p>
      <h4>初始值:</h4>
      <pre>{{ JSON.stringify(currentInitialValues, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrSender } from '@opentiny/tiny-robot'
import { ref } from 'vue'

const inputText = ref('')
const currentTemplate = ref('')
const currentInitialValues = ref<Record<string, string>>({})
const senderRef = ref(null)

// 预定义模板
const templates = [
  {
    name: '模板1',
    template: '你好 [姓名]，欢迎使用 [产品]！',
    initialValues: {
      姓名: '张三',
      产品: 'TinyRobot',
    },
  },
  {
    name: '模板2',
    template: '你好 [姓名]，关于 [项目名称] 的进展，请查看 [文档链接]。',
    initialValues: {
      姓名: '张三', // 只有姓名有初始值，其他字段显示placeholder
    },
  },
  {
    name: '模板3',
    template: '尊敬的 [客户姓名]，您的 [订单类型] 已经 [处理状态]，预计 [交付时间] 完成。',
    initialValues: {
      客户姓名: '李明先生',
      订单类型: '定制化软件开发项目',
      处理状态: '进入开发阶段',
      交付时间: '三个工作日内',
    },
  },
  {
    name: '模板4',
    template: '[发件人] 向 [收件人] 发送关于 [主题] 的邮件。',
    initialValues: {
      发件人: '北京某某科技有限公司产品研发部技术总监',
      收件人: '上海某某集团信息技术部系统架构师团队负责人',
      主题: '关于新一代人工智能客服系统设计方案的深度讨论与合作意向洽谈',
    },
  },
  {
    name: '模板5',
    template: '[短] 和 [长文本] 在 [时间] 进行 [活动]。',
    initialValues: {
      短: 'AI',
      长文本: '企业级人工智能解决方案技术研讨会暨产品发布会',
      时间: '明天',
      活动: '深度技术交流',
    },
  },
]

// 选择模板
const selectTemplate = (template) => {
  currentTemplate.value = template.template
  currentInitialValues.value = template.initialValues || {}
  inputText.value = ''
}

// 提交处理
const handleSubmit = (text) => {
  console.log('提交模板填充内容:', text)
  alert(`提交内容: ${text}`)
}

// 默认选择第一个模板
selectTemplate(templates[0])
</script>

<style scoped>
.app-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.template-selector {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.template-button {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-button:hover {
  background: #e0e0e0;
}

.template-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.test-info {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.test-info h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.test-info p {
  margin: 0 0 15px 0;
}

.test-info code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.test-info pre {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  margin: 0;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
}
</style>
