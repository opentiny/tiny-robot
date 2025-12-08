<script setup lang="ts">
import { watchEffect } from 'vue'
import { BubbleRendererMessage } from '../index.type'
import { useBubbleStore } from '../composables'

const props = defineProps<BubbleRendererMessage<string>>()

const store = useBubbleStore<{ toolCallResult?: Record<string, string> }>()

watchEffect(() => {
  if (!props.tool_call_id) {
    return
  }

  if (!store.toolCallResult) {
    store.toolCallResult = {}
  }

  store.toolCallResult[props.tool_call_id] = props.content
})
</script>

<template>
  <div style="display: none">{{ props.content }}</div>
</template>
