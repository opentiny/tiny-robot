<script setup lang="ts">
defineProps<{
  name: string
  label: string
}>()
</script>

<template>
  <slot></slot>
</template>
