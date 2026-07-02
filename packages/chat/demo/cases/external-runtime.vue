<script setup lang="ts">
import { TrChat } from '../../src'
import { useDemoRuntime } from './useDemoRuntime'

const { runtime, ui } = useDemoRuntime()
</script>

<template>
  <TrChat :runtime="runtime" :ui="ui" />
</template>
