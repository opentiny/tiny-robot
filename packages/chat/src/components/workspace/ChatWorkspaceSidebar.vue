<script setup lang="ts">
import { ChatHistoryContent } from '@/components/history'
import ChatWorkspaceSidebarShell from './ChatWorkspaceSidebarShell.vue'

defineOptions({ name: 'TrChatWorkspaceSidebar' })

const props = withDefaults(
  defineProps<{
    mobile?: boolean
    title?: string
  }>(),
  {
    mobile: false,
    title: 'TinyRobot',
  },
)
</script>

<template>
  <ChatWorkspaceSidebarShell :mobile="props.mobile" :title="props.title">
    <slot>
      <ChatHistoryContent />
    </slot>
  </ChatWorkspaceSidebarShell>
</template>
