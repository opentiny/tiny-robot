<script setup lang="ts">
import { provide } from 'vue'
import Bubble from './Bubble.vue'
import { BUBBLE_MESSAGE_GROUP_KEY } from './constants'
import type { BubbleMessageGroup, BubbleProps, BubbleRoleConfig } from './index.type'

const props = defineProps<{
  messageGroup: BubbleMessageGroup
  roleConfig?: BubbleRoleConfig
  splitPolymorphic?: BubbleProps['splitPolymorphic']
}>()

// Provide messages for each BubbleItem instance
provide(BUBBLE_MESSAGE_GROUP_KEY, props.messageGroup)
</script>

<template>
  <Bubble v-bind="roleConfig" :role="messageGroup.role" :split-polymorphic="splitPolymorphic" />
</template>
