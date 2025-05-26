<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <SuggestionPopover :data="[]" :loading="true">
      <button>加载中状态</button>
    </SuggestionPopover>
    <SuggestionPopover :data="[]">
      <button>空状态</button>
    </SuggestionPopover>
  </div>
</template>

<script setup lang="ts">
import { SuggestionPopover } from '@opentiny/tiny-robot'
</script>
