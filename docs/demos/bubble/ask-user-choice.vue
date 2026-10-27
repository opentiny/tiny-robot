<template>
  <div class="ask-user-demo">
    <TrBubble :content="message.content" :state="message.state" @state-change="handleStateChange" />
    <details class="ask-user-demo__state">
      <summary>查看交互状态</summary>
      <pre>{{ JSON.stringify(message.state, null, 2) }}</pre>
    </details>
  </div>
</template>

<script setup lang="ts">
import { TrBubble, type AskUserContent, type AskUserState, type BubbleMessage } from '@opentiny/tiny-robot'
import { reactive } from 'vue'

const message = reactive<BubbleMessage<AskUserContent[], { askUser?: AskUserState }>>({
  role: 'assistant',
  content: [
    {
      type: 'ask_user',
      id: 'release-environment',
      heading: '选择或自定义发布环境',
      questions: [
        {
          id: 'environment',
          question: '请选择发布环境；如果候选项不合适，也可以输入其他环境。',
          options: [
            { label: '预发布环境', description: '先完成验证' },
            { label: '生产环境', description: '直接影响线上用户' },
          ],
          multiSelect: false,
          allowCustom: true,
        },
      ],
    },
  ],
  state: {},
})

const handleStateChange = (payload: { key: string; value: unknown }) => {
  message.state = { ...message.state, [payload.key]: payload.value }
}
</script>

<style scoped>
.ask-user-demo__state {
  margin-top: 8px;
  font-size: 12px;
}

.ask-user-demo__state pre {
  margin: 8px 0 0;
  padding: 10px;
  overflow: auto;
  background: #f5f5f5;
  border-radius: 6px;
}
</style>
