<script setup lang="ts">
import { computed } from 'vue'
import { CHAT_UI_KEY, useChatPageInputs, useRequiredInject } from '@/shared/context'
import type { TrChatHistoryProps } from '@/types'
import ChatHistoryContent from './ChatHistoryContent.vue'
import ConditionalThemeProvider from '@/components/shared/ConditionalThemeProvider.vue'

defineOptions({ name: 'TrChatHistory' })

const props = defineProps<TrChatHistoryProps>()

const pageInputs = useChatPageInputs()
const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const historyInput = computed(() => pageInputs?.value.history)
const appearanceInput = computed(() => pageInputs?.value.appearance)
const resolvedEnabled = computed(() => props.enabled ?? historyInput.value?.enabled ?? true)
const shouldRenderDrawer = computed(
  () => resolvedEnabled.value && chatUi.history.display.value === 'drawer' && !chatUi.workspace.enabled.value,
)
const appearance = computed(() => props.appearance ?? appearanceInput.value)
</script>

<template>
  <template v-if="shouldRenderDrawer">
    <div
      class="tr-chat-drawer-overlay"
      :class="{ 'is-open': chatUi.history.visible.value }"
      @click="chatUi.history.close()"
    />

    <ConditionalThemeProvider :appearance="appearance" scope-id-prefix="tr-chat-history-drawer-theme">
      <template #default="{ themeScopeId }">
        <div :id="themeScopeId" class="tr-chat-drawer" :class="{ 'is-open': chatUi.history.visible.value }">
          <ChatHistoryContent />
        </div>
      </template>
    </ConditionalThemeProvider>
  </template>
</template>
