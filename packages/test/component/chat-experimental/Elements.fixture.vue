<script setup lang="ts">
import {
  TR_CHAT_EVENT_NAMES,
  TR_CHAT_UI_EVENT_NAMES,
  TrChatElement,
  TrChatUIElement,
  defineTrChatElements,
  forwardElementEvent,
  whenTrChatReady,
} from '../../../chat/src/experimental'

Object.assign(window, {
  __trChatElements: {
    TR_CHAT_EVENT_NAMES,
    TR_CHAT_UI_EVENT_NAMES,
    TrChatElement,
    TrChatUIElement,
    defineTrChatElements,
    forwardElementEvent,
    whenTrChatReady,
  },
})
</script>

<template>
  <div data-testid="elements-fixture" />
</template>
