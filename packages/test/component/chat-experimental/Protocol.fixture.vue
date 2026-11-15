<script setup lang="ts">
import {
  TrChatElement,
  TrChatUIElement,
  createRendererHost,
  defineTrChatElements,
  dispatchExperimentalEvent,
  whenTrChatReady,
} from '../../../chat/src/experimental'

Object.assign(window, {
  __trChatProtocol: {
    TrChatElement,
    TrChatUIElement,
    createRendererHost,
    defineTrChatElements,
    dispatchExperimentalEvent,
    whenTrChatReady,
  },
})
</script>

<template>
  <div data-testid="protocol-fixture" />
</template>
