<script setup lang="ts">
import { provide } from 'vue'
import Bubble from './Bubble.vue'
import { BUBBLE_MESSAGE_GROUP_KEY } from './constants'
import type { BubbleMessageGroup, BubbleRoleConfig, BubbleProps } from './index.type'

const props = defineProps<{
  messageGroup: BubbleMessageGroup
  roleConfig?: BubbleRoleConfig
  polymorphicContentMode?: BubbleProps['polymorphicContentMode']
}>()

// Provide messages for each BubbleItem instance
provide(BUBBLE_MESSAGE_GROUP_KEY, props.messageGroup)
</script>

<template>
  <Bubble v-bind="roleConfig" :role="messageGroup.role" :polymorphic-content-mode="polymorphicContentMode" />
</template>
