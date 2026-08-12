<script setup lang="ts">
import { computed, h, nextTick, watch } from 'vue'
import {
  BubbleRenderers,
  TrBubbleList,
  TrBubbleProvider,
  TrPrompts,
  TrWelcome,
  useAutoScroll,
  type BubbleMessage,
  type BubbleRoleConfig,
  type PromptProps,
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import type { ChatBubbleEventPayload, ChatBubbleStateChangePayload, ChatLabels, ChatMessageItem } from '../types'
import type {
  ResolvedChatBubbleOptions,
  ResolvedChatPromptsOptions,
  ResolvedChatWelcomeOptions,
} from './resolveOptions'

const props = defineProps<{
  messages: readonly ChatMessageItem[]
  scrollTarget: HTMLElement | null
  options: ResolvedChatBubbleOptions
  welcome: false | ResolvedChatWelcomeOptions
  prompts: false | ResolvedChatPromptsOptions
  labels: ChatLabels
}>()

const emit = defineEmits<{
  promptClick: [event: MouseEvent, item: PromptProps]
  bubbleStateChange: [payload: ChatBubbleStateChangePayload]
  bubbleEvent: [payload: ChatBubbleEventPayload]
}>()

const fallbackAiAvatar = h(IconAi, { style: { fontSize: '28px' } }) as never
const fallbackUserAvatar = h(IconUser, { style: { fontSize: '28px' } }) as never

const defaultRoleConfigs: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: fallbackAiAvatar,
  },
  user: {
    placement: 'end',
    avatar: fallbackUserAvatar,
  },
  system: {
    hidden: true,
  },
}

const isEmpty = computed(() => props.messages.length === 0)
const lastVisibleMessage = computed(() => props.messages.at(-1))
const bubbleMessages = computed<BubbleMessage[]>(() => props.messages.map((message) => ({ ...message })))
const shouldAutoScroll = computed(() => props.options.autoScroll ?? true)
const bubbleProviderProps = computed(() => ({
  fallbackContentRenderer: BubbleRenderers.Markdown,
  ...props.options.bubbleProvider,
}))
type BubbleListViewProps = ResolvedChatBubbleOptions['bubbleList'] & {
  autoScroll: false
}
const bubbleListProps = computed<BubbleListViewProps>(() => {
  const bubbleList = props.options.bubbleList
  const roleConfigs = {
    ...defaultRoleConfigs,
    ...Object.fromEntries(
      Object.entries(bubbleList.roleConfigs ?? {}).map(([role, config]) => [
        role,
        {
          ...defaultRoleConfigs[role],
          ...config,
        },
      ]),
    ),
  }

  return {
    ...bubbleList,
    roleConfigs,
    autoScroll: false,
  }
})
const welcomeProps = computed<ResolvedChatWelcomeOptions | null>(() => (props.welcome === false ? null : props.welcome))
const promptProps = computed<ResolvedChatPromptsOptions>(() => {
  if (props.prompts === false) {
    return {
      items: [],
    }
  }

  return {
    ...props.prompts,
    items: [...(props.prompts.items ?? [])],
  }
})
const hasPrompts = computed(() => props.prompts !== false && promptProps.value.items.length > 0)

const { scrollToBottom } = useAutoScroll(
  () => props.scrollTarget,
  () =>
    shouldAutoScroll.value
      ? [props.messages.length, lastVisibleMessage.value?.content, lastVisibleMessage.value?.reasoning_content]
      : null,
)

watch(
  () => lastVisibleMessage.value?.role,
  async (role) => {
    if (shouldAutoScroll.value && role === 'user') {
      await nextTick()
      scrollToBottom('smooth')
    }
  },
)

function handlePromptClick(event: MouseEvent, item: PromptProps) {
  if (item.disabled) {
    return
  }

  emit('promptClick', event, item)
}

function handleStateChange(payload: ChatBubbleStateChangePayload) {
  emit('bubbleStateChange', payload)
}

function handleBubbleEvent(payload: ChatBubbleEventPayload) {
  emit('bubbleEvent', payload)
}
</script>

<template>
  <div class="chat-panel-content chat-panel-content--main">
    <slot>
      <template v-if="isEmpty">
        <TrWelcome v-if="welcomeProps" v-bind="welcomeProps">
          <template v-if="$slots['welcome-footer']" #footer>
            <slot name="welcome-footer" />
          </template>
        </TrWelcome>
        <TrPrompts v-if="hasPrompts" v-bind="promptProps" @item-click="handlePromptClick">
          <template v-if="$slots['prompts-footer']" #footer>
            <slot name="prompts-footer" />
          </template>
        </TrPrompts>
      </template>

      <TrBubbleProvider v-else v-bind="bubbleProviderProps">
        <TrBubbleList
          v-bind="bubbleListProps"
          class="tr-chat-messages__bubble-list"
          :messages="bubbleMessages"
          @state-change="handleStateChange"
          @bubble-event="handleBubbleEvent"
        >
          <template v-if="$slots['bubble-prefix']" #prefix>
            <slot name="bubble-prefix" />
          </template>
          <template v-if="$slots['bubble-suffix']" #suffix>
            <slot name="bubble-suffix" />
          </template>
          <template v-if="$slots['bubble-after']" #after>
            <slot name="bubble-after" />
          </template>
          <template v-if="$slots['bubble-content-footer']" #content-footer>
            <slot name="bubble-content-footer" />
          </template>
        </TrBubbleList>
      </TrBubbleProvider>
    </slot>
  </div>
</template>

<style scoped>
.chat-panel-content--main {
  min-height: 100%;
}

.tr-chat-messages__bubble-list {
  overflow: visible;
  padding: 8px;
}

:deep(.tr-prompts__list-container) {
  justify-content: center;
}

:deep([data-box-type='box'][data-role='user']) {
  --tr-bubble-box-bg: var(--tr-color-primary-light);
}

:deep([data-box-type='box']:not([data-role='user'])) {
  --tr-bubble-box-bg: transparent;
}

:deep([data-type='markdown'] p) {
  margin: 0;
}
</style>
