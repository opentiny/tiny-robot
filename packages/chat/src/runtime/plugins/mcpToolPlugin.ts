import { toolPlugin, type UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatRunConfig } from '../../types'
import { CHAT_RUN_CONFIG_CONTEXT_KEY } from '../runConfig'

const TOOL_SNAPSHOT_CONTEXT_KEY = '__chat_tool_snapshot'

export interface ChatMcpToolDefinition {
  serverId: string
  id: string
  name: string
  originalName: string
  description?: string
  inputSchema?: Record<string, unknown>
}

export type ChatToolListTools = (
  serverIds: readonly string[],
  toolIds: Readonly<Record<string, readonly string[]>>,
) => Promise<readonly ChatMcpToolDefinition[]>

export type ChatToolCallTool = (serverId: string, toolName: string, args: Record<string, unknown>) => Promise<unknown>

function resolveToolCall(name: string, toolRunConfig: NonNullable<ChatRunConfig['mcp']>) {
  for (const serverId of toolRunConfig.serverIds) {
    const toolId = toolRunConfig.toolIds[serverId]?.find((candidate) => `${serverId}__${candidate}` === name)

    if (toolId) {
      return { serverId, toolId }
    }
  }

  return null
}

export function createMcpToolPlugin(listTools: ChatToolListTools, callTool: ChatToolCallTool): UseMessagePlugin {
  return toolPlugin({
    getTools: async ({ customContext, setCustomContext }) => {
      const runConfig = customContext[CHAT_RUN_CONFIG_CONTEXT_KEY] as ChatRunConfig | undefined
      const toolRunConfig = runConfig?.mcp

      if (!toolRunConfig) {
        return []
      }

      const serverWithoutToolSelection = toolRunConfig.serverIds.find(
        (serverId) => !Object.prototype.hasOwnProperty.call(toolRunConfig.toolIds, serverId),
      )

      if (serverWithoutToolSelection) {
        throw new Error(`Tool selection is missing for this turn: ${serverWithoutToolSelection}`)
      }

      let tools = customContext[TOOL_SNAPSHOT_CONTEXT_KEY] as readonly ChatMcpToolDefinition[] | undefined

      if (!Array.isArray(tools)) {
        tools = (await listTools(toolRunConfig.serverIds, toolRunConfig.toolIds)).map((tool) => ({ ...tool }))
        setCustomContext({
          [TOOL_SNAPSHOT_CONTEXT_KEY]: tools,
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
      const runConfig = customContext[CHAT_RUN_CONFIG_CONTEXT_KEY] as ChatRunConfig | undefined
      const toolRunConfig = runConfig?.mcp
      const rawName = toolCall.function?.name ?? ''
      const resolvedTool = toolRunConfig ? resolveToolCall(rawName, toolRunConfig) : null
      const toolSnapshot = customContext[TOOL_SNAPSHOT_CONTEXT_KEY] as readonly ChatMcpToolDefinition[] | undefined
      const exposedTool = Array.isArray(toolSnapshot) ? toolSnapshot.find((tool) => tool.name === rawName) : undefined

      if (
        !toolRunConfig ||
        !resolvedTool ||
        !exposedTool ||
        exposedTool.serverId !== resolvedTool.serverId ||
        exposedTool.id !== resolvedTool.toolId
      ) {
        throw new Error(`Tool is not enabled in this turn: ${rawName}`)
      }

      const rawArguments = toolCall.function?.arguments
      let argumentsValue: Record<string, unknown> = {}

      if (rawArguments && rawArguments.trim()) {
        try {
          argumentsValue = JSON.parse(rawArguments) as Record<string, unknown>
        } catch {
          throw new Error(`Invalid JSON arguments for MCP tool "${rawName}".`)
        }
      }

      return callTool(exposedTool.serverId, exposedTool.originalName, argumentsValue)
    },
  })
}
