<script setup lang="ts">
import { useBubbleContentRenderer } from './composables'
import type { BubbleContent } from './index.type'

const props = defineProps<{
  message: BubbleContent
  contentIndex?: number
}>()

const renderer = useBubbleContentRenderer(() => props.message, props.contentIndex)
</script>

<template>
  <component :is="renderer" v-bind="props"></component>
</template>
