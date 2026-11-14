<script setup lang="ts">
import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'
import Sender from '../../../../components/src/sender/index.vue'
import ActionButton from '../../../../components/src/sender-actions/action-button/index.vue'
import UploadButton from '../../../../components/src/sender-actions/upload-button/index.vue'
import VoiceButton from '../../../../components/src/sender-actions/voice-button/index.vue'
import type {
  SpeechCallbacks,
  SpeechHandler,
} from '../../../../components/src/sender-actions/voice-button/speech.types'
import type { DefaultActions, SenderSubmitExtra, StructuredData } from '../../../../components/src/sender/index.type'

interface Props {
  clearable?: boolean
  loading?: boolean
  disabled?: boolean
  maxLength?: number
  showWordLimit?: boolean
  defaultActions?: DefaultActions
  stopText?: string
}

const props = withDefaults(defineProps<Props>(), {
  clearable: true,
  loading: false,
  disabled: false,
  showWordLimit: true,
})

const value = ref('')
const loading = ref(props.loading)
const disabled = ref(props.disabled)
const defaultActions = ref<DefaultActions | undefined>(props.defaultActions)
const submitCount = ref(0)
const clearCount = ref(0)
const cancelCount = ref(0)
const selectedFiles = ref<string[]>([])
const uploadError = ref('')
const fileInputClickCount = ref(0)
const voiceEvents = ref<string[]>([])
const voiceIntercepted = ref(false)
const autoInsert = ref(true)
const voiceMounted = ref(true)
let activeSpeechCallbacks: SpeechCallbacks | undefined

const PropIcon = defineComponent({
  setup() {
    return () => h('span', { 'data-testid': 'prop-icon' }, 'prop-icon')
  },
})

const SlotIcon = defineComponent({
  setup() {
    return () => h('span', { 'data-testid': 'slot-icon' }, 'slot-icon')
  },
})

const fakeSpeechHandler: SpeechHandler = {
  isSupported: () => true,
  start: (callbacks) => {
    activeSpeechCallbacks = callbacks
    callbacks.onStart()
  },
  stop: () => undefined,
}

const speechConfig = {
  customHandler: fakeSpeechHandler,
}

const onVoiceButtonClick = (_isRecording: boolean, preventDefault: () => void) => {
  if (voiceIntercepted.value) preventDefault()
}

const handleSubmit = (..._args: [string, StructuredData?, SenderSubmitExtra?]) => {
  submitCount.value += 1
}

const recordVoice = (event: string) => {
  voiceEvents.value = [...voiceEvents.value, event]
}

const handleDocumentClick = (event: Event) => {
  if ((event.target as HTMLInputElement | null)?.type === 'file') {
    fileInputClickCount.value += 1
  }
}

const toggleSubmitDisabled = () => {
  defaultActions.value = {
    ...defaultActions.value,
    submit: {
      ...defaultActions.value?.submit,
      disabled: !defaultActions.value?.submit?.disabled,
    },
  }
}

onMounted(() => document.addEventListener('click', handleDocumentClick, true))
onBeforeUnmount(() => document.removeEventListener('click', handleDocumentClick, true))
</script>

<template>
  <main>
    <div class="fixture-controls">
      <button data-testid="toggle-loading" type="button" @click="loading = !loading">loading</button>
      <button data-testid="toggle-disabled" type="button" @click="disabled = !disabled">disabled</button>
      <button data-testid="toggle-submit-disabled" type="button" @click="toggleSubmitDisabled">submit disabled</button>
      <button data-testid="emit-voice-final" type="button" @click="activeSpeechCallbacks?.onFinal('语音结果')">
        voice final
      </button>
      <button data-testid="emit-voice-interim" type="button" @click="activeSpeechCallbacks?.onInterim('临时结果')">
        voice interim
      </button>
      <button data-testid="toggle-voice-intercept" type="button" @click="voiceIntercepted = !voiceIntercepted">
        voice intercept
      </button>
      <button data-testid="toggle-auto-insert" type="button" @click="autoInsert = !autoInsert">auto insert</button>
      <button data-testid="toggle-voice-mounted" type="button" @click="voiceMounted = !voiceMounted">
        voice mounted
      </button>
    </div>
    <output data-testid="submit-count">{{ submitCount }}</output>
    <output data-testid="clear-count">{{ clearCount }}</output>
    <output data-testid="cancel-count">{{ cancelCount }}</output>
    <output data-testid="selected-files">{{ JSON.stringify(selectedFiles) }}</output>
    <output data-testid="upload-error">{{ uploadError }}</output>
    <output data-testid="file-input-click-count">{{ fileInputClickCount }}</output>
    <output data-testid="voice-events">{{ JSON.stringify(voiceEvents) }}</output>

    <Sender
      data-testid="sender-root"
      v-model="value"
      mode="single"
      :clearable="props.clearable"
      :loading="loading"
      :disabled="disabled"
      :max-length="props.maxLength"
      :show-word-limit="props.showWordLimit"
      :default-actions="defaultActions"
      :stop-text="props.stopText"
      @submit="handleSubmit"
      @clear="clearCount++"
      @cancel="cancelCount++"
    >
      <template #actions-inline>
        <div data-testid="child-actions">
          <ActionButton
            data-testid="action-button-with-slot"
            :icon="PropIcon"
            :active="true"
            size="small"
            tooltip="动作提示"
            tooltip-placement="bottom"
          >
            <template #icon>
              <SlotIcon />
            </template>
          </ActionButton>
          <ActionButton data-testid="action-button-normal" :icon="PropIcon" size="normal" />
          <ActionButton data-testid="action-button-custom" :icon="PropIcon" size="40px" />
          <UploadButton
            data-testid="upload-button"
            accept="image/*,.txt"
            :multiple="true"
            :max-count="2"
            :max-size="1"
            @select="selectedFiles = $event.map((file) => file.name)"
            @error="uploadError = $event.message"
          />
          <VoiceButton
            v-if="voiceMounted"
            data-testid="voice-button"
            :speech-config="speechConfig"
            :auto-insert="autoInsert"
            :on-button-click="onVoiceButtonClick"
            @speech-start="recordVoice('start')"
            @speech-interim="recordVoice(`interim:${$event}`)"
            @speech-final="recordVoice(`final:${$event}`)"
            @speech-end="recordVoice('end')"
            @speech-error="recordVoice(`error:${$event.message}`)"
          />
        </div>
      </template>
    </Sender>
  </main>
</template>

<style scoped>
.fixture-controls,
[data-testid='child-actions'] {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
