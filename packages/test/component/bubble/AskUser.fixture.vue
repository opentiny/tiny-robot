<script setup lang="ts">
import { ref } from 'vue'
import Bubble from '../../../components/src/bubble/Bubble.vue'
import type { AskUserContent, AskUserState, BubbleEvent } from '../../../components/src/bubble/index.type'

const props = defineProps<{ initialState?: Record<string, unknown>; withOther?: boolean }>()

const content: AskUserContent = {
  type: 'ask_user',
  id: 'ask-user-test',
  heading: '项目配置',
  questions: [
    {
      id: 'name',
      question: '项目名称',
    },
    {
      id: 'framework',
      question: '框架',
      options: [{ label: 'Vue' }, { label: 'React' }],
      multiSelect: false,
      allowCustom: props.withOther ?? false,
    },
  ],
}

const state = ref<Record<string, unknown>>(props.initialState ?? {})
const lastEvent = ref('')
const lastStepId = ref('')

const handleStateChange = (payload: { key: string; value: unknown }) => {
  state.value = {
    ...state.value,
    [payload.key]: payload.value,
  }
}

const handleBubbleEvent = (event: BubbleEvent) => {
  lastEvent.value = event.name
  if (event.name === 'ask-user:step-change' && event.payload && typeof event.payload === 'object') {
    lastStepId.value = String((event.payload as { stepId?: string }).stepId ?? '')
  }
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
  <output data-testid="last-step-id">{{ lastStepId }}</output>
</template>
