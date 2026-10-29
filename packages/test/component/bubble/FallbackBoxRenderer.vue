<script setup lang="ts">
import type { BubbleBoxRendererProps } from '../../../components/src/bubble/index.type'

defineProps<BubbleBoxRendererProps>()
</script>

<template>
  <aside data-testid="fallback-box-renderer"><slot /></aside>
</template>
