<script setup lang="ts">
import { computed, nextTick, provide, ref, watch } from 'vue'
import { useAutoScroll } from '../shared/composables'
import BubbleItem from './BubbleItem.vue'
import { setupBubbleStore, useCopyCleanup } from './composables'
import { BUBBLE_LIST_CONTEXT_KEY } from './constants'
import { getBubbleMessageGroups } from './messageGroups'
import type { BubbleEvent, BubbleListProps, BubbleListSlots, BubbleMessage, BubbleMessageGroup } from './index.type'

const props = withDefaults(defineProps<BubbleListProps>(), {
  groupStrategy: 'divider',
  dividerRole: 'user',
  fallbackRole: 'assistant',
  contentResolver: (message: BubbleMessage) => message.content,
})

defineSlots<BubbleListSlots>()

type BubbleStateChangePayload = {
  key: string
  value: unknown
  messageIndex: number
  contentIndex: number
}

type BubbleEventPayload = BubbleEvent & {
  messageIndex: number
  contentIndex: number
}

const emit = defineEmits<{
  (e: 'state-change', payload: BubbleStateChangePayload): void
  (e: 'bubble-event', payload: BubbleEventPayload): void
}>()

// Provide bubble store if not already provided
setupBubbleStore()

// 提供 bubble list 上下文，标识 Bubble 组件在 BubbleList 下
provide(BUBBLE_LIST_CONTEXT_KEY, true)

const scrollContainerRef = ref<HTMLDivElement | null>(null)
const contentRef = ref<HTMLDivElement | null>(null)
const lastMessage = computed(() => props.messages.at(-1))

const { scrollToBottom } = useAutoScroll({
  scrollRef: scrollContainerRef,
  contentRef,
  enabled: () => props.autoScroll,
})

watch(
  () => lastMessage.value?.role,
  async (role) => {
    if (props.autoScroll && role === 'user') {
      await nextTick()
      scrollToBottom('smooth')
    }
  },
)

// 设置复制事件处理器，清理复制文本中的多余换行
useCopyCleanup(scrollContainerRef)

const messageGroups = computed<BubbleMessageGroup[]>(() => {
  return getBubbleMessageGroups(props.messages, props.groupStrategy, props.dividerRole, props.roleConfigs)
})

const resolveMessageIndex = (group: BubbleMessageGroup, messageIndex: number): number | undefined => {
  const resolvedMessageIndex = group.messageIndexes[messageIndex]

  if (resolvedMessageIndex === undefined) {
    console.warn(
      '[BubbleList] Missing messageIndexes mapping; event was not emitted. Ensure custom groupStrategy returns messageIndexes aligned with messages.',
      {
        messageIndex,
        messageIndexes: group.messageIndexes,
      },
    )
    return undefined
  }

  return resolvedMessageIndex
}

const handleStateChange = (group: BubbleMessageGroup, event: BubbleStateChangePayload): void => {
  const messageIndex = resolveMessageIndex(group, event.messageIndex)

  if (messageIndex === undefined) {
    return
  }

  emit('state-change', { ...event, messageIndex })
}

const handleBubbleEvent = (group: BubbleMessageGroup, event: BubbleEventPayload): void => {
  const messageIndex = resolveMessageIndex(group, event.messageIndex)

  if (messageIndex === undefined) {
    return
  }

  emit('bubble-event', { ...event, messageIndex })
}

defineExpose({
  scrollToBottom,
})
</script>

<template>
  <div class="tr-bubble-list" ref="scrollContainerRef">
    <div class="tr-bubble-list__content" ref="contentRef">
      <BubbleItem
        v-for="(group, index) in messageGroups"
        :key="index"
        :role="group.role || props.fallbackRole"
        :role-config="props.roleConfigs?.[group.role || props.fallbackRole]"
        :message-group="group"
        :content-render-mode="props.contentRenderMode"
        :content-resolver="props.contentResolver"
        @state-change="handleStateChange(group, $event)"
        @bubble-event="handleBubbleEvent(group, $event)"
      >
        <template #prefix="slotProps">
          <slot name="prefix" v-bind="slotProps" :messageIndexes="group.messageIndexes"></slot>
        </template>
        <template #suffix="slotProps">
          <slot name="suffix" v-bind="slotProps" :messageIndexes="group.messageIndexes"></slot>
        </template>
        <template #content-footer="slotProps">
          <slot name="content-footer" v-bind="slotProps" :messageIndexes="group.messageIndexes"></slot>
        </template>
        <template #after="slotProps">
          <slot name="after" v-bind="slotProps" :messageIndexes="group.messageIndexes"></slot>
        </template>
      </BubbleItem>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble-list {
  --gap: var(--tr-bubble-list-gap);
  --padding: var(--tr-bubble-list-padding);
  box-sizing: border-box;
  overflow-y: auto;
  padding: var(--padding);
}

.tr-bubble-list__content {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}
</style>
