import assert from 'node:assert/strict'
import test from 'node:test'

import { createRuntimeDependencies, formatRuntimeSpecifier, resolveRuntimeVersion } from '../bin/runtime-version.js'

test('prerelease runtime versions remain exact', () => {
  for (const version of ['0.5.2-alpha.15', '0.5.2-beta.3', '0.5.2-rc.1', '0.5.2-rc.1+build.7', '0.5.2-canary.4']) {
    assert.equal(formatRuntimeSpecifier(version), version)
    assert.deepEqual(resolveRuntimeVersion(version), { version, specifier: version })
  }
})

test('stable runtime versions use a caret range', () => {
  assert.equal(formatRuntimeSpecifier('0.5.3'), '^0.5.3')
  assert.deepEqual(resolveRuntimeVersion('0.5.3'), { version: '0.5.3', specifier: '^0.5.3' })
})

test('invalid runtime version overrides are rejected', () => {
  for (const version of ['', 'alpha', '^0.5.3', 'v0.5.3']) {
    assert.throws(() => resolveRuntimeVersion(version), /valid semantic version/i)
  }
})

test('all TinyRobot runtime packages share the resolved specifier', () => {
  assert.deepEqual(createRuntimeDependencies('0.5.2-alpha.15'), {
    '@opentiny/tiny-robot': '0.5.2-alpha.15',
    '@opentiny/tiny-robot-chat': '0.5.2-alpha.15',
    '@opentiny/tiny-robot-kit': '0.5.2-alpha.15',
    '@opentiny/tiny-robot-svgs': '0.5.2-alpha.15',
    '@vueuse/core': '13.9.0',
  })
})
