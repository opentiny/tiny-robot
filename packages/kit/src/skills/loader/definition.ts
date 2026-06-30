import type { SkillResourceDescriptor } from '../types'
import type { LoadableSkillFile, SkillLoadBaseOptions, SkillLoadResult, SkillLoadWarning } from './type'
import {
  getFallbackSkillName,
  getRecord,
  getString,
  isTextSkillFilePath,
  normalizeSkillPath,
  parseMarkdownFrontmatter,
  pushWarning,
} from './utils'

export function createSkillDefinition(files: LoadableSkillFile[], options: SkillLoadBaseOptions): SkillLoadResult {
  const warnings: SkillLoadWarning[] = []
  const rawEntryFile = options.entryFile ?? 'SKILL.md'
  const entryFile = normalizeSkillPath(rawEntryFile)

  if (!entryFile) {
    throw new Error(`Invalid skill entry file path: "${rawEntryFile}".`)
  }

  const normalizedFiles = normalizeFiles(files, options, warnings)
  const skillEntry = normalizedFiles.find((file) => file.path === entryFile)

  if (!skillEntry) {
    throw new Error(`Skill entry file "${entryFile}" is missing.`)
  }

  if (skillEntry.kind !== 'text') {
    throw new Error(`Skill entry file "${entryFile}" must be a text file.`)
  }

  const { frontmatter, body } = parseMarkdownFrontmatter(String(skillEntry.content))
  const instructions = body.trim()

  if (!instructions) {
    throw new Error(`Skill entry file "${entryFile}" must contain instructions.`)
  }

  const resources = normalizedFiles.flatMap((file) => {
    if (file.path === entryFile) return []
    if (file.kind === 'text' && !isTextSkillFilePath(file.path)) {
      pushWarning(warnings, options, {
        code: 'unsupported-text-file-ignored',
        message: 'Only markdown, text, and json files are converted to text skill files.',
        path: file.path,
      })
      return []
    }

    return [toSkillResource(file)]
  })

  return {
    skill: {
      name: getString(frontmatter.name) || getFallbackSkillName(entryFile),
      description: getString(frontmatter.description) || '',
      instructions,
      resources: resources.length ? resources : undefined,
      metadata: {
        ...getRecord(frontmatter.metadata),
        ...(getString(frontmatter.homepage) ? { homepage: getString(frontmatter.homepage) } : {}),
      },
    },
    warnings,
  }
}

function normalizeFiles<T extends LoadableSkillFile>(
  files: T[],
  options: SkillLoadBaseOptions,
  warnings: SkillLoadWarning[],
) {
  const result: T[] = []
  const seenPaths = new Set<string>()

  for (const file of files) {
    const path = normalizeSkillPath(file.path)

    if (!path) {
      pushWarning(warnings, options, {
        code: 'invalid-path',
        message: `Invalid skill file path: ${file.path}`,
        path: file.path,
      })
      continue
    }

    if (seenPaths.has(path)) {
      pushWarning(warnings, options, {
        code: 'duplicate-path',
        message: `Duplicate skill file path: ${path}`,
        path,
      })
      continue
    }

    seenPaths.add(path)
    result.push({ ...file, path })
  }

  return result.sort((a, b) => a.path.localeCompare(b.path))
}

function toSkillResource(file: LoadableSkillFile): SkillResourceDescriptor {
  if (file.kind === 'text') {
    const text = typeof file.content === 'string' ? file.content : new TextDecoder().decode(file.content)

    return {
      path: file.path,
      kind: file.kind,
      resourceId: file.path,
      mimeType: file.mimeType,
      size: file.size,
      lastModified: file.lastModified,
      metadata: file.metadata,
      text,
      readText: async () => text,
      readBinary: async () => new TextEncoder().encode(text),
    }
  }

  const binary = file.content instanceof Uint8Array ? file.content : new TextEncoder().encode(file.content)

  return {
    path: file.path,
    kind: file.kind,
    resourceId: file.path,
    mimeType: file.mimeType,
    size: file.size,
    lastModified: file.lastModified,
    metadata: file.metadata,
    binary,
    readBinary: async () => binary,
  }
}
