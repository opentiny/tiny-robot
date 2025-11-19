<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const message = ref('')

// 技能块数据
const editorData = ref([
  {
    type: 'skill',
    label: '内容总结专家',
    value: '请帮我总结以下内容：',
  },
  {
    type: 'text',
    content: ' 现总结分析当前页面内容，然后用 ',
  },
  {
    type: 'skill',
    label: 'Excalidraw画图专家',
    value: '请用 Excalidraw 画图：',
  },
  {
    type: 'text',
    content: ' 画合适的图帮我',
  },
])

// 可用技能列表
const availableSkills = [
  { label: '内容总结专家', value: '请帮我总结以下内容：' },
  { label: 'Excalidraw画图专家', value: '请用 Excalidraw 画图：' },
  { label: 'UI设计', value: '请帮我设计UI界面：' },
  { label: '编程助手', value: '请帮我编写代码：' },
  { label: '翻译专家', value: '请帮我翻译：' },
]

const handleSubmit = () => {
  // 提取最终消息
  const finalMessage = editorData.value
    .map((item) => {
      if (item.type === 'skill') {
        return item.value // 使用 value 作为实际内容
      }
      return item.content
    })
    .join('')

  console.log('发送消息:', finalMessage)
  console.log('编辑器数据:', editorData.value)

  // 清空编辑器
  editorData.value = []
}

// 添加技能块
const addSkill = (skill: { label: string; value: string }) => {
  editorData.value.push({
    type: 'skill',
    label: skill.label,
    value: skill.value,
  })
}
</script>

<template>
  <div class="skill-demo">
    <h3>技能块示例</h3>
    <p>技能块可以与普通文本混合使用，支持编辑、删除等操作。</p>

    <!-- 技能选择器 -->
    <div class="skill-selector">
      <h4>可用技能：</h4>
      <div class="skill-buttons">
        <button v-for="skill in availableSkills" :key="skill.label" class="skill-button" @click="addSkill(skill)">
          + {{ skill.label }}
        </button>
      </div>
    </div>

    <!-- Sender 组件 -->
    <tr-sender
      v-model="message"
      v-model:template-data="editorData"
      placeholder="输入消息或选择技能..."
      @submit="handleSubmit"
    />

    <!-- 数据预览 -->
    <div class="data-preview">
      <h4>编辑器数据：</h4>
      <pre>{{ JSON.stringify(editorData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.skill-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h3 {
  margin-bottom: 8px;
  color: #333;
}

p {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

.skill-selector {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.skill-selector h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.skill-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-button {
  padding: 6px 12px;
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.skill-button:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.data-preview {
  margin-top: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.data-preview h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.data-preview pre {
  margin: 0;
  padding: 12px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  color: #333;
}
</style>
