import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { verifyPublishVersions } from './verify-publish-versions.js'

const verifierFile = fileURLToPath(new URL('./verify-publish-versions.js', import.meta.url))
const packagePaths = {
  '@opentiny/tiny-robot-cli': 'packages/cli/package.json',
  '@opentiny/tiny-robot': 'packages/components/package.json',
  '@opentiny/tiny-robot-chat': 'packages/chat/package.json',
  '@opentiny/tiny-robot-kit': 'packages/kit/package.json',
  '@opentiny/tiny-robot-svgs': 'packages/svgs/package.json',
}

function createFixture(versions) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tiny-robot-publish-versions-'))

  for (const [name, relativePath] of Object.entries(packagePaths)) {
    const packageFile = path.join(root, relativePath)
    fs.mkdirSync(path.dirname(packageFile), { recursive: true })
    fs.writeFileSync(packageFile, `${JSON.stringify({ name, version: versions[name] }, null, 2)}\n`)
  }

  return root
}

function synchronizedVersions(version) {
  return Object.fromEntries(Object.keys(packagePaths).map((name) => [name, version]))
}

test('publish verification accepts synchronized prerelease packages on their channel', () => {
  const root = createFixture(synchronizedVersions('0.5.2-alpha.15'))

  try {
    assert.deepEqual(verifyPublishVersions({ rootDir: root, expectedVersion: '0.5.2-alpha.15', distTag: 'alpha' }), {
      version: '0.5.2-alpha.15',
      distTag: 'alpha',
    })
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('publish verification accepts synchronized stable packages on latest', () => {
  const root = createFixture(synchronizedVersions('0.5.3'))

  try {
    assert.deepEqual(verifyPublishVersions({ rootDir: root, distTag: 'latest' }), {
      version: '0.5.3',
      distTag: 'latest',
    })
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('publish verification rejects a mismatched runtime package', () => {
  const versions = synchronizedVersions('0.5.2-alpha.15')
  versions['@opentiny/tiny-robot-svgs'] = '0.5.2-alpha.14'
  const root = createFixture(versions)

  try {
    assert.throws(
      () => verifyPublishVersions({ rootDir: root, distTag: 'alpha' }),
      /@opentiny\/tiny-robot-svgs.*0\.5\.2-alpha\.14.*0\.5\.2-alpha\.15/i,
    )
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('publish verification rejects a version that does not match the Git tag', () => {
  const root = createFixture(synchronizedVersions('0.5.2-alpha.15'))

  try {
    assert.throws(
      () => verifyPublishVersions({ rootDir: root, expectedVersion: '0.5.2-alpha.16', distTag: 'alpha' }),
      /expected.*0\.5\.2-alpha\.16.*0\.5\.2-alpha\.15/i,
    )
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('publish verification rejects a dist-tag that does not match the package version', () => {
  const root = createFixture(synchronizedVersions('0.5.2-beta.3'))

  try {
    assert.throws(() => verifyPublishVersions({ rootDir: root, distTag: 'alpha' }), /dist-tag alpha.*requires beta/i)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('publish verifier CLI fails before publication when package versions diverge', () => {
  const versions = synchronizedVersions('0.5.3')
  versions['@opentiny/tiny-robot-chat'] = '0.5.2'
  const root = createFixture(versions)

  try {
    const result = spawnSync(process.execPath, [verifierFile, '--dist-tag', 'latest'], {
      cwd: root,
      encoding: 'utf8',
    })

    assert.equal(result.status, 1)
    assert.match(result.stderr, /@opentiny\/tiny-robot-chat/i)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
