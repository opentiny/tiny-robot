<script setup lang="ts">
import Bubble from './Bubble.vue'
import { setupBubbleMessageGroup } from './composables'
import type { BubbleMessageGroup, BubbleProps, BubbleRoleConfig, BubbleSlots } from './index.type'

const props = defineProps<{
  messageGroup: BubbleMessageGroup
  roleConfig?: BubbleRoleConfig
  contentRenderMode?: BubbleProps['contentRenderMode']
}>()

defineSlots<BubbleSlots>()

// Provide messages for each BubbleItem instance
setupBubbleMessageGroup(() => props.messageGroup)
</script>

<template>
  <Bubble v-bind="roleConfig" :role="messageGroup.role" :content-render-mode="contentRenderMode">
    <template #prefix="slotProps">
      <slot name="prefix" v-bind="slotProps"></slot>
    </template>
    <template #suffix="slotProps">
      <slot name="suffix" v-bind="slotProps"></slot>
    </template>
    <template #content-footer="slotProps">
      <slot name="content-footer" v-bind="slotProps"></slot>
    </template>
    <template #after="slotProps">
      <slot name="after" v-bind="slotProps"></slot>
    </template>
  </Bubble>
</template>
