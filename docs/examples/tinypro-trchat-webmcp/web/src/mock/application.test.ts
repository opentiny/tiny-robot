import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import application from './application'
import { dispatchMockRequest } from './dispatch'

test('GET /api/application returns paginated card-list data', async () => {
  const result = await dispatchMockRequest(application, {
    method: 'get',
    url: '/api/application?page=1&limit=10&keywords=&classify=all',
  })

  assert.equal(result.statusCode, 200)
  const body = result.body as {
    data: Array<{
      id: number
      name: string
      description: string
      icon: string
      classify: string
      tag: Array<{ type: string, value: string }>
    }>
    total: number
  }

  assert.ok(Array.isArray(body.data))
  assert.equal(body.data.length, 10)
  assert.ok(body.total > 10)
  assert.equal(typeof body.data[0].id, 'number')
  assert.equal(body.data[0].name, 'TinyVue 组件库')
  assert.equal(body.data[1].name, 'TinyEngine 低代码引擎')
  assert.ok(Array.isArray(body.data[0].tag))
})

test('GET /api/application filters by classify and keywords', async () => {
  const design = await dispatchMockRequest(application, {
    method: 'get',
    url: '/api/application?page=1&limit=10&classify=design',
  })
  const designBody = design.body as { data: Array<{ classify: string }>, total: number }
  assert.equal(design.statusCode, 200)
  assert.ok(designBody.total > 0)
  assert.ok(designBody.data.every(item => item.classify === 'design'))

  const search = await dispatchMockRequest(application, {
    method: 'get',
    url: '/api/application?page=1&limit=10&keywords=TinyEditor&classify=all',
  })
  const searchBody = search.body as { data: Array<{ name: string }>, total: number }
  assert.equal(search.statusCode, 200)
  assert.equal(searchBody.total, 1)
  assert.match(searchBody.data[0].name, /TinyEditor/)
})
