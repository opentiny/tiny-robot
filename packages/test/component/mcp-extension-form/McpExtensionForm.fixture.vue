<script setup lang="ts">
import { computed, ref } from 'vue'
import McpExtensionForm from '../../../components/src/mcp-extension-form/index.vue'

const model = ref({
  addType: 'form' as const,
  form: {
    name: '',
    description: '',
    type: 'streamableHttp' as const,
    url: '',
    headers: '',
    thumbnail: null,
  },
  code: '',
})
const submitted = ref<unknown>()
const cancelCount = ref(0)
const submitting = ref(false)

const componentModel = computed<typeof model.value>(() => JSON.parse(JSON.stringify(model.value)))

const handleUpdate = (value: typeof model.value) => {
  model.value = value
}

const handleSubmit = (payload: unknown) => {
  submitted.value = payload
}

const replaceModel = () => {
  model.value = {
    addType: 'form',
    form: {
      name: 'Updated MCP',
      description: 'Updated by the host.',
      type: 'sse',
      url: 'https://example.com/sse',
      headers: '{"Authorization":"Bearer token"}',
      thumbnail: 'https://example.com/icon.png',
    },
    code: '{"existing":true}',
  }
}
</script>

<template>
  <button data-testid="replace-model" type="button" @click="replaceModel">Replace model</button>
  <button data-testid="toggle-submitting" type="button" @click="submitting = !submitting">Toggle submitting</button>
  <McpExtensionForm
    :model-value="componentModel"
    :submitting="submitting"
    @update:model-value="handleUpdate"
    @submit="handleSubmit"
    @cancel="cancelCount += 1"
  />
  <output data-testid="model-output">{{ JSON.stringify(model) }}</output>
  <output data-testid="submit-output">{{ JSON.stringify(submitted) }}</output>
  <output data-testid="cancel-count">{{ cancelCount }}</output>
</template>
