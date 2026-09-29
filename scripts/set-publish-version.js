import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { assertPublishVersion, readPublishPackages, replaceTopLevelVersion } from './publish-version-utils.js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function setPublishVersion({ rootDir: targetRootDir = rootDir, version, writeFile = fs.writeFileSync } = {}) {
  const { distTag } = assertPublishVersion(version)
  const packages = readPublishPackages(targetRootDir)
  const replacements = packages.map(({ packageFile, relativePath, source }) => ({
    packageFile,
    relativePath,
    source,
    updated: replaceTopLevelVersion(source, version, relativePath),
  }))
  const changed = replacements.filter(({ source, updated }) => source !== updated)

  if (changed.length === 0) return { version, distTag, updated: 0 }

  const written = []

  try {
    for (const replacement of changed) {
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
          replacement.relativePath + ': ' + (rollbackError instanceof Error ? rollbackError.message : String(rollbackError)),
        )
      }
    }

    const reason = error instanceof Error ? error.message : String(error)
    const rollbackMessage =
      rollbackErrors.length === 0 ? ' All written files were restored.' : ' Rollback failed: ' + rollbackErrors.join('; ')
    throw new Error('Failed to update package versions: ' + reason + '.' + rollbackMessage)
  }

  return { version, distTag, updated: changed.length }
}

function main() {
  const [version, ...extraArguments] = process.argv.slice(2)

  if (!version || extraArguments.length > 0) throw new Error('Usage: pnpm set-version <semver>')

  const result = setPublishVersion({ version })
  console.log('Updated ' + result.updated + ' packages to ' + result.version)
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  try {
    main()
  } catch (error) {
    console.error('Error: ' + (error instanceof Error ? error.message : String(error)))
    process.exitCode = 1
  }
}
