import { describe, expect, it, vi } from 'vitest'
import { createWebMcpToolSource, normalizeWebMcpInputSchema } from './webmcpToolSource'
import type { WebMcpContext } from './webmcpTypes'

function createContext(tools: Array<{ name: string; description?: string; inputSchema?: unknown }>) {
  const listeners = new Set<() => void>()
  const executeTool = vi.fn(async (tool: { name: string }, input: string) => ({
    content: [{ type: 'text', text: `${tool.name}:${input}` }],
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
  it('reads tools, normalizes schemas, and calls executeTool with JSON input', async () => {
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
    expect(executeTool).toHaveBeenCalledWith(expect.objectContaining({ name: 'echo' }), '{"text":"hello"}')
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
    expect(normalizeWebMcpInputSchema({ properties: { q: { type: 'string' } } })).toEqual({
      type: 'object',
      properties: { q: { type: 'string' } },
    })
  })
})
