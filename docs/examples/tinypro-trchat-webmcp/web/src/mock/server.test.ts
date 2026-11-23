import type { AddressInfo } from 'node:net'
import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import { createBackendMocks } from './backend'
import { startMockServer } from './server'

test('mock handlers are served through the real HTTP boundary', async (context) => {
  const server = await startMockServer(createBackendMocks(), { port: 0 })
  context.after(() => server.close())
  const { address, port } = server.address() as AddressInfo

  const response = await fetch(`http://${address}:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@no-reply.com',
      password: 'admin',
    }),
  })

  assert.equal(response.status, 200)
  assert.equal(typeof (await response.json()).accessToken, 'string')
})
