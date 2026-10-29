<script setup lang="ts">
import { ref } from 'vue'
import Bubble from '../../../components/src/bubble/Bubble.vue'
import type { AskUserContent } from '../../../components/src/bubble/index.type'

const content: AskUserContent = {
  type: 'ask_user',
  id: 'shared-ask-user',
  heading: '选择框架',
  questions: [
    {
      id: 'framework',
      question: '框架',
      options: [{ label: 'Vue' }, { label: 'React' }],
      multiSelect: false,
      allowCustom: false,
    },
  ],
}

const firstState = ref<Record<string, unknown>>({})
const secondState = ref<Record<string, unknown>>({})

const updateState = (state: typeof firstState) => (payload: { key: string; value: unknown }) => {
  state.value = {
    ...state.value,
    [payload.key]: payload.value,
  }
}

const updateFirstState = updateState(firstState)
const updateSecondState = updateState(secondState)
</script>

<template>
  <Bubble role="assistant" :content="[content]" :state="firstState" @state-change="updateFirstState" />
  <Bubble role="assistant" :content="[content]" :state="secondState" @state-change="updateSecondState" />
</template>
