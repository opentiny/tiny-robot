import semver from 'semver'

export const DEFAULT_RUNTIME_VERSION = '0.5.2-rc.2'
export const RUNTIME_VERSION_PLACEHOLDER = '__TINY_ROBOT_VERSION__'

export function resolveRuntimeVersion(value = DEFAULT_RUNTIME_VERSION) {
  const version = typeof value === 'string' ? semver.valid(value) : null

  if (!version) throw new Error('runtime version must be an exact semantic version.')

  return version
}
