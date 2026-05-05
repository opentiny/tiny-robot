<script setup lang="ts">
import type { PropType } from 'vue'
import type { ChatPageHeaderInput } from '@/shared/context'
import type { ChatWorkspaceShellConfig } from '@/types'
import ChatHeader from '../ChatHeader.vue'

defineOptions({ name: 'TrChatDefaultHeaderRegion' })

defineProps({
  headerInput: Object as PropType<ChatPageHeaderInput | undefined>,
  shell: Object as PropType<ChatWorkspaceShellConfig | undefined>,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <template v-if="$slots.header">
    <slot name="header" />
  </template>
  <ChatHeader
    v-else
    :title="headerInput?.title"
    :show-history="headerInput?.showHistory"
    :show-close="headerInput?.showClose"
    :shell="shell"
    @close="emit('close')"
  >
    <template v-if="$slots['header-extra']" #extra>
      <slot name="header-extra" />
    </template>
  </ChatHeader>
</template>
