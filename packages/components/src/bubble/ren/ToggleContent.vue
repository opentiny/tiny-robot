<script setup lang="ts">
import { IconArrowDown, IconAtom } from '@opentiny/tiny-robot-svgs'
import { ref } from 'vue'
import { BubbleRendererMessage } from '../index.type'

const props = defineProps<BubbleRendererMessage<unknown, { detail: string; title?: string; defaultOpen?: boolean }>>()

const opened = ref(props.extras?.defaultOpen ?? false)
</script>

<template>
  <div class="tr-bubble__toggle-content">
    <div class="tr-bubble__toggle-content-head">
      <IconAtom />
      <span class="title">{{ props.extras?.title || 'Untitled' }}</span>
      <button class="icon-btn expand" :class="{ 'rotate-180': !opened }" @click="opened = !opened">
        <IconArrowDown />
      </button>
    </div>
    <div v-show="opened" class="tr-bubble__toggle-content-detail">
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
.tr-bubble__toggle-content-head {
  font-size: 16px;
  line-height: 1.5;
  color: var(--tr-text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tr-bubble__toggle-content-detail {
  font-size: 14px;
  line-height: 16px;
  color: var(--tr-text-secondary);
  padding-left: 12px;
  margin-block: 8px;
  white-space: pre-line;
  position: relative;

  p.detail {
    margin: 0;
    white-space: pre-wrap;

    & + p.detail {
      margin-top: 1em;
    }
  }

  .side-border {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;

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
      width: 2px;
      background-color: var(--tr-border-color-disabled);
      margin-left: 1px;
      border-radius: 1px;
    }
  }
}

.icon-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--tr-container-bg-hover);
  }
  &:active {
    background-color: var(--tr-container-bg-active);
  }

  svg {
    font-size: 16px;
  }

  &.expand.rotate-180 {
    transform: rotate(-90deg);
  }
}
</style>
