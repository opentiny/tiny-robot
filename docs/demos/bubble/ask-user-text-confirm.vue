<template>
  <div class="ask-user-demo">
    <div class="ask-user-demo__controls">
      <TinyButton size="small" :reset-time="0" :disabled="!canRelaunch" @click="relaunchInteraction">
        再次发起
      </TinyButton>
    </div>
    <TrBubble v-bind="message" @state-change="handleStateChange" />
    <details class="ask-user-demo__state">
      <summary>查看交互状态</summary>
      <pre>{{ JSON.stringify(message.state, null, 2) }}</pre>
    </details>
  </div>
</template>

<script setup lang="ts">
import { TrBubble, type AskUserContent, type AskUserState, type BubbleMessage } from '@opentiny/tiny-robot'
import { TinyButton } from '@opentiny/vue'
import { computed, reactive } from 'vue'

const message = reactive<BubbleMessage<AskUserContent[], { askUser?: AskUserState }>>({
  role: 'assistant',
  tool_calls: [
    {
      id: 'call-release-follow-up',
      type: 'function',
      function: {
        name: 'ask_user',
        arguments: JSON.stringify({
          heading: '发布说明与后续安排',
          questions: [
            {
              id: 'summary',
              summary: '变更目的',
              question: '请简要说明本次变更的目的。',
            },
            {
              id: 'sendInspectionSummary',
              summary: '巡检摘要',
              question: '发布后是否需要收到巡检摘要？',
              options: [{ label: '需要' }, { label: '不需要' }],
              multiSelect: false,
              allowCustom: false,
            },
          ],
        }),
      },
    },
  ],
  state: {},
})

const handleStateChange = (payload: { key: string; value: unknown }) => {
  message.state = { ...message.state, [payload.key]: payload.value }
}

const canRelaunch = computed(() => message.state?.askUser?.status === 'submitted')
let interactionSequence = 1

const relaunchInteraction = () => {
  const toolCall = message.tool_calls?.[0]
  if (!toolCall) return

  toolCall.id = `call-release-follow-up-${++interactionSequence}`
  message.state = {}
}
</script>

<style scoped>
.ask-user-demo__controls {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
}

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
