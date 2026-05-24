<script setup lang="ts">
import { Bubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const toolCalls = [
  {
    id: 'tool_call_id_01',
    type: 'function',
    function: {
      name: '天气查询',
      arguments: JSON.stringify({ city: '深圳' }),
    },
  },
]

const state = ref<{
  toolCall: Record<string, { status?: string; open?: boolean }>
}>({
  toolCall: {
    tool_call_id_01: { status: 'awaiting-approval' },
  },
})

const selectedChoice = ref<'allow' | 'deny' | undefined>()
const choiceText = {
  allow: '允许',
  deny: '拒绝',
}

const handleReset = () => {
  selectedChoice.value = undefined
  state.value.toolCall.tool_call_id_01.status = 'awaiting-approval'
}

const handleStateChange = (payload: { key: string; value: unknown }) => {
  if (payload.key === 'toolCallDecision') {
    const value = payload.value as {
      toolCallId: string
      decision: { action: 'allow' | 'deny' }
    }

    selectedChoice.value = value.decision.action
    state.value.toolCall[value.toolCallId].status = value.decision.action === 'allow' ? 'success' : 'denied'
    return
  }

  if (payload.key === 'toolCall') {
    state.value.toolCall = payload.value as typeof state.value.toolCall
  }
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div class="demo-toolbar">
      <button class="reset-button" type="button" @click="handleReset">重置工具状态</button>
      <span v-if="selectedChoice" class="choice-status" :data-choice="selectedChoice">
        <span class="choice-dot"></span>
        <span class="choice-label">已选择</span>
        <strong>{{ choiceText[selectedChoice] }}</strong>
      </span>
    </div>

    <Bubble
      content="查询天气前需要确认。"
      :tool_calls="toolCalls"
      :avatar="aiAvatar"
      :state="state"
      @state-change="handleStateChange"
    ></Bubble>
  </div>
</template>

<style scoped>
.demo-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reset-button {
  height: 28px;
  padding: 0 12px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.reset-button:hover {
  background: var(--vp-c-default-soft);
}

.choice-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.choice-status strong {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.choice-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--vp-c-green-2);
}

.choice-status[data-choice='deny'] .choice-dot {
  background: var(--vp-c-red-2);
}

:deep(.tr-bubble__tool-call) {
  min-width: 350px;
}
</style>
