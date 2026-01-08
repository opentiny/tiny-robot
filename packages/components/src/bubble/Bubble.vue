<script setup lang="ts">
import { computed, inject, ref, toValue } from 'vue'
import BubbleBoxWrapper from './BubbleBoxWrapper.vue'
import BubbleContentWrapper from './BubbleContentWrapper.vue'
import {
  setupBubblePropBoxRenderer,
  setupBubblePropContentRenderer,
  setupBubbleStore,
  useBubbleMessageGroup,
  useContentResolver,
  useCopyCleanup,
} from './composables'
import { BUBBLE_LIST_CONTEXT_KEY } from './constants'
import type { BubbleMessage, BubbleMessageGroup, BubbleProps, BubbleSlots } from './index.type'

const props = withDefaults(defineProps<BubbleProps>(), {
  placement: 'start',
  shape: 'corner',
  contentRenderMode: 'single',
  contentResolver: (message: BubbleMessage) => message.content,
})

defineSlots<BubbleSlots>()

const contentResolver = useContentResolver(() => props.contentResolver)

const emit = defineEmits<{
  (e: 'state-change', payload: { key: string; value: unknown; messageIndex: number; contentIndex?: number }): void
}>()

// Provide bubble store if not already provided
setupBubbleStore()

// 从父级 BubbleItem 注入消息分组
const messageGroup_ = useBubbleMessageGroup()
const messageGroup = computed(() => toValue(messageGroup_) as BubbleMessageGroup | undefined)

const messages = computed(() => {
  if (messageGroup.value?.messages.length) {
    return messageGroup.value.messages
  }

  const { role, content, reasoning_content, tool_calls, tool_call_id, name, id, loading, state } = props
  return [{ role, content, reasoning_content, tool_calls, tool_call_id, name, id, loading, state }]
})

// Setup prop-level fallback renderers for responsive tracking
setupBubblePropBoxRenderer({ fallbackBoxRenderer: () => props.fallbackBoxRenderer })
setupBubblePropContentRenderer({ fallbackContentRenderer: () => props.fallbackContentRenderer })

const hidden = computed(() => {
  if (messages.value.length === 0) {
    return true
  }

  return props.hidden
})

const shouldSplitedContent = computed(() => {
  if (props.contentRenderMode === 'split' && messages.value.length === 1) {
    const content = contentResolver(messages.value.at(0)!)
    if (Array.isArray(content)) {
      return content
    }
  }

  return null
})

// 检查 Bubble 是否在 BubbleList 下
const isInBubbleList = inject(BUBBLE_LIST_CONTEXT_KEY, false)
const bubbleRef = ref<HTMLDivElement | null>(null)

// 只有当 Bubble 不在 BubbleList 下时才使用 useCopyCleanup
if (!isInBubbleList) {
  useCopyCleanup(bubbleRef)
}
</script>

<template>
  <div class="tr-bubble" ref="bubbleRef" v-show="!hidden" :data-role="props.role" :data-placement="props.placement">
    <slot name="prefix" :messages="messages" :role="role"></slot>
    <div class="tr-bubble__body">
      <component
        v-if="props.avatar"
        :is="props.avatar"
        class="tr-bubble__avatar"
        :class="$style['tr-bubble__avatar']"
      />
      <div class="tr-bubble__content">
        <template v-if="shouldSplitedContent">
          <BubbleBoxWrapper
            v-for="(_, index) in shouldSplitedContent"
            :key="index"
            class="tr-bubble__box"
            :role="props.role"
            :placement="props.placement"
            :shape="props.shape"
            :messages="messages"
            :content-index="index"
          >
            <BubbleContentWrapper
              :message="messages.at(0)!"
              :content-index="index"
              @state-change="emit('state-change', { ...$event, messageIndex: 0 })"
            ></BubbleContentWrapper>
            <slot name="content-footer" :messages="messages" :role="props.role" :content-index="index"></slot>
          </BubbleBoxWrapper>
        </template>
        <template v-else>
          <BubbleBoxWrapper :role="props.role" :placement="props.placement" :shape="props.shape" :messages="messages">
            <template v-for="(message, msgIndex) in messages" :key="`message-${msgIndex}`">
              <template v-if="Array.isArray(contentResolver(message))">
                <BubbleContentWrapper
                  v-for="(_, contentIndex) in contentResolver(message)"
                  :key="`content-${contentIndex}`"
                  :message="message"
                  :content-index="contentIndex"
                  @state-change="emit('state-change', { ...$event, messageIndex: msgIndex })"
                ></BubbleContentWrapper>
              </template>
              <template v-else>
                <BubbleContentWrapper
                  :message="message"
                  @state-change="emit('state-change', { ...$event, messageIndex: msgIndex })"
                ></BubbleContentWrapper>
              </template>
            </template>
            <slot name="content-footer" :messages="messages" :role="props.role"></slot>
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
  user-select: none;
}

.tr-bubble__box {
  max-width: var(--tr-bubble-max-width);
  min-width: var(--tr-bubble-min-width);
  width: fit-content;
  user-select: text;
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
