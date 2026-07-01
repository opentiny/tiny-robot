<script setup lang="ts">
import { computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import { useChatContext } from '../composables/useChatContext'
import type { StructuredData } from '@opentiny/tiny-robot'

const { runtime, parts } = useChatContext()

const senderProps = computed(() => {
  const sender = parts.composer?.sender ?? {}

  return {
    ...sender,
    defaultActions: {
      ...sender.defaultActions,
      submit: {
        ...sender.defaultActions?.submit,
        disabled: runtime.composer.submitDisabled.value,
      },
    },
    modelValue: runtime.composer.inputValue.value,
    loading: runtime.composer.loading.value,
    disabled: runtime.composer.disabled.value,
  }
})

function handleUpdateModelValue(value: string) {
  runtime.actions.setInputValue(value)
}

function handleSubmit(text: string, structuredData?: StructuredData) {
  runtime.actions.send({ text, structuredData })
}

function handleCancel() {
  runtime.actions.abort?.()
}
</script>

<template>
  <TrSender
    v-bind="senderProps"
    @update:model-value="handleUpdateModelValue"
    @submit="handleSubmit"
    @cancel="handleCancel"
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
