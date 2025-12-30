<script setup lang="ts">
import { useBubbleBoxRenderer } from './composables'
import type { BubbleMessage, BubbleProps } from './index.type'

const props = defineProps<
  Pick<BubbleProps, 'role' | 'placement' | 'shape'> & {
    messages: BubbleMessage[]
    contentIndex?: number
  }
>()

const renderer = useBubbleBoxRenderer(() => props.messages, props.contentIndex)
</script>

<template>
  <component
    :is="renderer.renderer"
    :data-role="props.role"
    :data-placement="props.placement"
    :data-shape="props.shape"
    v-bind="renderer.attributes"
  >
    <slot />
  </component>
</template>
