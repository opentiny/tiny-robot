import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMcpToolPlugin } from '../../src/runtime/plugins/mcpToolPlugin'
import { CHAT_RUN_CONFIG_CONTEXT_KEY } from '../../src/runtime/runConfig'

vi.mock('@opentiny/tiny-robot-kit', () => ({
  toolPlugin: vi.fn((options) => options),
}))

interface McpToolCallOptions {
  callTool: (
    toolCall: { function?: { name?: string; arguments?: string } },
    context: { customContext: Record<string, unknown> },
  ) => Promise<unknown>
}

function createCallToolHook(callTool = vi.fn().mockResolvedValue('ok')) {
  const plugin = createMcpToolPlugin(vi.fn(), callTool)
  const options = plugin as unknown as McpToolCallOptions

  return { callTool: options.callTool, providerCall: callTool }
}

function createContext(overrides: Record<string, unknown> = {}) {
  return {
    customContext: {
      [CHAT_RUN_CONFIG_CONTEXT_KEY]: {
        mcp: {
          serverIds: ['maps'],
          toolIds: { maps: ['tool-a'] },
        },
      },
      __chat_tool_snapshot: [
        {
          serverId: 'maps',
          id: 'tool-a',
          name: 'maps__tool-a',
          originalName: 'tool-a',
        },
      ],
      ...overrides,
    },
  }
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('createMcpToolPlugin', () => {
  it.each([undefined, '', '   '])('passes empty arguments for %j', async (argumentsValue) => {
    const { callTool, providerCall } = createCallToolHook()

    await callTool({ function: { name: 'maps__tool-a', arguments: argumentsValue } }, createContext())

    expect(providerCall).toHaveBeenCalledWith('maps', 'tool-a', {})
  })

  it('passes parsed JSON arguments', async () => {
    const { callTool, providerCall } = createCallToolHook()

    await callTool({ function: { name: 'maps__tool-a', arguments: '{"query":"Vue"}' } }, createContext())

    expect(providerCall).toHaveBeenCalledWith('maps', 'tool-a', { query: 'Vue' })
  })

  it('rejects invalid JSON with the MCP tool name', async () => {
    const { callTool } = createCallToolHook()

    await expect(
      callTool({ function: { name: 'maps__tool-a', arguments: '{invalid' } }, createContext()),
    ).rejects.toThrow('maps__tool-a')
  })

  it('rejects a tool missing from the current snapshot or configuration', async () => {
    const { callTool } = createCallToolHook()

    await expect(
      callTool({ function: { name: 'maps__other-tool', arguments: '{}' } }, createContext()),
    ).rejects.toThrow('Tool is not enabled in this turn: maps__other-tool')
  })
})
