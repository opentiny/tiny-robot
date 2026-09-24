import type { McpExtensionFormValue } from './index.type'

export interface McpExtensionFormDraft {
  name: string
  description: string
  type: McpExtensionFormValue['type']
  url: string
  headers: string
  thumbnail: string | null
}
