<script setup lang="ts">
import { TrLayout } from '@opentiny/tiny-robot'
</script>

<template>
  <TrLayout mode="normal" :left-aside="{ mode: 'drawer', defaultOpen: false, ariaLabel: 'Conversation navigation' }">
    <template #left-aside>
      <button data-testid="drawer-first">First drawer action</button>
      <button data-testid="drawer-last">Last drawer action</button>
    </template>
    <template #header>
      <TrLayout.AsideToggle side="left">Toggle conversations</TrLayout.AsideToggle>
    </template>
    <template #main>
      <button data-testid="main-action">Main action</button>
    </template>
  </TrLayout>
</template>
