import { McpExtensionDetail, McpExtensionForm, TrMcpExtensionDetail, TrMcpExtensionForm } from '../index'
import type {
  McpExtensionDetailEmits,
  McpExtensionDetailProps,
  McpExtensionFormEmits,
  McpExtensionFormMode,
  McpExtensionFormProps,
  McpExtensionFormValue,
  McpExtensionToolToggleEvent,
} from '../index'

const model: McpExtensionFormValue = {
  name: 'Weather MCP',
  type: 'streamableHttp',
  url: 'https://example.com/mcp',
}

const mode: McpExtensionFormMode = 'code'
const formProps: McpExtensionFormProps = { modelValue: model, mode, defaultMode: 'form' }
const detailProps: McpExtensionDetailProps = {
  id: 'weather',
  name: 'Weather MCP',
  description: 'Weather tools',
  updatedAt: '2026-07-10',
  tools: [{ id: 'forecast', name: 'forecast', enabled: true }],
}
const toggleEvent: McpExtensionToolToggleEvent = { toolId: 'forecast', enabled: false }

declare const formEmit: McpExtensionFormEmits
formEmit('update:modelValue', model)
formEmit('update:mode', mode)
formEmit('submit', model, { source: 'form' })
formEmit('cancel')

declare const detailEmit: McpExtensionDetailEmits
detailEmit('tool-toggle', toggleEvent)

void McpExtensionForm
void TrMcpExtensionForm
void McpExtensionDetail
void TrMcpExtensionDetail
void formProps
void detailProps
