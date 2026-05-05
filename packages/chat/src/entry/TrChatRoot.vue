<script setup lang="ts">
import { computed, provide } from 'vue'
import { CHAT_PAGE_INPUTS_KEY, CHAT_RUNTIME_KEY, MCP_MANAGER_KEY } from '@/shared/context'
import { createRootBootstrapState } from '@/entry/createRootBootstrapState'
import RootBootstrapProvider from '@/entry/RootBootstrapProvider.vue'
import { normalizeChatRuntime } from '@/runtime/core/normalizeRuntime'
import type { TrChatRootProps } from '@/types'

defineOptions({ name: 'TrChatRoot' })

const props = defineProps<TrChatRootProps>()

const normalizedRuntime = computed(() => normalizeChatRuntime(props.runtime))
const bootstrap = createRootBootstrapState(
  normalizedRuntime,
  computed(() => props.ui),
)

provide(CHAT_PAGE_INPUTS_KEY, bootstrap.pageInputs)
provide(CHAT_RUNTIME_KEY, normalizedRuntime.value)
if (props.mcpManager) {
  provide(MCP_MANAGER_KEY, props.mcpManager)
}
</script>

<template>
  <RootBootstrapProvider
    :chat-kit="bootstrap.chatKit.value"
    :attachments-manager="bootstrap.attachmentsManager.value"
    :attachments-feature="bootstrap.attachmentsFeature.value"
    :messages="bootstrap.messages.value"
    :shell="bootstrap.shell.value"
  >
    <slot />
  </RootBootstrapProvider>
</template>
