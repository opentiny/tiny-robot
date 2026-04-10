<script setup lang="ts">
import { computed, nextTick, provide, ref, toRefs, watch } from 'vue'
import { useAutoScroll } from '../shared/composables'
import BubbleItem from './BubbleItem.vue'
import { setupBubbleStore, useCopyCleanup } from './composables'
import { useBubbleContentNav } from './composables/useBubbleContentNav'
import { BUBBLE_LIST_CONTEXT_KEY } from './constants'
import type { BubbleListProps, BubbleListSlots, BubbleMessage, BubbleMessageGroup } from './index.type'

const props = withDefaults(defineProps<BubbleListProps>(), {
  groupStrategy: 'divider',
  dividerRole: 'user',
  fallbackRole: 'assistant',
  contentResolver: (message: BubbleMessage) => message.content,
})

defineSlots<BubbleListSlots>()

const emit = defineEmits<{
  (e: 'state-change', payload: { key: string; value: unknown; messageIndex: number; contentIndex: number }): void
}>()

// Provide bubble store if not already provided
setupBubbleStore()

// 提供 bubble list 上下文，标识 Bubble 组件在 BubbleList 下
provide(BUBBLE_LIST_CONTEXT_KEY, true)

/**
 * 判断一个 role 是否是 hidden
 */
const isRoleHidden = (role: string | undefined): boolean => {
  if (!role) {
    return false
  }
  return Boolean(props.roleConfigs?.[role]?.hidden)
}

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
 * - 连续相同角色的消息会被合并到一组
 * - hidden 的消息需要单独分组，连续的 hidden 可以同一组
 */
const groupByRole = (messages: BubbleMessage[]): BubbleMessageGroup[] => {
  const groups: BubbleMessageGroup[] = []
  let isLastGroupHidden = false

  for (const [index, message] of messages.entries()) {
    const lastGroup = groups[groups.length - 1]
    const messageRole = message.role || ''
    const isMessageHidden = isRoleHidden(message.role)

    // 满足以下条件之一则添加到上一组：
    // 1. 连续的 hidden 消息（不管角色是否相同）
    // 2. 角色相同且 hidden 状态相同
    if (
      lastGroup &&
      ((isLastGroupHidden && isMessageHidden) ||
        (lastGroup.role === messageRole && isLastGroupHidden === isMessageHidden))
    ) {
      lastGroup.messages.push(message)
      lastGroup.messageIndexes.push(index)
    } else {
      // 创建新的分组
      groups.push({
        role: messageRole,
        messages: [message],
        messageIndexes: [index],
        startIndex: index,
      })
    }
    // 创建新组后统一更新 hidden 状态
    isLastGroupHidden = isMessageHidden
  }

  return groups
}

/**
 * 按分割角色分组
 * - 分割角色消息每条单独分组
 * - 非分割角色消息会被分到一组，直到遇到下一个分割角色消息
 * - hidden 的消息需要单独分组，连续的 hidden 可以同一组
 */
const groupByDivider = (messages: BubbleMessage[], dividerRole: string): BubbleMessageGroup[] => {
  const groups: BubbleMessageGroup[] = []
  let isLastGroupHidden = false

  for (const [index, message] of messages.entries()) {
    const lastGroup = groups[groups.length - 1]
    const isDivider = message.role === dividerRole
    const messageRole = message.role || ''
    const isMessageHidden = isRoleHidden(message.role)

    // 满足以下条件之一则添加到上一组：
    // 1. 连续的 hidden 消息（不管分割/非分割类型是否相同）
    // 2. 分割/非分割类型相同且 hidden 状态相同
    if (
      lastGroup &&
      // divider 消息（分割角色）永远不与任何组进行合并
      !isDivider &&
      // divider 组（分割角色）不允许被追加消息，确保 divider 组永远只有 1 条 message
      lastGroup.role !== dividerRole &&
      // hidden / 非 hidden 分组隔离
      isLastGroupHidden === isMessageHidden
    ) {
      lastGroup.messages.push(message)
      lastGroup.messageIndexes.push(index)
    } else {
      // 创建新的分组
      groups.push({
        role: isDivider ? dividerRole : messageRole,
        messages: [message],
        messageIndexes: [index],
        startIndex: index,
      })
    }
    // 创建新组后统一更新 hidden 状态
    isLastGroupHidden = isMessageHidden
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

const { contentNav, contentResolver, dividerRole, fallbackRole } = toRefs(props)

const { contentNavEntries, contentNavSource, bindGroupTarget } = useBubbleContentNav({
  contentNav,
  messageGroups,
  dividerRole,
  fallbackRole,
  contentResolver,
})

const getContentNavSourceFn = () => contentNavSource.value

defineExpose({
  scrollToBottom: scrollToBottomFn,
  getContentNavSource: getContentNavSourceFn,
})
</script>

<template>
  <div class="tr-bubble-list" ref="listRef">
    <BubbleItem
      v-for="(group, index) in messageGroups"
      :key="index"
      :ref="bindGroupTarget(contentNavEntries[index]?.id)"
      :data-content-nav-id="contentNavEntries[index]?.id || undefined"
      :role="group.role || props.fallbackRole"
      :role-config="props.roleConfigs?.[group.role || props.fallbackRole]"
      :message-group="group"
      :content-render-mode="props.contentRenderMode"
      :content-resolver="props.contentResolver"
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
