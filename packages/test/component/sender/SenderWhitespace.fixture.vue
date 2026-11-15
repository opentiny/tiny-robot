<script setup lang="ts">
import { ref } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
const props = withDefaults(defineProps<{ initial?: string }>(), { initial: 'Initial  draft  spaces' })
const value = ref(props.initial)
const sender = ref<InstanceType<typeof TrSender>>()
</script>
<template>
  <button data-testid="external" @click="value = 'External  draft  spaces'">Set external draft</button>
  <button data-testid="method" @click="sender?.setContent('Method  draft  spaces')">Set draft by method</button>
  <button data-testid="inline-external" @click="value = '<b>world</b>'">Set inline HTML draft</button>
  <button data-testid="inline-method" @click="sender?.setContent('hello <em>world</em>')">
    Set inline HTML by method
  </button>
  <TrSender ref="sender" v-model="value" mode="multiple" />
  <output data-testid="accepted">{{ value }}</output>
</template>
