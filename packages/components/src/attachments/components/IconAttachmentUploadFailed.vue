<script setup lang="ts">
defineOptions({
  name: 'IconAttachmentUploadFailed',
})

defineProps({
  color: {
    type: String,
    default: '#F23030',
  },
  width: {
    type: [Number, String],
    default: 20,
  },
  height: {
    type: [Number, String],
    default: 20,
  },
})
</script>

<template>
  <svg :width="width" :height="height" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10.84 3.99L16.88 15.12C17.13 15.57 16.95 16.14 16.49 16.38C16.35 16.46 16.2 16.5 16.04 16.5L3.95 16.5C3.42 16.5 3 16.08 3 15.56C3 15.4 3.03 15.25 3.11 15.12L9.15 3.99C9.4 3.53 9.98 3.36 10.44 3.61C10.61 3.69 10.75 3.83 10.84 3.99Z"
      fill="#FFFFFF"
      fill-opacity="1.000000"
      fill-rule="evenodd"
    />
    <path
      d="M10 14.5C9.58 14.5 9.25 14.16 9.25 13.75C9.25 13.33 9.58 13 10 13C10.41 13 10.75 13.33 10.75 13.75C10.75 14.16 10.41 14.5 10 14.5Z"
      :fill="color"
      fill-opacity="1.000000"
      fill-rule="evenodd"
    />
    <rect
      x="9.500000"
      y="7.500000"
      rx="0.500000"
      width="1.000000"
      height="4.500000"
      :fill="color"
      fill-opacity="1.000000"
    />
  </svg>
</template>
