import assert from 'node:assert/strict'
import test from 'node:test'

test('imports the experimental package in Node without DOM globals', async () => {
  assert.equal(globalThis.window, undefined)
  assert.equal(globalThis.document, undefined)
  assert.equal(globalThis.customElements, undefined)

  const api = await import('../packages/chat/dist/experimental-node.js')

  assert.equal(typeof api.toExperimentalEventName, 'function')
  assert.equal(typeof api.defineTrChatElements, 'function')
  assert.equal(api.toExperimentalEventName('update:inputValue'), 'input-value-update')
})

test('reports an actionable error only when registration is requested in Node', async () => {
  const api = await import('../packages/chat/dist/experimental-node.js')

  assert.throws(
    () => api.defineTrChatElements(),
    (error) =>
      error instanceof Error &&
      error.name === 'TrChatBrowserOnlyError' &&
      /browser environment.*customElements/i.test(error.message),
  )
})
