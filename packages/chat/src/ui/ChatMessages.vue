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
  type BubbleProviderProps,
  type PromptProps,
  type WelcomeProps,
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import type {
  ChatBubbleEventPayload,
  ChatBubbleListUi,
  ChatBubbleStateChangePayload,
  ChatMessageItem,
  ChatPromptsUi,
} from '../types'

const props = defineProps<{
  messages: readonly ChatMessageItem[]
  scrollTarget: HTMLElement | null
  bubbleProvider?: Omit<BubbleProviderProps, 'store'>
  bubbleList?: ChatBubbleListUi
  welcome?: WelcomeProps
  prompts?: ChatPromptsUi
}>()

const emit = defineEmits<{
  promptClick: [event: MouseEvent, item: PromptProps]
  bubbleStateChange: [payload: ChatBubbleStateChangePayload]
  bubbleEvent: [payload: ChatBubbleEventPayload]
}>()

const fallbackAiAvatar = h(IconAi, { style: { fontSize: '28px' } }) as never
const fallbackUserAvatar = h(IconUser, { style: { fontSize: '28px' } }) as never
const fallbackWelcomeIcon = h(IconAi, { style: { fontSize: '40px' } }) as never

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
const shouldAutoScroll = computed(() => props.bubbleList?.autoScroll ?? true)
const bubbleProviderProps = computed(() => ({
  fallbackContentRenderer: BubbleRenderers.Markdown,
  ...props.bubbleProvider,
}))
type BubbleListViewProps = Omit<ChatBubbleListUi, 'onStateChange' | 'onBubbleEvent'>
const bubbleListProps = computed<BubbleListViewProps>(() => {
  const bubbleList = props.bubbleList

  if (!bubbleList) {
    return {
      autoScroll: false,
      roleConfigs: defaultRoleConfigs,
    }
  }

  const { onStateChange: _onStateChange, onBubbleEvent: _onBubbleEvent, ...nextBubbleListProps } = bubbleList

  return {
    roleConfigs: defaultRoleConfigs,
    ...nextBubbleListProps,
    autoScroll: false,
  }
})
const welcomeProps = computed(() => ({
  title: 'TinyRobot AI 助手',
  description: '您好，我是TinyRobot，您专属的 AI 智能专家',
  icon: fallbackWelcomeIcon,
  ...props.welcome,
}))
const promptProps = computed(() => {
  const { onItemClick: _onItemClick, ...nextPromptProps } = props.prompts ?? {}

  return {
    ...nextPromptProps,
    items: props.prompts?.items ?? [],
  }
})
const hasPrompts = computed(() => promptProps.value.items.length > 0)

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
    <slot :messages="messages" :is-empty="isEmpty">
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
          <template v-if="$slots.prefix" #prefix="slotProps">
            <slot name="prefix" v-bind="slotProps" />
          </template>
          <template v-if="$slots.suffix" #suffix="slotProps">
            <slot name="suffix" v-bind="slotProps" />
          </template>
          <template v-if="$slots.after" #after="slotProps">
            <slot name="after" v-bind="slotProps" />
          </template>
          <template v-if="$slots['content-footer']" #content-footer="slotProps">
            <slot name="content-footer" v-bind="slotProps" />
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
