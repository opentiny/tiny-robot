<script setup lang="ts">
import { computed } from 'vue'
import BubbleItem from './BubbleItem.vue'
import type {
  BubbleListProps,
  BubbleMessage,
  BubbleMessageGroup,
  BubblePlainMessage,
  BubblePolymorphicMessage,
} from './index.type'

const props = withDefaults(defineProps<BubbleListProps>(), {
  groupStrategy: 'divider',
  dividerRole: 'user',
})

/**
 * 按角色分组
 * 连续相同角色的消息会被合并到一组
 * 如果消息的 content 是数组，则该消息单独作为一组，且后续消息不能添加到这个组
 */
const groupByRole = (messages: BubbleMessage[]): BubbleMessageGroup[] => {
  const groups: BubbleMessageGroup[] = []

  for (const message of messages) {
    const lastGroup = groups[groups.length - 1]
    const isArrayContent = Array.isArray(message.content)

    // 如果 content 是数组，则单独作为一组
    if (isArrayContent) {
      groups.push({
        role: message.role,
        messages: [message as BubblePolymorphicMessage],
        isPolymorphic: true,
      })
    }
    // 如果上一组的角色相同，且上一组不是多态分组，则添加到该组
    else if (lastGroup && lastGroup.role === message.role && !lastGroup.isPolymorphic) {
      ;(lastGroup.messages as BubblePlainMessage[]).push(message as BubblePlainMessage)
    } else {
      // 创建新的分组
      groups.push({
        role: message.role,
        messages: [message as BubblePlainMessage],
        isPolymorphic: false,
      })
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

  for (const message of messages) {
    const lastGroup = groups[groups.length - 1]
    const isDivider = message.role === dividerRole
    const isArrayContent = Array.isArray(message.content)

    // 如果 content 是数组，则单独作为一组
    if (isArrayContent) {
      groups.push({
        role: message.role,
        messages: [message as BubblePolymorphicMessage],
        isPolymorphic: true,
      })
    }
    // 如果上一组与当前消息的分割/非分割类型相同，且上一组不是多态分组，则添加到该组
    else if (lastGroup && (lastGroup.role === dividerRole) === isDivider && !lastGroup.isPolymorphic) {
      ;(lastGroup.messages as BubblePlainMessage[]).push(message as BubblePlainMessage)
    } else {
      // 创建新的分组
      groups.push({
        role: isDivider ? dividerRole : message.role,
        messages: [message as BubblePlainMessage],
        isPolymorphic: false,
      })
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
</script>

<template>
  <div class="tr-bubble-list">
    <BubbleItem
      v-for="(group, index) in messageGroups"
      :key="index"
      :role="group.role"
      :role-config="props.roleConfigs?.[group.role]"
      :message-group="group"
      :split-polymorphic="props.splitPolymorphic"
    ></BubbleItem>
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
