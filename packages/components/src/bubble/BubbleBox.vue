<script setup lang="ts">
import type { BubbleContentBoxProps } from './index.type'
import { useBubbleBoxRenderer } from './composables/useBubbleBoxRenderer'

const props = defineProps<BubbleContentBoxProps>()

const renderer = useBubbleBoxRenderer(() => ({
  placement: props.placement,
  shape: props.shape,
  messages: props.messages,
}))
</script>

<template>
  <component :is="renderer" :placement="props.placement" :shape="props.shape">
    <slot />
  </component>
</template>
