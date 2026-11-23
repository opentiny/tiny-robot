import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import axios from 'axios'
import { createMockAxiosAdapter, resolveMockRequestUrl } from './axios-adapter'
import { createMockHandlers } from './handlers'

test('strips the mock server host prefix used by frontend APIs', () => {
  assert.equal(resolveMockRequestUrl('/api/auth/login'), '/api/auth/login')
  assert.equal(
    resolveMockRequestUrl('/mock/api/employee/getEmployee'),
    '/api/employee/getEmployee',
  )
  assert.equal(
    resolveMockRequestUrl('http://localhost:3031/mock/api/user/getdata?x=1'),
    '/api/user/getdata?x=1',
  )
})

test('axios can login against in-browser mock handlers without a backend', async () => {
  const client = axios.create({
    adapter: createMockAxiosAdapter(createMockHandlers(), { mockServerHost: '/mock' }),
  })

  const login = await client.post('/api/auth/login', {
    email: 'admin@no-reply.com',
    password: 'admin',
  })

  assert.equal(login.status, 200)
  assert.equal(typeof login.data.accessToken, 'string')

  const menus = await client.get('/api/menu/role/admin@no-reply.com', {
    headers: { Authorization: `Bearer ${login.data.accessToken}` },
  })
  assert.ok(Array.isArray(menus.data) && menus.data.length > 0)

  const employees = await client.post('/mock/api/employee/getEmployee', {
    pageIndex: 1,
    pageSize: 10,
  })
  assert.equal(employees.status, 200)
  assert.equal(employees.data.data.total, 60)
  assert.doesNotMatch(String(login.request.responseURL), /mock/)
  assert.match(String(employees.request.responseURL), /mock/)
})

test('invalid login still surfaces as an HTTP 401 to axios', async () => {
  const client = axios.create({
    adapter: createMockAxiosAdapter(createMockHandlers(), { mockServerHost: '/mock' }),
  })

  await assert.rejects(
    () => client.post('/api/auth/login', {
      email: 'admin@no-reply.com',
      password: 'wrong',
    }),
    (error: unknown) => {
      assert.equal((error as { response: { status: number } }).response.status, 401)
      return true
    },
  )
})
