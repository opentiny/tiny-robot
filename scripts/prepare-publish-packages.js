import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { PUBLISHED_DEPENDENCY_SECTIONS, readPublishPackages } from './publish-version-utils.js'

function publishedRange(spec, version) {
  const workspaceRange = spec.slice('workspace:'.length)

  if (workspaceRange === '' || workspaceRange === '*') return version
  if (workspaceRange === '^' || workspaceRange === '~') return workspaceRange + version
  return workspaceRange
}

export function preparePublishPackages({ rootDir = process.cwd(), writeFile = fs.writeFileSync } = {}) {
  const packages = readPublishPackages(rootDir)
  const versions = new Map(packages.map(({ name, packageJson }) => [name, packageJson.version]))
  const replacements = []

  for (const pkg of packages) {
    const packageJson = structuredClone(pkg.packageJson)
    let changed = false

    for (const section of PUBLISHED_DEPENDENCY_SECTIONS) {
      for (const [dependency, spec] of Object.entries(packageJson[section] ?? {})) {
        if (typeof spec !== 'string' || !spec.startsWith('workspace:')) continue

        const version = versions.get(dependency)
        if (!version) {
          throw new Error(`${pkg.name} ${section}.${dependency} must reference a published workspace package`)
        }

        packageJson[section][dependency] = publishedRange(spec, version)
        changed = true
      }
    }

    if (changed) {
      replacements.push({
        packageFile: pkg.packageFile,
        source: pkg.source,
        updated: `${JSON.stringify(packageJson, null, 2)}\n`,
      })
    }
  }

  const written = []
  try {
    for (const replacement of replacements) {
      written.push(replacement)
      writeFile(replacement.packageFile, replacement.updated, 'utf8')
    }
  } catch (error) {
    const rollbackErrors = []
    for (const replacement of written.reverse()) {
      try {
        writeFile(replacement.packageFile, replacement.source, 'utf8')
      } catch (rollbackError) {
        rollbackErrors.push(
          `${replacement.packageFile}: ${rollbackError instanceof Error ? rollbackError.message : String(rollbackError)}`,
        )
      }
    }

    const reason = error instanceof Error ? error.message : String(error)
    const rollbackMessage = rollbackErrors.length === 0 ? '' : ` Rollback failed: ${rollbackErrors.join('; ')}`
    throw new Error(`Failed to prepare publish packages: ${reason}.${rollbackMessage}`)
  }

  return { updated: replacements.length }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  try {
    const result = preparePublishPackages()
    console.log(`Prepared ${result.updated} package manifests for publication`)
  } catch (error) {
    console.error('Error: ' + (error instanceof Error ? error.message : String(error)))
    process.exitCode = 1
  }
}
