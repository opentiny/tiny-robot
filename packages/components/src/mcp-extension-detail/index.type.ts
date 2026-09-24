export interface McpExtensionTool {
  id: string
  name: string
  description?: string
  enabled: boolean
  disabled?: boolean
}

export interface McpExtensionDetailProps {
  id: string
  name: string
  description?: string
  updatedAt?: string
  tools: McpExtensionTool[]
}

export interface McpExtensionToolToggleEvent {
  toolId: string
  enabled: boolean
}

export interface McpExtensionDetailEmits {
  (e: 'tool-toggle', event: McpExtensionToolToggleEvent): void
}
