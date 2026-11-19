<script setup lang="ts">
import { computed, markRaw, ref } from 'vue'
import ChatMessages from '../../../chat/src/ui/messages/ChatMessages.vue'
import { resolveChatUIOptions } from '../../../chat/src/ui/resolveOptions'
import RenderContextProbe from './RenderContextProbe.vue'

const firstRoot = ref<HTMLElement | null>(null)
const secondRoot = ref<HTMLElement | null>(null)
const alternate = ref(false)
const visible = ref(true)
const enabled = ref(true)
const content = ref('Answer')
const chat = ref<InstanceType<typeof ChatMessages> | null>(null)
const target = computed(() => (alternate.value ? secondRoot.value : firstRoot.value))
const resolved = resolveChatUIOptions(undefined)
const options = computed(() => ({
  ...resolved.bubble,
  autoScroll: enabled.value,
  bubbleProvider: { fallbackContentRenderer: markRaw(RenderContextProbe) },
}))
</script>

<template>
  <section>
    <input data-testid="sender-input" />
    <button data-testid="grow" @click="content += 'x'.repeat(500)">Grow</button>
    <button data-testid="switch-root" @click="alternate = !alternate">Switch root</button>
    <button data-testid="toggle-enabled" @click="enabled = !enabled">Toggle auto scroll</button>
    <button data-testid="anchor" @click="chat?.pauseAutoScroll()">Anchor pause</button>
    <button data-testid="bottom" @click="chat?.scrollToBottom()">Bottom</button>
    <button data-testid="detach" @click="visible = false">Unmount messages</button>
    <div ref="firstRoot" data-testid="first-root" style="height: 300px; overflow-y: auto">
      <div style="height: 1200px" />
    </div>
    <div ref="secondRoot" data-testid="second-root" style="height: 300px; overflow-y: auto">
      <div style="height: 1200px" />
    </div>
    <Teleport :to="target ?? 'body'" :disabled="!target">
      <ChatMessages
        v-if="visible"
        ref="chat"
        :messages="[{ id: 'answer', role: 'assistant', content }]"
        :scroll-target="target"
        :options="options"
        :welcome="false"
        :prompts="false"
        :labels="resolved.labels"
        :is-empty="false"
        :center-empty-state="false"
        :center-welcome-composer="false"
      />
    </Teleport>
  </section>
</template>
