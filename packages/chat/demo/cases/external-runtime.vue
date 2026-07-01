<script setup lang="ts">
import { TrChat } from '../../src'
import { useDemoRuntime } from './useDemoRuntime'

const { runtime, parts } = useDemoRuntime()
</script>

<template>
  <TrChat :runtime="runtime" :parts="parts" />
</template>
