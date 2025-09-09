<template>
  <div class="form-container">
    <TrMcpAddForm />
  </div>
</template>

<script setup lang="ts">
import { TrMcpAddForm } from '@opentiny/tiny-robot'
</script>

<style scoped>
.form-container {
  max-width: 570px;
  width: 100%;
  background-color: var(--tr-container-bg-default);
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
