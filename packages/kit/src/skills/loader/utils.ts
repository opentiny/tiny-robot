import { parse as parseYaml } from 'yaml'
import { getExtension, isTextSkillFilePath, normalizeSkillPath } from '../utils'
import type { SkillLoadBaseOptions, SkillLoadContext, SkillLoadJob, SkillLoadResult, SkillLoadWarning } from './type'

class SkillLoadCancelledError extends Error {
  constructor() {
    super('Skill load was cancelled.')
    this.name = 'SkillLoadCancelledError'
  }
}

export function throwIfSkillLoadCancelled(signal: AbortSignal) {
  if (!signal.aborted) {
    return
  }

  if (signal.reason instanceof Error) {
    throw signal.reason
  }

  throw new SkillLoadCancelledError()
}

const normalizeAbortError = (error: unknown): never => {
  if (error instanceof DOMException && error.name === 'AbortError') {
    throw new SkillLoadCancelledError()
  }

  throw error
}

export function createSkillLoadJob(load: (context: SkillLoadContext) => Promise<SkillLoadResult>): SkillLoadJob {
  const controller = new AbortController()

  const job = (async () => {
    try {
      throwIfSkillLoadCancelled(controller.signal)
      const result = await load({ signal: controller.signal })
      throwIfSkillLoadCancelled(controller.signal)
      return result
    } catch (error) {
      normalizeAbortError(error)
    }
  })() as SkillLoadJob

  job.cancel = () => {
    controller.abort(new SkillLoadCancelledError())
  }

  return job
}

export { getExtension, isTextSkillFilePath, normalizeSkillPath }

export function parseMarkdownFrontmatter(content: string) {
  if (!content.startsWith('---')) {
    return {
      frontmatter: {} as Record<string, unknown>,
      body: content,
    }
  }

  const endIndex = content.indexOf('\n---', 3)

  if (endIndex === -1) {
    return {
      frontmatter: {} as Record<string, unknown>,
      body: content,
    }
  }

  const rawFrontmatter = content.slice(3, endIndex).trim()
  const body = content.slice(endIndex + 4)

  return {
    frontmatter: getRecord(parseYaml(rawFrontmatter)) ?? {},
    body,
  }
}

export function stripRootDirectory(path: string) {
  const normalized = path.split('\\').join('/')
  const parts = normalized.split('/').filter(Boolean)
  return parts.length <= 1 ? normalized : parts.slice(1).join('/')
}

export function getFallbackSkillName(entryFile: string) {
  const filename = entryFile.split('/').at(-1) || entryFile
  const ext = getExtension(filename)
  return ext ? filename.slice(0, -ext.length) : filename
}

export function pushWarning(warnings: SkillLoadWarning[], options: SkillLoadBaseOptions, warning: SkillLoadWarning) {
  if (options.strict) {
    throw new Error(warning.path ? `${warning.path}: ${warning.message}` : warning.message)
  }

  warnings.push(warning)
}

export const getString = (value: unknown) => (typeof value === 'string' ? value : undefined)

export const getRecord = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined
