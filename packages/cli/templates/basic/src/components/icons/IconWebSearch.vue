<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
  }>(),
  {
    size: 24,
  },
)
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    fill="none"
  >
    <defs>
      <clipPath id="clip98_50741">
        <rect id="联网搜索" width="16.000000" height="16.000000" fill="white" fill-opacity="0" />
      </clipPath>
    </defs>
    <g clip-path="url(#clip98_50741)">
      <path
        id="形状"
        d="M8 2C4.67 2 2 4.68 2 8C2 11.31 4.67 14 8 14C11.31 14 14 11.31 14 8C14 4.68 11.31 2 8 2ZM8 1C11.86 1 15 4.13 15 8C15 11.86 11.86 15 8 15C4.12 15 1 11.86 1 8C1 4.13 4.12 1 8 1ZM8 2C6.71 2 5.5 4.65 5.5 8C5.5 11.34 6.71 14 8 14C9.27 14 10.5 11.34 10.5 8C10.5 4.65 9.27 2 8 2ZM8 1C10.03 1 11.5 4.16 11.5 8C11.5 11.83 10.03 15 8 15C5.95 15 4.5 11.83 4.5 8C4.5 4.16 5.95 1 8 1ZM14.5 7.5C14.77 7.5 15 7.71 15 8C15 8.27 14.77 8.5 14.5 8.5L1.5 8.5C1.21 8.5 1 8.27 1 8C1 7.71 1.21 7.5 1.5 7.5L14.5 7.5Z"
        fill="currentColor"
        fill-opacity="1.000000"
        fill-rule="nonzero"
      />
    </g>
  </svg>
</template>
