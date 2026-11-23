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

interface ToolSnapshot {
  runConfig?: NonNullable<ChatRunConfig['mcp']>
  tools: readonly ChatMcpToolDefinition[]
}

interface CreateMcpToolPluginOptions {
  refresh?: () => Promise<void> | void
  resolveRunConfig?: (runConfig: ChatRunConfig | undefined) => ChatRunConfig | undefined
}

function readToolSnapshot(value: unknown, fallbackRunConfig?: ChatRunConfig): ToolSnapshot | undefined {
  if (Array.isArray(value)) {
    return { runConfig: fallbackRunConfig?.mcp, tools: value as ChatMcpToolDefinition[] }
  }

  if (value && typeof value === 'object' && 'tools' in value && Array.isArray((value as { tools?: unknown }).tools)) {
    return value as ToolSnapshot
  }

  return undefined
}

function resolveToolCall(name: string, toolRunConfig: NonNullable<ChatRunConfig['mcp']>) {
  for (const serverId of toolRunConfig.serverIds) {
    const toolId = toolRunConfig.toolIds[serverId]?.find((candidate) => `${serverId}__${candidate}` === name)

    if (toolId) {
      return { serverId, toolId }
    }
  }

  return null
}

export function createMcpToolPlugin(
  listTools: ChatToolListTools,
  callTool: ChatToolCallTool,
  options: CreateMcpToolPluginOptions = {},
): UseMessagePlugin {
  return toolPlugin({
    getTools: async ({ customContext, setCustomContext }) => {
      await options.refresh?.()

      const storedRunConfig = customContext[CHAT_RUN_CONFIG_CONTEXT_KEY] as ChatRunConfig | undefined
      const runConfig = options.resolveRunConfig?.(storedRunConfig) ?? storedRunConfig
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

      const tools = (await listTools(toolRunConfig.serverIds, toolRunConfig.toolIds)).map((tool) => ({ ...tool }))
      setCustomContext({
        [TOOL_SNAPSHOT_CONTEXT_KEY]: {
          runConfig: {
            serverIds: [...toolRunConfig.serverIds],
            toolIds: Object.fromEntries(
              Object.entries(toolRunConfig.toolIds).map(([serverId, toolIds]) => [serverId, [...toolIds]]),
            ),
          },
          tools,
        } satisfies ToolSnapshot,
      })

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
      const storedRunConfig = customContext[CHAT_RUN_CONFIG_CONTEXT_KEY] as ChatRunConfig | undefined
      const rawName = toolCall.function?.name ?? ''
      const snapshot = readToolSnapshot(customContext[TOOL_SNAPSHOT_CONTEXT_KEY], storedRunConfig)
      const toolRunConfig = snapshot?.runConfig
      const resolvedTool = toolRunConfig ? resolveToolCall(rawName, toolRunConfig) : null
      const exposedTool = snapshot?.tools.find((tool) => tool.name === rawName)

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
        let parsed: unknown
        try {
          parsed = JSON.parse(rawArguments)
        } catch {
          throw new Error(`Invalid JSON arguments for MCP tool "${rawName}".`)
        }

        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error(`Arguments for MCP tool "${rawName}" must be a JSON object.`)
        }

        argumentsValue = parsed as Record<string, unknown>
      }

      return callTool(exposedTool.serverId, exposedTool.originalName, argumentsValue)
    },
  })
}
