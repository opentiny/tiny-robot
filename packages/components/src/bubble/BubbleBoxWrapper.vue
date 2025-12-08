<script setup lang="ts">
import { useBubbleBoxRenderer } from './composables'
import type { BubbleContentBoxProps } from './index.type'

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
