<script setup lang="ts">
import { TrChat } from '../../src'
import { useExternalRuntime } from './useExternalRuntime'

const { isMobile, runtime, ui } = useExternalRuntime()
</script>

<template>
  <TrChat :key="isMobile ? 'mobile' : 'desktop'" :runtime="runtime" :ui="ui" />
</template>
