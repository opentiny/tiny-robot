import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { assertPublishVersion, readPublishPackages } from './publish-version-utils.js'

export function verifyPublishVersions({ rootDir = process.cwd(), expectedVersion, distTag } = {}) {
  const packages = readPublishPackages(rootDir).map(({ name, packageJson }) => ({
    name,
    version: packageJson.version,
  }))
  const version = packages[0].version

  for (const pkg of packages.slice(1)) {
    if (pkg.version !== version) {
      throw new Error(
        pkg.name + ' has version ' + pkg.version + '; expected ' + version + ' to match @opentiny/tiny-robot-cli',
      )
    }
  }

  if (expectedVersion && version !== expectedVersion) {
    throw new Error('Expected version ' + expectedVersion + ' from Git tag, but packages use ' + version)
  }

  const { distTag: requiredDistTag } = assertPublishVersion(version)
  if (distTag && distTag !== requiredDistTag) {
    throw new Error(
      'Publish dist-tag ' + distTag + ' does not match version ' + version + '; version requires ' + requiredDistTag,
    )
  }

  return { version, distTag: requiredDistTag }
}

function parseArgs(argv) {
  const options = {}

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--expected-version' || argument === '--dist-tag') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) throw new Error(argument + ' requires a value')
      if (argument === '--expected-version') options.expectedVersion = value
      else options.distTag = value
      index += 1
      continue
    }
    throw new Error('Unknown argument: ' + argument)
  }

  return options
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  try {
    const result = verifyPublishVersions(parseArgs(process.argv.slice(2)))
    console.log('Verified synchronized publish version ' + result.version + ' for dist-tag ' + result.distTag)
  } catch (error) {
    console.error('Error: ' + (error instanceof Error ? error.message : String(error)))
    process.exitCode = 1
  }
}
