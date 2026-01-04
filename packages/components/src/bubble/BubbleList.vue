<script setup lang="ts">
import { computed, nextTick, provide, ref, watch } from 'vue'
import { useAutoScroll } from '../shared/composables'
import BubbleItem from './BubbleItem.vue'
import { resolveMessageContent, setupBubbleStore, useCopyCleanup } from './composables'
import { BUBBLE_LIST_CONTEXT_KEY } from './constants'
import type { BubbleListProps, BubbleListSlots, BubbleMessage, BubbleMessageGroup } from './index.type'

const props = withDefaults(defineProps<BubbleListProps>(), {
  groupStrategy: 'divider',
  dividerRole: 'user',
  fallbackRole: 'assistant',
})

defineSlots<BubbleListSlots>()

const emit = defineEmits<{
  (e: 'state-change', payload: { key: string; value: unknown; messageIndex: number; contentIndex?: number }): void
}>()

// Provide bubble store if not already provided
setupBubbleStore()

// 提供 bubble list 上下文，标识 Bubble 组件在 BubbleList 下
provide(BUBBLE_LIST_CONTEXT_KEY, true)

const listRef = ref<HTMLDivElement | null>(null)
let scrollToBottomFn: (behavior?: ScrollBehavior) => Promise<void> = async () => {}

if (props.autoScroll) {
  const lastMessage = computed(() => props.messages.at(-1))

  const { scrollToBottom } = useAutoScroll(listRef, () => [
    props.messages.length,
    lastMessage.value?.content,
    lastMessage.value?.reasoning_content,
  ])
  scrollToBottomFn = scrollToBottom

  watch(
    () => lastMessage.value?.role,
    async (role) => {
      if (role === 'user') {
        await nextTick()
        scrollToBottom('smooth')
      }
    },
  )
}

// 设置复制事件处理器，清理复制文本中的多余换行
useCopyCleanup(listRef)

/**
 * 按角色分组
 * 连续相同角色的消息会被合并到一组
 * 如果消息的 content 是数组，则该消息单独作为一组，且后续消息不能添加到这个组
 */
const groupByRole = (messages: BubbleMessage[]): BubbleMessageGroup[] => {
  const groups: BubbleMessageGroup[] = []
  let isLastGroupSealed = false

  for (const [index, message] of messages.entries()) {
    const lastGroup = groups[groups.length - 1]
    const isArrayContent = Array.isArray(resolveMessageContent(message))

    // 如果 content 是数组，则单独作为一组
    if (isArrayContent) {
      groups.push({
        role: message.role || '',
        messages: [message],
        messageIndexes: [index],
        startIndex: index,
      })
      isLastGroupSealed = true
    }
    // 如果上一组的角色相同，且上一组未被密封，则添加到该组
    else if (lastGroup && lastGroup.role === message.role && !isLastGroupSealed) {
      lastGroup.messages.push(message)
      lastGroup.messageIndexes.push(index)
    } else {
      // 创建新的分组
      groups.push({
        role: message.role || '',
        messages: [message],
        messageIndexes: [index],
        startIndex: index,
      })
      isLastGroupSealed = false
    }
  }

  return groups
}

/**
 * 按分割角色分组
 * - 连续的分割角色消息会被分到一组
 * - 非分割角色消息会被分到一组，直到遇到下一个分割角色消息
 * - 如果消息的 content 是数组，则该消息单独作为一组，且后续消息不能添加到这个组
 */
const groupByDivider = (messages: BubbleMessage[], dividerRole: string): BubbleMessageGroup[] => {
  const groups: BubbleMessageGroup[] = []
  let isLastGroupSealed = false

  for (const [index, message] of messages.entries()) {
    const lastGroup = groups[groups.length - 1]
    const isDivider = message.role === dividerRole
    const isArrayContent = Array.isArray(resolveMessageContent(message))

    // 如果 content 是数组，则单独作为一组
    if (isArrayContent) {
      groups.push({
        role: message.role || '',
        messages: [message],
        messageIndexes: [index],
        startIndex: index,
      })
      isLastGroupSealed = true
    }
    // 如果上一组与当前消息的分割/非分割类型相同，且上一组未被密封，则添加到该组
    else if (lastGroup && (lastGroup.role === dividerRole) === isDivider && !isLastGroupSealed) {
      lastGroup.messages.push(message)
      lastGroup.messageIndexes.push(index)
    } else {
      // 创建新的分组
      groups.push({
        role: isDivider ? dividerRole : message.role || '',
        messages: [message],
        messageIndexes: [index],
        startIndex: index,
      })
      isLastGroupSealed = false
    }
  }

  return groups
}

/**
 * 根据分组策略计算消息分组
 */
const messageGroups = computed<BubbleMessageGroup[]>(() => {
  if (props.messages.length === 0) {
    return []
  }

  // 如果是自定义函数，直接调用
  if (typeof props.groupStrategy === 'function') {
    return props.groupStrategy(props.messages, props.dividerRole)
  }

  // 使用预定义策略
  if (props.groupStrategy === 'consecutive') {
    return groupByRole(props.messages)
  } else {
    return groupByDivider(props.messages, props.dividerRole)
  }
})

defineExpose({
  scrollToBottom: scrollToBottomFn,
})
</script>

<template>
  <div class="tr-bubble-list" ref="listRef">
    <BubbleItem
      v-for="(group, index) in messageGroups"
      :key="index"
      :role="group.role || props.fallbackRole"
      :role-config="props.roleConfigs?.[group.role || props.fallbackRole]"
      :message-group="group"
      :content-render-mode="props.contentRenderMode"
      @state-change="emit('state-change', { ...$event, messageIndex: group.startIndex + $event.messageIndex })"
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
</template>

<style lang="less" scoped>
.tr-bubble-list {
  --gap: var(--tr-bubble-list-gap);
  --padding: var(--tr-bubble-list-padding);
}

.tr-bubble-list {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  overflow-y: auto;
  padding: var(--padding);
}
</style>
