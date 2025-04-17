<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <h4>单行模式</h4>
    <sender />
    <h4>多行模式</h4>
    <sender mode="multiple" />
  </div>
</template>

<script setup lang="ts">
import { Sender } from '@opentiny/tiny-robot'
</script>
