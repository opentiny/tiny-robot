<script setup lang="ts">
import type { Component } from 'vue'
import { setupBubbleBoxRenderer, useBubbleBoxRenderer } from './composables'
import type { BubbleBoxProps, BubbleRendererMessage } from './index.type'

const props = defineProps<BubbleBoxProps & { messages: BubbleRendererMessage[]; fallbackRenderer?: Component }>()

// 更新子孙 renderer 组件的 fallback renderer
setupBubbleBoxRenderer({ fallbackBoxRenderer: () => props.fallbackRenderer })

// 由于 provide 不会在当前组件中生效，因此需要手动提供 fallback renderer
const renderer = useBubbleBoxRenderer(
  () => props.messages,
  () => props.fallbackRenderer,
)
</script>

<template>
  <component :is="renderer" :placement="props.placement" :shape="props.shape">
    <slot />
  </component>
</template>
