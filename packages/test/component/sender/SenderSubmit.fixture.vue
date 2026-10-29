<script setup lang="ts">
import { defineComponent, onUnmounted, ref } from 'vue'
import Sender from '../../../components/src/sender/index.vue'
import SubmitButton from '../../../components/src/sender-actions/submit-button/index.vue'
import { useSenderContentRegistration } from '../../../components/src/shared/composables/useSenderContentRegistration'

const props = defineProps<{
  initial?: string
  disabled?: boolean
  loading?: boolean
  submitDisabled?: boolean
  maxLength?: number
  hasExternalContent?: boolean
  payload?: string
}>()
const sender = ref<InstanceType<typeof Sender>>()
const submissions: unknown[][] = []
const Payload = defineComponent({
  setup() {
    const unregister = useSenderContentRegistration()?.('test', () => props.payload)
    if (unregister) onUnmounted(unregister)
    return () => null
  },
})

declare global {
  interface Window {
    senderSubmitFixture: {
      setAndSubmit: (text: string) => void
      snapshot: () => unknown[][]
    }
  }
}

window.senderSubmitFixture = {
  setAndSubmit: (text) => {
    sender.value?.setContent(text)
    sender.value?.submit()
  },
  snapshot: () => submissions.slice(),
}
</script>

<template>
  <Sender
    ref="sender"
    :default-value="initial"
    :disabled="disabled"
    :loading="loading"
    :max-length="maxLength"
    :has-external-content="hasExternalContent"
    :default-actions="{ submit: { disabled: submitDisabled } }"
    @submit="(...args) => submissions.push(args)"
  >
    <template #actions-inline>
      <Payload />
      <SubmitButton />
    </template>
  </Sender>
</template>
