import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import semver from 'semver'

const CLI_PACKAGE_FILE = fileURLToPath(new URL('../package.json', import.meta.url))

export function readCliVersion() {
  const packageJson = JSON.parse(fs.readFileSync(CLI_PACKAGE_FILE, 'utf8'))
  return packageJson.version
}

export function formatRuntimeSpecifier(version) {
  const parsedVersion = typeof version === 'string' ? semver.parse(version) : null
  const canonicalVersion = parsedVersion
    ? `${parsedVersion.version}${parsedVersion.build.length > 0 ? `+${parsedVersion.build.join('.')}` : ''}`
    : null
  if (!parsedVersion || canonicalVersion !== version) {
    throw new Error(`Runtime version must be a valid semantic version: ${String(version)}`)
  }

  return parsedVersion.prerelease.length > 0 ? version : `^${version}`
}

export function resolveRuntimeVersion(override) {
  const version = override ?? readCliVersion()
  return { version, specifier: formatRuntimeSpecifier(version) }
}

export function createRuntimeDependencies(specifier) {
  return {
    '@opentiny/tiny-robot': specifier,
    '@opentiny/tiny-robot-chat': specifier,
    '@opentiny/tiny-robot-kit': specifier,
    '@opentiny/tiny-robot-svgs': specifier,
    '@vueuse/core': '13.9.0',
  }
}
