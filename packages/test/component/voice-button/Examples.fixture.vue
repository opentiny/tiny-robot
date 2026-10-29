<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useSpeechHandler } from '../../../components/src/sender-actions/voice-button/useSpeechHandler'
import type { SpeechCallbacks } from '../../../components/src/sender-actions/voice-button/speech.types'
import { MockSpeechHandler } from '../../../../docs/demos/sender/mockSpeechHandler'
import { MockSpeechHandler as ServiceMock } from '../../../../docs/demos/sender/speechHandlers'
import CustomUI from '../../../../docs/demos/sender/voice-custom-ui.vue'
import VoiceInput from '../../../../docs/demos/sender/voice-input.vue'
import VoiceCustom from '../../../../docs/demos/sender/voice-custom.vue'

const props = defineProps<{ example: 'mock' | 'serviceMock' | 'ui' | 'input' | 'custom'; delayedStop?: boolean }>()
const text = ref('')
const ends = ref(0)
const handler = props.example === 'serviceMock' ? new ServiceMock() : new MockSpeechHandler()
const { start, stop, speechState } = useSpeechHandler({
  customHandler: handler,
  onStart: () => {
    text.value = ''
  },
  onFinal: (value) => {
    text.value += value
  },
  onEnd: () => {
    ends.value++
  },
})

if (props.delayedStop) {
  const originalStart = MockSpeechHandler.prototype.start
  const originalStop = MockSpeechHandler.prototype.stop
  const callbacks = new WeakMap<MockSpeechHandler, SpeechCallbacks>()
  MockSpeechHandler.prototype.start = function (listener) {
    let committed = ''
    const adapted = {
      ...listener,
      onFinal: (value: string) => {
        committed += value
        listener.onFinal(value)
      },
      onEnd: () => listener.onEnd(committed || undefined),
    }
    originalStart.call(this, adapted)
    callbacks.set(this, adapted)
  }
  MockSpeechHandler.prototype.stop = function () {
    const listener = callbacks.get(this)
    if (!listener) {
      originalStop.call(this)
      return
    }
    callbacks.delete(this)
    setTimeout(() => {
      listener.onFinal('停止后的结果')
      originalStop.call(this)
    }, 100)
  }
  onUnmounted(() => {
    MockSpeechHandler.prototype.start = originalStart
    MockSpeechHandler.prototype.stop = originalStop
  })
}
</script>

<template>
  <div>
    <CustomUI v-if="example === 'ui'" />
    <VoiceInput v-else-if="example === 'input'" />
    <VoiceCustom v-else-if="example === 'custom'" />
    <template v-else>
      <button @click="start">start</button>
      <button @click="stop">stop</button>
      <output data-testid="recording">{{ speechState.isRecording }}</output>
      <output data-testid="text">{{ text }}</output>
      <output data-testid="ends">{{ ends }}</output>
    </template>
  </div>
</template>
