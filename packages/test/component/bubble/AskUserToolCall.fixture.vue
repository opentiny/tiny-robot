<script setup lang="ts">
import { ref } from 'vue'
import Bubble from '../../../components/src/bubble/Bubble.vue'
import BubbleList from '../../../components/src/bubble/BubbleList.vue'
import type { BubbleMessage } from '../../../components/src/bubble/index.type'

const props = withDefaults(defineProps<{ askUserCount?: number; inList?: boolean; withText?: boolean }>(), {
  askUserCount: 1,
  inList: false,
  withText: false,
})

const toolCalls = Array.from({ length: props.askUserCount }, (_, index) => ({
  id: `call-ask-user-tool-call-test-${index + 1}`,
  type: 'function',
  function: {
    name: 'ask_user',
    arguments: JSON.stringify({
      heading: index === 0 ? '工具调用问题' : `工具调用问题 ${index + 1}`,
      questions: [
        {
          id: `environment-${index + 1}`,
          question: '选择发布环境',
          options: [{ label: '预发布' }, { label: '生产' }],
          multiSelect: false,
          allowCustom: false,
        },
      ],
    }),
  },
}))

const message = ref<BubbleMessage>({
  role: 'assistant',
  ...(props.withText ? { content: '请确认模型返回的发布环境。' } : {}),
  tool_calls: toolCalls,
  state: {},
})

const handleStateChange = (payload: { key: string; value: unknown }) => {
  message.value.state = { ...message.value.state, [payload.key]: payload.value }
}

const handleListStateChange = (payload: { key: string; value: unknown }) => {
  handleStateChange(payload)
}
</script>

<template>
  <BubbleList
    v-if="props.inList"
    data-testid="ask-user-tool-call-list"
    :messages="[message]"
    @state-change="handleListStateChange"
  />
  <Bubble v-else data-testid="ask-user-tool-call-bubble" v-bind="message" @state-change="handleStateChange" />
</template>
