<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble content="形状: rounded" placement="start" shape="rounded"></tr-bubble>
    <tr-bubble content="形状: corner" placement="start" shape="corner"></tr-bubble>
    <tr-bubble content="形状: none" placement="start" shape="none"></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
</script>
