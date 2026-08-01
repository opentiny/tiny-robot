import { toolPlugin, type UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatMessageItem, ChatRunConfig } from '../../src/types'
import { readRunConfigFromMessage } from '../../src/utils/runConfig'
import type { McpToolItem } from './useMcp'

const MCP_TOOL_SNAPSHOT_CONTEXT_KEY = '__chat_demo_mcp_tool_snapshot'

function getLastUserMessage(currentTurn: ChatMessageItem[]) {
  return [...currentTurn].reverse().find((message) => message.role === 'user')
}

function resolveMcpToolCall(name: string, mcpConfig: NonNullable<ChatRunConfig['mcp']>) {
  for (const serverId of mcpConfig.serverIds) {
    const toolId = mcpConfig.toolIds[serverId]?.find((candidate) => `${serverId}__${candidate}` === name)

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

export function createModelRequestPlugin(runtime: {
  resolveModel: (modelId: string) => { requestModel: string } | undefined
}): UseMessagePlugin {
  return {
    name: 'chat-model-request',
    onBeforeRequest({ customContext, requestBody }) {
      const runConfig = customContext.runConfig as ChatRunConfig | undefined
      const model = runConfig?.modelId ? runtime.resolveModel(runConfig.modelId) : null
      const reasoningEnabled = runConfig?.reasoning?.enabled ?? runConfig?.features?.thinking

      if (model) {
        requestBody.model = model.requestModel
      }

      if (reasoningEnabled !== undefined) {
        requestBody.thinking = {
          type: reasoningEnabled ? 'enabled' : 'disabled',
        }
      }

      if (runConfig?.reasoning?.effort) {
        requestBody.reasoning_effort = runConfig.reasoning.effort
      }

      if (runConfig?.features?.search) {
        requestBody.enable_search = true
      }
    },
  }
}

export function createMcpToolPlugin(runtime: {
  listTools: (
    serverIds: readonly string[],
    toolIds: Readonly<Record<string, readonly string[]>>,
  ) => Promise<readonly McpToolItem[]>
  callTool: (serverId: string, toolName: string, args: Record<string, unknown>) => Promise<unknown>
}): UseMessagePlugin {
  return toolPlugin({
    getTools: async ({ customContext, setCustomContext }) => {
      const runConfig = customContext.runConfig as ChatRunConfig | undefined
      const mcpConfig = runConfig?.mcp

      if (!mcpConfig) {
        return []
      }

      const serverWithoutToolSelection = mcpConfig.serverIds.find(
        (serverId) => !Object.prototype.hasOwnProperty.call(mcpConfig.toolIds, serverId),
      )

      if (serverWithoutToolSelection) {
        throw new Error(`MCP tool selection is missing for this turn: ${serverWithoutToolSelection}`)
      }

      let tools = customContext[MCP_TOOL_SNAPSHOT_CONTEXT_KEY] as readonly McpToolItem[] | undefined

      if (!Array.isArray(tools)) {
        tools = (await runtime.listTools(mcpConfig.serverIds, mcpConfig.toolIds)).map((tool) => ({ ...tool }))
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
      const mcpConfig = runConfig?.mcp
      const rawName = toolCall.function?.name ?? ''
      const resolvedTool = mcpConfig ? resolveMcpToolCall(rawName, mcpConfig) : null
      const toolSnapshot = customContext[MCP_TOOL_SNAPSHOT_CONTEXT_KEY] as readonly McpToolItem[] | undefined
      const exposedTool = Array.isArray(toolSnapshot) ? toolSnapshot.find((tool) => tool.name === rawName) : undefined

      if (
        !mcpConfig ||
        !resolvedTool ||
        !exposedTool ||
        exposedTool.serverId !== resolvedTool.serverId ||
        exposedTool.id !== resolvedTool.toolId
      ) {
        throw new Error(`MCP tool is not enabled in this turn: ${rawName}`)
      }

      return runtime.callTool(
        exposedTool.serverId,
        exposedTool.originalName,
        JSON.parse(toolCall.function?.arguments ?? '{}') as Record<string, unknown>,
      )
    },
  })
}
