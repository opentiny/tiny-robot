import { describe, expect, it, vi } from 'vitest'
import { createWebMcpToolSource, normalizeWebMcpInputSchema } from '../../../../components/src/mcp/webmcpToolSource'
import type { WebMcpContext } from './webmcpTypes'

function createContext(tools: Array<{ name: string; description?: string; inputSchema?: unknown }>) {
  const listeners = new Set<() => void>()
  const executeTool = vi.fn(async (tool: { name: string }, input: Record<string, unknown> | string) => ({
    content: [{ type: 'text', text: `${tool.name}:${JSON.stringify(input)}` }],
  }))
  const context: WebMcpContext & { emit: () => void } = {
    getTools: async () => tools,
    executeTool,
    addEventListener: (_type, listener) => listeners.add(listener),
    removeEventListener: (_type, listener) => listeners.delete(listener),
    emit: () => listeners.forEach((listener) => listener()),
  }

  return { context, executeTool }
}

describe('createWebMcpToolSource', () => {
  it('reads tools, normalizes schemas, and calls executeTool with object input', async () => {
    const { context, executeTool } = createContext([
      {
        name: 'echo',
        description: 'Echo',
        inputSchema: '{"type":"object","properties":{"text":{"type":"string"}}}',
      },
    ])
    const source = createWebMcpToolSource({ getContext: () => context })

    await expect(source.listTools()).resolves.toEqual([
      {
        name: 'echo',
        description: 'Echo',
        inputSchema: '{"type":"object","properties":{"text":{"type":"string"}}}',
      },
    ])
    await expect(source.callTool('echo', { text: 'hello' })).resolves.toBe('echo:{"text":"hello"}')
    expect(executeTool).toHaveBeenCalledWith(expect.objectContaining({ name: 'echo' }), { text: 'hello' })
  })

  it('falls back to a JSON string when the browser rejects object input', async () => {
    const tool = { name: 'echo' }
    const executeTool = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to parse input arguments'))
      .mockResolvedValueOnce({ content: [{ type: 'text', text: 'echo:ok' }] })
    const context: WebMcpContext = {
      listTools: async () => [tool],
      executeTool,
    }
    const source = createWebMcpToolSource({ getContext: () => context })

    await expect(source.callTool('echo', { text: 'hello' })).resolves.toBe('echo:ok')
    expect(executeTool).toHaveBeenNthCalledWith(1, tool, { text: 'hello' })
    expect(executeTool).toHaveBeenNthCalledWith(2, tool, '{"text":"hello"}')
  })

  it('falls back when the browser reports the parse error as a generic Error', async () => {
    const tool = { name: 'echo' }
    const executeTool = vi
      .fn()
      .mockRejectedValueOnce(new Error('Failed to parse input arguments'))
      .mockResolvedValueOnce({ content: [{ type: 'text', text: 'echo:ok' }] })
    const context: WebMcpContext = {
      listTools: async () => [tool],
      executeTool,
    }
    const source = createWebMcpToolSource({ getContext: () => context })

    await expect(source.callTool('echo', { text: 'hello' })).resolves.toBe('echo:ok')
    expect(executeTool).toHaveBeenCalledTimes(2)
  })

  it('extracts text from a JSON string result returned by the browser', async () => {
    const tool = { name: 'echo' }
    const context: WebMcpContext = {
      listTools: async () => [tool],
      executeTool: async () => JSON.stringify({ content: [{ type: 'text', text: 'echo:ok' }] }),
    }
    const source = createWebMcpToolSource({ getContext: () => context })

    await expect(source.callTool('echo', {})).resolves.toBe('echo:ok')
  })

  it('does not retry non-parse tool errors', async () => {
    const tool = { name: 'echo' }
    const error = new Error('tool execution failed')
    const executeTool = vi.fn().mockRejectedValue(error)
    const context: WebMcpContext = {
      listTools: async () => [tool],
      executeTool,
    }
    const source = createWebMcpToolSource({ getContext: () => context })

    await expect(source.callTool('echo', { text: 'hello' })).rejects.toBe(error)
    expect(executeTool).toHaveBeenCalledOnce()
  })

  it('notifies subscribers after toolchange and refreshes the next tool list', async () => {
    const tools = [{ name: 'echo' }]
    const { context } = createContext(tools)
    const source = createWebMcpToolSource({ getContext: () => context })
    const listener = vi.fn()

    source.subscribe?.(listener)
    await source.listTools()
    tools.push({ name: 'navigate' })
    context.emit()

    await vi.waitFor(() => expect(listener).toHaveBeenCalledOnce())
    await expect(source.listTools()).resolves.toHaveLength(2)
  })

  it('normalizes malformed schemas to an object schema', () => {
    expect(normalizeWebMcpInputSchema('{bad json')).toEqual({ type: 'object', properties: {} })
    expect(normalizeWebMcpInputSchema({ properties: [] })).toEqual({ type: 'object', properties: {} })
    expect(normalizeWebMcpInputSchema({ properties: { q: { type: 'string' } } })).toEqual({
      type: 'object',
      properties: { q: { type: 'string' } },
    })
  })
})
