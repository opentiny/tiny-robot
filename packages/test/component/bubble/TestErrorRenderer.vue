<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { BubbleErrorRendererProps } from '../../../components/src/bubble/index.type'

const props = defineProps<BubbleErrorRendererProps>()
const attrs = useAttrs()
const errorText = computed(() => {
  const error = props.message.state?.error
  return error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error)
})
</script>

<template>
  <div
    data-testid="test-error-renderer"
    :data-message-id="props.message.id"
    :data-message-role="props.message.role"
    :data-content-index="'contentIndex' in attrs ? 'present' : 'absent'"
  >
    {{ props.message.content }}|{{ errorText }}
  </div>
</template>
