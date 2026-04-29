<script setup lang="ts">
import { IconArrowDown, IconAtom } from '@opentiny/tiny-robot-svgs'
import { nextTick, ref, watch, watchEffect } from 'vue'
import { useBubbleContentRenderer, useBubbleStateChangeFn, useOmitMessageFields } from '../composables'
import { BubbleContentRendererProps, ChatMessageContent } from '../index.type'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<
  BubbleContentRendererProps<
    ChatMessageContent,
    {
      thinking?: boolean
      open?: boolean
    }
  >
>()

const { restMessage, restProps } = useOmitMessageFields(props, ['reasoning_content'])

const renderer = useBubbleContentRenderer(restMessage, props.contentIndex)

const open = ref(true)

watchEffect(() => {
  // 思考过程默认展开
  open.value = props.message.state?.open ?? true
})

const handleStateChange = useBubbleStateChangeFn()

const handleClick = () => {
  open.value = !open.value
  handleStateChange('open', open.value)
}

const detailRef = ref<HTMLParagraphElement | null>(null)

watch(
  () => props.message.reasoning_content,
  () => {
    nextTick(() => {
      if (!detailRef.value) {
        return
      }

      detailRef.value.scrollTo({
        top: detailRef.value.scrollHeight,
        behavior: 'smooth',
      })
    })
  },
)
</script>

<template>
  <div class="tr-bubble__reasoning" data-type="reasoning" v-bind="$attrs">
    <div class="header" @click="handleClick">
      <div class="icon-and-text" :class="{ thinking: props.message.state?.thinking }">
        <IconAtom />
        <span class="title">{{ props.message.state?.thinking ? '正在思考' : '已思考' }}</span>
      </div>
      <IconArrowDown class="expand-icon" :class="{ '-rotate-90': !open }" />
    </div>
    <div v-show="open" class="detail">
      <div class="side-border">
        <div class="dot-wrapper">
          <div class="dot"></div>
        </div>
        <div class="border-line"></div>
      </div>
      <p class="detail-content" ref="detailRef">{{ props.message.reasoning_content }}</p>
    </div>
  </div>
  <component :is="renderer.renderer" v-bind="{ ...renderer.attributes, ...restProps }" />
</template>

<style lang="less" scoped>
.tr-bubble__reasoning:not(:last-child) {
  margin-bottom: 8px;
}

.header {
  font-size: 16px;
  line-height: 1.5;
  color: var(--tr-text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    color: var(--tr-text-primary);
  }

  .icon-and-text {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .expand-icon.-rotate-90 {
    transform: rotate(-90deg);
  }
}

@keyframes thinking-pulse {
  20% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  80% {
    opacity: 1;
  }
}

.thinking {
  animation: thinking-pulse 1.5s infinite linear;
}

.detail {
  color: var(--tr-text-secondary);
  margin-block: 8px;
  white-space: pre-line;
  display: flex;
  gap: 8px;
  align-items: center;

  p.detail-content {
    font-size: 14px;
    line-height: 16px;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: var(--tr-bubble-reasoning-max-height, 300px);
    overflow-y: auto;

    & + p.detail-content {
      margin-top: 1em;
    }
  }

  .side-border {
    width: 16px;
    flex-shrink: 0;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    align-items: center;

    .dot-wrapper {
      width: 4px;
      height: 16px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--tr-text-primary);
    }

    .border-line {
      flex: 1;
      width: var(--tr-bubble-reasoning-side-border-width, 1.5px);
      background-color: var(--tr-bubble-reasoning-side-border-color, var(--tr-border-color-disabled));
      border-radius: 1px;
    }
  }
}
</style>
