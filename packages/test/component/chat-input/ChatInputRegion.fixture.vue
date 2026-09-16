<script setup lang="ts">
import { computed, ref } from 'vue'
import ChatUI from '../../../chat/src/ChatUI.vue'
import type { ChatUIData, ChatUIOptions } from '../../../chat/src/types'

const placement = ref<'footer' | 'center'>('footer')
const hasMessages = ref(false)
const customLayoutFooter = ref(false)
const loading = ref(false)
const customPlaceholder = ref(false)
const inputValue = ref('')
const updateCount = ref(0)
const submitCount = ref(0)
const cancelCount = ref(0)
const clearCount = ref(0)
const modelFeatureChangeCount = ref(0)
const lastSubmittedText = ref('')

const data = computed<ChatUIData>(() => ({
  conversation: {
    activeId: 'conversation-1',
    title: 'Conversation 1',
  },
  bubble: {
    messages: hasMessages.value ? [{ role: 'assistant', content: 'Existing message' }] : [],
  },
  sender: {
    loading: loading.value,
    disabled: false,
    submitDisabled: false,
  },
  model: {
    options: [
      {
        id: 'model-a',
        label: 'Model A',
        capabilities: { thinking: true, search: true },
      },
    ],
    selectedId: 'model-a',
    features: { thinking: false, search: false },
  },
  mcp: {
    servers: [{ id: 'server-a', name: 'Server A', installed: true, enabled: true }],
  },
}))

const ui = computed<ChatUIOptions>(() => ({
  header: false,
  history: false,
  prompts: false,
  sender: customPlaceholder.value ? { placeholder: 'Custom placeholder' } : undefined,
  layout: {
    composer: { welcome: placement.value },
    leftAside: false,
  },
}))

function setPlacement(value: 'footer' | 'center') {
  placement.value = value
}

function handleInputValue(value: string) {
  inputValue.value = value
  updateCount.value++
}

function handleSubmit(payload: { text: string }) {
  lastSubmittedText.value = payload.text
  submitCount.value++
}

function handleCancel() {
  cancelCount.value++
}

function handleClear() {
  clearCount.value++
}

function handleModelFeatureChange() {
  modelFeatureChangeCount.value++
}
</script>

<template>
  <div>
    <div class="chat-input-controls">
      <button type="button" data-testid="footer-mode" @click="setPlacement('footer')">Footer</button>
      <button type="button" data-testid="center-mode" @click="setPlacement('center')">Center</button>
      <button type="button" data-testid="toggle-messages" @click="hasMessages = !hasMessages">Messages</button>
      <button type="button" data-testid="toggle-custom-footer" @click="customLayoutFooter = !customLayoutFooter">
        Custom footer
      </button>
      <button type="button" data-testid="toggle-loading" @click="loading = !loading">Loading</button>
      <button type="button" data-testid="toggle-placeholder" @click="customPlaceholder = !customPlaceholder">
        Placeholder
      </button>
    </div>

    <output data-testid="update-count">{{ updateCount }}</output>
    <output data-testid="submit-count">{{ submitCount }}</output>
    <output data-testid="cancel-count">{{ cancelCount }}</output>
    <output data-testid="clear-count">{{ clearCount }}</output>
    <output data-testid="model-feature-change-count">{{ modelFeatureChangeCount }}</output>
    <output data-testid="last-submitted-text">{{ lastSubmittedText }}</output>

    <ChatUI
      :data="data"
      :ui="ui"
      :input-value="inputValue"
      @update:input-value="handleInputValue"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @clear="handleClear"
      @model-feature-change="handleModelFeatureChange"
    >
      <template #layout-footer="slotProps" v-if="customLayoutFooter">
        <div data-testid="custom-layout-footer">
          <button type="button" data-testid="custom-layout-footer-submit" @click="slotProps.submit({ text: 'custom' })">
            Custom submit
          </button>
        </div>
      </template>
      <template #composer-before="slotProps">
        <span data-testid="composer-before">{{ slotProps.value }}</span>
      </template>
      <template #sender-header>
        <span data-testid="sender-header">header</span>
      </template>
      <template #sender-footer>
        <span data-testid="sender-footer">footer</span>
      </template>
      <template #sender-footer-right>
        <span data-testid="sender-footer-right">footer-right</span>
      </template>
    </ChatUI>
  </div>
</template>
