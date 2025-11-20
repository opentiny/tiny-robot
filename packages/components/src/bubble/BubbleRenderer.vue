<script setup lang="ts">
import type { BubbleRendererProps } from './index.type'
import { getBoxRenderer, getContentRenderer } from './ren/renderers'

const props = defineProps<BubbleRendererProps>()
</script>

<template>
  <component :is="getBoxRenderer(props)" :placement="props.placement" :shape="props.shape">
    <component
      v-for="(message, index) in props.messages"
      :key="index"
      :is="getContentRenderer(message)"
      v-bind="message"
    ></component>
  </component>
</template>
