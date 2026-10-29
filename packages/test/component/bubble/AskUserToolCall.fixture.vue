<script setup lang="ts">
import { ref } from 'vue'
import Bubble from '../../../components/src/bubble/Bubble.vue'
import BubbleList from '../../../components/src/bubble/BubbleList.vue'
import BubbleProvider from '../../../components/src/bubble/BubbleProvider.vue'
import type { BubbleMessage } from '../../../components/src/bubble/index.type'

const props = withDefaults(
  defineProps<{
    askUserCount?: number
    inList?: boolean
    malformedAskUser?: boolean
    withContentAttributes?: boolean
    withOrdinaryTool?: boolean
    withText?: boolean
  }>(),
  {
    askUserCount: 1,
    inList: false,
    malformedAskUser: false,
    withContentAttributes: false,
    withOrdinaryTool: false,
    withText: false,
  },
)

const toolCalls = [
  ...Array.from({ length: props.askUserCount }, (_, index) => ({
    id: `call-ask-user-tool-call-test-${index + 1}`,
    type: 'function',
    function: {
      name: 'ask_user',
      arguments:
        props.malformedAskUser && index === 0
          ? JSON.stringify({
              heading: '工具调用问题',
              questions: [
                {
                  id: `environment-${index + 1}`,
                  question: '选择发布环境',
                  unsupported: true,
                  options: [{ label: '预发布' }, { label: '生产' }],
                  multiSelect: false,
                  allowCustom: false,
                },
              ],
            })
          : JSON.stringify({
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
  })),
  ...(props.withOrdinaryTool
    ? [
        {
          id: 'call-send-email-test',
          type: 'function',
          function: { name: 'send_email', arguments: JSON.stringify({ to: 'team@example.com' }) },
        },
      ]
    : []),
]

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
  <BubbleProvider
    :content-attributes="props.withContentAttributes ? { 'data-testid': 'synthetic-ask-user' } : undefined"
  >
    <BubbleList
      v-if="props.inList"
      data-testid="ask-user-tool-call-list"
      :messages="[message]"
      @state-change="handleListStateChange"
    />
    <Bubble v-else data-testid="ask-user-tool-call-bubble" v-bind="message" @state-change="handleStateChange" />
  </BubbleProvider>
</template>
