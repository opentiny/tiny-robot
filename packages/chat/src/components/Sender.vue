<script setup lang="ts">
import { computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { useChatContext } from '../composables/useChatContext'
import type { ChatSenderUi, ChatStructuredData } from '../types'

const { input, runtime, ui } = useChatContext()
const senderUi = computed<ChatSenderUi>(() => ui.value.sender ?? {})

const senderProps = computed(() => {
  const {
    onInput: _onInput,
    onSubmit: _onSubmit,
    onCancel: _onCancel,
    onClear: _onClear,
    onFocus: _onFocus,
    onBlur: _onBlur,
    'onUpdate:modelValue': _onUpdateModelValue,
    ...sender
  } = senderUi.value as ChatSenderUi & {
    'onUpdate:modelValue'?: (value: string) => unknown
  }
  const currentRuntime = runtime.value

  return {
    ...sender,
    defaultActions: {
      ...sender.defaultActions,
      submit: {
        ...sender.defaultActions?.submit,
        disabled: input.submitDisabled.value,
      },
    },
    modelValue: input.inputValue.value,
    loading: currentRuntime.activeConversation.value?.requestState === 'processing',
    disabled: currentRuntime.sender.disabled.value,
  }
})

function handleUpdateModelValue(value: string) {
  input.setInputValue(value)
}

async function handleSubmit(text: string, structuredData?: ChatStructuredData) {
  const payload = { text, structuredData }
  const result = input.send(payload)

  await result
  senderUi.value.onSubmit?.(payload)

  return result
}

async function handleCancel() {
  const result = input.abort?.()

  await result
  senderUi.value.onCancel?.()

  return result
}

function handleInput(value: string) {
  senderUi.value.onInput?.(value)
}

function handleFocus(event: FocusEvent) {
  senderUi.value.onFocus?.(event)
}

function handleBlur(event: FocusEvent) {
  senderUi.value.onBlur?.(event)
}

function handleClear() {
  senderUi.value.onClear?.()
}
</script>

<template>
  <TrSender
    v-bind="senderProps"
    @update:model-value="handleUpdateModelValue"
    @submit="handleSubmit"
    @cancel="handleCancel"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
    @clear="handleClear"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>
    <template v-if="$slots.content" #content="slotProps">
      <slot name="content" v-bind="slotProps" />
    </template>
    <template v-if="$slots['actions-inline']" #actions-inline="slotProps">
      <slot name="actions-inline" v-bind="slotProps" />
    </template>
    <template v-if="$slots.footer" #footer="slotProps">
      <slot name="footer" v-bind="slotProps" />
    </template>
    <template v-if="$slots['footer-right']" #footer-right="slotProps">
      <slot name="footer-right" v-bind="slotProps" />
    </template>
  </TrSender>
</template>
