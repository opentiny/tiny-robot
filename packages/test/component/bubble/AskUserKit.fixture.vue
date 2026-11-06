<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toolPlugin } from '../../../kit/src/vue/message/plugins/toolPlugin'
import { useAskUserRuntime } from '../../../kit/src/vue/message/useAskUserRuntime'
import { useMessage } from '../../../kit/src/vue/message/useMessage'
import type { ChatCompletion, ResponseProvider } from '../../../kit/src/vue/message/types'
import BubbleList from '../../../components/src/bubble/BubbleList.vue'

const props = defineProps<{ maxToolRounds?: number; delayToolPreparation?: boolean }>()
const toolResult = ref('')
let finishStream!: () => void
const waitForStreamEnd = new Promise<void>((resolve) => {
  finishStream = resolve
})
let finishPreparation!: () => void
const waitForPreparation = new Promise<void>((resolve) => {
  finishPreparation = resolve
})

const responseProvider: ResponseProvider = async function* (requestBody) {
  const toolMessage = requestBody.messages.find((message) => message.role === 'tool')
  if (toolMessage) {
    toolResult.value = String(toolMessage.content)
    yield {
      id: 'ask-user-final',
      object: 'chat.completion.chunk',
      created: 1,
      model: 'mock',
      choices: [{ index: 0, delta: { content: 'Answer received.' }, finish_reason: 'stop' }],
    } as ChatCompletion
    return
  }

  yield {
    id: 'ask-user-stream',
    object: 'chat.completion.chunk',
    created: 1,
    model: 'mock',
    choices: [
      {
        index: 0,
        delta: {
          role: 'assistant',
          tool_calls: [
            {
              index: 0,
              id: 'call-ask-user-kit',
              type: 'function',
              function: {
                name: 'ask_user',
                arguments: JSON.stringify({
                  questions: [
                    { id: 'name', question: 'Name?' },
                    { id: 'notes', question: 'Notes?' },
                  ],
                }),
              },
            },
          ],
        },
        finish_reason: null,
      },
    ],
  } as ChatCompletion
  await waitForStreamEnd
  yield {
    id: 'ask-user-stream',
    object: 'chat.completion.chunk',
    created: 1,
    model: 'mock',
    choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }],
  } as ChatCompletion
}

const engine = useMessage({
  responseProvider,
  plugins: [
    toolPlugin({
      askUser: true,
      maxToolRounds: props.maxToolRounds,
      beforeCallTools: async () => {
        if (props.delayToolPreparation) {
          await waitForPreparation
        }
      },
      getTools: async () => [],
      callTool: async () => '',
      persistPausedTurn: false,
    }),
  ],
})
const runtime = useAskUserRuntime(engine)
const { messages, requestState } = engine

onMounted(() => {
  void engine.sendMessage('Collect my name')
})
</script>

<template>
  <BubbleList
    data-testid="ask-user-kit-bubbles"
    :messages="messages"
    @state-change="runtime.handleStateChange"
    @bubble-event="runtime.handleBubbleEvent"
  />
  <button type="button" data-testid="finish-stream" @click="finishStream">Finish stream</button>
  <button type="button" data-testid="finish-preparation" @click="finishPreparation">Finish preparation</button>
  <output data-testid="request-state">{{ requestState }}</output>
  <output data-testid="tool-result">{{ toolResult }}</output>
</template>
