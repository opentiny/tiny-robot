import type { ExtensionManagerItem, ExtensionManagerTab } from '@opentiny/tiny-robot'
import type { ChatLabels, ChatMcpServerView, ChatMcpView } from '../../types'

type McpManagerLabels = Pick<ChatLabels, 'mcp' | 'mcpInstallServer' | 'mcpRemoveServer'>

function toManagerItem(
  server: ChatMcpServerView,
  labels: McpManagerLabels,
  fallbackIcon?: string,
): ExtensionManagerItem {
  const disabled = Boolean(server.loading)

  return {
    id: server.id,
    name: server.name,
    description: server.description,
    icon: server.icon ?? fallbackIcon,
    installed: server.installed,
    tags: server.category ? [server.category] : [],
    nameClickable: server.installed && !disabled,
    progress: disabled ? 'indeterminate' : undefined,
    actions: server.installed
      ? [
          {
            id: 'toggle',
            type: 'switch',
            label: '',
            checked: server.enabled,
            disabled,
          },
          {
            id: 'remove',
            type: 'button',
            label: labels.mcpRemoveServer,
            danger: true,
            disabled,
          },
        ]
      : [{ id: 'add', type: 'button', label: `${labels.mcpInstallServer}`, disabled }],
  }
}

export function createChatMcpManagerTab(
  mcp: ChatMcpView,
  labels: McpManagerLabels,
  fallbackIcon?: string,
): ExtensionManagerTab {
  return {
    id: 'mcp',
    label: labels.mcp,
    items: (mcp.servers ?? []).map((server) => toManagerItem(server, labels, fallbackIcon)),
  }
}
