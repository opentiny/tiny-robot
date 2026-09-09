<script setup lang="ts">
import type { BubbleContentRendererProps } from '../../../components/src/bubble/index.type'

const props = defineProps<BubbleContentRendererProps>()
</script>

<template>
  <div data-testid="fallback-content-renderer">Fallback content {{ props.contentIndex }}</div>
</template>
