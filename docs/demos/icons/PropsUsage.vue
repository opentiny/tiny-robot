<script setup lang="ts">
import { TrIconButton } from '@opentiny/tiny-robot'
import { IconNewSession, IconRefresh, IconSearch } from '@opentiny/tiny-robot-svgs'
</script>

<template>
  <div class="icon-demo-row">
    <TrIconButton size="34" svg-size="18" :icon="IconNewSession" />
    <TrIconButton size="34" svg-size="18" :icon="IconRefresh" />
    <TrIconButton size="34" svg-size="18" :icon="IconSearch" />
  </div>
</template>

<style scoped>
.icon-demo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
}
</style>
