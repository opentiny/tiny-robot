<script setup lang="ts">
import { ref } from 'vue'
import { TrMcpExtensionForm } from '@opentiny/tiny-robot'
import type { McpExtensionFormSubmitMeta, McpExtensionFormValue } from '@opentiny/tiny-robot'

const emptyValue = (): McpExtensionFormValue => ({ name: '', type: 'streamableHttp', url: '' })
const value = ref<McpExtensionFormValue>(emptyValue())
const formKey = ref(0)
const result = ref('')

const handleSubmit = (submitted: McpExtensionFormValue, meta: McpExtensionFormSubmitMeta) => {
  result.value = `应用收到 ${submitted.name}（${meta.source}）：${submitted.url}`
}

const reset = () => {
  value.value = emptyValue()
  result.value = ''
  formKey.value += 1
}
</script>

<template>
  <section class="mcp-demo">
    <div class="extension-demo-controls">
      <button type="button" class="extension-demo-control" @click="reset">重置示例</button>
    </div>
    <tr-mcp-extension-form
      :key="formKey"
      v-model="value"
      @submit="handleSubmit"
      @cancel="result = '应用收到取消意图'"
    />
    <p aria-live="polite">{{ result || '填写名称和 HTTP 地址，然后点击“确定”。' }}</p>
  </section>
</template>

<style scoped>
.mcp-demo {
  max-width: 700px;
}
</style>
