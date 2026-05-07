<script setup lang="ts">
import { computed, inject, useSlots, type Slot } from 'vue'
import { BUBBLE_LIST_SLOTS, CHAT_KIT_KEY, MCP_MANAGER_KEY, useChatPageInputs } from '@/shared/context'
import { useSlotFilter } from '@/components/useSlotFilter'
import type { ChatListVariant, ModelOption, TrChatPageEmits, TrChatPageProps, TrChatPageSlots } from '@/types'
import ChatPageContent from '@/components/page-regions/ChatPageContent.vue'
import ChatWorkspaceLayout from '@/components/workspace/ChatWorkspaceLayout.vue'
import { ChatHistory } from '@/components/history'

defineOptions({ name: 'TrChatPage', inheritAttrs: false })

const props = defineProps<TrChatPageProps>()
const emit = defineEmits<TrChatPageEmits>()
defineSlots<TrChatPageSlots>()

const slots = useSlots() as Record<string, Slot | undefined>
const bubbleSlots = useSlotFilter(slots, BUBBLE_LIST_SLOTS)
const chatKit = inject(CHAT_KIT_KEY)!
const mcpManager = inject(MCP_MANAGER_KEY, null)
const pageInputs = useChatPageInputs()
const bubbleSlotNames = computed<(typeof BUBBLE_LIST_SLOTS)[number][]>(
  () => Object.keys(bubbleSlots.value) as (typeof BUBBLE_LIST_SLOTS)[number][],
)

const headerInput = computed(() => pageInputs?.value.header)
const layoutInput = computed(() => pageInputs?.value.layout)
const showWelcome = computed(() => chatKit.messages.value.length === 0)
const welcomeInput = computed(() => pageInputs?.value.welcome)
const messageListInput = computed(() => pageInputs?.value.messageList)
const historyInput = computed(() => pageInputs?.value.history)
const appearanceInput = computed(() => pageInputs?.value.appearance)
const modelSelectorInput = computed(() => pageInputs?.value.modelSelector)
const resolvedVariant = computed<ChatListVariant>(() => {
  const variant = props.messageListVariant ?? messageListInput.value?.variant
  if (variant === 'docs' || variant === 'workspace') return variant
  return 'bubble'
})
const showModelSelector = computed(() =>
  Boolean(modelSelectorInput.value?.enabled && (modelSelectorInput.value.models?.length ?? 0) > 1),
)
const shellInput = computed(() => pageInputs?.value.shell)
const isWorkspaceShell = computed(() => shellInput.value?.variant === 'workspace')
const showMcpTrigger = computed(() => Boolean(mcpManager))
const showFooterTools = computed(() => showModelSelector.value || showMcpTrigger.value)

function handleModelChange(model: ModelOption) {
  pageInputs?.value.updateModel?.(model)
  emit('update:model', model.value)
}
</script>

<template>
  <ChatWorkspaceLayout
    v-if="isWorkspaceShell"
    :appearance="appearanceInput"
    :shell="shellInput"
    :sidebar-title="headerInput?.title"
  >
    <template v-if="$slots.left" #left>
      <slot name="left" />
    </template>
    <template v-if="$slots['left-rail']" #left-rail>
      <slot name="left-rail" />
    </template>
    <template v-if="$slots.right" #right>
      <slot name="right" />
    </template>
    <template v-if="$slots['mobile-left']" #mobile-left>
      <slot name="mobile-left" />
    </template>
    <template v-if="$slots['mobile-right']" #mobile-right>
      <slot name="mobile-right" />
    </template>

    <ChatPageContent
      :header-input="headerInput"
      :layout-input="layoutInput"
      :welcome-input="welcomeInput"
      :message-list-input="messageListInput"
      :model-selector-input="modelSelectorInput"
      :shell-input="shellInput"
      :appearance-input="appearanceInput"
      :show-welcome="showWelcome"
      :show-footer-tools="showFooterTools"
      :show-model-selector="showModelSelector"
      :show-mcp-trigger="showMcpTrigger"
      :resolved-variant="resolvedVariant"
      :bubble-slot-names="bubbleSlotNames"
      @update:show="emit('update:show', $event)"
      @change-model="handleModelChange"
    >
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>
      <template v-if="$slots['header-extra']" #header-extra>
        <slot name="header-extra" />
      </template>
      <template v-if="$slots['message-list']" #message-list="slotProps">
        <slot name="message-list" v-bind="slotProps ?? {}" />
      </template>
      <template v-if="$slots.welcome" #welcome>
        <slot name="welcome" />
      </template>
      <template v-if="$slots.empty" #empty>
        <slot name="empty" />
      </template>
      <template v-for="name in bubbleSlotNames" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
      <template v-if="$slots.sender" #sender="slotProps">
        <slot name="sender" v-bind="slotProps ?? {}" />
      </template>
      <template v-if="$slots['footer-extra']" #footer-extra>
        <slot name="footer-extra" />
      </template>
    </ChatPageContent>
  </ChatWorkspaceLayout>

  <ChatPageContent
    v-else
    :header-input="headerInput"
    :layout-input="layoutInput"
    :welcome-input="welcomeInput"
    :message-list-input="messageListInput"
    :model-selector-input="modelSelectorInput"
    :shell-input="shellInput"
    :appearance-input="appearanceInput"
    :show-welcome="showWelcome"
    :show-footer-tools="showFooterTools"
    :show-model-selector="showModelSelector"
    :show-mcp-trigger="showMcpTrigger"
    :resolved-variant="resolvedVariant"
    :bubble-slot-names="bubbleSlotNames"
    @update:show="emit('update:show', $event)"
    @change-model="handleModelChange"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <template v-if="$slots['header-extra']" #header-extra>
      <slot name="header-extra" />
    </template>
    <template v-if="$slots['message-list']" #message-list="slotProps">
      <slot name="message-list" v-bind="slotProps ?? {}" />
    </template>
    <template v-if="$slots.welcome" #welcome>
      <slot name="welcome" />
    </template>
    <template v-if="$slots.empty" #empty>
      <slot name="empty" />
    </template>
    <template v-for="name in bubbleSlotNames" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
    <template v-if="$slots.sender" #sender="slotProps">
      <slot name="sender" v-bind="slotProps ?? {}" />
    </template>
    <template v-if="$slots['footer-extra']" #footer-extra>
      <slot name="footer-extra" />
    </template>
    <template #after-footer>
      <ChatHistory :enabled="historyInput?.enabled" :appearance="appearanceInput" />
    </template>
  </ChatPageContent>
</template>
