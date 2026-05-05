import { computed, ref } from 'vue'
import type { MaybePromise, Tool, ToolCall } from '@opentiny/tiny-robot-kit'
import type { PluginInfo, PluginTool } from '@opentiny/tiny-robot'

export interface McpToolContext {
  plugin: PluginInfo
  tool: PluginTool
  installedPlugins: PluginInfo[]
}

export interface McpPluginContext {
  installedPlugins: PluginInfo[]
}

export interface UseMcpManagerBridge {
  getTools?: (context: McpPluginContext) => MaybePromise<Tool[]>
  callTool?: (toolCall: ToolCall, context: McpToolContext) => MaybePromise<string | Record<string, unknown>>
  onPluginToggle?: (plugin: PluginInfo, enabled: boolean, context: McpPluginContext) => MaybePromise<void>
  onToolToggle?: (plugin: PluginInfo, toolId: string, enabled: boolean, context: McpPluginContext) => MaybePromise<void>
  onPluginCreate?: (type: 'form' | 'code', data: unknown, context: McpPluginContext) => MaybePromise<PluginInfo | void>
  onPluginDelete?: (plugin: PluginInfo, context: McpPluginContext) => MaybePromise<void>
}

export interface UseMcpManagerOptions {
  initialPlugins?: PluginInfo[]
  bridge?: UseMcpManagerBridge
}

function clonePlugins(plugins: PluginInfo[]): PluginInfo[] {
  return plugins.map((plugin) => ({
    ...plugin,
    tools: plugin.tools.map((tool) => ({ ...tool })),
  }))
}

function createPluginContext(installedPlugins: PluginInfo[]): McpPluginContext {
  return {
    installedPlugins,
  }
}

function normalizeToolResult(result: string | Record<string, unknown>): string {
  return typeof result === 'string' ? result : JSON.stringify(result)
}

function createMissingBridgeError(toolName: string): string {
  return JSON.stringify({
    error: `No MCP bridge configured for tool "${toolName}"`,
  })
}

export function useMcpManager(options: UseMcpManagerOptions = {}) {
  const installedPlugins = ref<PluginInfo[]>(clonePlugins(options.initialPlugins ?? []))
  const bridge = options.bridge

  const getTools = async (): Promise<Tool[]> => {
    if (bridge?.getTools) {
      return await bridge.getTools(createPluginContext(installedPlugins.value))
    }

    const tools: Tool[] = []

    for (const plugin of installedPlugins.value) {
      if (!plugin.enabled) {
        continue
      }

      for (const tool of plugin.tools) {
        if (!tool.enabled) {
          continue
        }

        tools.push({
          type: 'function',
          function: {
            name: `${plugin.id}__${tool.id}`,
            description: tool.description,
            parameters: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
        })
      }
    }

    return tools
  }

  const callTool = async (toolCall: ToolCall): Promise<string> => {
    const toolName = toolCall.function.name
    const [pluginId, toolId] = toolName.split('__')

    const plugin = installedPlugins.value.find((item) => item.id === pluginId)
    if (!plugin) {
      return JSON.stringify({ error: `Plugin not found: ${pluginId}` })
    }

    const tool = plugin.tools.find((item) => item.id === toolId)
    if (!tool) {
      return JSON.stringify({ error: `Tool not found: ${toolId}` })
    }

    if (!bridge?.callTool) {
      return createMissingBridgeError(toolName)
    }

    return normalizeToolResult(
      await bridge.callTool(toolCall, {
        plugin,
        tool,
        installedPlugins: installedPlugins.value,
      }),
    )
  }

  async function handlePluginToggle(plugin: PluginInfo, enabled: boolean) {
    const target = installedPlugins.value.find((item) => item.id === plugin.id)
    if (target) {
      target.enabled = enabled
      if (!enabled) {
        target.tools.forEach((tool) => {
          tool.enabled = false
        })
      }
    }

    await bridge?.onPluginToggle?.(plugin, enabled, createPluginContext(installedPlugins.value))
  }

  async function handleToolToggle(plugin: PluginInfo, toolId: string, enabled: boolean) {
    const target = installedPlugins.value.find((item) => item.id === plugin.id)
    if (target) {
      const tool = target.tools.find((item) => item.id === toolId)
      if (tool) {
        tool.enabled = enabled
      }
    }

    await bridge?.onToolToggle?.(plugin, toolId, enabled, createPluginContext(installedPlugins.value))
  }

  async function handlePluginCreate(type: 'form' | 'code', data: unknown) {
    const plugin = await bridge?.onPluginCreate?.(type, data, createPluginContext(installedPlugins.value))
    if (!plugin) {
      return
    }

    const nextPlugin = clonePlugins([plugin])[0]
    const existingIndex = installedPlugins.value.findIndex((item) => item.id === nextPlugin.id)
    if (existingIndex >= 0) {
      installedPlugins.value.splice(existingIndex, 1, nextPlugin)
    } else {
      installedPlugins.value.push(nextPlugin)
    }
  }

  async function handlePluginDelete(plugin: PluginInfo) {
    const index = installedPlugins.value.findIndex((item) => item.id === plugin.id)
    if (index >= 0) {
      installedPlugins.value.splice(index, 1)
    }

    await bridge?.onPluginDelete?.(plugin, createPluginContext(installedPlugins.value))
  }

  const activeCount = computed(() => {
    return installedPlugins.value.filter((plugin) => plugin.enabled).length
  })

  return {
    installedPlugins,
    getTools,
    callTool,
    handlePluginToggle,
    handleToolToggle,
    handlePluginCreate,
    handlePluginDelete,
    activeCount,
  }
}

export type UseMcpManagerReturn = ReturnType<typeof useMcpManager>
