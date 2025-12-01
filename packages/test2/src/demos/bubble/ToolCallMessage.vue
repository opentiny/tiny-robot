<script setup lang="ts">
import { Bubble } from '@opentiny/tiny-robot'
import { ref } from 'vue'
import Avatar from '../Avatar.vue'

const toolCalls = ref([
  {
    id: 'call_00_wy0r2VgGNvzUp1tIfCfSnGPO',
    type: 'function',
    function: { name: 'add', arguments: '{"a": 4, "b": 4}' },
    status: 'running',
    open: true,
  },
  {
    id: 'call_01_ZaQqGi3jCXr1iJ308Yu1hJkj',
    type: 'function',
    function: { name: 'multiply', arguments: '{"a": 4, "b": 4}' },
    open: true,
  },
])

const handleChangeToolCallStatus = () => {
  const allStatus = ['running', 'success', 'failed', 'cancelled'] as const
  const currentStatus = toolCalls.value[0]!.status as (typeof allStatus)[number]
  const nextStatus = allStatus[(allStatus.indexOf(currentStatus) + 1) % allStatus.length]
  toolCalls.value[0]!.status = nextStatus
}

const handleChangeToolCallArguments = () => {
  const args = toolCalls.value[0]!.function.arguments
  const parsedArgs = JSON.parse(args)
  parsedArgs.a = parsedArgs.a + 1
  toolCalls.value[0]!.function.arguments = JSON.stringify(parsedArgs)
}

const isReplaying = ref(false)

const handleReplaySecondToolCall = async () => {
  const originalArguments = toolCalls.value[1]!.function.arguments

  isReplaying.value = true
  toolCalls.value[1]!.function.arguments = ''
  toolCalls.value[1]!.status = 'running'
  for (const char of originalArguments) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    toolCalls.value[1]!.function.arguments += char
  }

  isReplaying.value = false
  toolCalls.value[1]!.status = 'success'
}
</script>

<template>
  <section>
    <p><strong>工具调用消息</strong></p>

    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px">
      <div>
        <label>
          <input type="checkbox" v-model="toolCalls[0]!.open" />
          First Tool Call Expanded
        </label>
      </div>
      <div>
        <button @click="handleChangeToolCallStatus">Change First Tool Call Status</button>
      </div>
      <div>
        <button @click="handleChangeToolCallArguments">Change First Tool Call Arguments</button>
      </div>
      <div>
        <button @click="handleReplaySecondToolCall" :disabled="isReplaying">Replay Second Tool Call</button>
      </div>
    </div>

    <Bubble content="我来帮您同时计算这两个算式。" :tool_calls="toolCalls" :avatar="Avatar" />
  </section>
</template>
