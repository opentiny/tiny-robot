<script setup lang="ts">
import type { BubbleBoxRendererProps } from '../../../components/src/bubble/index.type'

defineProps<BubbleBoxRendererProps>()
</script>

<template>
  <section data-testid="test-box-renderer"><slot /></section>
</template>
