import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import semver from 'semver'

import {
  assertPublishVersion,
  PUBLISHED_DEPENDENCY_SECTIONS,
  readPublishPackages,
  resolvePublishedDependencyRange,
} from './publish-version-utils.js'

export function verifyPublishVersions({ rootDir = process.cwd(), expectedVersion, distTag } = {}) {
  const packages = readPublishPackages(rootDir).map(({ name, packageJson }) => ({
    name,
    version: packageJson.version,
    packageJson,
  }))
  const version = packages[0].version
  const { distTag: requiredDistTag } = assertPublishVersion(version)
  const packageVersions = new Map(packages.map((pkg) => [pkg.name, pkg.version]))

  for (const pkg of packages) {
    for (const [dependency, spec] of Object.entries(pkg.packageJson.peerDependencies ?? {})) {
      if (typeof spec === 'string' && spec.startsWith('workspace:')) {
        throw new Error(`${pkg.name} peerDependencies.${dependency} must not use ${spec} when publishing`)
      }
    }

    const internalDependencies = new Map()
    for (const section of PUBLISHED_DEPENDENCY_SECTIONS) {
      for (const [dependency, spec] of Object.entries(pkg.packageJson[section] ?? {})) {
        const dependencyVersion = packageVersions.get(dependency)
        if (!dependencyVersion) continue

        const declarations = internalDependencies.get(dependency) ?? []
        declarations.push({ section, spec })
        internalDependencies.set(dependency, declarations)
      }
    }

    for (const [dependency, declarations] of internalDependencies) {
      if (declarations.length > 1) {
        throw new Error(
          `${pkg.name} declares ${dependency} in multiple published dependency sections: ${declarations
            .map(({ section }) => section)
            .join(', ')}`,
        )
      }

      const [{ section, spec }] = declarations
      const dependencyVersion = packageVersions.get(dependency)
      if (typeof spec !== 'string') {
        throw new Error(`${pkg.name} ${section}.${dependency} must use a string version range`)
      }

      const publishedRange = resolvePublishedDependencyRange(spec, dependencyVersion)
      if (!semver.validRange(publishedRange) || !semver.satisfies(dependencyVersion, publishedRange)) {
        throw new Error(
          `${pkg.name} ${section}.${dependency} uses ${spec}, which does not include published version ${dependencyVersion}`,
        )
      }
    }
  }

  const component = packages.find((pkg) => pkg.name === '@opentiny/tiny-robot')
  const runtimePeer = component.packageJson.peerDependencies?.['@opentiny/tiny-robot-kit']
  const expectedRuntimePeer = `^${component.version}`
  if (runtimePeer !== expectedRuntimePeer) {
    throw new Error(
      `${component.name} peer @opentiny/tiny-robot-kit uses ${String(runtimePeer)}; expected ${expectedRuntimePeer}`,
    )
  }

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
