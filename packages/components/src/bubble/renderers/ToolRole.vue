<script setup lang="ts">
import { watchEffect } from 'vue'
import { BubbleRendererMessage } from '../index.type'
import { useBubbleStore } from '../composables'

const props = defineProps<BubbleRendererMessage<string>>()

const store = useBubbleStore<{ toolCallResults?: Record<string, string> }>()

watchEffect(() => {
  if (!props.tool_call_id) {
    return
  }

  if (!store.toolCallResults) {
    store.toolCallResults = {}
  }

  store.toolCallResults[props.tool_call_id] = props.content
})
</script>

<template>
  <div style="display: none">{{ props.content }}</div>
</template>
