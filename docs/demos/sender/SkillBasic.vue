<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'

const message = ref('')

// 初始化编辑器数据，包含一个技能块
const editorData = ref([
  {
    type: 'skill',
    label: '翻译专家',
    value: '请帮我翻译：',
  },
  {
    type: 'text',
    content: ' Hello World',
  },
])

const handleSubmit = () => {
  // 提取最终消息
  const finalMessage = editorData.value
    .map((item) => {
      if (item.type === 'skill') {
        return item.value // 技能块使用 value 字段
      }
      return item.content // 文本块使用 content 字段
    })
    .join('')

  console.log('最终消息:', finalMessage)
  // 输出: "请帮我翻译： Hello World"

  alert(`发送消息:\n${finalMessage}`)

  // 清空编辑器
  editorData.value = []
}
</script>

<template>
  <div class="skill-basic-demo">
    <h3>技能块基础示例</h3>
    <p>技能块（蓝色标签）会在发送时被替换为对应的 value 值。</p>

    <tr-sender
      v-model="message"
      mode="multiple"
      v-model:template-data="editorData"
      placeholder="输入消息..."
      @submit="handleSubmit"
    />

    <div class="info">
      <h4>当前编辑器内容：</h4>
      <div class="content-display">
        <span v-for="(item, index) in editorData" :key="index">
          <span v-if="item.type === 'skill'" class="skill-display">@{{ item.label }}</span>
          <span v-else>{{ item.content }}</span>
        </span>
      </div>

      <h4>发送时的实际内容：</h4>
      <div class="content-display">
        {{
          editorData
            .map((item) => {
              if (item.type === 'skill') return item.value
              return item.content
            })
            .join('')
        }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-basic-demo {
  padding: 20px;
  max-width: 700px;
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

.info {
  margin-top: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.info h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.info h4:not(:first-child) {
  margin-top: 16px;
}

.content-display {
  padding: 12px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  min-height: 40px;
}

.skill-display {
  display: inline-block;
  padding: 2px 8px;
  background: #3b82f6;
  color: white;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  margin: 0 2px;
}
</style>
