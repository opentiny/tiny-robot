import { toolPlugin, type UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatMessageItem, ChatRunConfig } from '../../src/types'
import { readRunConfigFromMessage } from '../../src/utils/runConfig'

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listTools: (serverIds: readonly string[]) => Promise<any[]>
  callTool: (serverId: string, toolName: string, args: Record<string, unknown>) => Promise<unknown>
}): UseMessagePlugin {
  return toolPlugin({
    getTools: async ({ customContext }) => {
      const runConfig = customContext.runConfig as ChatRunConfig | undefined
      const tools = await runtime.listTools(runConfig?.mcpServerIds ?? [])

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

      return runtime.callTool(
        serverId,
        nameParts.join('__'),
        JSON.parse(toolCall.function?.arguments ?? '{}') as Record<string, unknown>,
      )
    },
  })
}
