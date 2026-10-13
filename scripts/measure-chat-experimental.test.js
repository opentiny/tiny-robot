import assert from 'node:assert/strict'
import test from 'node:test'
import { collectBuildMeasurements, summarizeMountSamples } from './measure-chat-experimental.mjs'

test('reports stable and experimental raw/gzip sizes and bundled Vue evidence', () => {
  const result = collectBuildMeasurements()

  assert.ok(result.stable.js.rawBytes > 0)
  assert.ok(result.stable.js.gzipBytes > 0)
  assert.ok(result.experimental.js.rawBytes > result.stable.js.rawBytes)
  assert.ok(result.experimental.js.gzipBytes > result.stable.js.gzipBytes)
  assert.ok(result.experimental.css.rawBytes > 0)
  assert.ok(result.experimental.css.gzipBytes > 0)
  assert.equal(result.experimental.bundlesVue, true)
  assert.ok(result.experimental.files.length > 1)
})

test('summarizes representative mount timing samples and console errors', () => {
  const result = summarizeMountSamples([12.5, 8.25, 10.75], ['example error'])

  assert.deepEqual(result.samplesMs, [12.5, 8.25, 10.75])
  assert.equal(result.minMs, 8.25)
  assert.equal(result.medianMs, 10.75)
  assert.equal(result.maxMs, 12.5)
  assert.deepEqual(result.consoleErrors, ['example error'])
})
