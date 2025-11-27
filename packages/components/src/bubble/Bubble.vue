<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import BubbleContent from './BubbleContent.vue'
import { BUBBLE_MESSAGE_GROUP_KEY } from './constants'
import type { BubbleProps, BubbleRendererMessage } from './index.type'
import { getBoxRenderer } from './ren/renderers'

const props = withDefaults(defineProps<BubbleProps>(), {
  placement: 'start',
  shape: 'corner',
  splitPolymorphic: false,
})

// 从父级 BubbleItem 注入消息分组
const messageGroup = inject(BUBBLE_MESSAGE_GROUP_KEY, undefined)
// Bubble 可能递归渲染，因此在 inject 后立即 provide 空值来阻断无限递归
provide(BUBBLE_MESSAGE_GROUP_KEY, undefined)

// 判断多态内容是否应以 Split Mode（拆分模式）渲染
const shouldSplitPolymorphic = computed(() => {
  return props.splitPolymorphic && (messageGroup?.isPolymorphic || Array.isArray(props.content))
})

// 收集 Split Mode 需要渲染的多态内容项
const splitedPolymorphicItems = computed(() => {
  if (messageGroup?.isPolymorphic) {
    return messageGroup.messages[0].content || []
  }
  return Array.isArray(props.content) ? props.content : []
})

// 构建消息列表
const rendererMessages = computed<BubbleRendererMessage[]>(() => {
  // 来源：消息分组（普通文本）
  if (messageGroup && !messageGroup.isPolymorphic) {
    return messageGroup.messages
  }

  // 来源：消息分组（多态内容，Merged Mode）
  if (messageGroup?.isPolymorphic) {
    return (messageGroup.messages[0].content || []).map((content) => ({
      ...messageGroup.messages[0],
      content,
    }))
  }

  // 来源：props.content（多态内容）
  if (Array.isArray(props.content)) {
    return props.content.map((content) => ({
      ...props,
      content,
    }))
  }

  // 来源：props.content（普通文本）
  return [
    {
      ...props,
      content: props.content,
    },
  ]
})
</script>

<template>
  <template v-if="shouldSplitPolymorphic">
    <Bubble
      v-for="(content, index) in splitedPolymorphicItems"
      :key="index"
      v-bind="props"
      :content="[content]"
      :split-polymorphic="false"
    />
  </template>

  <div v-else class="tr-bubble" :data-role="props.role" :data-placement="props.placement">
    <component v-if="props.avatar" :is="props.avatar" :class="$style['tr-bubble__avatar']" />
    <component
      :is="getBoxRenderer({ placement: props.placement, shape: props.shape, messages: rendererMessages })"
      :placement="props.placement"
      :shape="props.shape"
    >
      <BubbleContent v-for="(message, index) in rendererMessages" :key="index" :message="message" />
    </component>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble {
  display: flex;
  gap: var(--tr-bubble-gap, 16px);
  max-width: var(--tr-bubble-max-width, 80%);

  &[data-placement='start'] {
    flex-direction: row;
    margin-inline-end: auto;
  }

  &[data-placement='end'] {
    flex-direction: row-reverse;
    margin-inline-start: auto;
  }
}

:not(.tr-bubble-list) > .tr-bubble + .tr-bubble {
  margin-top: var(--tr-bubble-space-y, 16px);
}
</style>

<style module>
.tr-bubble__avatar {
  flex-shrink: 0;
  align-self: flex-start;
}
</style>
