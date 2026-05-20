import { parse as parseYaml } from 'yaml'
import type { SkillDefinition, SkillFile } from './types'
import { getExtension, isTextSkillFilePath, normalizeSkillPath } from './utils'

export interface SkillLoaderResult {
  /**
   * 从源文件解析出的 skill 定义。
   */
  skill: SkillDefinition
  /**
   * 非致命的加载警告。
   */
  warnings: Array<{
    /**
     * 用于 UI 和日志分类的警告编码。
     */
    code: string
    /**
     * 人类可读的警告信息。
     */
    message: string
    /**
     * 关联的 skill 文件路径。
     */
    path?: string
  }>
}

export interface SkillLoaderOptions {
  /**
   * skill 入口文件名。
   */
  entryFile?: string
  /**
   * 启用后，警告会直接抛出为错误。
   */
  strict?: boolean
}

/**
 * 将标准化后的 skill 文件转换为 SkillDefinition。
 *
 * 文件来源适配器负责提供 SkillFile[]；该 loader 负责解析入口文件和资源文件。
 */
export class SkillLoader {
  private entryFile: string
  private strict: boolean

  constructor(options: SkillLoaderOptions = {}) {
    this.entryFile = options.entryFile ?? 'SKILL.md'
    this.strict = options.strict ?? false
  }

  load(files: SkillFile[]): SkillLoaderResult {
    const warnings: SkillLoaderResult['warnings'] = []
    const normalizedFiles = this.normalizeFiles(files, warnings)
    const entryFile = normalizedFiles.find((file) => file.path === this.entryFile)

    if (!entryFile) {
      throw new Error(`Skill entry file "${this.entryFile}" is missing.`)
    }

    if (entryFile.kind !== 'text') {
      throw new Error(`Skill entry file "${this.entryFile}" must be a text file.`)
    }

    const { frontmatter, body } = parseMarkdownFrontmatter(entryFile.content)
    const instructions = body.trim()

    if (!instructions) {
      throw new Error(`Skill entry file "${this.entryFile}" must contain instructions.`)
    }

    const frontmatterMetadata = getRecord(frontmatter.metadata)
    const skillFiles: SkillFile[] = []

    for (const file of normalizedFiles) {
      if (file.path === this.entryFile) {
        continue
      }

      if (file.kind === 'binary') {
        skillFiles.push(file)
        continue
      }

      if (!isTextSkillFilePath(file.path)) {
        warnings.push({
          code: 'unsupported-text-file-ignored',
          message: 'Only markdown, text, and json files are converted to text skill files.',
          path: file.path,
        })
        continue
      }

      skillFiles.push(file)
    }

    return {
      skill: {
        name: getString(frontmatter.name) || getFallbackSkillName(this.entryFile),
        description: getString(frontmatter.description) || '',
        instructions,
        files: skillFiles.length ? skillFiles : undefined,
        metadata: {
          ...frontmatterMetadata,
          homepage: getString(frontmatter.homepage),
          frontmatter,
        },
      },
      warnings,
    }
  }

  private normalizeFiles(files: SkillFile[], warnings: SkillLoaderResult['warnings']) {
    const result: SkillFile[] = []
    const seenPaths = new Set<string>()

    for (const file of files) {
      const path = normalizeSkillPath(file.path)

      if (!path) {
        this.handleWarning(warnings, {
          code: 'invalid-path',
          message: `Invalid skill file path: ${file.path}`,
          path: file.path,
        })
        continue
      }

      if (seenPaths.has(path)) {
        this.handleWarning(warnings, {
          code: 'duplicate-path',
          message: `Duplicate skill file path: ${path}`,
          path,
        })
        continue
      }

      seenPaths.add(path)
      result.push({ ...file, path } as SkillFile)
    }

    return result.sort((a, b) => a.path.localeCompare(b.path))
  }

  private handleWarning(warnings: SkillLoaderResult['warnings'], warning: SkillLoaderResult['warnings'][number]) {
    if (this.strict) {
      throw new Error(warning.path ? `${warning.path}: ${warning.message}` : warning.message)
    }

    warnings.push(warning)
  }
}

const parseMarkdownFrontmatter = (content: string) => {
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
    frontmatter: parseYamlFrontmatter(rawFrontmatter),
    body,
  }
}

const parseYamlFrontmatter = (rawFrontmatter: string) => {
  const parsed = parseYaml(rawFrontmatter)
  return getRecord(parsed) ?? {}
}

const getString = (value: unknown) => (typeof value === 'string' ? value : undefined)

const getRecord = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined

const getResourceTitle = (path: string) => {
  const filename = path.split('/').at(-1) || path
  const ext = getExtension(filename)
  return ext ? filename.slice(0, -ext.length) : filename
}

const getFallbackSkillName = (entryFile: string) => getResourceTitle(entryFile)
