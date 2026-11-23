import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import { dispatchMockRequest } from './dispatch'
import { createEditorMocks, createMemoryEditorStorage } from './editor'

function createClient(storage = createMemoryEditorStorage()) {
  const mocks = createEditorMocks(storage)
  return {
    storage,
    request: (method: string, url: string, body?: unknown) => {
      return dispatchMockRequest(mocks, { method, url, body })
    },
  }
}

test('documents endpoints expose the seed rich-text documents', async () => {
  const { request } = createClient()
  const response = await request('get', '/api/editor/documents')

  assert.equal(response.statusCode, 200)
  const list = response.body as { id: number, name: string }[]
  assert.deepEqual(list.map(item => item.id), [1, 2, 3])
})

test('document create / update / delete round-trips through the mock api', async () => {
  const { request } = createClient()

  const created = await request('post', '/api/editor/document', { name: '新文档', content: '<p>hi</p>' })
  const doc = created.body as { id: number, name: string, department: string }
  assert.equal(doc.name, '新文档')
  assert.equal(doc.department, '未分类')

  const updated = await request('post', '/api/editor/document/update', { id: doc.id, patch: { name: '改名' } })
  assert.equal(updated.body, true)
  const list = (await request('get', '/api/editor/documents')).body as { id: number, name: string }[]
  assert.equal(list.find(item => item.id === doc.id)?.name, '改名')

  const removed = await request('delete', `/api/editor/document?id=${doc.id}`)
  assert.equal(removed.body, true)
  const after = (await request('get', '/api/editor/documents')).body as { id: number }[]
  assert.ok(!after.some(item => item.id === doc.id))
})

test('missing documents return 404 instead of mutating state', async () => {
  const { request } = createClient()

  const update = await request('post', '/api/editor/document/update', { id: 999, patch: { name: 'x' } })
  assert.equal(update.statusCode, 404)

  const remove = await request('delete', '/api/editor/document?id=999')
  assert.equal(remove.statusCode, 404)

  const missingCollab = await request('post', '/api/editor/collaboration-document/update', { id: 999, patch: {} })
  assert.equal(missingCollab.statusCode, 404)
})

test('collaboration document ids are never reused, even after deleting the newest one', async () => {
  const { request } = createClient()

  const first = (await request('post', '/api/editor/collaboration-document', { name: 'A', content: '' })).body as { id: number }
  const second = (await request('post', '/api/editor/collaboration-document', { name: 'B', content: '' })).body as { id: number }
  assert.notEqual(first.id, second.id)

  await request('delete', `/api/editor/collaboration-document?id=${second.id}`)
  const third = (await request('post', '/api/editor/collaboration-document', { name: 'C', content: '' })).body as { id: number }
  assert.notEqual(third.id, second.id)
})

test('mutations persist through the injected storage', async () => {
  const storage = createMemoryEditorStorage()
  const first = createClient(storage)
  const created = (await first.request('post', '/api/editor/document', { name: '持久化', content: '' })).body as { id: number }

  // 模拟页面刷新：同一 storage 重新创建一套 handlers，状态应从 storage 恢复
  const second = createClient(storage)
  const list = (await second.request('get', '/api/editor/documents')).body as { id: number }[]
  assert.ok(list.some(item => item.id === created.id))
})
