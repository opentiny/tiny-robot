<script setup lang="ts">
import { ref } from 'vue'
import Bubble from '../../../components/src/bubble/Bubble.vue'
import type { AskUserContent, AskUserState, BubbleEvent } from '../../../components/src/bubble/index.type'

const content: AskUserContent = {
  type: 'ask_user',
  id: 'ask-user-test',
  title: '项目配置',
  steps: [
    {
      id: 'name',
      title: '项目名称',
      type: 'text',
      placeholder: '输入项目名称',
    },
    {
      id: 'framework',
      title: '框架',
      type: 'single',
      options: [
        { label: 'Vue', value: 'vue' },
        { label: 'React', value: 'react' },
      ],
    },
  ],
}

const state = ref<Record<string, unknown>>({})
const lastEvent = ref('')

const handleStateChange = (payload: { key: string; value: unknown }) => {
  state.value = {
    ...state.value,
    [payload.key]: payload.value,
  }
}

const handleBubbleEvent = (event: BubbleEvent) => {
  lastEvent.value = event.name
}

const replaceWithEquivalentState = () => {
  state.value = {
    askUser: {
      status: 'active',
      currentStep: 0,
      answers: {},
      completedStepIds: [],
    } satisfies AskUserState,
  }
}
</script>

<template>
  <Bubble
    data-testid="ask-user-bubble"
    role="assistant"
    :content="[content]"
    :state="state"
    @state-change="handleStateChange"
    @bubble-event="handleBubbleEvent"
  />
  <button type="button" data-testid="replace-state" @click="replaceWithEquivalentState">替换状态</button>
  <output data-testid="last-event">{{ lastEvent }}</output>
</template>
