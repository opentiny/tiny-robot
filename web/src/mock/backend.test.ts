import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import { createBackendMocks } from './backend'
import { type BackendStorage, MOCK_BACKEND_STORAGE_KEY, createMemoryStorage } from './backend-persist'
import { dispatchMockRequest } from './dispatch'

function createClient(storage?: BackendStorage) {
  const mocks = createBackendMocks(storage)

  return async (method: string, url: string, body?: unknown, headers: Record<string, string> = {}) => {
    return dispatchMockRequest(mocks, { method, url, body, headers })
  }
}

test('default credentials return the backend token-pair contract', async () => {
  const request = createClient()
  const response = await request('post', '/api/auth/login', {
    email: 'admin@no-reply.com',
    password: 'admin',
  })

  assert.equal(response.statusCode, 200)
  assert.deepEqual(Object.keys(response.body as object).sort(), [
    'accessToken',
    'accessTokenTTL',
    'refreshToken',
    'refreshTokenTTL',
  ])
})

test('invalid credentials are rejected instead of creating a fake session', async () => {
  const request = createClient()
  const response = await request('post', '/api/auth/login', {
    email: 'admin@no-reply.com',
    password: 'wrong-password',
  })

  assert.equal(response.statusCode, 401)
  assert.deepEqual(response.body, { message: '邮箱或密码错误' })
})

test('bootstrap endpoints expose the current frontend contract', async () => {
  const request = createClient()
  const login = await request('post', '/api/auth/login', {
    email: 'admin@no-reply.com',
    password: 'admin',
  })
  const token = (login.body as { accessToken: string }).accessToken
  const headers = { authorization: `Bearer ${token}` }

  const user = await request('get', '/api/user/info/admin@no-reply.com', undefined, headers)
  const currentUser = await request('get', '/api/user/info/', undefined, headers)
  const role = await request('get', '/api/role/info/1', undefined, headers)
  const menu = await request('get', '/api/menu/role/admin@no-reply.com', undefined, headers)
  const languages = await request('get', '/api/lang', undefined, headers)
  const localeTable = await request('get', '/api/i18/format', undefined, headers)

  assert.equal((user.body as { email: string }).email, 'admin@no-reply.com')
  assert.equal((currentUser.body as { email: string }).email, 'admin@no-reply.com')
  assert.equal((role.body as { name: string }).name, 'admin')
  assert.ok((menu.body as unknown[]).length > 0)
  assert.deepEqual(languages.body, [
    { id: 1, name: 'enUS' },
    { id: 2, name: 'zhCN' },
  ])
  assert.ok((localeTable.body as { zhCN: object }).zhCN)
})

test('permission mutations are visible in following queries', async () => {
  const request = createClient()
  const created = await request('post', '/api/permission', {
    name: 'demo::read',
    desc: 'Demo permission',
  })
  const page = await request('get', '/api/permission?page=1&limit=10')

  assert.equal(created.statusCode, 200)
  assert.ok(
    (page.body as { items: { id: number }[] }).items.some(
      item => item.id === (created.body as { id: number }).id,
    ),
  )

  const updated = await request('patch', '/api/permission', {
    ...(created.body as object),
    desc: 'Updated permission',
  })
  assert.equal((updated.body as { desc: string }).desc, 'Updated permission')

  const removed = await request(
    'delete',
    `/api/permission/${(created.body as { id: number }).id}`,
  )
  assert.deepEqual(removed.body, created.body)
})

test('language mutations use dynamic path parameters', async () => {
  const request = createClient()
  const updated = await request('patch', '/api/lang/1', { name: 'en-US' })
  const languages = await request('get', '/api/lang')

  assert.equal((updated.body as { name: string }).name, 'en-US')
  assert.equal((languages.body as { name: string }[])[0].name, 'en-US')
})

test('system management list endpoints return the shapes consumed by views', async () => {
  const request = createClient()
  const users = await request('get', '/api/user?page=1&limit=10')
  const roles = await request('get', '/api/role/detail?page=1&limit=10')
  const permissions = await request('get', '/api/permission')
  const menus = await request('get', '/api/menu')
  const locales = await request('get', '/api/i18?page=1&limit=10')

  assert.ok(Array.isArray((users.body as { items: unknown[] }).items))
  assert.ok(Array.isArray((roles.body as { roleInfo: { items: unknown[] } }).roleInfo.items))
  assert.ok(Array.isArray(permissions.body))
  assert.ok(Array.isArray(menus.body))
  assert.ok(Array.isArray((locales.body as { items: unknown[] }).items))
})

test('nested menu create, update and delete persist in the menu tree', async () => {
  const request = createClient()
  const initial = (await request('get', '/api/menu')).body as any[]
  const board = initial.find(item => item.label === 'Board')
  const created = await request('post', '/api/menu', {
    name: 'Demo',
    path: 'demo',
    component: 'board/demo/index',
    icon: '',
    menuType: 'normal',
    parentId: board.id,
    order: 99,
    locale: 'menu.demo',
  })

  await request('patch', '/api/menu', {
    ...(created.body as object),
    name: 'DemoUpdated',
    path: 'demo-updated',
  })
  const updated = (await request('get', '/api/menu')).body as any[]
  assert.equal(
    updated.find(item => item.id === board.id).children.find(
      item => item.id === (created.body as { id: number }).id,
    ).label,
    'DemoUpdated',
  )

  await request(
    'delete',
    `/api/menu?id=${(created.body as { id: number }).id}&parentId=${board.id}`,
  )
  const afterDelete = (await request('get', '/api/menu')).body as any[]
  assert.equal(
    afterDelete.find(item => item.id === board.id).children.some(
      item => item.id === (created.body as { id: number }).id,
    ),
    false,
  )
})

test('role menu assignments control the menu returned for its users', async () => {
  const request = createClient()
  const menus = (await request('get', '/api/menu')).body as any[]
  const list = menus.find(item => item.label === 'List')
  const table = list.children.find(item => item.label === 'Table')

  await request('patch', '/api/role', {
    id: 1,
    menuIds: [list.id, table.id],
  })
  const assigned = (await request(
    'get',
    '/api/menu/role/admin@no-reply.com',
  )).body as any[]

  assert.deepEqual(assigned.map(item => item.label), ['List'])
  assert.deepEqual(assigned[0].children.map(item => item.label), ['Table'])
})

test('updating user roleIds changes the user role and assigned menu', async () => {
  const request = createClient()
  const menus = (await request('get', '/api/menu')).body as any[]
  const list = menus.find(item => item.label === 'List')
  const role = await request('post', '/api/role', {
    name: 'list-reader',
    permissionIds: [2],
    menuIds: [list.id],
  })

  await request('patch', '/api/user/update', {
    email: 'admin@no-reply.com',
    roleIds: [(role.body as { id: number }).id],
  })
  const assigned = (await request(
    'get',
    '/api/menu/role/admin@no-reply.com',
  )).body as any[]

  assert.deepEqual(assigned.map(item => item.label), ['List'])
})

test('referenced permissions, roles and languages cannot be deleted', async () => {
  const request = createClient()

  assert.equal((await request('delete', '/api/permission/1')).statusCode, 409)
  assert.equal((await request('delete', '/api/role/1')).statusCode, 409)
  assert.equal((await request('delete', '/api/lang/1')).statusCode, 409)
})

test('user list applies name, email and role filters', async () => {
  const request = createClient()
  await request('post', '/api/user/reg', {
    email: 'reader@example.com',
    password: 'reader-password',
    name: 'Reader',
    roleIds: [1],
  })

  const match = await request(
    'get',
    '/api/user?page=1&limit=10&name=Read&email=reader%40example.com&role=1',
  )
  const miss = await request(
    'get',
    '/api/user?page=1&limit=10&email=missing%40example.com&role=1',
  )

  assert.deepEqual(
    (match.body as { items: { email: string }[] }).items.map(item => item.email),
    ['reader@example.com'],
  )
  assert.equal((miss.body as { items: unknown[] }).items.length, 0)
})

test('registered and password-updated users authenticate with current credentials', async () => {
  const request = createClient()
  await request('post', '/api/user/reg', {
    username: 'reader@example.com',
    password: 'reader-password',
  })
  const login = await request('post', '/api/auth/login', {
    email: 'reader@example.com',
    password: 'reader-password',
  })
  assert.equal(login.statusCode, 200)

  const token = (login.body as { accessToken: string }).accessToken
  const user = await request(
    'get',
    '/api/user/info/',
    undefined,
    { authorization: `Bearer ${token}` },
  )
  assert.equal((user.body as { email: string }).email, 'reader@example.com')
  const roleId = (user.body as { role: { id: number }[] }).role[0]?.id
  assert.ok(roleId)
  assert.equal((await request('get', `/api/role/info/${roleId}`)).statusCode, 200)

  await request('patch', '/api/user/admin/updatePwd', {
    email: 'reader@example.com',
    newPassword: 'updated-password',
  })
  assert.equal((await request('post', '/api/auth/login', {
    email: 'reader@example.com',
    password: 'reader-password',
  })).statusCode, 401)
  assert.equal((await request('post', '/api/auth/login', {
    email: 'reader@example.com',
    password: 'updated-password',
  })).statusCode, 200)
})

test('locale updates keep records, language filters and formatted output synchronized', async () => {
  const request = createClient()
  const allRecords = await request('get', '/api/i18?page=1&limit=0&all=1')
  assert.ok((allRecords.body as { items: unknown[] }).items.length > 100)
  const created = await request('post', '/api/i18', {
    key: 'demo.title',
    content: 'Demo',
    lang: 1,
  })
  await request('patch', `/api/i18/${(created.body as { id: number }).id}`, {
    key: 'demo.heading',
    content: '演示',
    lang: 2,
  })

  const zhRecords = await request('get', '/api/i18?page=1&limit=2000&lang=2')
  const formatted = await request('get', '/api/i18/format')
  const item = (zhRecords.body as { items: any[] }).items.find(
    record => record.id === (created.body as { id: number }).id,
  )
  assert.deepEqual(item.lang, { id: 2, name: 'zhCN' })
  assert.equal((formatted.body as any).enUS['demo.title'], undefined)
  assert.equal((formatted.body as any).zhCN['demo.heading'], '演示')

  await request('delete', `/api/i18/${item.id}`)
  const afterDelete = await request('get', '/api/i18/format')
  assert.equal((afterDelete.body as any).zhCN['demo.heading'], undefined)
})

test('a recreated backend restores login and submitted data from shared storage', async () => {
  const storage = createMemoryStorage()
  const request = createClient(storage)
  const login = await request('post', '/api/auth/login', {
    email: 'admin@no-reply.com',
    password: 'admin',
  })
  const token = (login.body as { accessToken: string }).accessToken
  const headers = { authorization: `Bearer ${token}` }

  await request('post', '/api/permission', {
    name: 'demo::persist',
    desc: 'Keep after reload',
  }, headers)
  await request('post', '/api/user/reg', {
    email: 'persisted@example.com',
    password: 'persisted-password',
    name: 'Persisted',
    roleIds: [1],
  }, headers)

  const reloaded = createClient(storage)
  const session = await reloaded('get', '/api/user/info/', undefined, headers)
  const permissions = await reloaded('get', '/api/permission?page=1&limit=100', undefined, headers)
  const users = await reloaded('get', '/api/user?page=1&limit=10&email=persisted%40example.com', undefined, headers)

  assert.equal(session.statusCode, 200)
  assert.equal((session.body as { email: string }).email, 'admin@no-reply.com')
  assert.ok(
    (permissions.body as { items: { name: string }[] }).items.some(item => item.name === 'demo::persist'),
  )
  assert.deepEqual(
    (users.body as { items: { email: string }[] }).items.map(item => item.email),
    ['persisted@example.com'],
  )
})

test('corrupt persisted backend state falls back to the default catalog', async () => {
  const storage = createMemoryStorage()
  storage.setItem(MOCK_BACKEND_STORAGE_KEY, '{not-json')

  const request = createClient(storage)
  const languages = await request('get', '/api/lang')

  assert.deepEqual(languages.body, [
    { id: 1, name: 'enUS' },
    { id: 2, name: 'zhCN' },
  ])
})

test('issued mock access tokens still authenticate after a process restart', async () => {
  const storage = createMemoryStorage()
  const request = createClient(storage)
  const login = await request('post', '/api/auth/login', {
    email: 'admin@no-reply.com',
    password: 'admin',
  })
  const token = (login.body as { accessToken: string }).accessToken
  const reloaded = createClient(storage)
  const session = await reloaded(
    'get',
    '/api/user/info/',
    undefined,
    { authorization: `Bearer ${token}` },
  )

  assert.equal(session.statusCode, 200)
  assert.equal((session.body as { email: string }).email, 'admin@no-reply.com')
})

test('logged-out tokens stay invalid after the mock backend is recreated', async () => {
  const storage = createMemoryStorage()
  const request = createClient(storage)
  const login = await request('post', '/api/auth/login', {
    email: 'admin@no-reply.com',
    password: 'admin',
  })
  assert.equal(login.statusCode, 200)
  const token = (login.body as { accessToken: string }).accessToken
  assert.ok(token)

  await request(
    'post',
    '/api/auth/logout',
    undefined,
    { authorization: `Bearer ${token}` },
  )

  const reloaded = createClient(storage)
  const session = await reloaded(
    'get',
    '/api/user/info/',
    undefined,
    { authorization: `Bearer ${token}` },
  )

  assert.equal(session.statusCode, 401)
})

test('persisted mock credentials are not stored as plaintext passwords', async () => {
  const storage = createMemoryStorage()
  const request = createClient(storage)
  const registered = await request('post', '/api/user/reg', {
    email: 'secret@example.com',
    password: 'persisted-password',
    department: 'demo',
    employeeType: 'full-time',
    job: 'tester',
    probationDate: '2024-01-01',
    probationPeriod: '3',
    protocol: true,
    role: 'employee',
  })
  assert.equal(registered.statusCode, 200)

  const snapshot = JSON.parse(storage.getItem(MOCK_BACKEND_STORAGE_KEY) ?? '{}') as {
    credentials?: [string, string][]
  }
  const credential = snapshot.credentials?.find(([email]) => email === 'secret@example.com')
  assert.equal(JSON.stringify(snapshot).includes('persisted-password'), false)
  assert.ok(credential)
  assert.match(credential[1], /^[0-9a-f]{64}$/)
})

test('malformed persisted roles fall back to the default catalog', async () => {
  const storage = createMemoryStorage()
  const request = createClient(storage)
  await request('post', '/api/auth/login', {
    email: 'admin@no-reply.com',
    password: 'admin',
  })
  const snapshot = JSON.parse(storage.getItem(MOCK_BACKEND_STORAGE_KEY) ?? '{}')
  snapshot.roles = [{}]
  storage.setItem(MOCK_BACKEND_STORAGE_KEY, JSON.stringify(snapshot))

  const reloaded = createClient(storage)
  const roles = await reloaded('get', '/api/role')
  const admin = (roles.body as { name?: string, menus?: unknown }[])
    .find(item => item.name === 'admin')
  assert.ok(Array.isArray(admin?.menus))
})

test('incomplete persisted snapshots fall back to the default catalog', async () => {
  const storage = createMemoryStorage()
  const request = createClient(storage)
  await request('post', '/api/auth/login', {
    email: 'admin@no-reply.com',
    password: 'admin',
  })
  const snapshot = JSON.parse(storage.getItem(MOCK_BACKEND_STORAGE_KEY) ?? '{}')
  delete snapshot.languages
  storage.setItem(MOCK_BACKEND_STORAGE_KEY, JSON.stringify(snapshot))

  const reloaded = createClient(storage)
  const created = await reloaded('post', '/api/lang', { name: 'frFR' })
  assert.equal(created.statusCode, 200)
})

test('role menu updates still apply after persisted user-role identity is restored', async () => {
  const storage = createMemoryStorage()
  const request = createClient(storage)
  await request('post', '/api/auth/login', {
    email: 'admin@no-reply.com',
    password: 'admin',
  })

  const reloaded = createClient(storage)
  const menus = (await reloaded('get', '/api/menu')).body as { id: number; label: string }[]
  const list = menus.find(item => item.label === 'List')
  assert.ok(list)

  await reloaded('patch', '/api/role', { id: 1, menuIds: [list.id] })
  const assigned = (await reloaded('get', '/api/menu/role/admin@no-reply.com')).body as { label: string }[]
  assert.deepEqual(assigned.map(item => item.label), ['List'])
})
