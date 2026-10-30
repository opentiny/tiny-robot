import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assertExperimentalBuildBudget,
  collectBuildMeasurements,
  summarizeMountSamples,
} from './measure-chat-experimental.mjs'

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

test('keeps the self-contained experimental build inside the shipping budget', () => {
  const result = collectBuildMeasurements()
  const checked = assertExperimentalBuildBudget(result)

  assert.equal(checked.passed, true)
  assert.ok(checked.actual.jsGzipBytes > 0)
  assert.ok(checked.actual.cssGzipBytes > 0)
  assert.ok(checked.actual.jsGzipBytes <= checked.budget.jsGzipBytes)
  assert.ok(checked.actual.cssGzipBytes <= checked.budget.cssGzipBytes)
})

test('rejects a build that exceeds either compressed-size ceiling', () => {
  assert.throws(
    () =>
      assertExperimentalBuildBudget({
        experimental: {
          js: { gzipBytes: 665_601 },
          css: { gzipBytes: 49_153 },
        },
      }),
    /experimental build budget exceeded.*javascript.*css/i,
  )
})

test('summarizes representative mount timing samples and console errors', () => {
  const result = summarizeMountSamples([12.5, 8.25, 10.75], ['example error'])

  assert.deepEqual(result.samplesMs, [12.5, 8.25, 10.75])
  assert.equal(result.minMs, 8.25)
  assert.equal(result.medianMs, 10.75)
  assert.equal(result.maxMs, 12.5)
  assert.deepEqual(result.consoleErrors, ['example error'])
})
