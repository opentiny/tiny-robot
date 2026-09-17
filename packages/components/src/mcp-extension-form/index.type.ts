export type McpExtensionFormAddType = 'form' | 'code'

export interface McpExtensionFormData {
  name: string
  description: string
  type: 'sse' | 'streamableHttp'
  url: string
  headers: string
  thumbnail?: string | null
}

export interface McpExtensionFormModel {
  addType: McpExtensionFormAddType
  form: McpExtensionFormData
  code: string
}

export interface McpExtensionValue extends Omit<McpExtensionFormData, 'headers'> {
  headers: Record<string, unknown>
}

export type McpExtensionFormSubmitPayload =
  { source: 'form'; value: McpExtensionValue } | { source: 'code'; value: string }

export interface McpExtensionFormProps {
  modelValue: McpExtensionFormModel
  submitting?: boolean
}

export interface McpExtensionFormEmits {
  (e: 'update:modelValue', value: McpExtensionFormModel): void
  (e: 'submit', payload: McpExtensionFormSubmitPayload): void
  (e: 'cancel'): void
}
