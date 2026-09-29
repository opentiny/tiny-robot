<script setup lang="ts">
import { ref } from 'vue'
import { TrMcpExtensionForm } from '@opentiny/tiny-robot'
import type { McpExtensionFormMode, McpExtensionFormSubmitMeta, McpExtensionFormValue } from '@opentiny/tiny-robot'

const example = (): McpExtensionFormValue => ({
  name: 'weather',
  type: 'streamableHttp',
  url: 'https://example.com/mcp',
})

const value = ref<McpExtensionFormValue>(example())
const mode = ref<McpExtensionFormMode>('code')
const formKey = ref(0)
const result = ref('')

const handleSubmit = (submitted: McpExtensionFormValue, meta: McpExtensionFormSubmitMeta) => {
  result.value = `应用收到 ${submitted.name}，提交来源：${meta.source}`
}

const reset = () => {
  value.value = example()
  mode.value = 'code'
  result.value = ''
  formKey.value += 1
}
</script>

<template>
  <section class="mcp-demo">
    <div class="demo-aux-controls">
      <button type="button" class="demo-aux-control" @click="reset">恢复示例配置</button>
    </div>
    <tr-mcp-extension-form :key="formKey" v-model="value" v-model:mode="mode" @submit="handleSubmit" />
    <p aria-live="polite">{{ result || `当前添加方式：${mode}` }}</p>
  </section>
</template>

<style scoped>
.mcp-demo {
  max-width: 700px;
}
</style>
