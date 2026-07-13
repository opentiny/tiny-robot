<script setup lang="ts">
import { TrChat } from '../../src'
import { useCustomRuntime } from './useCustomRuntime'

const { isMobile, runtime, ui } = useCustomRuntime()
</script>

<template>
  <TrChat :key="isMobile ? 'mobile' : 'desktop'" :runtime="runtime" :ui="ui" />
</template>
