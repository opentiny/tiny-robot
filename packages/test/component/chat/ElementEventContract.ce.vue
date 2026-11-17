<script setup lang="ts">
import Source, { CONTRACT_EVENTS } from './ElementEventSource.fixture'
import { createElementEventListeners, elementEventNames } from '../../../chat/src/experimental/events'
import { useExperimentalElementHost } from '../../../chat/src/experimental/elementHost'
const emit = defineEmits(elementEventNames(CONTRACT_EVENTS))
useExperimentalElementHost({}, [], () => emit('ready'))
const events = createElementEventListeners(CONTRACT_EVENTS, emit)
</script>
<template><Source v-on="events" /></template>
