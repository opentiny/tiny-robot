<script setup lang="ts">
import ChatUI from '../../../chat/src/ChatUI.vue'
import type { ChatRenderers } from '../../../chat/src/types'

const renderers: ChatRenderers = {
  'sender-footer': () => 'Renderer footer',
  'layout-empty-state': (context) => {
    const section = document.createElement('section')
    section.dataset.nativeWelcomeRenderer = ''
    const composer = context.renderComposer()
    if (composer) section.append(composer)
    return section
  },
}
</script>

<template>
  <ChatUI :ui="{ layout: { leftAside: false }, sender: { mode: 'multiple' } }" :renderers="renderers">
    <template #sender-footer><span data-native-footer>Native Vue footer</span></template>
  </ChatUI>
</template>
