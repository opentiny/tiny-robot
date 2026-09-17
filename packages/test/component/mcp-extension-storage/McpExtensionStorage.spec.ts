import { expect, test } from '@playwright/experimental-ct-vue'
import { parseMcpExtensionConfig } from '../../../components/src/mcp-extension-storage/config'
import { parseMcpExtensionStorageDocument } from '../../../components/src/mcp-extension-storage/document'
import { createMcpExtensionStorage } from '../../../components/src/mcp-extension-storage'
import { normalizeMcpExtensionInput } from '../../../components/src/mcp-extension-storage/normalize'

const validRecord = {
  id: 'b8050110-c8e2-4fb8-852b-0c2a29ef6ee3',
  name: 'Weather',
  description: 'Forecast tools',
  type: 'streamableHttp',
  url: 'https://example.com/mcp',
  headers: { Authorization: 'Bearer token' },
  thumbnail: null,
  enabled: true,
  toolPolicy: { default: 'enabled', overrides: { forecast: false } },
  createdAt: '2026-09-17T12:00:00.000Z',
  updatedAt: '2026-09-17T12:30:00.000Z',
}

class TestStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

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

test.describe('MCP extension storage document', () => {
  test('loads missing data as an empty version-one document', () => {
    expect(parseMcpExtensionStorageDocument(null)).toEqual({ schemaVersion: 1, extensions: [] })
  })

  test('loads a complete version-one record', () => {
    const document = { schemaVersion: 1, extensions: [validRecord] }

    expect(parseMcpExtensionStorageDocument(JSON.stringify(document))).toEqual(document)
  })

  test('rejects corrupt or unsupported document envelopes', () => {
    expect(() => parseMcpExtensionStorageDocument('{')).toThrow(/json/i)
    expect(() => parseMcpExtensionStorageDocument('[]')).toThrow(/document/i)
    expect(() => parseMcpExtensionStorageDocument(JSON.stringify({ extensions: [] }))).toThrow(/schema/i)
    expect(() => parseMcpExtensionStorageDocument(JSON.stringify({ schemaVersion: 2, extensions: [] }))).toThrow(
      /schema/i,
    )
    expect(() => parseMcpExtensionStorageDocument(JSON.stringify({ schemaVersion: 1, extensions: {} }))).toThrow(
      /extensions/i,
    )
  })

  test('rejects malformed persisted records', () => {
    const malformedRecords: Array<[string, Record<string, unknown>]> = [
      ['id', { ...validRecord, id: 'not-a-uuid' }],
      ['name', { ...validRecord, name: ' Weather ' }],
      ['description', { ...validRecord, description: 'a'.repeat(1001) }],
      ['type', { ...validRecord, type: 'http' }],
      ['url', { ...validRecord, url: 'ftp://example.com/mcp' }],
      ['headers', { ...validRecord, headers: { Authorization: 1 } }],
      ['headers', { ...validRecord, headers: { ' Authorization ': 'Bearer token' } }],
      ['thumbnail', { ...validRecord, thumbnail: 'not-a-url' }],
      ['enabled', { ...validRecord, enabled: 'true' }],
      ['tool policy', { ...validRecord, toolPolicy: { default: 'all', overrides: {} } }],
      ['tool override', { ...validRecord, toolPolicy: { default: 'enabled', overrides: { forecast: 1 } } }],
      ['createdAt', { ...validRecord, createdAt: 'today' }],
      ['updatedAt', { ...validRecord, updatedAt: 'today' }],
      ['field', { ...validRecord, unexpected: true }],
    ]

    for (const [field, record] of malformedRecords) {
      expect(() =>
        parseMcpExtensionStorageDocument(JSON.stringify({ schemaVersion: 1, extensions: [record] })),
      ).toThrow(new RegExp(field, 'i'))
    }
  })

  test('rejects duplicate persisted IDs and normalized names', () => {
    const duplicateId = { ...validRecord, name: 'Forecast' }
    const duplicateName = {
      ...validRecord,
      id: '2f65e35a-8d70-4864-9050-e6043e6384c2',
    }

    expect(() =>
      parseMcpExtensionStorageDocument(JSON.stringify({ schemaVersion: 1, extensions: [validRecord, duplicateId] })),
    ).toThrow(/duplicate.*id/i)
    expect(() =>
      parseMcpExtensionStorageDocument(JSON.stringify({ schemaVersion: 1, extensions: [validRecord, duplicateName] })),
    ).toThrow(/duplicate.*name/i)
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

test.describe('createMcpExtensionStorage', () => {
  test('creates, lists, and gets canonical records in the default document', async () => {
    const webStorage = new TestStorage()
    const repository = createMcpExtensionStorage({ storage: webStorage })

    const created = await repository.create({
      name: ' Weather ',
      description: ' Forecast tools ',
      type: 'streamableHttp',
      url: ' https://example.com/mcp ',
      headers: { Retries: 3 },
      thumbnail: ' ',
    })

    expect(created).toMatchObject({
      name: 'Weather',
      description: 'Forecast tools',
      type: 'streamableHttp',
      url: 'https://example.com/mcp',
      headers: { Retries: '3' },
      thumbnail: null,
      enabled: true,
      toolPolicy: { default: 'enabled', overrides: {} },
    })
    expect(created.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    expect(new Date(created.createdAt).toISOString()).toBe(created.createdAt)
    expect(created.updatedAt).toBe(created.createdAt)

    expect(await repository.list()).toEqual([created])
    expect(await repository.get(created.id)).toEqual(created)
    expect(await repository.get('missing')).toBeUndefined()

    const stored = JSON.parse(webStorage.getItem('tiny-robot:mcp-extensions') ?? '')
    expect(stored).toEqual({ schemaVersion: 1, extensions: [created] })
  })

  test('uses an isolated namespaced storage key', async () => {
    const webStorage = new TestStorage()
    const repository = createMcpExtensionStorage({ storage: webStorage, namespace: ' demo ' })

    await repository.create({
      name: 'Weather',
      type: 'sse',
      url: 'https://example.com/sse',
    })

    expect(webStorage.getItem('tiny-robot:mcp-extensions')).toBeNull()
    expect(webStorage.getItem('tiny-robot:demo:mcp-extensions')).not.toBeNull()
  })

  test('enforces normalized case-sensitive names while allowing the same URL', async () => {
    const repository = createMcpExtensionStorage({ storage: new TestStorage() })
    const input = { name: 'Weather', type: 'sse' as const, url: 'https://example.com/sse' }

    await repository.create(input)
    await expect(repository.create({ ...input, name: ' Weather ' })).rejects.toThrow(/name/i)
    await expect(repository.create({ ...input, name: 'weather' })).resolves.toMatchObject({ name: 'weather' })
  })

  test('returns fresh records that cannot mutate persisted data', async () => {
    const repository = createMcpExtensionStorage({ storage: new TestStorage() })
    const created = await repository.create({
      name: 'Weather',
      type: 'streamableHttp',
      url: 'https://example.com/mcp',
      headers: { Authorization: 'original' },
    })

    created.name = 'Mutated'
    created.headers.Authorization = 'changed'
    created.toolPolicy.overrides.forecast = false

    expect(await repository.get(created.id)).toMatchObject({
      name: 'Weather',
      headers: { Authorization: 'original' },
      toolPolicy: { default: 'enabled', overrides: {} },
    })
  })

  test('creates code configs through the same canonical path', async () => {
    const repository = createMcpExtensionStorage({ storage: new TestStorage() })

    const created = await repository.createFromConfig(
      JSON.stringify({
        mcpServers: {
          weather: { type: 'http', url: 'https://example.com/mcp', headers: { Retries: 3 } },
        },
      }),
    )

    expect(created).toMatchObject({
      name: 'weather',
      type: 'streamableHttp',
      headers: { Retries: '3' },
      enabled: true,
      toolPolicy: { default: 'enabled', overrides: {} },
    })
  })

  test('updates editable fields while preserving record identity and policies', async () => {
    const webStorage = new TestStorage()
    const existing = {
      ...validRecord,
      enabled: false,
      toolPolicy: { default: 'disabled' as const, overrides: { forecast: true } },
    }
    webStorage.setItem('tiny-robot:mcp-extensions', JSON.stringify({ schemaVersion: 1, extensions: [existing] }))
    const repository = createMcpExtensionStorage({ storage: webStorage })

    const updated = await repository.update(existing.id, {
      name: ' Weather Pro ',
      description: ' Updated tools ',
      type: 'sse',
      url: ' https://example.com/sse ',
      headers: { Retries: 5 },
      thumbnail: null,
    })

    expect(updated).toMatchObject({
      id: existing.id,
      name: 'Weather Pro',
      description: 'Updated tools',
      type: 'sse',
      url: 'https://example.com/sse',
      headers: { Retries: '5' },
      thumbnail: null,
      enabled: false,
      toolPolicy: { default: 'disabled', overrides: { forecast: true } },
      createdAt: existing.createdAt,
    })
    expect(updated.updatedAt).not.toBe(existing.updatedAt)
  })

  test('updates code configs without replacing stable fields', async () => {
    const repository = createMcpExtensionStorage({ storage: new TestStorage() })
    const created = await repository.create({
      name: 'Weather',
      type: 'streamableHttp',
      url: 'https://example.com/mcp',
    })

    const updated = await repository.updateFromConfig(
      created.id,
      JSON.stringify({
        mcpServers: { events: { type: 'sse', url: 'https://example.com/sse' } },
      }),
    )

    expect(updated).toMatchObject({
      id: created.id,
      name: 'events',
      type: 'sse',
      createdAt: created.createdAt,
      enabled: true,
      toolPolicy: { default: 'enabled', overrides: {} },
    })
  })

  test('enforces name uniqueness on update while excluding the current record', async () => {
    const repository = createMcpExtensionStorage({ storage: new TestStorage() })
    const weather = await repository.create({
      name: 'Weather',
      type: 'sse',
      url: 'https://example.com/sse',
    })
    const calendar = await repository.create({
      name: 'Calendar',
      type: 'streamableHttp',
      url: 'https://example.com/calendar',
    })

    await expect(
      repository.update(weather.id, {
        name: ' Weather ',
        type: 'sse',
        url: 'https://example.com/sse',
      }),
    ).resolves.toMatchObject({ name: 'Weather' })
    await expect(
      repository.update(calendar.id, {
        name: ' Weather ',
        type: 'streamableHttp',
        url: 'https://example.com/calendar',
      }),
    ).rejects.toThrow(/name/i)
  })

  test('deletes exactly one record and throws when the target is missing', async () => {
    const repository = createMcpExtensionStorage({ storage: new TestStorage() })
    const weather = await repository.create({
      name: 'Weather',
      type: 'sse',
      url: 'https://example.com/sse',
    })
    const calendar = await repository.create({
      name: 'Calendar',
      type: 'streamableHttp',
      url: 'https://example.com/calendar',
    })

    await repository.delete(weather.id)

    expect(await repository.list()).toEqual([calendar])
    await expect(repository.delete(weather.id)).rejects.toThrow(/not found/i)
  })

  test('toggles service state without rewriting tool policy', async () => {
    const repository = createMcpExtensionStorage({ storage: new TestStorage() })
    const created = await repository.create({
      name: 'Weather',
      type: 'streamableHttp',
      url: 'https://example.com/mcp',
    })
    const toolUpdated = await repository.setToolEnabled(created.id, 'forecast', false)

    const disabled = await repository.setEnabled(created.id, false)

    expect(disabled).toMatchObject({
      enabled: false,
      toolPolicy: toolUpdated.toolPolicy,
      createdAt: created.createdAt,
    })
    expect(disabled.updatedAt).not.toBe(toolUpdated.updatedAt)
  })

  test('stores tool overrides by name and removes values equal to the default', async () => {
    const repository = createMcpExtensionStorage({ storage: new TestStorage() })
    const created = await repository.create({
      name: 'Weather',
      type: 'streamableHttp',
      url: 'https://example.com/mcp',
    })

    const overridden = await repository.setToolEnabled(created.id, 'forecast', false)
    expect(overridden).toMatchObject({
      enabled: true,
      toolPolicy: { default: 'enabled', overrides: { forecast: false } },
    })

    const withAnotherTool = await repository.setToolEnabled(created.id, 'current-weather', false)
    expect(withAnotherTool.toolPolicy.overrides).toEqual({
      forecast: false,
      'current-weather': false,
    })

    const restored = await repository.setToolEnabled(created.id, 'forecast', true)
    expect(restored.toolPolicy.overrides).toEqual({ 'current-weather': false })
  })

  test('applies a persisted disabled-by-default tool policy', async () => {
    const webStorage = new TestStorage()
    const existing = {
      ...validRecord,
      toolPolicy: { default: 'disabled' as const, overrides: { forecast: true } },
    }
    webStorage.setItem('tiny-robot:mcp-extensions', JSON.stringify({ schemaVersion: 1, extensions: [existing] }))
    const repository = createMcpExtensionStorage({ storage: webStorage })

    const restored = await repository.setToolEnabled(existing.id, 'forecast', false)

    expect(restored.toolPolicy).toEqual({ default: 'disabled', overrides: {} })
  })

  test('persists tool names that overlap object prototype properties', async () => {
    const repository = createMcpExtensionStorage({ storage: new TestStorage() })
    const created = await repository.create({
      name: 'Weather',
      type: 'streamableHttp',
      url: 'https://example.com/mcp',
    })

    const updated = await repository.setToolEnabled(created.id, '__proto__', false)

    expect(Object.prototype.hasOwnProperty.call(updated.toolPolicy.overrides, '__proto__')).toBe(true)
    expect(updated.toolPolicy.overrides.__proto__).toBe(false)
    expect((await repository.get(created.id))?.toolPolicy.overrides.__proto__).toBe(false)
  })

  test('throws when toggling a missing record', async () => {
    const repository = createMcpExtensionStorage({ storage: new TestStorage() })

    await expect(repository.setEnabled('missing', false)).rejects.toThrow(/not found/i)
    await expect(repository.setToolEnabled('missing', 'forecast', false)).rejects.toThrow(/not found/i)
  })

  test('rejects non-boolean toggle values without corrupting storage', async () => {
    const webStorage = new TestStorage()
    const repository = createMcpExtensionStorage({ storage: webStorage })
    const created = await repository.create({
      name: 'Weather',
      type: 'streamableHttp',
      url: 'https://example.com/mcp',
    })
    const before = webStorage.getItem('tiny-robot:mcp-extensions')

    await expect(repository.setEnabled(created.id, 'yes' as unknown as boolean)).rejects.toThrow(/enabled/i)
    await expect(repository.setToolEnabled(created.id, 'forecast', 'yes' as unknown as boolean)).rejects.toThrow(
      /enabled/i,
    )
    expect(webStorage.getItem('tiny-robot:mcp-extensions')).toBe(before)
  })

  test('never overwrites corrupt, unsupported, or duplicate persisted data', async () => {
    const duplicate = {
      schemaVersion: 1,
      extensions: [validRecord, { ...validRecord, name: 'Forecast' }],
    }
    const invalidDocuments = ['{', JSON.stringify({ schemaVersion: 2, extensions: [] }), JSON.stringify(duplicate)]

    for (const raw of invalidDocuments) {
      const webStorage = new TestStorage()
      webStorage.setItem('tiny-robot:mcp-extensions', raw)
      const repository = createMcpExtensionStorage({ storage: webStorage })

      await expect(repository.list()).rejects.toThrow(Error)
      expect(webStorage.getItem('tiny-robot:mcp-extensions')).toBe(raw)
    }
  })

  test('leaves the persisted document unchanged when a mutation fails validation', async () => {
    const webStorage = new TestStorage()
    const repository = createMcpExtensionStorage({ storage: webStorage })
    const created = await repository.create({
      name: 'Weather',
      type: 'streamableHttp',
      url: 'https://example.com/mcp',
    })
    const before = webStorage.getItem('tiny-robot:mcp-extensions')

    await expect(
      repository.update(created.id, {
        name: 'Weather',
        type: 'streamableHttp',
        url: 'ftp://example.com/mcp',
      }),
    ).rejects.toThrow(/url/i)

    expect(webStorage.getItem('tiny-robot:mcp-extensions')).toBe(before)
  })
})
