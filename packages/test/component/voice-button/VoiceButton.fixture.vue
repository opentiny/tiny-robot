<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import Sender from '../../../components/src/sender/index.vue'
import VoiceButton from '../../../components/src/sender-actions/voice-button/index.vue'
import type { SpeechConfig } from '../../../components/src/sender-actions/voice-button/speech.types'
import { ControlledHandler, NativeRecognition, type Event } from './harness'

const props = withDefaults(
  defineProps<{
    native?: boolean
    deferred?: boolean
    replace?: boolean
    autoInsert?: boolean
    initial?: string
  }>(),
  { autoInsert: true },
)
const content = ref(props.initial ?? '')
const visible = ref(true)
const voice = ref<InstanceType<typeof VoiceButton>>()
const handlers = [new ControlledHandler(), new ControlledHandler()]
handlers.forEach((handler) => {
  handler.deferred = props.deferred ?? false
})
NativeRecognition.instances = []
Object.assign(window, { SpeechRecognition: NativeRecognition, webkitSpeechRecognition: NativeRecognition })
const selected = shallowRef<number | null>(props.native ? null : 0)
const config = ref<SpeechConfig>({ autoReplace: props.replace })
const autoInsert = ref(props.autoInsert ?? true)
const speechConfig = computed(() => ({
  ...config.value,
  customHandler: selected.value === null ? undefined : handlers[selected.value],
}))
const events: Event[] = []
let restart = false
const record = (name: string, text?: string) => {
  events.push({ name, text })
  if (name === 'end' && restart) {
    restart = false
    voice.value?.start()
  }
}

window.voiceFixture = {
  start: () => voice.value?.start(),
  stop: () => voice.value?.stop(),
  emit: (name, text, index, handler = 0) => {
    const callbacks = handlers[handler].callbacks[index ?? handlers[handler].callbacks.length - 1]
    if (selected.value === null && handler === 0 && index === undefined) {
      const native = NativeRecognition.instances[NativeRecognition.instances.length - 1]
      if (name === 'end') native.onend?.()
      if (name === 'error') native.onerror?.({ error: text } as SpeechRecognitionErrorEvent)
      return
    }
    if (name === 'start') callbacks.onStart()
    if (name === 'interim') callbacks.onInterim(text ?? '')
    if (name === 'final') callbacks.onFinal(text ?? '')
    if (name === 'end') callbacks.onEnd(text)
    if (name === 'error') callbacks.onError(new Error(text))
  },
  result: (results, index) =>
    NativeRecognition.instances[NativeRecognition.instances.length - 1].result(results, index),
  configure: ({ autoInsert: insert, ...options }) => {
    config.value = { ...config.value, ...options }
    if (insert !== undefined) autoInsert.value = insert
  },
  select: (handler) => {
    selected.value = handler
  },
  failure: (start, stop = '') => {
    handlers[0].startFailure = start
    handlers[0].stopFailure = stop
    const native = NativeRecognition.instances[NativeRecognition.instances.length - 1]
    if (native) native.stopFailure = stop
  },
  rejectStart: (index) => handlers[0].pendingStarts[index].reject(new Error('late start reject')),
  restartOnEnd: () => {
    restart = true
  },
  hide: () => {
    visible.value = false
  },
  snapshot: () => ({
    content: content.value,
    events: [...events],
    recording: voice.value?.speechState.isRecording ?? false,
    starts: handlers.map((handler) => handler.callbacks.length),
    stops: handlers.map((handler) => handler.stops),
    native: NativeRecognition.instances.map(({ lang, assignments, continuous, interimResults, stops, onresult }) => ({
      lang,
      assignments,
      continuous,
      interimResults,
      stops,
      listening: !!onresult,
    })),
  }),
}
</script>

<template>
  <Sender v-model="content">
    <template #actions-inline>
      <VoiceButton
        v-if="visible"
        ref="voice"
        :speech-config="speechConfig"
        :auto-insert="autoInsert"
        @speech-start="record('start')"
        @speech-interim="record('interim', $event)"
        @speech-final="record('final', $event)"
        @speech-end="record('end', $event)"
        @speech-error="record('error', $event.message)"
      />
    </template>
  </Sender>
</template>
