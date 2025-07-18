<template>
  <div style="display: flex; gap: 8px; justify-content: space-around">
    <SuggestionPopover :data="[]" :loading="true">
      <template #trigger>
        <button>加载中状态</button>
      </template>
    </SuggestionPopover>
    <SuggestionPopover :data="[]">
      <template #trigger>
        <button>空状态</button>
      </template>
    </SuggestionPopover>
  </div>
</template>

<script setup lang="ts">
import { SuggestionPopover } from '@opentiny/tiny-robot'
</script>
