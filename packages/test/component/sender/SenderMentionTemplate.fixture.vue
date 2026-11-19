<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrSender as Sender } from '@opentiny/tiny-robot'

const props = defineProps<{
  template?: boolean
  defaultValue?: string
  maxLength?: number
  mode?: 'single' | 'multiple'
}>()
const submitted = shallowRef('')
const extensions = [
  ...(props.template === false ? [] : [Sender.Template.configure({ items: [] })]),
  Sender.mention([{ id: 'user-1', label: '张三', value: 'user-123' }]),
]

function handleSubmit(text: string, data?: unknown) {
  submitted.value = JSON.stringify({ text, data })
}
</script>

<template>
  <div>
    <Sender
      :extensions="extensions"
      :default-value="props.defaultValue"
      :max-length="props.maxLength"
      :mode="props.mode"
      show-word-limit
      @submit="handleSubmit"
    />
    <output data-testid="submit-output">{{ submitted }}</output>
  </div>
</template>
