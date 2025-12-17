<script setup lang="ts">
import { IconArrowDown, IconAtom } from '@opentiny/tiny-robot-svgs'
import { computed, ref, watchEffect } from 'vue'
import { useBubbleContentRenderer, useBubbleStateChangeFn } from '../composables'
import { BubbleContentRendererProps, ChatMessageContent } from '../index.type'

const props = defineProps<
  BubbleContentRendererProps<
    ChatMessageContent,
    {
      thinking?: boolean
      open?: boolean
    }
  >
>()

const restMessage = computed(() => {
  const { reasoning_content: _, ...rest } = props.message
  return rest
})

const renderer = useBubbleContentRenderer(restMessage, props.contentIndex)

const open = ref(false)

watchEffect(() => {
  open.value = props.message.state?.open ?? false
})

const handleStateChange = useBubbleStateChangeFn()

const handleClick = () => {
  open.value = !open.value
  handleStateChange?.('open', open.value)
}
</script>

<template>
  <div class="tr-bubble__reasoning" data-type="reasoning">
    <div class="header" @click="handleClick">
      <IconAtom />
      <span class="title">{{ props.message.state?.thinking ? '正在思考' : '已思考' }}</span>
      <IconArrowDown class="expand-icon" :class="{ '-rotate-90': !open }" />
    </div>
    <div v-show="open" class="detail">
      <div class="side-border">
        <div class="dot-wrapper">
          <div class="dot"></div>
        </div>
        <div class="border-line"></div>
      </div>
      <p class="detail">{{ props.message.reasoning_content }}</p>
    </div>
  </div>
  <component :is="renderer" :message="restMessage" :content-index="props.contentIndex" />
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

  .expand-icon.-rotate-90 {
    transform: rotate(-90deg);
  }
}

.detail {
  font-size: 14px;
  line-height: 16px;
  color: var(--tr-text-secondary);
  margin-block: 8px;
  white-space: pre-line;
  display: flex;
  gap: 8px;
  align-items: center;

  p.detail {
    margin: 0;
    white-space: pre-wrap;

    & + p.detail {
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
      width: 1.5px;
      background-color: var(--tr-border-color-disabled);
      border-radius: 1px;
    }
  }
}
</style>
