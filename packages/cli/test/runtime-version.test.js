import assert from 'node:assert/strict'
import test from 'node:test'

import { DEFAULT_RUNTIME_VERSION, resolveRuntimeVersion } from '../bin/runtime-version.js'

test('runtime version defaults to the supported release and normalizes exact versions', () => {
  assert.equal(resolveRuntimeVersion(), DEFAULT_RUNTIME_VERSION)
  assert.equal(resolveRuntimeVersion('v0.5.2-rc.3'), '0.5.2-rc.3')
})

test('runtime version rejects tags and ranges', () => {
  assert.throws(() => resolveRuntimeVersion('latest'), /exact semantic version/)
  assert.throws(() => resolveRuntimeVersion('^0.5.2'), /exact semantic version/)
})
