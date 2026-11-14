<script setup lang="ts">
import { ref } from 'vue'
import Sender from '../../../../components/src/sender/index.vue'
import type { InputMode } from '../../../../components/src/sender/index.type'

interface Props {
  mode?: InputMode
  placeholder?: string
  autofocus?: boolean
  enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'single',
  placeholder: '编辑器占位',
  autofocus: false,
  enterkeyhint: 'send',
})

const modelValue = ref('')
const currentPlaceholder = ref(props.placeholder)
const inputCount = ref(0)

const handleInput = () => {
  inputCount.value += 1
}
</script>

<template>
  <main>
    <output data-testid="input-count">{{ inputCount }}</output>
    <output data-testid="model-value">{{ modelValue }}</output>
    <input data-testid="placeholder-input" v-model="currentPlaceholder" />
    <Sender
      data-testid="sender-root"
      v-model="modelValue"
      :mode="props.mode"
      :placeholder="currentPlaceholder"
      :autofocus="props.autofocus"
      :enterkeyhint="props.enterkeyhint"
      @input="handleInput"
    />
  </main>
</template>
