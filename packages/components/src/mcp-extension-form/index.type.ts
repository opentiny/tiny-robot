export type McpExtensionFormMode = 'form' | 'code'

import type { McpServerRegistrationConfig } from '../mcp/types'

export type McpExtensionFormValue = McpServerRegistrationConfig

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
