<script setup lang="ts">
import { TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import '@opentiny/tiny-robot-chat/dist/style.css'
import './shared/base.css'
</script>

<template>
  <TrTheme>
    <div class="chat-case-shell">
      <ClientOnly>
        <slot />
      </ClientOnly>
    </div>
  </TrTheme>
</template>

<style scoped>
.chat-case-shell {
  container-type: inline-size;
  box-sizing: border-box;
  width: 100%;
  height: min(880px, calc(100vh - 180px));
  min-height: 0;
  overflow: visible;
  background: var(--tr-container-bg-default);
}

.chat-case-shell > :deep(*) {
  width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 0;
}

.chat-case-shell :deep(.tr-chat-ui) {
  --tr-layout-height: 100%;
  height: 100%;
  min-height: 0;
}

:global(.main-content:has(.chat-case-shell) > .Layout),
:global(.main-content:has(.chat-case-shell) .VPContent),
:global(.main-content:has(.chat-case-shell) .VPDoc),
:global(.main-content:has(.chat-case-shell) .content),
:global(.main-content:has(.chat-case-shell) .content-container),
:global(.main-content:has(.chat-case-shell) .main) {
  min-height: 0;
}

:global(.VPDoc:has(.chat-case-shell)) {
  padding-top: 0;
}

:global(.VPDoc:has(.chat-case-shell) .VPDocFooter) {
  display: none;
}

@media (max-width: 640px) {
  .chat-case-shell {
    height: 640px;
  }
}
</style>
