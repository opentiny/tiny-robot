<script setup lang="ts">
import { ref } from 'vue'
import Bubble from '../../../components/src/bubble/Bubble.vue'
import type { AskUserContent } from '../../../components/src/bubble/index.type'

const props = defineProps<{ useResolver?: boolean; initialState?: Record<string, unknown> }>()

const firstContent: AskUserContent = {
  type: 'ask_user',
  id: 'first-ask-user',
  title: '第一个问题',
  steps: [{ id: 'first-step', title: '第一个步骤', type: 'text' }],
}

const secondContent: AskUserContent = {
  type: 'ask_user',
  id: 'second-ask-user',
  title: '第二个问题',
  steps: [{ id: 'second-step', title: '第二个步骤', type: 'text' }],
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
