import fs from 'node:fs'
import path from 'node:path'

export const PUBLISH_PACKAGES = Object.freeze([
  ['@opentiny/tiny-robot-cli', 'packages/cli/package.json'],
  ['@opentiny/tiny-robot', 'packages/components/package.json'],
  ['@opentiny/tiny-robot-chat', 'packages/chat/package.json'],
  ['@opentiny/tiny-robot-kit', 'packages/kit/package.json'],
  ['@opentiny/tiny-robot-svgs', 'packages/svgs/package.json'],
])

export const PUBLISHED_DEPENDENCY_SECTIONS = Object.freeze(['dependencies', 'optionalDependencies', 'peerDependencies'])

export const SEMVER_PATTERN =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-((?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/

function stripBom(source) {
  return source.charCodeAt(0) === 0xfeff ? source.slice(1) : source
}

function findStringEnd(source, start) {
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === '\\') index += 1
    else if (source[index] === '"') return index + 1
  }

  throw new Error('Unterminated JSON string')
}

function skipWhitespace(source, start) {
  let index = start
  while (index < source.length && /\s/.test(source[index])) index += 1
  return index
}

function findRootVersion(source, relativePath) {
  const start = source.charCodeAt(0) === 0xfeff ? 1 : 0
  let objectDepth = 0
  let arrayDepth = 0

  for (let index = start; index < source.length; index += 1) {
    const char = source[index]

    if (char === '"') {
      const end = findStringEnd(source, index)

      if (objectDepth === 1 && arrayDepth === 0) {
        const previous = source.slice(0, index).trimEnd().at(-1)
        const key = source.slice(index + 1, end - 1)

        if ((previous === '{' || previous === ',') && key === 'version') {
          const colon = skipWhitespace(source, end)
          const valueStart = skipWhitespace(source, colon + 1)

          if (source[colon] !== ':' || source[valueStart] !== '"') {
            throw new Error(relativePath + ' must contain a top-level string version field')
          }

          return { start: valueStart, end: findStringEnd(source, valueStart) }
        }
      }

      index = end - 1
      continue
    }

    if (char === '{') objectDepth += 1
    else if (char === '}') objectDepth -= 1
    else if (char === '[') arrayDepth += 1
    else if (char === ']') arrayDepth -= 1
  }

  throw new Error(relativePath + ' must contain a top-level version field')
}

function findObjectEnd(source, start) {
  let depth = 0

  for (let index = start; index < source.length; index += 1) {
    if (source[index] === '"') {
      index = findStringEnd(source, index) - 1
      continue
    }
    if (source[index] === '{') depth += 1
    else if (source[index] === '}' && --depth === 0) return index + 1
  }

  throw new Error('Unterminated JSON object')
}

function findTopLevelObject(source, key, relativePath) {
  let objectDepth = 0
  let arrayDepth = 0

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]

    if (char === '"') {
      const end = findStringEnd(source, index)
      const previous = source.slice(0, index).trimEnd().at(-1)
      const candidate = source.slice(index + 1, end - 1)

      if (objectDepth === 1 && arrayDepth === 0 && (previous === '{' || previous === ',') && candidate === key) {
        const colon = skipWhitespace(source, end)
        const valueStart = skipWhitespace(source, colon + 1)
        if (source[colon] !== ':' || source[valueStart] !== '{') {
          throw new Error(relativePath + ' must contain a top-level object ' + key)
        }
        return { start: valueStart, end: findObjectEnd(source, valueStart) }
      }

      index = end - 1
      continue
    }

    if (char === '{') objectDepth += 1
    else if (char === '}') objectDepth -= 1
    else if (char === '[') arrayDepth += 1
    else if (char === ']') arrayDepth -= 1
  }

  throw new Error(relativePath + ' must contain a top-level object ' + key)
}

function findObjectStringProperty(source, objectRange, key, relativePath) {
  let objectDepth = 0

  for (let index = objectRange.start; index < objectRange.end; index += 1) {
    const char = source[index]

    if (char === '"') {
      const end = findStringEnd(source, index)
      const previous = source.slice(objectRange.start, index).trimEnd().at(-1)
      const candidate = source.slice(index + 1, end - 1)

      if (objectDepth === 1 && (previous === '{' || previous === ',') && candidate === key) {
        const colon = skipWhitespace(source, end)
        const valueStart = skipWhitespace(source, colon + 1)
        if (source[colon] !== ':' || source[valueStart] !== '"') {
          throw new Error(relativePath + ' ' + key + ' must be a string')
        }
        return { start: valueStart, end: findStringEnd(source, valueStart) }
      }

      index = end - 1
      continue
    }

    if (char === '{') objectDepth += 1
    else if (char === '}') objectDepth -= 1
  }

  throw new Error(relativePath + ' must contain ' + key)
}

export function assertPublishVersion(version) {
  const match = typeof version === 'string' ? SEMVER_PATTERN.exec(version) : null
  if (!match) throw new Error('Package version must be a valid semantic version: ' + String(version))

  const channel = match[1]?.split('.')[0] ?? 'latest'
  if (/^(?:v)?\d+$|^[xX]$/.test(channel)) {
    throw new Error('Package version derives an unusable npm dist-tag: ' + channel)
  }

  return { version, distTag: channel }
}

export function readPublishPackages(rootDir) {
  return PUBLISH_PACKAGES.map(([expectedName, relativePath]) => {
    const packageFile = path.join(rootDir, relativePath)
    let source

    try {
      source = fs.readFileSync(packageFile, 'utf8')
    } catch (error) {
      throw new Error('Cannot read ' + relativePath + ': ' + (error instanceof Error ? error.message : String(error)))
    }

    let packageJson
    try {
      packageJson = JSON.parse(stripBom(source))
    } catch (error) {
      throw new Error(
        'Invalid JSON in ' + relativePath + ': ' + (error instanceof Error ? error.message : String(error)),
      )
    }

    if (packageJson.name !== expectedName) {
      throw new Error(relativePath + ' must describe ' + expectedName + '; found ' + String(packageJson.name))
    }

    if (typeof packageJson.version !== 'string') {
      throw new Error(relativePath + ' must contain a top-level string version field')
    }

    const versionRange = findRootVersion(source, relativePath)

    return { name: expectedName, relativePath, packageFile, packageJson, source, versionRange }
  })
}

export function replaceTopLevelVersion(source, version, relativePath) {
  const range = findRootVersion(source, relativePath)
  return source.slice(0, range.start) + JSON.stringify(version) + source.slice(range.end)
}

export function replaceDependencyVersion(source, section, dependency, version, relativePath) {
  const sectionRange = findTopLevelObject(source, section, relativePath)
  const valueRange = findObjectStringProperty(source, sectionRange, dependency, relativePath)
  return source.slice(0, valueRange.start) + JSON.stringify(version) + source.slice(valueRange.end)
}
