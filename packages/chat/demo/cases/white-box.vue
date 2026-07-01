<script setup lang="ts">
import { TrLayout } from '@opentiny/tiny-robot'
import { TrChat } from '../../src'
import { useDemoRuntime } from './useDemoRuntime'

const { runtime, parts } = useDemoRuntime()
</script>

<template>
  <TrChat.Root :runtime="runtime" :parts="parts">
    <TrLayout v-bind="parts.layout">
      <template #left-aside>
        <TrChat.Conversations />
      </template>

      <template #header>
        <TrChat.Header />
      </template>

      <template #main>
        <TrChat.Messages />
      </template>

      <template #footer>
        <TrChat.Composer />
      </template>
    </TrLayout>
  </TrChat.Root>
</template>
