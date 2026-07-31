import { toolPlugin, type UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatMessageItem, ChatRunConfig } from '@opentiny/tiny-robot-chat'
import { readRunConfigFromMessage } from '@opentiny/tiny-robot-chat'
import type { ModelDefinition } from './models'
import type { McpToolItem } from './useMcp'

function getLastUserMessage(currentTurn: ChatMessageItem[]) {
  return [...currentTurn].reverse().find((message) => message.role === 'user')
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

export function createModelRequestPlugin(
  resolveModel: (modelId: string) => ModelDefinition | undefined,
): UseMessagePlugin {
  return {
    name: 'chat-model-request',
    onBeforeRequest({ customContext, requestBody }) {
      const runConfig = customContext.runConfig as ChatRunConfig | undefined
      const model = runConfig?.modelId ? resolveModel(runConfig.modelId) : null
      const reasoningEnabled = runConfig?.reasoning?.enabled ?? runConfig?.features?.thinking

      if (!model) {
        return
      }

      const thinkingParams = reasoningEnabled
        ? model.featureParams?.thinking?.enabled
        : model.featureParams?.thinking?.disabled

      if (thinkingParams) {
        Object.assign(requestBody, thinkingParams)
      }

      if (
        runConfig?.reasoning?.effort &&
        model.reasoningEffortParam &&
        model.reasoningEfforts?.includes(runConfig.reasoning.effort)
      ) {
        Object.assign(requestBody, {
          [model.reasoningEffortParam]: runConfig.reasoning.effort,
        })
      }

      const searchParams = runConfig?.features?.search
        ? model.featureParams?.search?.enabled
        : model.featureParams?.search?.disabled

      if (searchParams) {
        Object.assign(requestBody, searchParams)
      }
    },
  }
}

export function createMcpToolPlugin(
  listTools: (serverIds: readonly string[]) => Promise<McpToolItem[]>,
  callTool: (serverId: string, toolName: string, args: Record<string, unknown>) => Promise<unknown>,
): UseMessagePlugin {
  return toolPlugin({
    getTools: async ({ customContext }) => {
      const runConfig = customContext.runConfig as ChatRunConfig | undefined
      const tools = await listTools(runConfig?.mcpServerIds ?? [])

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
      const enabledServerIds = runConfig?.mcpServerIds ?? []
      const rawName = toolCall.function?.name ?? ''
      const [serverId, ...nameParts] = rawName.split('__')

      if (!serverId || !enabledServerIds.includes(serverId)) {
        throw new Error(`MCP server is not enabled in this turn: ${serverId}`)
      }

      return callTool(
        serverId,
        nameParts.join('__'),
        JSON.parse(toolCall.function?.arguments ?? '{}') as Record<string, unknown>,
      )
    },
  })
}
