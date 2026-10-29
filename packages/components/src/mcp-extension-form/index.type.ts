export type McpExtensionFormMode = 'form' | 'code'

export interface McpExtensionFormValue {
  name: string
  description?: string
  type: 'sse' | 'streamableHttp'
  url: string
  headers?: Record<string, string>
  thumbnail?: string | null
}

export interface McpExtensionFormProps {
  modelValue: McpExtensionFormValue
  mode?: McpExtensionFormMode
  defaultMode?: McpExtensionFormMode
}

export interface McpExtensionFormSubmitMeta {
  source: McpExtensionFormMode
}

export interface McpExtensionFormEmits {
  (e: 'update:modelValue', value: McpExtensionFormValue): void
  (e: 'update:mode', mode: McpExtensionFormMode): void
  (e: 'submit', value: McpExtensionFormValue, meta: McpExtensionFormSubmitMeta): void
  (e: 'cancel'): void
}
