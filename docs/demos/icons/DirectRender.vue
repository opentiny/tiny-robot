<script setup lang="ts">
import { IconAi, IconSearch, IconSparkles } from '@opentiny/tiny-robot-svgs'
</script>

<template>
  <div class="icon-demo-row">
    <IconAi class="icon-demo-row__icon icon-demo-row__icon--primary" />
    <IconSparkles class="icon-demo-row__icon icon-demo-row__icon--brand" />
    <IconSearch class="icon-demo-row__icon icon-demo-row__icon--muted" />
  </div>
</template>

<style scoped>
.icon-demo-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 48px;
}

.icon-demo-row__icon {
  font-size: 22px;
}

.icon-demo-row__icon--primary {
  font-size: 30px;
}

.icon-demo-row__icon--brand {
  color: #1476ff;
}

.icon-demo-row__icon--muted {
  color: #5b6b82;
}
</style>
