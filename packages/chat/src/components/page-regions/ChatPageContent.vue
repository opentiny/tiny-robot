<script setup lang="ts">
import type { PropType } from 'vue'
import type { ChatListVariant, ModelOption, ChatWorkspaceShellConfig, ChatAppearanceConfig } from '@/types'
import type {
  ChatPageHeaderInput,
  ChatPageMessageListInput,
  ChatPageModelSelectorInput,
  ChatPageWelcomeInput,
  ChatPageLayoutInput,
} from '@/shared/context'
import ChatDefaultBodyRegion from './ChatDefaultBodyRegion.vue'
import ChatDefaultFooterRegion from './ChatDefaultFooterRegion.vue'
import ChatDefaultHeaderRegion from './ChatDefaultHeaderRegion.vue'
import ChatLayout from '../ChatLayout.vue'

defineOptions({ name: 'TrChatPageContent', inheritAttrs: false })

defineProps({
  headerInput: Object as PropType<ChatPageHeaderInput | undefined>,
  layoutInput: Object as PropType<ChatPageLayoutInput | undefined>,
  welcomeInput: Object as PropType<ChatPageWelcomeInput | undefined>,
  messageListInput: Object as PropType<ChatPageMessageListInput | undefined>,
  modelSelectorInput: Object as PropType<ChatPageModelSelectorInput | undefined>,
  shellInput: Object as PropType<ChatWorkspaceShellConfig | undefined>,
  appearanceInput: Object as PropType<ChatAppearanceConfig | undefined>,
  showWelcome: { type: Boolean, required: true },
  showFooterTools: { type: Boolean, required: true },
  showModelSelector: { type: Boolean, required: true },
  showMcpTrigger: { type: Boolean, required: true },
  resolvedVariant: { type: String as PropType<ChatListVariant>, required: true },
  bubbleSlotNames: { type: Array as PropType<string[]>, default: () => [] },
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'change-model': [model: ModelOption]
}>()
</script>

<template>
  <ChatLayout
    :show="layoutInput?.show"
    :role-configs="layoutInput?.roleConfigs"
    :appearance="appearanceInput"
    :content-layout="layoutInput?.contentLayout"
    :bubble-renderers="layoutInput?.bubbleRenderers"
  >
    <ChatDefaultHeaderRegion :header-input="headerInput" :shell="shellInput" @close="emit('update:show', false)">
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>
      <template v-if="$slots['header-extra']" #header-extra>
        <slot name="header-extra" />
      </template>
    </ChatDefaultHeaderRegion>

    <ChatDefaultBodyRegion
      :show-welcome="showWelcome"
      :welcome-input="welcomeInput"
      :message-list-input="messageListInput"
      :variant="resolvedVariant"
      :bubble-slot-names="bubbleSlotNames"
    >
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
    </ChatDefaultBodyRegion>

    <ChatDefaultFooterRegion
      :show-footer-tools="showFooterTools"
      :show-model-selector="showModelSelector"
      :show-mcp-trigger="showMcpTrigger"
      :model-selector-input="modelSelectorInput"
      @change-model="(model) => emit('change-model', model)"
    >
      <template v-if="$slots.sender" #sender="slotProps">
        <slot name="sender" v-bind="slotProps ?? {}" />
      </template>
      <template v-if="$slots['footer-extra']" #footer-extra>
        <slot name="footer-extra" />
      </template>
    </ChatDefaultFooterRegion>

    <slot name="after-footer" />
  </ChatLayout>
</template>
