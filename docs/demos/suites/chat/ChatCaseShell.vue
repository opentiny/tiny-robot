<script setup lang="ts">
import { TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import '@opentiny/tiny-robot-chat/dist/style.css'
import './styles/base.css'
import './cases/tiny-robot/index.css'
</script>

<template>
  <TrTheme>
    <div class="chat-case-shell">
      <div class="chat-case-shell__preview">
        <ClientOnly>
          <slot />
        </ClientOnly>
      </div>
    </div>
  </TrTheme>
</template>

<style scoped>
.chat-case-shell {
  container-type: inline-size;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  max-width: 1280px;
  margin: 10px auto;
  padding: 20px 20px 30px;
  border: 1px solid var(--coot-demo-box-border, #ddd);
  border-radius: 8px;
  background: #fafafa;
}

.chat-case-shell__preview {
  box-sizing: border-box;
  position: relative;
  display: flex;
  width: 100%;
  height: min(880px, calc(100vh - 180px));
  min-height: 0;
  overflow: hidden;
  border-radius: 16px;
  background: var(--tr-container-bg-default, #fff);
  box-shadow: 0 4px 24px rgb(0 0 0 / 6%);
}

.chat-case-shell__preview > * {
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
</style>
