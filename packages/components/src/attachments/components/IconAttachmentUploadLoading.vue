<script setup lang="ts">
defineOptions({
  name: 'IconAttachmentUploadLoading',
})

defineProps({
  color: {
    type: String,
    default: '#FFFFFF',
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
    <circle
      cx="10.000000"
      cy="10.000000"
      r="8.750000"
      stroke="#FFFFFF"
      stroke-opacity="0.400000"
      stroke-width="2.500000"
    />
    <path
      d="M5.67 17.6C6.94 18.33 8.42 18.75 10 18.75C14.83 18.75 18.75 14.83 18.75 10C18.75 5.16 14.83 1.25 10 1.25"
      stroke="#FFFFFF"
      stroke-opacity="1.000000"
      stroke-width="2.500000"
      stroke-linecap="round"
    />
  </svg>
</template>
