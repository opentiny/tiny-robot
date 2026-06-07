<template>
  <div class="tool-approval-demo">
    <Bubble
      content="我需要调用天气工具获取实时信息。"
      :tool_calls="toolCalls"
      :avatar="aiAvatar"
      :state="state"
      @bubble-event="handleBubbleEvent"
      @state-change="handleStateChange"
    ></Bubble>

    <div class="event-log">
      <div class="event-log__header">
        <span>事件日志：</span>
        <button class="event-log__reset" type="button" @click="resetDemo">重置</button>
      </div>
      <pre class="event-log__content">{{ logsText }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bubble, type BubbleEvent } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { computed, h, ref } from 'vue'

type ToolCallState = Record<string, { status?: string; open?: boolean }>

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const toolCalls = [
  {
    id: 'call_weather',
    type: 'function',
    function: {
      name: 'get_weather',
      arguments: '{"city":"深圳"}',
    },
  },
]

const createInitialToolCallState = (): ToolCallState => ({
  call_weather: {
    status: 'awaiting-approval',
    open: false,
  },
})

const state = ref<{ toolCall: ToolCallState }>({
  toolCall: createInitialToolCallState(),
})

const createInitialLogs = () => ['点击「同意」或「拒绝」查看事件。']

const logs = ref<string[]>(createInitialLogs())
const logsText = computed(() => logs.value.join('\n'))

const appendLog = (title: string, payload: unknown) => {
  logs.value = [...logs.value, `[${title}] ${JSON.stringify(payload)}`]
}

const handleStateChange = (payload: { key: string; value: unknown }) => {
  if (payload.key === 'toolCall') {
    state.value.toolCall = payload.value as ToolCallState
  }

  appendLog('state-change', payload)
}

const handleBubbleEvent = (payload: BubbleEvent & { contentIndex: number }) => {
  appendLog(`bubble-event: ${payload.name}`, payload)
}

const resetDemo = () => {
  state.value.toolCall = createInitialToolCallState()
  logs.value = createInitialLogs()
}
</script>

<style scoped>
.tool-approval-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-log {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.event-log__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.event-log__reset {
  padding: 2px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
  cursor: pointer;
}

.event-log__content {
  max-height: 160px;
  padding: 8px;
  margin: 8px 0 0;
  overflow: auto;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  white-space: pre;
}
</style>
