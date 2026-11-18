<script setup lang="ts">
import { computed, onUnmounted, shallowRef, watch } from 'vue'
import { IconCheck, IconCopy, IconEditPen, IconInfo, IconRefresh } from '@opentiny/tiny-robot-svgs'
import { resolveChatTokenUsage } from '../../runtime/usage'
import { resolveChatMessageTimestamp, useChatTimestampDate } from './messageTimestamp'
import ChatMessageInfoPopover from './ChatMessageInfoPopover.vue'
import type {
  ChatActionCondition,
  ChatBubbleActionContext,
  ChatBubbleActionsOptions,
  ChatBubbleActionItem,
  ChatBubbleActionId,
  ChatIcon,
  ChatMessageInfoItem,
  ChatMessageItem,
} from '../../types'

const props = defineProps<{
  context: ChatBubbleActionContext
  options: ChatBubbleActionsOptions
  role: string
  editing?: boolean
  streamState?: ChatMessageItem['streamState']
}>()
const emit = defineEmits<{
  editStart: [context: ChatBubbleActionContext]
  regenerate: []
  error: [payload: { actionId: string; messageId?: string; error: unknown }]
}>()
const slots = defineSlots<{
  action?: (scope: {
    item: Extract<ChatBubbleActionItem, { type: 'slot' }>
    context: ChatBubbleActionContext
    disabled: boolean
    setOpen: (open: boolean) => void
  }) => unknown
}>()

const infoOpen = shallowRef(false)
const infoTrigger = shallowRef<HTMLButtonElement | null>(null)
const busyIds = shallowRef(new Set<string>())
const slotOpenIds = shallowRef(new Set<string>())
const copied = shallowRef(false)
let copyFeedbackTimer: ReturnType<typeof setTimeout> | undefined
const defaultItems: readonly ChatBubbleActionItem[] = props.role === 'user' ? ['edit', 'copy'] : ['regenerate', 'copy']
const defaultIcons: Partial<Record<ChatBubbleActionId, ChatIcon>> = {
  copy: IconCopy,
  edit: IconEditPen,
  regenerate: IconRefresh,
  info: IconInfo,
}
const displayMode = computed(() =>
  typeof props.options.display === 'function'
    ? props.options.display(props.context)
    : (props.options.display ?? 'hover'),
)
const items = computed<readonly ChatBubbleActionItem[]>(() => {
  const configured = props.options[props.role as 'user' | 'assistant']
  const resolved = typeof configured === 'function' ? configured(defaultItems, props.context) : configured
  return resolved === false ? [] : (resolved ?? defaultItems)
})
const timestampDate = useChatTimestampDate()
const timestamp = computed(() => {
  if (!items.value.some((item) => actionId(item) === 'timestamp')) return
  return resolveChatMessageTimestamp(
    { ...props.context.message, streamState: props.streamState ?? props.context.message.streamState },
    props.options.timestamp?.format,
    timestampDate.value,
  )
})

function actionId(item: ChatBubbleActionItem): string {
  return typeof item === 'string' ? item : item.id
}

function actionLabel(item: ChatBubbleActionItem) {
  if (typeof item === 'object' && 'label' in item && item.label) return item.label
  const id = actionId(item)
  if (id === 'regenerate') {
    return props.context.turnState === 'error' || props.context.turnState === 'aborted' ? '重试' : '重新生成'
  }
  return (
    { copy: '复制', edit: '编辑', regenerate: '重新生成', info: '对话信息', timestamp: '完成时间' }[
      id as ChatBubbleActionId
    ] ?? id
  )
}

function actionIcon(item: ChatBubbleActionItem): ChatIcon | undefined {
  if (actionId(item) === 'copy' && copied.value) return IconCheck
  const configured = typeof item === 'object' && item.type !== 'slot' ? item.icon : undefined
  return configured ?? defaultIcons[actionId(item) as ChatBubbleActionId]
}

function actionTitle(item: ChatBubbleActionItem) {
  return actionId(item) === 'copy' && copied.value ? '复制成功' : actionLabel(item)
}

function messageText(message: ChatBubbleActionContext['message']) {
  const content = message.content
  if (typeof content === 'string') return content
  return Array.isArray(content)
    ? content
        .filter((part) => part.type === 'text' && typeof part.text === 'string')
        .map((part) => part.text as string)
        .join('\n')
    : ''
}

function defaultInfoItems(): readonly ChatMessageInfoItem[] {
  const metadata = props.context.message.metadata
  const usage = resolveChatTokenUsage(metadata?.usage)
  const choices = metadata?.choices
  const choice = Array.isArray(choices) ? (choices.find((item) => item?.index === 0) ?? choices[0]) : undefined
  const createdAt = typeof metadata?.createdAt === 'number' ? new Date(metadata.createdAt * 1000) : undefined
  return [
    { id: 'model', label: '模型', value: typeof metadata?.model === 'string' ? metadata.model : undefined },
    {
      id: 'finishReason',
      label: '结束原因',
      value: typeof choice?.finish_reason === 'string' ? choice.finish_reason : undefined,
    },
    {
      id: 'createdAt',
      label: '时间',
      value: createdAt && Number.isFinite(createdAt.getTime()) ? createdAt.toLocaleString() : undefined,
    },
    { id: 'promptTokens', label: '输入 Token', value: usage?.prompt_tokens?.toLocaleString() },
    { id: 'completionTokens', label: '输出 Token', value: usage?.completion_tokens?.toLocaleString() },
    { id: 'totalTokens', label: '总 Token', value: usage?.total_tokens?.toLocaleString(), highlight: true },
  ]
}

const infoItems = computed<readonly ChatMessageInfoItem[]>(() => {
  if (!items.value.some((item) => actionId(item) === 'info')) return []
  try {
    const resolved = props.options.info?.items ? props.options.info.items(props.context) : defaultInfoItems()
    return resolved.filter(
      (item) => typeof item.value === 'string' || (typeof item.value === 'number' && Number.isFinite(item.value)),
    )
  } catch {
    return []
  }
})

watch([() => props.editing, () => infoItems.value.length], ([editing, count]) => {
  if (editing || !count) infoOpen.value = false
})

watch(
  () => props.context.messageKey,
  () => {
    infoOpen.value = false
    slotOpenIds.value = new Set()
    copied.value = false
    if (copyFeedbackTimer) clearTimeout(copyFeedbackTimer)
  },
)

onUnmounted(() => {
  if (copyFeedbackTimer) clearTimeout(copyFeedbackTimer)
})

function condition(value: ChatActionCondition | undefined) {
  return typeof value === 'function' ? value(props.context) : value !== false
}

function visible(item: ChatBubbleActionItem) {
  const id = actionId(item)
  if (id === 'edit' && !props.context.capabilities.canEdit) return false
  if (id === 'regenerate' && !props.context.capabilities.canRegenerate) return false
  if (id === 'info' && !infoItems.value.length) return false
  if (id === 'timestamp' && !timestamp.value) return false
  return typeof item === 'string' || condition(item.visible)
}

function textToCopy() {
  const override = props.options.copy?.getText?.(props.context)
  if (override !== undefined) return override
  return props.context.messages
    .filter((message) => ['user', 'assistant'].includes(message.role ?? '') && message.content)
    .map(messageText)
    .join('\n')
}

function disabled(item: ChatBubbleActionItem) {
  if (typeof item === 'object' && item.disabled !== undefined && condition(item.disabled)) return true
  return actionId(item) === 'copy' && !textToCopy().trim()
}

async function activate(item: ChatBubbleActionItem, event: MouseEvent) {
  const id = actionId(item)
  if (!visible(item) || disabled(item) || busyIds.value.has(id)) return
  if (id === 'edit') {
    emit('editStart', props.context)
    return
  }
  if (id === 'regenerate') return emit('regenerate')
  if (id === 'info') {
    infoTrigger.value = event.currentTarget as HTMLButtonElement
    infoOpen.value = !infoOpen.value
    return
  }
  if (id === 'copy') {
    try {
      await navigator.clipboard.writeText(textToCopy())
      copied.value = true
      if (copyFeedbackTimer) clearTimeout(copyFeedbackTimer)
      copyFeedbackTimer = setTimeout(() => {
        copied.value = false
        copyFeedbackTimer = undefined
      }, 2000)
    } catch (error) {
      emit('error', { actionId: id, messageId: props.context.messageId, error })
    }
    return
  }
  if (typeof item === 'object' && item.type === 'custom') {
    busyIds.value = new Set(busyIds.value).add(id)
    try {
      await item.onClick(props.context)
    } catch (error) {
      emit('error', { actionId: id, messageId: props.context.messageId, error })
    } finally {
      const next = new Set(busyIds.value)
      next.delete(id)
      busyIds.value = next
    }
  }
}

function setSlotOpen(id: string, open: boolean) {
  const next = new Set(slotOpenIds.value)
  if (open) next.add(id)
  else next.delete(id)
  slotOpenIds.value = next
}
</script>

<template>
  <div
    v-if="items.some(visible) && condition(options.visible)"
    class="tr-chat-bubble-actions"
    :class="{
      'is-latest': context.isLatest,
      'is-processing': role === 'assistant' && context.turnState === 'processing',
      'is-open': infoOpen || slotOpenIds.size > 0,
      'is-editing': editing,
      'is-always': displayMode === 'always',
    }"
  >
    <template v-for="item in items" :key="actionId(item)">
      <time
        v-if="visible(item) && actionId(item) === 'timestamp' && timestamp"
        class="tr-chat-message-timestamp"
        :datetime="timestamp.timestamp"
      >
        {{ timestamp.label }}
      </time>
      <span
        v-else-if="visible(item) && (typeof item === 'string' || item.type !== 'slot')"
        class="tr-chat-bubble-actions__item"
        :data-action="actionId(item)"
        @keydown.esc="infoOpen = false"
      >
        <button
          class="tr-chat-bubble-actions__button"
          type="button"
          :aria-label="actionTitle(item)"
          :title="actionTitle(item)"
          :aria-expanded="actionId(item) === 'info' ? infoOpen : undefined"
          :aria-haspopup="actionId(item) === 'info' ? 'dialog' : undefined"
          :disabled="disabled(item) || busyIds.has(actionId(item))"
          @click="activate(item, $event)"
        >
          <img v-if="typeof actionIcon(item) === 'string'" :src="actionIcon(item) as string" alt="" />
          <component v-else-if="actionIcon(item)" :is="actionIcon(item)" aria-hidden="true" />
          <span v-else>{{ actionLabel(item) }}</span>
        </button>
      </span>
      <template v-else-if="visible(item) && typeof item === 'object' && item.type === 'slot'">
        <component
          :is="slots.action"
          :item="item"
          :context="context"
          :disabled="disabled(item) || busyIds.has(actionId(item))"
          :setOpen="(open: boolean) => setSlotOpen(actionId(item), open)"
        />
      </template>
    </template>
  </div>
  <ChatMessageInfoPopover
    v-if="
      infoOpen &&
      infoItems.length &&
      infoTrigger &&
      !editing &&
      condition(options.visible) &&
      !(role === 'assistant' && context.turnState === 'processing')
    "
    :title="options.info?.title ?? '对话信息'"
    :items="infoItems"
    :trigger="infoTrigger"
    :placement="role === 'user' ? 'bottom-end' : 'bottom-start'"
    @close="infoOpen = false"
  />
</template>

<style scoped>
.tr-chat-bubble-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 32px;
  position: relative;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
.tr-chat-bubble-actions.is-processing {
  visibility: hidden;
}
.tr-chat-bubble-actions.is-latest:not(.is-processing),
.tr-chat-bubble-actions.is-always:not(.is-processing),
.tr-chat-bubble-actions.is-open:not(.is-processing),
.tr-chat-bubble-actions:focus-within:not(.is-processing) {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
.tr-chat-bubble-actions__item {
  position: relative;
  display: inline-flex;
}
.tr-chat-bubble-actions__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--tr-text-secondary);
  cursor: pointer;
  padding: 0;
  font: inherit;
}
.tr-chat-bubble-actions__button:hover:not(:disabled) {
  background: var(--tr-container-bg-hover);
}
.tr-chat-bubble-actions__button:focus-visible {
  outline: 2px solid var(--tr-border-color-hover);
  outline-offset: 1px;
}
.tr-chat-bubble-actions__button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.tr-chat-bubble-actions__button img,
.tr-chat-bubble-actions__button :deep(svg) {
  width: 16px;
  height: 16px;
}
.tr-chat-message-timestamp {
  display: inline-block;
  margin-left: 4px;
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 20px;
  vertical-align: middle;
}
.tr-chat-bubble-actions.is-editing {
  display: none;
}
</style>
