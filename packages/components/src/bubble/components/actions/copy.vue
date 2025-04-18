<script setup lang="ts">
import { BubbleProps } from '../../index.type'
import { IconCopy } from '@opentiny/tiny-robot-svgs'

const { bubbleItem } = defineProps<{ bubbleItem: BubbleProps }>()

const emit = defineEmits(['click'])

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err: unknown) {
    return false
  }
}

const handleClick = async () => {
  const result = bubbleItem.content ? await copyToClipboard(bubbleItem.content) : false

  emit('click', result)
}
</script>

<template>
  <button class="icon-btn" @click="handleClick">
    <IconCopy width="16px" height="16px" />
  </button>
</template>

<style lang="less" scoped>
button.icon-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.15);
  }
}
</style>
