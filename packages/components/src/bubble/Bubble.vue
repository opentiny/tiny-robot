<script setup lang="ts">
import { computed, toValue } from 'vue'
import BubbleBoxWrapper from './BubbleBoxWrapper.vue'
import BubbleContentWrapper from './BubbleContentWrapper.vue'
import {
  setupBubblePropBoxRenderer,
  setupBubblePropContentRenderer,
  setupBubbleStore,
  useBubbleMessageGroup,
} from './composables'
import type { BubbleMessageGroup, BubbleProps, BubbleSlots } from './index.type'

const props = withDefaults(defineProps<BubbleProps>(), {
  placement: 'start',
  shape: 'corner',
  contentRenderMode: 'single',
})

defineSlots<BubbleSlots>()

// Provide bubble store if not already provided
setupBubbleStore()

// 从父级 BubbleItem 注入消息分组
const messageGroup_ = useBubbleMessageGroup()
const messageGroup = computed(() => toValue(messageGroup_) as BubbleMessageGroup | undefined)

const messages = computed(() => {
  if (messageGroup.value?.messages.length) {
    return messageGroup.value.messages
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { avatar, placement, shape, contentRenderMode, fallbackBoxRenderer, fallbackContentRenderer, ...rest } = props
  return [rest]
})

// Setup prop-level fallback renderers for responsive tracking
setupBubblePropBoxRenderer({ fallbackBoxRenderer: () => props.fallbackBoxRenderer })
setupBubblePropContentRenderer({ fallbackContentRenderer: () => props.fallbackContentRenderer })

const hidden = computed(() => {
  if (props.hidden) {
    return true
  }

  if (messages.value.length === 0) {
    return true
  }

  return messages.value.every((message) => message.hidden)
})

const shouldSplit = computed(() => {
  return props.contentRenderMode === 'split' && messages.value.length === 1 && Array.isArray(messages.value[0].content)
})
</script>

<template>
  <div class="tr-bubble" v-show="!hidden" :data-role="props.role" :data-placement="props.placement">
    <slot name="prefix" :messages="messages" :role="role"></slot>
    <div class="tr-bubble__body">
      <component v-if="props.avatar" :is="props.avatar" :class="$style['tr-bubble__avatar']" />
      <div class="tr-bubble__content">
        <template v-if="shouldSplit">
          <BubbleBoxWrapper
            v-for="(_, index) in messages[0].content"
            :key="index"
            class="tr-bubble__box"
            :role="props.role"
            :placement="props.placement"
            :shape="props.shape"
            :messages="messages"
            :content-index="index"
          >
            <BubbleContentWrapper :message="messages[0]" :content-index="index"></BubbleContentWrapper>
            <slot name="content-footer" :message="messages[0]" :content-index="index" :role="props.role"></slot>
          </BubbleBoxWrapper>
        </template>
        <template v-else>
          <BubbleBoxWrapper :role="props.role" :placement="props.placement" :shape="props.shape" :messages="messages">
            <template v-for="(message, index) in messages" :key="`message-${index}`">
              <template v-if="Array.isArray(message.content)">
                <BubbleContentWrapper
                  v-for="(_, index) in message.content"
                  :key="`content-${index}`"
                  :message="message"
                  :content-index="index"
                ></BubbleContentWrapper>
                <slot name="content-footer" :message="message" :content-index="index" :role="props.role"></slot>
              </template>
              <template v-else>
                <BubbleContentWrapper :message="message"></BubbleContentWrapper>
                <slot name="content-footer" :message="message" :role="props.role"></slot>
              </template>
            </template>
          </BubbleBoxWrapper>
        </template>
      </div>
      <div class="tr-bubble__after">
        <slot name="after" :messages="messages" :role="role"></slot>
      </div>
    </div>
    <slot name="suffix" :messages="messages" :role="role"></slot>
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

.tr-bubble__content {
  grid-area: 1 / 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

.tr-bubble__box {
  max-width: var(--tr-bubble-max-width);
  width: fit-content;
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

  .tr-bubble__content {
    grid-area: 1 / 1;
    align-items: flex-end;
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
