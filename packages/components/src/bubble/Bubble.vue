<script setup lang="ts">
import { computed, toValue } from 'vue'
import BubbleBoxWrapper from './BubbleBoxWrapper.vue'
import BubbleContentWrapper from './BubbleContentWrapper.vue'
import { setupBubbleMessageGroup, setupBubbleStore, useBubbleMessageGroup } from './composables'
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
const messageGroup = useBubbleMessageGroup()
// Bubble 可能递归渲染，因此在 inject 后立即 provide 空值来阻断无限递归
setupBubbleMessageGroup(undefined)

// 判断多态内容是否应以 Split Mode（拆分模式）渲染
const shouldSplitPolymorphic = computed(() => {
  return props.splitPolymorphic && (toValue(messageGroup)?.isPolymorphic || Array.isArray(props.content))
})

// 收集 Split Mode 需要渲染的多态内容项
const splitedPolymorphicItems = computed(() => {
  const msgGroup = toValue(messageGroup)

  if (msgGroup?.isPolymorphic) {
    return msgGroup.messages[0].content || []
  }
  return Array.isArray(props.content) ? props.content : []
})

const splitedPolymorphicItemProps = computed(() => {
  const msgGroup = toValue(messageGroup)

  if (msgGroup?.isPolymorphic) {
    const { content: _, ...rest } = msgGroup.messages[0]
    return rest
  }
  return {}
})

// 构建消息列表
const rendererMessages = computed<BubbleRendererMessage[]>(() => {
  const msgGroup = toValue(messageGroup)

  // 来源：消息分组（普通文本）
  if (msgGroup && !msgGroup.isPolymorphic) {
    return msgGroup.messages
  }

  // 来源：消息分组（多态内容，Merged Mode）
  if (msgGroup && msgGroup.isPolymorphic) {
    return (msgGroup.messages[0].content || []).map((content) => ({
      ...msgGroup.messages[0],
      content,
    }))
  }

  // 移除不需要的 props，与 BubbleRendererMessage 类型保持一致
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { avatar, placement, shape, splitPolymorphic, fallbackBoxRenderer, fallbackContentRenderer, ...rest } = props

  // 来源：props.content（多态内容）
  if (Array.isArray(props.content)) {
    return props.content.map((content) => ({
      ...rest,
      content,
    }))
  }

  // 来源：props.content（普通文本）
  return [
    {
      ...rest,
      content: props.content,
    },
  ]
})

const role = computed(() => {
  return toValue(messageGroup)?.role || props.role
})

const hidden = computed(() => {
  return props.hidden || rendererMessages.value.every((message) => message.hidden)
})
</script>

<template>
  <template v-if="shouldSplitPolymorphic">
    <Bubble
      v-for="(content, index) in splitedPolymorphicItems"
      :key="index"
      v-bind="{ ...props, ...splitedPolymorphicItemProps, ...$attrs }"
      :content="[content]"
      :split-polymorphic="false"
    >
      <template #prefix="slotProps">
        <slot
          name="prefix"
          v-bind="slotProps"
          :isPolymorphic="true"
          :isFirstPolymorphic="index === 0"
          :polymorphicIndex="index"
        ></slot>
      </template>
      <template #suffix="slotProps">
        <slot
          name="suffix"
          v-bind="slotProps"
          :isPolymorphic="true"
          :isFirstPolymorphic="index === 0"
          :polymorphicIndex="index"
        ></slot>
      </template>
      <template #content-footer="slotProps">
        <slot
          name="content-footer"
          v-bind="slotProps"
          :isPolymorphic="true"
          :isFirstPolymorphic="index === 0"
          :polymorphicIndex="index"
        ></slot>
      </template>
      <template #after="slotProps">
        <slot
          name="after"
          v-bind="slotProps"
          :isPolymorphic="true"
          :isFirstPolymorphic="index === 0"
          :polymorphicIndex="index"
        ></slot>
      </template>
    </Bubble>
  </template>

  <div v-else class="tr-bubble" v-show="!hidden" :data-role="props.role" :data-placement="props.placement">
    <slot name="prefix" :rendererMessages="rendererMessages" :role="role"></slot>
    <div class="tr-bubble__body">
      <component v-if="props.avatar" :is="props.avatar" :class="$style['tr-bubble__avatar']" />
      <BubbleBoxWrapper
        class="tr-bubble__box"
        :placement="props.placement"
        :shape="props.shape"
        :messages="rendererMessages"
        :fallback-renderer="props.fallbackBoxRenderer"
      >
        <BubbleContentWrapper
          v-for="(message, index) in rendererMessages"
          :key="index"
          :message="message"
          :fallback-renderer="props.fallbackContentRenderer"
        />
        <slot name="content-footer" :rendererMessages="rendererMessages" :role="role"></slot>
      </BubbleBoxWrapper>
      <div class="tr-bubble__after">
        <slot name="after" :rendererMessages="rendererMessages" :role="role"></slot>
      </div>
    </div>
    <slot name="suffix" :rendererMessages="rendererMessages" :role="role"></slot>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble {
  display: flex;
  align-items: flex-start;
}

.tr-bubble__body {
  flex: 1;

  display: grid;
  grid-template-columns: auto 1fr; /* 左侧头像，右侧内容 */
  grid-template-rows: auto auto;
}

.tr-bubble__box {
  max-width: var(--tr-bubble-max-width);
  width: fit-content;
  grid-area: 1 / 2;
}

.tr-bubble__after {
  grid-area: 2 / 2;
  position: relative;
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
  margin-right: var(--tr-bubble-gap);
  grid-area: 1 / 1;
}

[data-placement='end'] .tr-bubble__avatar {
  margin-left: var(--tr-bubble-gap);
  grid-area: 1 / 2;
}
</style>
