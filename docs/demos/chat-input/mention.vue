<script setup lang="ts">
import { ref } from 'vue'
import { ChatInput } from '@opentiny/tiny-robot'
import type { MentionItem, ContentNode } from '@opentiny/tiny-robot'

const content = ref('')

// 提及列表（id 可选，组件会自动生成）
const mentions: MentionItem[] = [
  {
    label: '小小画家',
    preset: '你是一个专业的绘画助手，擅长帮助用户进行艺术创作和绘画指导。',
  },
  {
    label: '代码助手',
    preset: '你是一个专业的编程助手，精通多种编程语言，能够帮助用户解决编程问题。',
  },
  {
    label: '文案大师',
    preset: '你是一个专业的文案撰写专家，擅长创作各类营销文案和创意内容。',
  },
  {
    label: '数据分析师',
    preset: '你是一个专业的数据分析师，擅长数据处理、统计分析和可视化。',
  },
  {
    label: '翻译专家',
    preset: '你是一个专业的翻译专家，精通多国语言，能够提供准确流畅的翻译服务。',
  },
]

const handleSubmit = (value: string, structuredContent: ContentNode[]) => {
  console.log('提交内容（默认拼接）：', value)
  console.log('提交结构数据（原始数据）：', structuredContent)
}
</script>

<template>
  <div class="mention-demo">
    <div class="demo-tip">
      <p>💡 输入 <code>@</code> 触发提及选择，支持键盘导航（↑↓）和 Enter/Tab 选择</p>
    </div>

    <ChatInput
      v-model="content"
      :mentions="mentions"
      placeholder="输入 @ 选择助手..."
      mode="multiple"
      :max-length="500"
      show-word-limit
      clearable
      @submit="handleSubmit"
    />

    <div v-if="content" class="demo-output">
      <h4>当前内容：</h4>
      <pre>{{ content }}</pre>
    </div>
  </div>
</template>

<style scoped>
.mention-demo {
  width: 100%;
  max-width: 800px;
}

.demo-tip {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f0f7ff;
  border-left: 4px solid #1476ff;
  border-radius: 4px;
}

.demo-tip p {
  margin: 0;
  color: #333;
  font-size: 14px;
  line-height: 1.6;
}

.demo-tip code {
  padding: 2px 6px;
  background: rgba(20, 118, 255, 0.1);
  color: #1476ff;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.demo-output {
  margin-top: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.demo-output h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.demo-output pre {
  margin: 0;
  padding: 12px;
  background: white;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  color: #666;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
