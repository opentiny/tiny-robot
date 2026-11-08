<script setup lang="ts">
import { computed } from 'vue'
import Bubble from '../../../components/src/bubble/Bubble.vue'
import type { BubbleMessage } from '../../../components/src/bubble/index.type'

const props = defineProps<{ names: string[] }>()

const message = computed<BubbleMessage>(() => ({
  role: 'assistant',
  content: '准备调用工具',
  tool_calls: props.names.map((name, index) => ({
    id: `tool-${index}`,
    type: 'function',
    function: { name, arguments: '{"query":"quarterly report"}' },
  })),
  state: {
    toolCall: Object.fromEntries(
      props.names.map((_, index) => [
        `tool-${index}`,
        index === 0
          ? {
              status: 'awaiting-approval',
              description: '根据用户给出的时间范围查询季度报告，并汇总不同地区和业务线的收入变化以及同比数据。',
            }
          : { status: 'success' },
      ]),
    ),
  },
}))
</script>

<template>
  <main style="width: 320px">
    <Bubble v-bind="message" />
  </main>
</template>
