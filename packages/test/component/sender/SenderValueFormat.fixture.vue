<script setup lang="ts">
import Sender from '../../../components/src/sender'
defineProps<{ format?: 'html' | 'text'; value: string }>()
</script>
<template><Sender mode="multiple" :value-format="format" :model-value="value" /></template>
