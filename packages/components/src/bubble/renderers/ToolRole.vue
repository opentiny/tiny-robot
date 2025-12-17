<script setup lang="ts">
import { watchEffect } from 'vue'
import { useBubbleStore } from '../composables'
import { BubbleContentRendererProps } from '../index.type'

const props = defineProps<BubbleContentRendererProps<string>>()

const store = useBubbleStore<{ toolCallResults?: Record<string, string> }>()

watchEffect(() => {
  if (!props.message.tool_call_id) {
    return
  }

  if (!store.toolCallResults) {
    store.toolCallResults = {}
  }

  store.toolCallResults[props.message.tool_call_id] = props.message.content ?? ''
})
</script>

<template>
  <div style="display: none">{{ props.message.content }}</div>
</template>
