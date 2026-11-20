import assert from 'node:assert/strict'
import test from 'node:test'
import semver from 'semver'

import { collectPeerDependencies } from './test-package-install.js'

test('collects required external peers and combines duplicate ranges', () => {
  const packages = [
    {
      packageJson: {
        peerDependencies: {
          '@opentiny/tiny-robot-kit': '^1.0.1',
          'markdown-it': '^14.1.0',
          vue: '^3.3.11',
          'optional-editor': '^2.0.0',
        },
        peerDependenciesMeta: {
          'optional-editor': { optional: true },
        },
      },
    },
    {
      packageJson: {
        peerDependencies: {
          vue: '>=3.0.0',
          dompurify: '^3.3.1',
        },
      },
    },
  ]

  const peers = collectPeerDependencies(packages, new Set(['@opentiny/tiny-robot-kit']))

  assert.equal(peers['markdown-it'], '^14.1.0')
  assert.equal(peers.dompurify, '^3.3.1')
  assert.equal(semver.satisfies('3.5.0', peers.vue), true)
  assert.equal(semver.satisfies('3.2.0', peers.vue), false)
  assert.equal(semver.satisfies('4.0.0', peers.vue), false)
})

test('intersects complete peer ranges with OR alternatives', () => {
  const packages = [
    { packageJson: { name: 'first', peerDependencies: { editor: '^1.0.0 || ^2.0.0' } } },
    { packageJson: { name: 'second', peerDependencies: { editor: '^2.0.0 || ^3.0.0' } } },
  ]

  const peers = collectPeerDependencies(packages, new Set())

  assert.equal(semver.satisfies('1.5.0', peers.editor), false)
  assert.equal(semver.satisfies('2.5.0', peers.editor), true)
  assert.equal(semver.satisfies('3.5.0', peers.editor), false)
})

test('rejects peer ranges with no semantic intersection', () => {
  const packages = [
    { packageJson: { name: 'first', peerDependencies: { editor: '^1.0.0' } } },
    { packageJson: { name: 'second', peerDependencies: { editor: '^2.0.0' } } },
  ]

  assert.throws(
    () => collectPeerDependencies(packages, new Set()),
    /editor has incompatible ranges: \^1\.0\.0, \^2\.0\.0/,
  )
})

test('preserves prerelease exclusions from every peer range', () => {
  const packages = [
    { packageJson: { name: 'first', peerDependencies: { editor: '>=1.0.0-alpha <1.0.0' } } },
    { packageJson: { name: 'second', peerDependencies: { editor: '>=0.0.0 <1.0.0' } } },
  ]

  assert.throws(
    () => collectPeerDependencies(packages, new Set()),
    /editor has incompatible ranges: >=1\.0\.0-alpha <1\.0\.0, >=0\.0\.0 <1\.0\.0/,
  )
})
