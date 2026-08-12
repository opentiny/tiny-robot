import type { ChatStructuredData } from './base'

export interface ChatSendPayload {
  readonly text: string
  readonly structuredData?: ChatStructuredData
}

export interface ChatRuntimeActionErrorPayload {
  readonly action:
    | 'send'
    | 'abort'
    | 'create-conversation'
    | 'switch-conversation'
    | 'rename-conversation'
    | 'delete-conversation'
    | 'select-model'
    | 'set-model-feature'
    | 'add-mcp-server'
    | 'remove-mcp-server'
    | 'set-mcp-server-enabled'
    | 'set-mcp-tool-enabled'
  readonly payload?: unknown
  readonly error: unknown
}
