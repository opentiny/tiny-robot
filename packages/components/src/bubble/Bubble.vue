<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import BubbleBoxWrapper from './BubbleBoxWrapper.vue'
import BubbleContentWrapper from './BubbleContentWrapper.vue'
import { setupBubbleStore } from './composables'
import { BUBBLE_MESSAGE_GROUP_KEY } from './constants'
import type { BubbleProps, BubbleRendererMessage, BubbleSlots } from './index.type'

const props = withDefaults(defineProps<BubbleProps>(), {
  placement: 'start',
  shape: 'corner',
  splitPolymorphic: false,
})

defineSlots<BubbleSlots>()

// Provide bubble store if not already provided
setupBubbleStore()

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
  if (messageGroup && messageGroup.isPolymorphic) {
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

const role = computed(() => {
  return messageGroup?.role || props.role
})
</script>

<template>
  <template v-if="shouldSplitPolymorphic">
    <Bubble
      v-for="(content, index) in splitedPolymorphicItems"
      :key="index"
      v-bind="{ ...props, ...$attrs }"
      :content="[content]"
      :split-polymorphic="false"
    />
  </template>

  <div v-else class="tr-bubble" v-show="!props.hidden" :data-role="props.role" :data-placement="props.placement">
    <slot name="prefix" :messages="rendererMessages" :role="role"></slot>
    <div class="tr-bubble__body">
      <component v-if="props.avatar" :is="props.avatar" :class="$style['tr-bubble__avatar']" />
      <BubbleBoxWrapper
        class="tr-bubble__box"
        :placement="props.placement"
        :shape="props.shape"
        :messages="rendererMessages"
      >
        <BubbleContentWrapper v-for="(message, index) in rendererMessages" :key="index" :message="message" />
        <slot name="content-footer" :messages="rendererMessages" :role="role"></slot>
      </BubbleBoxWrapper>
      <div class="tr-bubble__after">
        <slot name="after" :messages="rendererMessages" :role="role"></slot>
      </div>
    </div>
    <slot name="suffix" :messages="rendererMessages" :role="role"></slot>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble {
  display: flex;
}

.tr-bubble__body {
  flex: 1;

  display: grid;
  grid-template-columns: auto 1fr; /* 左侧头像，右侧内容 */
  grid-template-rows: auto auto;
}

.tr-bubble__box {
  max-width: var(--tr-bubble-max-width, 80%);
  width: fit-content;
  grid-area: 1 / 2;
}

.tr-bubble__after {
  grid-area: 2 / 2;
}

[data-placement='end'] {
  .tr-bubble__body {
    grid-template-columns: 1fr auto; /* 左侧内容，右侧头像 */

    & > * {
      justify-self: end;
    }
  }

  .tr-bubble__box {
    grid-area: 1 / 1;
  }

  .tr-bubble__after {
    grid-area: 2 / 1;
  }
}
</style>

<style module>
[data-placement='start'] .tr-bubble__avatar {
  margin-right: var(--tr-bubble-gap, 16px);
  grid-area: 1 / 1;
}

[data-placement='end'] .tr-bubble__avatar {
  margin-left: var(--tr-bubble-gap, 16px);
  grid-area: 1 / 2;
}
</style>
