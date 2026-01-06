<script setup lang="ts">
import Bubble from './Bubble.vue'
import { setupBubbleMessageGroup } from './composables'
import type { BubbleMessageGroup, BubbleProps, BubbleRoleConfig, BubbleSlots } from './index.type'

const props = defineProps<{
  messageGroup: BubbleMessageGroup
  roleConfig?: BubbleRoleConfig
  contentRenderMode?: BubbleProps['contentRenderMode']
  contentResolver?: BubbleProps['contentResolver']
}>()

defineSlots<BubbleSlots>()

const emit = defineEmits<{
  (e: 'state-change', payload: { key: string; value: unknown; messageIndex: number; contentIndex?: number }): void
}>()

// Provide messages for each BubbleItem instance
setupBubbleMessageGroup(() => props.messageGroup)
</script>

<template>
  <Bubble
    v-bind="roleConfig"
    :role="messageGroup.role"
    :content-render-mode="contentRenderMode"
    :content-resolver="contentResolver"
    @state-change="emit('state-change', $event)"
  >
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
