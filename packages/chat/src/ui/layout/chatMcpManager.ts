import type { ExtensionManagerItem, ExtensionManagerTab } from '@opentiny/tiny-robot'
import type { ChatLabels, ChatMcpServerView, ChatMcpView } from '../../types'

type McpManagerLabels = Pick<ChatLabels, 'mcp' | 'mcpInstallServer' | 'mcpRetryServer' | 'mcpRemoveServer'>

function getMcpErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message.trim().slice(0, 240)
  if (typeof error === 'string' && error.trim()) return error.trim().slice(0, 240)
  return '连接失败，请重试'
}

export function getChatMcpServerDescription(server: ChatMcpServerView) {
  if (!server.error) return server.description
  const error = `连接失败：${getMcpErrorMessage(server.error)}`
  return server.description ? `${server.description}；${error}` : error
}

function toManagerItem(
  server: ChatMcpServerView,
  labels: McpManagerLabels,
  fallbackIcon?: string,
): ExtensionManagerItem {
  const disabled = Boolean(server.loading)

  return {
    id: server.id,
    name: server.name,
    description: getChatMcpServerDescription(server),
    icon: server.icon ?? fallbackIcon,
    installed: server.installed,
    tags: server.category ? [server.category] : [],
    nameClickable: server.installed && !disabled,
    progress: disabled ? 'indeterminate' : undefined,
    actions: server.installed
      ? [
          ...(server.error
            ? [
                {
                  id: 'retry',
                  type: 'button' as const,
                  label: labels.mcpRetryServer,
                  disabled,
                },
              ]
            : []),
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
