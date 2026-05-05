<script setup lang="ts">
import { computed, inject, type PropType } from 'vue'
import { TrIconButton } from '@opentiny/tiny-robot'
import { IconClose, IconHistory, IconMenuOpen, IconMenu2, IconNewSession } from '@opentiny/tiny-robot-svgs'
import { CHAT_ATTACHMENTS_KEY, CHAT_KIT_KEY, CHAT_UI_KEY, useChatPageInputs, useRequiredInject } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'
import type { TrChatHeaderEmits, TrChatHeaderSlots, ChatWorkspaceShellConfig } from '@/types'
import { triStateBooleanProp } from '@/shared/utils'

defineOptions({ name: 'TrChatHeader' })

const props = defineProps({
  showHistory: triStateBooleanProp,
  showNewChat: triStateBooleanProp,
  showClose: triStateBooleanProp,
  title: String,
  shell: Object as PropType<ChatWorkspaceShellConfig | undefined>,
})
const pageInputs = useChatPageInputs()
const headerInput = computed(() => pageInputs?.value.header)
const shellConfig = computed(() => props.shell ?? pageInputs?.value.shell)

const emit = defineEmits<TrChatHeaderEmits>()
defineSlots<TrChatHeaderSlots>()

const chatKit = useRequiredInject(CHAT_KIT_KEY, 'chat kit')
const attachmentsContext = inject(CHAT_ATTACHMENTS_KEY, null)
const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const chatMessages = useResolvedChatMessages()
const brandTitle = computed(() => props.title ?? headerInput.value?.title ?? '')
const hasActiveConversation = computed(() => Boolean(chatKit.activeConversationId.value))
const activeConversationTitle = computed(() => {
  const title = chatKit.activeConversation.value?.title?.trim()
  return title || chatMessages.value.history.defaultConversationTitle
})
const resolvedTitle = computed(() => (hasActiveConversation.value ? activeConversationTitle.value : brandTitle.value))
const resolvedShowHistory = computed(() => props.showHistory ?? headerInput.value?.showHistory ?? false)
const resolvedShowNewChat = computed(() => props.showNewChat ?? true)
const resolvedShowClose = computed(() => props.showClose ?? headerInput.value?.showClose ?? false)
const showWorkspaceMobileHistory = computed(
  () => resolvedShowHistory.value && chatUi.workspace.enabled.value && chatUi.workspace.isMobile.value,
)
const showLegacyHistoryButton = computed(
  () => resolvedShowHistory.value && (!chatUi.workspace.enabled.value || chatUi.workspace.isMobile.value),
)
const showRightPanelToggle = computed(
  () => chatUi.workspace.enabled.value && shellConfig.value?.rightRegion?.enabled !== false,
)

function handleNewChat() {
  attachmentsContext?.manager.clear()
  chatKit.createConversation()
}

const historyBtnLabel = computed(() =>
  chatUi.history.visible.value ? chatMessages.value.header.closeHistory : chatMessages.value.header.openHistory,
)
</script>

<template>
  <div class="tr-chat__header">
    <div class="tr-chat__header-inner">
      <div class="tr-chat__header-left">
        <TrIconButton
          v-if="showWorkspaceMobileHistory"
          :icon="IconMenuOpen"
          size="28"
          svg-size="20"
          :title="historyBtnLabel"
          :aria-label="historyBtnLabel"
          @click="chatUi.history.toggle()"
        />
      </div>

      <div class="tr-chat__header-title">
        <slot name="title">
          <h3 v-if="resolvedTitle" class="tr-chat__header-brand">{{ resolvedTitle }}</h3>
        </slot>
      </div>

      <div class="tr-chat__header-right">
        <slot name="extra" />
        <TrIconButton
          v-if="resolvedShowNewChat"
          :icon="IconNewSession"
          size="28"
          svg-size="20"
          :title="chatMessages.header.newChat"
          :aria-label="chatMessages.header.newChat"
          @click="handleNewChat"
        />
        <TrIconButton
          v-if="showLegacyHistoryButton && !showWorkspaceMobileHistory"
          :icon="IconHistory"
          size="28"
          svg-size="20"
          :title="historyBtnLabel"
          :aria-label="historyBtnLabel"
          @click="chatUi.history.toggle()"
        />
        <TrIconButton
          v-if="showRightPanelToggle"
          :icon="IconMenu2"
          size="28"
          svg-size="20"
          :title="chatMessages.workspace.toggleRightPanel"
          :aria-label="chatMessages.workspace.toggleRightPanel"
          @click="chatUi.workspace.right.toggle()"
        />
        <TrIconButton
          v-if="resolvedShowClose"
          :title="chatMessages.header.close"
          :aria-label="chatMessages.header.close"
          :icon="IconClose"
          size="28"
          svg-size="20"
          @click="emit('close')"
        />
      </div>
    </div>
  </div>
</template>
