<script setup lang="ts">
defineOptions({ name: 'TrChatFooter' })
</script>

<template>
  <div class="tr-chat__footer">
    <div class="tr-chat__footer-inner">
      <div v-if="$slots.extra" class="tr-chat__footer-extra">
        <slot name="extra" />
      </div>
      <slot />
    </div>
  </div>
</template>
