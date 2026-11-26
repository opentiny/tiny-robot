import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import board from './board'
import { dispatchMockRequest } from './dispatch'

test('getrtrain returns collect cards with i18n fields for learn-traini', async () => {
  const result = await dispatchMockRequest(board, {
    method: 'get',
    url: '/api/user/getrtrain',
  })

  assert.equal(result.statusCode, 200)
  const options = (result.body as { data: { options: Array<{
    value: string
    description: string
    label1: string
    label2: string
    isNews?: boolean
  }> } }).data.options

  assert.equal(options.length, 4)
  assert.deepEqual(options[0], {
    value: 'work.mock.collectValue1',
    description: 'work.mock.collectDescription1',
    label1: 'work.mock.collectHotLabel1',
    label2: 'work.mock.collectLabel2',
  })
  assert.equal(options[3].value, 'work.mock.collectValue4')
  assert.equal(options[3].isNews, true)
  for (const item of options) {
    assert.ok(item.description)
    assert.ok(item.label1)
    assert.ok(item.label2)
  }
})
