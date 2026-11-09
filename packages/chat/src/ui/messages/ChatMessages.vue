<script setup lang="ts">
import { computed, getCurrentInstance, h, mergeProps, nextTick, provide, ref, watch } from 'vue'
import {
  BubbleRenderers,
  TrBubbleList,
  TrBubbleProvider,
  TrPrompts,
  TrWelcome,
  useAutoScroll,
  getBubbleMessageGroups,
  type BubbleBoxAttributesResolver,
  type BubbleContentAttributesResolver,
  type BubbleMessage,
  type BubbleMessageGroup,
  type BubbleRoleConfig,
  type PromptProps,
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { CHAT_RENDER_ENVIRONMENT } from '../../composables/useChatRenderContext'
import {
  createMessageIdentity,
  getAdditionalAnchorIndexes,
  getMessageAnchorText,
  resolveStreamState,
} from './messageIdentity'
import { useChatStreamState } from './useChatStreamState'
import type { ChatRequestView } from '../../types'
import type { ChatBubbleEventPayload, ChatBubbleStateChangePayload, ChatLabels, ChatMessageItem } from '../../types'
import type {
  ResolvedChatBubbleOptions,
  ResolvedChatPromptsOptions,
  ResolvedChatWelcomeOptions,
} from '../resolveOptions'

const props = defineProps<{
  messages: readonly ChatMessageItem[]
  scrollTarget: HTMLElement | null
  options: ResolvedChatBubbleOptions
  welcome: false | ResolvedChatWelcomeOptions
  prompts: false | ResolvedChatPromptsOptions
  labels: ChatLabels
  isEmpty: boolean
  centerEmptyState: boolean
  centerWelcomeComposer: boolean
  conversationId?: string | null
  request?: ChatRequestView
  anchorEnabled?: boolean
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

const lastMessage = computed(() => props.messages.at(-1))
const contentRef = ref<HTMLElement | null>(null)
const messageIdentity = createMessageIdentity(`chat-${getCurrentInstance()!.uid}`)
const getMessageStreamState = useChatStreamState(
  () => props.messages,
  () => props.request,
  () => props.conversationId,
  messageIdentity,
)
const bubbleMessages = computed<ChatMessageItem[]>(() =>
  props.messages.map((message) => ({
    ...message,
    renderKey: messageIdentity(message, props.conversationId),
    streamState: resolveStreamState(message, props.request, getMessageStreamState(message)),
  })),
)
const messageIndexes = computed(() =>
  props.anchorEnabled ? new Map(bubbleMessages.value.map((message, index) => [message, index])) : undefined,
)
const additionalAnchorIndexes = computed(() => {
  if (!props.anchorEnabled) return new Set<number>()
  const groups: BubbleMessageGroup[] = getBubbleMessageGroups(
    bubbleMessages.value,
    props.options.bubbleList.groupStrategy,
    props.options.bubbleList.dividerRole,
    bubbleListProps.value.roleConfigs,
  )
  return getAdditionalAnchorIndexes(groups, bubbleMessages.value)
})
provide(CHAT_RENDER_ENVIRONMENT, {
  scrollRoot: computed(() => props.scrollTarget),
  conversationId: computed(() => props.conversationId),
})
const anchorItems = computed(() =>
  !props.anchorEnabled
    ? []
    : bubbleMessages.value
        .filter((message) => message.role === 'user' && !bubbleListProps.value.roleConfigs?.user?.hidden)
        .map((message) => {
          const content = (props.options.bubbleList.contentResolver ?? ((item: BubbleMessage) => item.content))(message)
          const part = Array.isArray(content) ? content[0] : { type: 'text', text: content || '' }
          const attributes = resolveBoxAttributes([message], part, 0)
          return {
            id: String(attributes?.['data-anchor-id'] ?? message.renderKey),
            label: getMessageAnchorText(message),
          }
        })
        .filter((item) => item.label.length > 0),
)
const shouldAutoScroll = computed(() => props.options.autoScroll ?? true)

const resolveBoxAttributes: BubbleBoxAttributesResolver = (messages, content, contentIndex) => {
  const attributes = props.options.bubbleProvider?.boxAttributes
  return typeof attributes === 'function' ? attributes(messages, content, contentIndex) : attributes
}
const boxAttributes: BubbleBoxAttributesResolver = (messages, content, contentIndex) => {
  const attributes = resolveBoxAttributes(messages, content, contentIndex)
  const message = messages[0] as ChatMessageItem | undefined
  if (!props.anchorEnabled || message?.role !== 'user' || (contentIndex ?? 0) !== 0) return attributes
  return mergeProps(attributes ?? {}, {
    class: 'tr-chat-anchor-target',
    'data-anchor-id': attributes?.['data-anchor-id'] ?? message.renderKey,
  })
}
const contentAttributes: BubbleContentAttributesResolver = (message, content, contentIndex) => {
  const configured = props.options.bubbleProvider?.contentAttributes
  const attributes = typeof configured === 'function' ? configured(message, content, contentIndex) : configured
  const item = message as ChatMessageItem
  const messageIndex = messageIndexes.value?.get(item) ?? -1
  const isAdditionalAnchorTarget = additionalAnchorIndexes.value.has(messageIndex) && (contentIndex ?? 0) === 0
  const boxAttributes = isAdditionalAnchorTarget ? resolveBoxAttributes([item], content, 0) : undefined
  return mergeProps(attributes ?? {}, {
    ...(isAdditionalAnchorTarget
      ? {
          class: 'tr-chat-anchor-target',
          'data-anchor-id': boxAttributes?.['data-anchor-id'] ?? item.renderKey,
        }
      : {}),
    key: (attributes?.key as string | number | symbol | undefined) ?? JSON.stringify([item.renderKey, contentIndex]),
  })
}
const bubbleProviderProps = computed(() => ({
  fallbackContentRenderer: BubbleRenderers.Markdown,
  errorRenderer: BubbleRenderers.Error,
  ...props.options.bubbleProvider,
  boxAttributes,
  contentAttributes,
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

const { scrollToBottom, pause } = useAutoScroll({
  scrollRef: () => props.scrollTarget,
  contentRef: () => contentRef.value,
  bottomThreshold: 50,
  enabled: () => shouldAutoScroll.value,
})
defineExpose({ scrollToBottom, pauseAutoScroll: pause, anchorItems })

watch(
  () => props.conversationId,
  () => {
    pause()
    if (shouldAutoScroll.value) scrollToBottom()
  },
)

watch(
  () => lastMessage.value?.role,
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
  <div
    ref="contentRef"
    class="chat-panel-content chat-panel-content--main"
    :class="{
      'is-message-state': !isEmpty,
    }"
  >
    <slot>
      <template v-if="props.isEmpty">
        <div
          class="chat-empty-content"
          :class="{
            'chat-empty-content--centered':
              !$slots['empty-state'] && (props.centerEmptyState || props.centerWelcomeComposer),
          }"
        >
          <slot v-if="$slots['empty-state']" name="empty-state" />
          <template v-else-if="$slots['welcome-composer']">
            <div class="chat-welcome-content">
              <TrWelcome v-if="welcomeProps" v-bind="welcomeProps">
                <template #footer>
                  <slot name="welcome-footer" />
                  <slot name="welcome-composer" />
                </template>
              </TrWelcome>
              <TrPrompts v-if="hasPrompts" v-bind="promptProps" @item-click="handlePromptClick">
                <template v-if="$slots['prompts-footer']" #footer>
                  <slot name="prompts-footer" />
                </template>
              </TrPrompts>
            </div>
          </template>
          <template v-else>
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
        </div>
      </template>

      <TrBubbleProvider v-else v-bind="bubbleProviderProps">
        <TrBubbleList
          v-bind="bubbleListProps"
          class="tr-chat-messages__bubble-list"
          :messages="bubbleMessages"
          @state-change="handleStateChange"
          @bubble-event="handleBubbleEvent"
        >
          <template v-if="$slots['bubble-prefix']" #prefix="slotProps">
            <slot name="bubble-prefix" v-bind="slotProps" />
          </template>
          <template v-if="$slots['bubble-suffix']" #suffix="slotProps">
            <slot name="bubble-suffix" v-bind="slotProps" />
          </template>
          <template v-if="$slots['bubble-after']" #after="slotProps">
            <slot name="bubble-after" v-bind="slotProps" />
          </template>
          <template v-if="$slots['bubble-content-footer']" #content-footer="slotProps">
            <slot name="bubble-content-footer" v-bind="slotProps" />
          </template>
        </TrBubbleList>
      </TrBubbleProvider>
    </slot>
  </div>
</template>

<style scoped>
.chat-panel-content--main {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: auto;
}

.chat-panel-content--main:not(.is-message-state) {
  min-height: 100%;
}

.chat-empty-content {
  display: flex;
  box-sizing: border-box;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.chat-empty-content--centered {
  justify-content: center;
}

.chat-welcome-content {
  display: flex;
  box-sizing: border-box;
  min-height: 0;
  flex-direction: column;
}

.tr-chat-messages__bubble-list {
  min-height: 0;
  overflow: visible;
  padding: var(--tr-chat-ui-message-list-padding, 8px 0);
}

:deep(.tr-chat-anchor-target) {
  --tr-chat-anchor-bg: var(--tr-color-primary-light);
  --tr-chat-anchor-active-bg: #b9d7ff;
  scroll-margin-top: 16px;
}

:deep(.tr-chat-anchor-target-active) {
  animation: tr-chat-anchor-flash 1.8s ease-out !important;
}

:global([data-tr-color-mode='dark'] .tr-chat-anchor-target) {
  --tr-chat-anchor-bg: color-mix(in srgb, #317af7 30%, var(--tr-container-bg-default));
  --tr-chat-anchor-active-bg: color-mix(in srgb, #317af7 40%, var(--tr-container-bg-default));
}

@keyframes tr-chat-anchor-flash {
  0%,
  25% {
    background-color: var(--tr-chat-anchor-active-bg);
  }
  45% {
    background-color: var(--tr-bubble-box-bg);
  }
  65%,
  85% {
    background-color: var(--tr-chat-anchor-active-bg);
  }
  100% {
    background-color: var(--tr-bubble-box-bg);
  }
}

:deep(.tr-prompts__list-container) {
  justify-content: center;
}

:deep([data-box-type='box'][data-role='user']) {
  --tr-bubble-box-bg: var(--tr-chat-anchor-bg, var(--tr-color-primary-light));
}

:deep([data-box-type='box']:not([data-role='user'])) {
  --tr-bubble-box-bg: transparent;
}

:deep([data-type='markdown'] p) {
  margin: 0;
}
</style>
