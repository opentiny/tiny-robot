import { execFileSync } from 'node:child_process'
import { copyFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { PUBLISH_PACKAGES } from './publish-version-utils.js'

try {
  const componentDirectory = 'packages/components'
  const componentReadmes = ['README.md', 'README.zh-CN.md']

  for (const readme of componentReadmes) {
    copyFileSync(readme, path.join(componentDirectory, readme))
  }

  for (const [name, manifest] of PUBLISH_PACKAGES) {
    const directory = path.dirname(manifest)
    const output = execFileSync(
      'npm',
      ['pack', path.resolve(directory), '--dry-run', '--json', '--ignore-scripts', '--offline'],
      { encoding: 'utf8' },
    )
    const [{ files }] = JSON.parse(output)
    const requiredReadmes = directory === componentDirectory ? componentReadmes : ['README.md']

    for (const readme of requiredReadmes) {
      if (!files.some((file) => file.path === readme)) {
        throw new Error(`${name} tarball must contain a root ${readme}`)
      }
    }
  }

  console.log(`Verified package root READMEs for all ${PUBLISH_PACKAGES.length} npm packages`)
} catch (error) {
  console.error(`Failed to prepare publish READMEs: ${error.message}`)
  process.exitCode = 1
}
