import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const PUBLISH_PACKAGES = [
  ['@opentiny/tiny-robot-cli', 'packages/cli/package.json'],
  ['@opentiny/tiny-robot', 'packages/components/package.json'],
  ['@opentiny/tiny-robot-chat', 'packages/chat/package.json'],
  ['@opentiny/tiny-robot-kit', 'packages/kit/package.json'],
  ['@opentiny/tiny-robot-svgs', 'packages/svgs/package.json'],
]

function readPackage(rootDir, expectedName, relativePath) {
  const packageFile = path.join(rootDir, relativePath)
  const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'))

  if (packageJson.name !== expectedName) {
    throw new Error(`${relativePath} must describe ${expectedName}; found ${String(packageJson.name)}`)
  }

  return packageJson
}

function publishChannel(version) {
  const match =
    /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.exec(
      version,
    )
  if (!match) throw new Error(`Package version must be a valid semantic version: ${version}`)
  return match[1]?.split('.')[0] ?? 'latest'
}

export function verifyPublishVersions({ rootDir = process.cwd(), expectedVersion, distTag } = {}) {
  const packages = PUBLISH_PACKAGES.map(([name, relativePath]) => ({
    name,
    version: readPackage(rootDir, name, relativePath).version,
  }))
  const version = packages[0].version

  for (const pkg of packages.slice(1)) {
    if (pkg.version !== version) {
      throw new Error(`${pkg.name} has version ${pkg.version}; expected ${version} to match @opentiny/tiny-robot-cli`)
    }
  }

  if (expectedVersion && version !== expectedVersion) {
    throw new Error(`Expected version ${expectedVersion} from Git tag, but packages use ${version}`)
  }

  const requiredDistTag = publishChannel(version)
  if (distTag && distTag !== requiredDistTag) {
    throw new Error(
      `Publish dist-tag ${distTag} does not match version ${version}; version requires ${requiredDistTag}`,
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
      if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`)
      if (argument === '--expected-version') options.expectedVersion = value
      else options.distTag = value
      index += 1
      continue
    }
    throw new Error(`Unknown argument: ${argument}`)
  }

  return options
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  try {
    const result = verifyPublishVersions(parseArgs(process.argv.slice(2)))
    console.log(`Verified synchronized publish version ${result.version} for dist-tag ${result.distTag}`)
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}
