<script setup lang="ts">
import { ref } from 'vue'
import McpExtensionForm from '../../../components/src/mcp-extension-form/index.vue'
import type {
  McpExtensionFormMode,
  McpExtensionFormSubmitMeta,
  McpExtensionFormValue,
} from '../../../components/src/mcp-extension-form/index.type'

const props = withDefaults(
  defineProps<{
    controlledMode?: boolean
    defaultMode?: McpExtensionFormMode
  }>(),
  {
    controlledMode: true,
    defaultMode: 'form',
  },
)

const model = ref<McpExtensionFormValue>({
  name: '',
  type: 'streamableHttp',
  url: '',
})
const mode = ref<McpExtensionFormMode>('form')
const submitted = ref<unknown>()
const cancelCount = ref(0)

const handleSubmit = (value: McpExtensionFormValue, meta: McpExtensionFormSubmitMeta) => {
  submitted.value = { value, source: meta.source }
}

const replaceModel = () => {
  model.value = {
    name: 'Updated MCP',
    description: 'Updated by the host.',
    type: 'sse',
    url: 'https://example.com/sse',
    headers: { Authorization: 'Bearer token' },
    thumbnail: 'https://example.com/icon.png',
  }
}
</script>

<template>
  <button data-testid="replace-model" type="button" @click="replaceModel">Replace model</button>
  <McpExtensionForm
    v-model="model"
    :mode="props.controlledMode ? mode : undefined"
    :default-mode="props.defaultMode"
    @update:mode="mode = $event"
    @submit="handleSubmit"
    @cancel="cancelCount += 1"
  />
  <output data-testid="model-output">{{ JSON.stringify(model) }}</output>
  <output data-testid="mode-output">{{ mode }}</output>
  <output data-testid="submit-output">{{ JSON.stringify(submitted) }}</output>
  <output data-testid="cancel-count">{{ cancelCount }}</output>
</template>
