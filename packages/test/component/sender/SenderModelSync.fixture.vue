<script setup lang="ts">
import { ref } from 'vue'
import { TrSender as Sender } from '@opentiny/tiny-robot'

const content = ref('nihao')
</script>

<template>
  <div>
    <Sender v-model="content" />
    <input v-model="content" data-testid="model" />
  </div>
</template>
