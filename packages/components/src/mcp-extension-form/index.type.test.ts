import { McpExtensionDetail, McpExtensionForm, TrMcpExtensionDetail, TrMcpExtensionForm } from '../index'
import type {
  McpExtensionDetailEmits,
  McpExtensionDetailProps,
  McpExtensionFormEmits,
  McpExtensionFormModel,
  McpExtensionFormProps,
  McpExtensionToolToggleEvent,
} from '../index'

const model: McpExtensionFormModel = {
  addType: 'form',
  form: {
    name: 'Weather MCP',
    description: 'Weather tools',
    type: 'streamableHttp',
    url: 'https://example.com/mcp',
    headers: '{}',
    thumbnail: null,
  },
  code: '{}',
}

const formProps: McpExtensionFormProps = { modelValue: model, submitting: false }
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
formEmit('submit', {
  source: 'form',
  value: { ...model.form, headers: {} },
})
formEmit('submit', { source: 'code', value: '{}' })
formEmit('cancel')

declare const detailEmit: McpExtensionDetailEmits
detailEmit('tool-toggle', toggleEvent)

void McpExtensionForm
void TrMcpExtensionForm
void McpExtensionDetail
void TrMcpExtensionDetail
void formProps
void detailProps
