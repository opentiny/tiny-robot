<script setup lang="ts">
import Bubble from './Bubble.vue'
import { setupBubbleMessageGroup } from './composables'
import type { BubbleItemSlot, BubbleMessageGroup, BubbleProps, BubbleRoleConfig } from './index.type'

const props = defineProps<{
  messageGroup: BubbleMessageGroup
  roleConfig?: BubbleRoleConfig
  splitPolymorphic?: BubbleProps['splitPolymorphic']
}>()

defineSlots<BubbleItemSlot>()

// Provide messages for each BubbleItem instance
setupBubbleMessageGroup(() => props.messageGroup)
</script>

<template>
  <Bubble v-bind="roleConfig" :role="messageGroup.role" :split-polymorphic="splitPolymorphic">
    <template #prefix="slotProps">
      <slot name="prefix" v-bind="slotProps" :messages="messageGroup.messages"></slot>
    </template>
    <template #suffix="slotProps">
      <slot name="suffix" v-bind="slotProps" :messages="messageGroup.messages"></slot>
    </template>
    <template #content-footer="slotProps">
      <slot name="content-footer" v-bind="slotProps" :messages="messageGroup.messages"></slot>
    </template>
    <template #after="slotProps">
      <slot name="after" v-bind="slotProps" :messages="messageGroup.messages"></slot>
    </template>
  </Bubble>
</template>
