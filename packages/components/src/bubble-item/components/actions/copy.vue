<script setup lang="ts">
import { BubbleItemProps } from '../../../bubble-list/index.type'

const { bubbleItem } = defineProps<{ bubbleItem: BubbleItemProps }>()

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
  <span @click="handleClick">
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <desc>Created with Pixso.</desc>
      <defs />
      <path
        id="矢量 22"
        d="M4 4.76C2.89 4.76 2 5.66 2 6.76L2 11.99C2 13.1 2.89 13.99 4 13.99L9.23 13.99C10.33 13.99 11.23 13.1 11.23 11.99L11.23 6.76C11.23 5.66 10.33 4.76 9.23 4.76L4 4.76ZM14 8.46L14 3.84C14 2.82 13.17 2 12.15 2L7.53 2"
        stroke="#191919"
        stroke-opacity="1.000000"
        stroke-width="1.000000"
        stroke-linecap="round"
      />
    </svg>
  </span>
</template>
