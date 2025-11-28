<script setup lang="ts">
import { IconArrowDown, IconAtom } from '@opentiny/tiny-robot-svgs'
import { ref, watchEffect } from 'vue'
import { useBubbleContentMessage } from '../composables/useContentMessage'
import { BubbleRendererMessage } from '../index.type'

const props = defineProps<
  BubbleRendererMessage<
    unknown,
    {
      detail: string
      title?: string
      open?: boolean
    }
  >
>()

const message = useBubbleContentMessage()

const open = ref(false)

watchEffect(() => {
  open.value = props.extras?.open ?? false
})

const handleClick = () => {
  open.value = !open.value
  if (message?.extras) {
    message.extras.open = open.value
  }
}
</script>

<template>
  <div class="tr-bubble__collapsible-content" data-type="collapsible-content">
    <div class="header" @click="handleClick">
      <IconAtom />
      <span class="title">{{ props.extras?.title || 'Untitled' }}</span>
      <IconArrowDown class="expand-icon" :class="{ '-rotate-90': !open }" />
    </div>
    <div v-show="open" class="detail">
      <div class="side-border">
        <div class="dot-wrapper">
          <div class="dot"></div>
        </div>
        <div class="border-line"></div>
      </div>
      <p class="detail">{{ props.extras?.detail }}</p>
    </div>
  </div>
</template>

<style lang="less" scoped>
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
  margin-top: 8px;
  margin-bottom: 16px;
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
