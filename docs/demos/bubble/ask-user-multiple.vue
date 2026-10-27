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
      id: 'release-services',
      heading: '多选题',
      questions: [
        {
          id: 'services',
          question: '本次发布涉及哪些服务？',
          options: [{ label: '订单服务' }, { label: '库存服务' }, { label: '支付服务' }],
          multiSelect: true,
          allowCustom: false,
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
