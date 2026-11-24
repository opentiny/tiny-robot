<script setup lang="ts">
import { ref } from 'vue'
import Bubble from '../../../components/src/bubble/Bubble.vue'
import type { AskUserContent } from '../../../components/src/bubble/index.type'

const props = defineProps<{ useResolver?: boolean; initialState?: Record<string, unknown> }>()

const firstContent: AskUserContent = {
  type: 'ask_user',
  id: 'first-ask-user',
  heading: '第一个问题',
  questions: [{ id: 'first-step', question: '第一个步骤' }],
}

const secondContent: AskUserContent = {
  type: 'ask_user',
  id: 'second-ask-user',
  heading: '第二个问题',
  questions: [{ id: 'second-step', question: '第二个步骤' }],
}

const state = ref<Record<string, unknown>>(props.initialState ?? {})

const resolveContent = () => [firstContent, secondContent]

const handleStateChange = (payload: { key: string; value: unknown }) => {
  state.value = {
    ...state.value,
    [payload.key]: payload.value,
  }
}
</script>

<template>
  <Bubble
    role="assistant"
    content-render-mode="split"
    :content="[firstContent, secondContent]"
    :content-resolver="props.useResolver ? resolveContent : undefined"
    :state="state"
    @state-change="handleStateChange"
  />
</template>
