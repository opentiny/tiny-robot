import { expect, test } from '@playwright/experimental-ct-vue'
import {
  createMcpExtensionStorage,
  createMemoryMcpExtensionStorage,
} from '../../../components/src/mcp-extension-storage'

const weather = { name: '天气', type: 'streamableHttp' as const, url: 'https://example.com/mcp' }
const identity = { source: 'remote', id: 'weather' }
const parseBusinessOptions = (value: unknown) => {
  if (typeof value !== 'object' || value === null || !('enabled' in value) || typeof value.enabled !== 'boolean')
    throw new Error('enabled must be boolean')
  return { enabled: value.enabled }
}

test('same display name has separate source identities and newer data keeps options', async () => {
  const storage = createMemoryMcpExtensionStorage({ parseBusinessOptions })
  await storage.upsertData({
    ...identity,
    version: 1,
    ...weather,
    tools: [{ id: 'forecast', name: '预报', enabled: true }],
  })
  await storage.upsertData({ source: 'builtin', id: 'weather', version: 1, ...weather, tools: [] })
  await storage.setOptions(identity, {
    toolPolicy: { default: 'enabled', overrides: { forecast: false } },
    business: { enabled: false },
  })
  await storage.upsertData({
    ...identity,
    version: 2,
    ...weather,
    description: '新版',
    tools: [{ id: 'forecast', name: '预报', enabled: true }],
  })

  expect((await storage.listData()).length).toBe(2)
  expect((await storage.getData(identity))?.version).toBe(2)
  expect((await storage.getOptions(identity))?.business).toEqual({ enabled: false })
  expect((await storage.getOptions(identity))?.toolPolicy.overrides.forecast).toBe(false)
})

test('data deletion preserves options, including for an options-only builtin', async () => {
  const storage = createMemoryMcpExtensionStorage({ parseBusinessOptions })
  await storage.setOptions(identity, {
    toolPolicy: { default: 'enabled', overrides: {} },
    business: { enabled: false },
  })
  expect(await storage.getData(identity)).toBeUndefined()
  await storage.upsertData({ ...identity, version: 1, ...weather, tools: [] })
  await storage.deleteData(identity)
  expect(await storage.getData(identity)).toBeUndefined()
  expect((await storage.getOptions(identity))?.business?.enabled).toBe(false)
  await storage.upsertData({ ...identity, version: 1, ...weather, tools: [] })
  expect((await storage.getOptions(identity))?.business?.enabled).toBe(false)
})

test('asynchronous backend and caller parser persist validated business options', async () => {
  let raw: string | null = null
  const adapter = {
    async read() {
      await Promise.resolve()
      return raw
    },
    async write(_key: string, value: string) {
      await Promise.resolve()
      raw = value
    },
  }
  const storage = createMcpExtensionStorage({ adapter, parseBusinessOptions })
  await storage.setOptions(identity, { toolPolicy: { default: 'enabled', overrides: {} }, business: { enabled: true } })
  expect((await storage.getOptions(identity))?.business?.enabled).toBe(true)
  raw = String(raw).replace('"enabled":true', '"enabled":"invalid"')
  await expect(storage.getOptions(identity)).rejects.toThrow('enabled must be boolean')
})

test('tool switches and business settings survive uninstall and reinstall independently', async () => {
  const storage = createMemoryMcpExtensionStorage({ parseBusinessOptions })
  await storage.setOptions(identity, {
    toolPolicy: { default: 'enabled', overrides: {} },
    business: { enabled: false },
  })
  await storage.setToolEnabled(identity, 'forecast', false)
  await storage.upsertData({
    ...identity,
    version: 1,
    ...weather,
    tools: [{ id: 'forecast', name: '预报', enabled: true }],
  })
  await storage.deleteData(identity)
  await storage.upsertData({
    ...identity,
    version: 2,
    ...weather,
    tools: [{ id: 'forecast', name: '预报', enabled: true }],
  })
  expect(await storage.getOptions(identity)).toEqual({
    toolPolicy: { default: 'enabled', overrides: { forecast: false } },
    business: { enabled: false },
  })
  await storage.deleteOptions(identity)
  expect(await storage.getOptions(identity)).toBeUndefined()
})

test('definition versions reject equal-version conflicts without overwriting stored data', async () => {
  const storage = createMemoryMcpExtensionStorage()
  await storage.upsertData({ ...identity, version: 2, ...weather, tools: [] })
  await storage.upsertData({ ...identity, version: 1, ...weather, description: '旧版', tools: [] })
  expect((await storage.getData(identity))?.version).toBe(2)
  await expect(
    storage.upsertData({ ...identity, version: 2, ...weather, description: '冲突', tools: [] }),
  ).rejects.toThrow(/version conflict/)
  expect((await storage.getData(identity))?.description).toBe('')
})

test('concurrent changes on one storage instance keep both identities', async () => {
  const storage = createMemoryMcpExtensionStorage()
  await Promise.all([
    storage.upsertData({ ...identity, version: 1, ...weather, tools: [] }),
    storage.upsertData({ source: 'builtin', id: 'search', version: 1, ...weather, tools: [] }),
  ])
  expect((await storage.listData()).length).toBe(2)
})

test('concurrent changes across storage instances sharing an adapter keep both identities', async () => {
  let raw: string | null = null
  const adapter = {
    async read() {
      const snapshot = raw
      await Promise.resolve()
      return snapshot
    },
    async write(_key: string, value: string) {
      raw = value
    },
  }
  const first = createMcpExtensionStorage({ adapter })
  const second = createMcpExtensionStorage({ adapter })

  await Promise.all([
    first.upsertData({ ...identity, version: 1, ...weather, tools: [] }),
    second.upsertData({ source: 'builtin', id: 'search', version: 1, ...weather, tools: [] }),
  ])

  expect(await first.listData()).toHaveLength(2)
})

test('manual config helpers create and edit a definition without changing its identity', async () => {
  const storage = createMemoryMcpExtensionStorage()
  const created = await storage.createFromConfig(
    JSON.stringify({ mcpServers: { weather: { url: 'https://example.com/mcp' } } }),
  )
  const updated = await storage.update(created, { ...weather, name: '天气服务' })
  expect(updated).toMatchObject({ source: 'manual', id: created.id, version: 2, name: '天气服务' })
  expect((await storage.listData()).length).toBe(1)
})

test('manual updates clear optional connection fields omitted from the replacement value', async () => {
  const storage = createMemoryMcpExtensionStorage()
  const created = await storage.create({
    ...weather,
    description: '旧描述',
    headers: { Authorization: 'Bearer token' },
    thumbnail: 'https://example.com/icon.png',
  })

  const updated = await storage.update(created, weather)

  expect(updated).toMatchObject({
    source: 'manual',
    id: created.id,
    version: 2,
  })
  expect(updated.description).toBe('')
  expect(updated.headers).toEqual({})
  expect(updated.thumbnail).toBeNull()
  expect(await storage.getData(created)).toEqual(updated)
})

test('config creation works when passed as a standalone callback', async () => {
  const storage = createMemoryMcpExtensionStorage()
  const createFromConfig = storage.createFromConfig

  const created = await createFromConfig(
    JSON.stringify({ mcpServers: { weather: { url: 'https://example.com/mcp' } } }),
  )

  expect(created).toMatchObject({ source: 'manual', name: 'weather', version: 1 })
})

test('manual creation generates a UUID when crypto.randomUUID is unavailable', async () => {
  const randomUuidDescriptor = Object.getOwnPropertyDescriptor(crypto, 'randomUUID')
  Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: undefined })

  try {
    const created = await createMemoryMcpExtensionStorage().create(weather)
    expect(created.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  } finally {
    if (randomUuidDescriptor) Object.defineProperty(crypto, 'randomUUID', randomUuidDescriptor)
    else Reflect.deleteProperty(crypto, 'randomUUID')
  }
})

test('uses the original storage key and rejects corrupt data without overwriting it', async () => {
  const values = new Map<string, string>()
  const webStorage: Storage = {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key) {
      return values.get(key) ?? null
    },
    key(index) {
      return [...values.keys()][index] ?? null
    },
    removeItem(key) {
      values.delete(key)
    },
    setItem(key, value) {
      values.set(key, value)
    },
  }
  const storage = createMcpExtensionStorage({ storage: webStorage })
  await storage.upsertData({ ...identity, version: 1, ...weather, tools: [] })
  const key = 'tiny-robot:mcp-extensions'
  expect(JSON.parse(webStorage.getItem(key) ?? '')).toMatchObject({
    schemaVersion: 1,
    data: [{ ...identity }],
    options: [],
  })
  webStorage.setItem(key, '{')
  await expect(
    storage.upsertData({ source: 'remote', id: 'other', version: 1, ...weather, tools: [] }),
  ).rejects.toThrow(/JSON/)
  expect(webStorage.getItem(key)).toBe('{')
})
