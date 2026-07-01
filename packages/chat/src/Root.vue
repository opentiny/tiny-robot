<script setup lang="ts">
import { provide } from 'vue'
import { chatContextKey } from './context'
import type { ChatParts, ChatRuntime } from './types'

const props = withDefaults(
  defineProps<{
    runtime: ChatRuntime
    parts?: ChatParts
  }>(),
  {
    parts: () => ({}),
  },
)

provide(chatContextKey, {
  runtime: props.runtime,
  parts: props.parts,
})
</script>

<template>
  <slot />
</template>
