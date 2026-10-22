import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { preparePublishPackages } from './prepare-publish-packages.js'
import { PUBLISH_PACKAGES } from './publish-version-utils.js'

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tiny-robot-prepare-publish-'))

  for (const [name, relativePath] of PUBLISH_PACKAGES) {
    const packageJson = { name, version: '1.0.0-rc.3' }

    if (name === '@opentiny/tiny-robot') {
      packageJson.dependencies = {
        '@opentiny/tiny-robot-svgs': 'workspace:*',
        external: '^2.0.0',
      }
      packageJson.optionalDependencies = {
        '@opentiny/tiny-robot-kit': 'workspace:~',
      }
      packageJson.peerDependencies = {
        '@opentiny/tiny-robot-kit': 'workspace:^',
        vue: '^3.3.11',
      }
      packageJson.devDependencies = {
        '@opentiny/tiny-robot-kit': 'workspace:*',
      }
    }

    const packageFile = path.join(root, relativePath)
    fs.mkdirSync(path.dirname(packageFile), { recursive: true })
    fs.writeFileSync(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`)
  }

  return root
}

test('converts published workspace dependencies to package-manager-neutral ranges', () => {
  const root = createFixture()

  try {
    assert.deepEqual(preparePublishPackages({ rootDir: root }), { updated: 1 })

    const component = JSON.parse(fs.readFileSync(path.join(root, 'packages/components/package.json'), 'utf8'))
    assert.equal(component.dependencies['@opentiny/tiny-robot-svgs'], '1.0.0-rc.3')
    assert.equal(component.dependencies.external, '^2.0.0')
    assert.equal(component.optionalDependencies['@opentiny/tiny-robot-kit'], '~1.0.0-rc.3')
    assert.equal(component.peerDependencies['@opentiny/tiny-robot-kit'], '^1.0.0-rc.3')
    assert.equal(component.peerDependencies.vue, '^3.3.11')
    assert.equal(component.devDependencies['@opentiny/tiny-robot-kit'], 'workspace:*')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('rejects a workspace dependency that is not a published package', () => {
  const root = createFixture()
  const componentFile = path.join(root, 'packages/components/package.json')
  const component = JSON.parse(fs.readFileSync(componentFile, 'utf8'))
  component.peerDependencies.unknown = 'workspace:^'
  fs.writeFileSync(componentFile, `${JSON.stringify(component, null, 2)}\n`)

  try {
    assert.throws(
      () => preparePublishPackages({ rootDir: root }),
      /@opentiny\/tiny-robot.*peerDependencies\.unknown.*published workspace package/i,
    )
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('continues restoring manifests and reports every rollback failure', () => {
  const root = createFixture()
  const componentFile = path.join(root, 'packages/components/package.json')
  const chatFile = path.join(root, 'packages/chat/package.json')
  const kitFile = path.join(root, 'packages/kit/package.json')

  for (const [packageFile, dependency] of [
    [chatFile, '@opentiny/tiny-robot'],
    [kitFile, '@opentiny/tiny-robot-svgs'],
  ]) {
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'))
    packageJson.dependencies = { [dependency]: 'workspace:*' }
    fs.writeFileSync(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`)
  }

  const originals = new Map(
    [componentFile, chatFile, kitFile].map((packageFile) => [packageFile, fs.readFileSync(packageFile, 'utf8')]),
  )
  let writes = 0

  try {
    assert.throws(
      () =>
        preparePublishPackages({
          rootDir: root,
          writeFile(packageFile, source, encoding) {
            writes += 1
            if (writes === 3) throw new Error('write failed')
            if (writes === 4) throw new Error('restore failed')
            fs.writeFileSync(packageFile, source, encoding)
          },
        }),
      /write failed.*rollback failed.*restore failed/i,
    )

    assert.equal(fs.readFileSync(componentFile, 'utf8'), originals.get(componentFile))
    assert.equal(fs.readFileSync(chatFile, 'utf8'), originals.get(chatFile))
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
