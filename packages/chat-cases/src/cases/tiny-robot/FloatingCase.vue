<script setup lang="ts">
import FloatingChat from '../../shared/layouts/FloatingChat.vue'
import { useTinyRobotRuntime } from '../../shared/runtime/createChatRuntime'

const runtime = useTinyRobotRuntime()
</script>

<template>
  <FloatingChat :runtime="runtime" />
</template>
