import { expect, test } from '@playwright/experimental-ct-vue'
import { parseMcpExtensionConfig } from '../../../components/src/mcp-extension-storage/config'
import { normalizeMcpExtensionInput } from '../../../components/src/mcp-extension-storage/normalize'

test.describe('MCP extension storage normalization', () => {
  test('normalizes form input into the canonical MCP configuration', () => {
    expect(
      normalizeMcpExtensionInput({
        name: ' Weather ',
        description: ' Forecast tools ',
        type: 'streamableHttp',
        url: ' https://example.com/mcp?city=shenzhen ',
        headers: { Authorization: 'Bearer token', Retries: 3, Enabled: true },
        thumbnail: ' ',
      }),
    ).toEqual({
      name: 'Weather',
      description: 'Forecast tools',
      type: 'streamableHttp',
      url: 'https://example.com/mcp?city=shenzhen',
      headers: { Authorization: 'Bearer token', Retries: '3', Enabled: 'true' },
      thumbnail: null,
    })
  })

  test('rejects invalid MCP identity and endpoint fields', () => {
    const validInput = {
      name: 'Weather',
      description: 'Forecast tools',
      type: 'streamableHttp' as const,
      url: 'https://example.com/mcp',
    }

    expect(() => normalizeMcpExtensionInput({ ...validInput, name: ' ' })).toThrow(/name/i)
    expect(() =>
      normalizeMcpExtensionInput({
        ...validInput,
        type: 'http' as unknown as 'streamableHttp',
      }),
    ).toThrow(/type/i)
    expect(() => normalizeMcpExtensionInput({ ...validInput, description: 'a'.repeat(1001) })).toThrow(/description/i)
    expect(() => normalizeMcpExtensionInput({ ...validInput, url: 'ftp://example.com/mcp' })).toThrow(/url/i)
    expect(() => normalizeMcpExtensionInput({ ...validInput, thumbnail: 'not-a-url' })).toThrow(/thumbnail/i)
  })

  test('rejects header names and values that cannot be stored canonically', () => {
    const validInput = {
      name: 'Weather',
      type: 'sse' as const,
      url: 'https://example.com/sse',
    }

    expect(() => normalizeMcpExtensionInput({ ...validInput, headers: { ' ': 'value' } })).toThrow(/header name/i)
    expect(() =>
      normalizeMcpExtensionInput({
        ...validInput,
        headers: { Authorization: 'first', ' Authorization ': 'second' },
      }),
    ).toThrow(/duplicate.*header/i)

    for (const value of [null, undefined, ['value'], { nested: true }]) {
      expect(() => normalizeMcpExtensionInput({ ...validInput, headers: { Invalid: value } })).toThrow(/header value/i)
    }
  })

  test('preserves header names that overlap object prototype properties', () => {
    const headers = JSON.parse('{"__proto__":"safe"}') as Record<string, unknown>

    const normalized = normalizeMcpExtensionInput({
      name: 'Weather',
      type: 'streamableHttp',
      url: 'https://example.com/mcp',
      headers,
    })

    expect(Object.prototype.hasOwnProperty.call(normalized.headers, '__proto__')).toBe(true)
    expect(normalized.headers.__proto__).toBe('safe')
  })
})

test.describe('MCP extension code config', () => {
  test('normalizes one Claude or Copilot style server', () => {
    expect(
      parseMcpExtensionConfig(
        JSON.stringify({
          mcpServers: {
            weather: {
              name: ' Weather ',
              description: ' Forecast tools ',
              type: 'http',
              url: ' https://example.com/mcp ',
              headers: { Authorization: 'Bearer token', Retries: 3, Enabled: true },
              thumbnail: ' ',
              unknown: 'ignored',
            },
          },
          unknown: 'ignored',
        }),
      ),
    ).toEqual({
      name: 'Weather',
      description: 'Forecast tools',
      type: 'streamableHttp',
      url: 'https://example.com/mcp',
      headers: { Authorization: 'Bearer token', Retries: '3', Enabled: 'true' },
      thumbnail: null,
    })
  })

  test('uses the server key as name and defaults URL configs to streamable HTTP', () => {
    expect(
      parseMcpExtensionConfig(
        JSON.stringify({ mcpServers: { ' fallback-name ': { url: 'https://example.com/mcp' } } }),
      ),
    ).toMatchObject({ name: 'fallback-name', type: 'streamableHttp' })
  })

  test('preserves the SSE transport', () => {
    expect(
      parseMcpExtensionConfig(
        JSON.stringify({ mcpServers: { events: { type: 'sse', url: 'https://example.com/sse' } } }),
      ),
    ).toMatchObject({ name: 'events', type: 'sse', url: 'https://example.com/sse' })
  })

  test('requires exactly one server in a valid object envelope', () => {
    const invalidConfigs = [
      '{',
      '[]',
      JSON.stringify({}),
      JSON.stringify({ mcpServers: [] }),
      JSON.stringify({ mcpServers: {} }),
      JSON.stringify({
        mcpServers: {
          first: { url: 'https://example.com/first' },
          second: { url: 'https://example.com/second' },
        },
      }),
    ]

    for (const config of invalidConfigs) expect(() => parseMcpExtensionConfig(config)).toThrow(Error)
  })

  test('rejects stdio and invalid recognized server fields', () => {
    const invalidServers = [
      { type: 'stdio', command: 'node', args: ['server.js'] },
      { command: 'node', url: 'https://example.com/mcp' },
      { args: ['server.js'], url: 'https://example.com/mcp' },
      { name: 1, url: 'https://example.com/mcp' },
      { description: 1, url: 'https://example.com/mcp' },
      { type: 1, url: 'https://example.com/mcp' },
      { type: 'websocket', url: 'https://example.com/mcp' },
      {},
      { url: 1 },
      { url: 'https://example.com/mcp', headers: [] },
      { url: 'https://example.com/mcp', thumbnail: 1 },
    ]

    for (const server of invalidServers) {
      expect(() => parseMcpExtensionConfig(JSON.stringify({ mcpServers: { invalid: server } }))).toThrow(Error)
    }
  })
})
