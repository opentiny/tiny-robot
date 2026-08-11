import { toolPlugin, type UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatMessageItem, ChatRunConfig } from '@opentiny/tiny-robot-chat'
import { readRunConfigFromMessage } from '@opentiny/tiny-robot-chat'
import type { McpToolItem } from './useMcp'

const MCP_TOOL_SNAPSHOT_CONTEXT_KEY = '__chat_basic_mcp_tool_snapshot'

function getLastUserMessage(currentTurn: ChatMessageItem[]) {
  return [...currentTurn].reverse().find((message) => message.role === 'user')
}

function resolveMcpToolCall(name: string, mcpRunConfig: NonNullable<ChatRunConfig['mcp']>) {
  for (const serverId of mcpRunConfig.serverIds) {
    const toolId = mcpRunConfig.toolIds[serverId]?.find((candidate) => `${serverId}__${candidate}` === name)

    if (toolId) {
      return { serverId, toolId }
    }
  }

  return null
}

export function createRunConfigPlugin(): UseMessagePlugin {
  return {
    name: 'chat-run-config',
    onTurnStart({ currentTurn, setCustomContext }) {
      setCustomContext({
        runConfig: readRunConfigFromMessage(getLastUserMessage(currentTurn)),
      })
    },
  }
}

export function createMcpToolPlugin(
  listTools: (
    serverIds: readonly string[],
    toolIds: Readonly<Record<string, readonly string[]>>,
  ) => Promise<McpToolItem[]>,
  callTool: (serverId: string, toolName: string, args: Record<string, unknown>) => Promise<unknown>,
): UseMessagePlugin {
  return toolPlugin({
    getTools: async ({ customContext, setCustomContext }) => {
      const runConfig = customContext.runConfig as ChatRunConfig | undefined
      const mcpRunConfig = runConfig?.mcp

      if (!mcpRunConfig) {
        return []
      }

      const serverWithoutToolSelection = mcpRunConfig.serverIds.find(
        (serverId) => !Object.prototype.hasOwnProperty.call(mcpRunConfig.toolIds, serverId),
      )

      if (serverWithoutToolSelection) {
        throw new Error(`MCP tool selection is missing for this turn: ${serverWithoutToolSelection}`)
      }

      let tools = customContext[MCP_TOOL_SNAPSHOT_CONTEXT_KEY] as readonly McpToolItem[] | undefined

      if (!Array.isArray(tools)) {
        tools = (await listTools(mcpRunConfig.serverIds, mcpRunConfig.toolIds)).map((tool) => ({ ...tool }))
        setCustomContext({
          [MCP_TOOL_SNAPSHOT_CONTEXT_KEY]: tools,
        })
      }

      return tools.map((tool) => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description ?? '',
          parameters: tool.inputSchema ?? { type: 'object', properties: {} },
        },
      }))
    },

    callTool: async (toolCall, { customContext }) => {
      const runConfig = customContext.runConfig as ChatRunConfig | undefined
      const mcpRunConfig = runConfig?.mcp
      const rawName = toolCall.function?.name ?? ''
      const resolvedTool = mcpRunConfig ? resolveMcpToolCall(rawName, mcpRunConfig) : null
      const toolSnapshot = customContext[MCP_TOOL_SNAPSHOT_CONTEXT_KEY] as readonly McpToolItem[] | undefined
      const exposedTool = Array.isArray(toolSnapshot) ? toolSnapshot.find((tool) => tool.name === rawName) : undefined

      if (
        !mcpRunConfig ||
        !resolvedTool ||
        !exposedTool ||
        exposedTool.serverId !== resolvedTool.serverId ||
        exposedTool.id !== resolvedTool.toolId
      ) {
        throw new Error(`MCP tool is not enabled in this turn: ${rawName}`)
      }

      return callTool(
        exposedTool.serverId,
        exposedTool.originalName,
        JSON.parse(toolCall.function?.arguments ?? '{}') as Record<string, unknown>,
      )
    },
  })
}
