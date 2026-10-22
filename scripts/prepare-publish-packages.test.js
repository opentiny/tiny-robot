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
