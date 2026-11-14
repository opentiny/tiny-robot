<script setup lang="ts">
import { ref } from 'vue'
import Sender from '../../../../components/src/sender/index.vue'
import type {
  AutoSize,
  DefaultActions,
  InputMode,
  SenderSubmitExtra,
  StructuredData,
} from '../../../../components/src/sender/index.type'

interface Props {
  modelValue?: string
  defaultValue?: string
  placeholder?: string
  initialMode?: InputMode
  disabled?: boolean
  loading?: boolean
  clearable?: boolean
  maxLength?: number
  showWordLimit?: boolean
  autoSize?: AutoSize
  autofocus?: boolean
  enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
  submitType?: 'enter' | 'ctrlEnter' | 'shiftEnter'
  defaultActions?: DefaultActions
  stopText?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容...',
  initialMode: 'single',
  clearable: false,
  showWordLimit: false,
})

const senderRef = ref()
const currentValue = ref(props.modelValue)
const currentDefaultValue = ref(props.defaultValue)
const currentPlaceholder = ref(props.placeholder)
const currentMode = ref<InputMode>(props.initialMode)
const currentSize = ref<'normal' | 'small'>('normal')
const currentDisabled = ref(props.disabled)
const currentLoading = ref(props.loading)
const currentDefaultActions = ref<DefaultActions | undefined>(props.defaultActions)
const externalValue = ref('外部更新')
const replacementDefaultValue = ref('后续默认值')
const eventCounts = ref({ update: 0, input: 0, submit: 0, focus: 0, blur: 0, clear: 0, cancel: 0 })
const lastSubmit = ref('[]')
const lastAction = ref('')

const handleUpdate = (value: string) => {
  eventCounts.value.update += 1
  currentValue.value = value
}

const handleInput = () => {
  eventCounts.value.input += 1
}

const handleSubmit = (...args: [string, StructuredData?, SenderSubmitExtra?]) => {
  eventCounts.value.submit += 1
  lastSubmit.value = JSON.stringify(args.map((value) => value ?? null))
  lastAction.value = 'submit'
}

const updateDefaultValue = () => {
  currentDefaultValue.value = replacementDefaultValue.value
}

const setExternalValue = () => {
  currentValue.value = externalValue.value
}

const toggleSubmitDisabled = () => {
  currentDefaultActions.value = {
    ...currentDefaultActions.value,
    submit: {
      ...currentDefaultActions.value?.submit,
      disabled: !currentDefaultActions.value?.submit?.disabled,
    },
  }
}

const callMethod = (name: 'focus' | 'blur' | 'clear' | 'submit' | 'cancel' | 'setContent' | 'getContent') => {
  const sender = senderRef.value
  if (!sender) return

  if (name === 'setContent') {
    sender.setContent('<p>方法设置</p>')
    lastAction.value = 'setContent'
    return
  }

  if (name === 'getContent') {
    lastAction.value = `getContent:${sender.getContent()}`
    return
  }

  sender[name]()
  lastAction.value = name
}
</script>

<template>
  <main>
    <section class="fixture-controls">
      <input data-testid="external-model-input" v-model="externalValue" />
      <button data-testid="set-external-model" type="button" @click="setExternalValue">set external</button>
      <input data-testid="replacement-default-input" v-model="replacementDefaultValue" />
      <button data-testid="set-default-value" type="button" @click="updateDefaultValue">set default</button>
      <input data-testid="placeholder-input" v-model="currentPlaceholder" />
      <select v-model="currentMode" data-testid="mode-select">
        <option value="single">single</option>
        <option value="multiple">multiple</option>
      </select>
      <button
        data-testid="toggle-size"
        type="button"
        @click="currentSize = currentSize === 'normal' ? 'small' : 'normal'"
      >
        toggle size
      </button>
      <button data-testid="toggle-disabled" type="button" @click="currentDisabled = !currentDisabled">
        toggle disabled
      </button>
      <button data-testid="toggle-loading" type="button" @click="currentLoading = !currentLoading">
        toggle loading
      </button>
      <button data-testid="toggle-submit-disabled" type="button" @click="toggleSubmitDisabled">
        toggle submit disabled
      </button>
      <button data-testid="call-set-content" type="button" @click="callMethod('setContent')">setContent</button>
      <button data-testid="call-get-content" type="button" @click="callMethod('getContent')">getContent</button>
      <button data-testid="call-focus" type="button" @click="callMethod('focus')">focus</button>
      <button data-testid="call-blur" type="button" @click="callMethod('blur')">blur</button>
      <button data-testid="call-clear" type="button" @click="callMethod('clear')">clear</button>
      <button data-testid="call-submit" type="button" @click="callMethod('submit')">submit</button>
      <button data-testid="call-cancel" type="button" @click="callMethod('cancel')">cancel</button>
    </section>

    <output data-testid="update-count">{{ eventCounts.update }}</output>
    <output data-testid="input-count">{{ eventCounts.input }}</output>
    <output data-testid="submit-count">{{ eventCounts.submit }}</output>
    <output data-testid="focus-count">{{ eventCounts.focus }}</output>
    <output data-testid="blur-count">{{ eventCounts.blur }}</output>
    <output data-testid="clear-count">{{ eventCounts.clear }}</output>
    <output data-testid="cancel-count">{{ eventCounts.cancel }}</output>
    <output data-testid="last-submit">{{ lastSubmit }}</output>
    <output data-testid="last-action">{{ lastAction }}</output>
    <output data-testid="model-value">{{ currentValue ?? '' }}</output>

    <Sender
      ref="senderRef"
      data-testid="sender-root"
      :model-value="currentValue"
      :default-value="currentDefaultValue"
      :placeholder="currentPlaceholder"
      :mode="currentMode"
      :size="currentSize"
      :disabled="currentDisabled"
      :loading="currentLoading"
      :clearable="props.clearable"
      :max-length="props.maxLength"
      :show-word-limit="props.showWordLimit"
      :auto-size="props.autoSize"
      :autofocus="props.autofocus"
      :enterkeyhint="props.enterkeyhint"
      :submit-type="props.submitType"
      :default-actions="currentDefaultActions"
      :stop-text="props.stopText"
      @update:model-value="handleUpdate"
      @input="handleInput"
      @submit="handleSubmit"
      @focus="eventCounts.focus++"
      @blur="eventCounts.blur++"
      @clear="eventCounts.clear++"
      @cancel="eventCounts.cancel++"
    />
  </main>
</template>

<style scoped>
.fixture-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
