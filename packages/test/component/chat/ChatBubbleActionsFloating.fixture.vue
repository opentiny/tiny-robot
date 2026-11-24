<script setup lang="ts">
import { computed, onMounted, provide, shallowRef } from 'vue'
import ChatBubbleActions from '../../../chat/src/ui/messages/ChatBubbleActions.vue'
import { CHAT_RENDER_ENVIRONMENT } from '../../../chat/src/composables/useChatRenderContext'
import type { ChatBubbleActionContext } from '../../../chat/src/types'

const scrollHost = shallowRef<HTMLElement | null>(null)
const message = {
  id: 'usage-message',
  role: 'assistant',
  content: 'Assistant answer',
  metadata: { usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 } },
}
const context: ChatBubbleActionContext = {
  message,
  messages: [message],
  messageKey: 'usage-message',
  isLatest: true,
  turnState: 'completed',
  capabilities: { canEdit: false, canRegenerate: false },
}
provide(CHAT_RENDER_ENVIRONMENT, {
  scrollRoot: computed(() => scrollHost.value),
  conversationId: computed(() => null),
  pauseAutoScroll: () => {},
})
onMounted(() => {
  if (scrollHost.value) scrollHost.value.scrollTop = scrollHost.value.scrollHeight
})
</script>

<template>
  <div class="usage-floating-fixture" data-tr-color-mode="dark">
    <div ref="scrollHost" class="usage-scroll-host" data-testid="usage-scroll-host">
      <div class="usage-scroll-content">
        <ChatBubbleActions :context="context" :options="{ assistant: ['info'] }" role="assistant" />
      </div>
    </div>
    <button type="button" class="usage-composer">面板外部</button>
  </div>
</template>

<style scoped>
.usage-floating-fixture {
  width: 320px;
  max-width: 100%;
  padding-top: 40px;
}
.usage-scroll-host {
  height: 260px;
  overflow: auto;
  background: var(--tr-container-bg-default);
}
.usage-scroll-content {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  height: 700px;
  padding: 0 12px 8px;
}
.usage-composer {
  width: 100%;
  height: 80px;
}
</style>
