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
      id: 'release-follow-up',
      heading: '发布说明与后续安排',
      questions: [
        {
          id: 'summary',
          question: '请简要说明本次变更的目的。',
        },
        {
          id: 'sendInspectionSummary',
          question: '发布后是否需要收到巡检摘要？',
          options: [{ label: '需要' }, { label: '不需要' }],
          multiSelect: false,
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
