import { describe, expect, it, vi } from 'vitest'
import { createDefaultMcpAdapter } from './createDefaultMcpAdapter'

describe('MCP ownership', () => {
  it('closes pending discovery connections and prevents reconnecting after disposal', async () => {
    const signals: AbortSignal[] = []
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal
          if (signal) {
            signals.push(signal)
            signal.addEventListener('abort', () => reject(new DOMException('Stopped', 'AbortError')), { once: true })
          }
        }),
    )
    try {
      const owned = createDefaultMcpAdapter([{ id: 'tools', name: 'Tools', baseUrl: 'https://example.test/mcp' }])
      const adding = owned.runtime.addServer('tools')
      const rejected = expect(adding).rejects.toThrow()
      await vi.waitFor(() => expect(signals.length).toBeGreaterThan(0))
      const closing = owned.dispose()
      expect(owned.dispose()).toBe(closing)
      await closing
      await rejected
      expect(signals.every((signal) => signal.aborted)).toBe(true)
      await expect(owned.runtime.addServer('tools')).rejects.toThrow(/disposed/i)
      expect(owned.runtime.tools.value).toEqual({})
    } finally {
      fetch.mockRestore()
    }
  })
})
